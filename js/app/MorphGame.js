/**
 * Application service / facade.
 * Orchestrates domain services; UI depends on this port only (ISP/DIP).
 */
import { createEventEmitter } from "../domain/events.js";
import {
  regenEnergy,
  spendEnergy as spendEnergyFn,
  refillEnergy,
  spendCoins,
  addCoins,
} from "../domain/energy.js";
import * as inventory from "../domain/inventory.js";
import { createRequirementEvaluators } from "../domain/evolution/requirements.js";
import { createEvolutionService } from "../domain/evolution/service.js";
import { createTrainingService } from "../domain/training.js";
import { createMoveResolvers } from "../domain/combat/moves.js";
import { createEncounterService } from "../domain/combat/encounter.js";
import { createBattleService } from "../domain/combat/battle.js";
import {
  enrichCreature,
  createCreatureRecord,
  seedCreatureStats,
  seedCreatureMoves,
} from "../domain/creature.js";

export function createGame({ catalog, store }) {
  let state = store.load();

  const next = (key) => state.nextIds[key]++;

  const emit = createEventEmitter(() => state, () => next("domain_events"));

  const player = () => state.players[0] || null;
  const resources = () => {
    const p = player();
    return p ? state.player_resources.find((r) => r.player_id === p.id) || null : null;
  };

  const persist = () => store.save(state);

  const inventoryQty = (itemId) => {
    const p = player();
    return p ? inventory.qty(state.player_inventory, p.id, itemId) : 0;
  };

  const evaluators = createRequirementEvaluators({
    catalog,
    inventoryQty: (playerId, itemId) =>
      inventory.qty(state.player_inventory, playerId, itemId),
  });

  const evolution = createEvolutionService({
    catalog,
    evaluators,
    consumeItem: (playerId, itemId, amount) =>
      inventory.consumeItem(state.player_inventory, playerId, itemId, amount),
  });

  const training = createTrainingService({
    catalog,
    spendEnergy: spendEnergyFn,
    addCoins,
  });

  const moveResolvers = createMoveResolvers({ catalog });
  const encounters = createEncounterService(catalog);
  const battles = createBattleService({ catalog, moveResolvers });

  function enrich(c) {
    const info = evolution.getInfo(
      c,
      state.player_creature_stats,
      c.player_id
    );
    return enrichCreature(
      catalog,
      c,
      state.player_creature_stats,
      state.player_creature_moves,
      info
    );
  }

  function playerCreatures() {
    const p = player();
    if (!p) return [];
    return state.player_creatures.filter((c) => c.player_id === p.id).map(enrich);
  }

  function activeCreature() {
    const p = player();
    if (!p) return null;
    const active = state.player_creatures.find(
      (c) => c.player_id === p.id && c.is_active
    );
    return active ? enrich(active) : playerCreatures()[0] || null;
  }

  function getPlayerCreature(id) {
    const c = state.player_creatures.find((x) => x.id === id);
    return c ? enrich(c) : null;
  }

  function addPlayerCreature(speciesId, nickname) {
    const species = catalog.speciesById(speciesId);
    if (!species) throw new Error("Unknown species");
    const p = player();
    if (!p) throw new Error("No player");

    const id = next("player_creatures");
    const isFirst = !state.player_creatures.some((c) => c.player_id === p.id);
    const creature = createCreatureRecord({
      id,
      playerId: p.id,
      speciesId,
      nickname,
      speciesDisplayName: species.display_name,
      isActive: isFirst,
      obtainedAt: catalog.now(),
    });
    state.player_creatures.push(creature);
    state.player_creature_stats.push(
      ...seedCreatureStats(catalog, () => next("player_creature_stats"), id, speciesId)
    );
    state.player_creature_moves.push(
      ...seedCreatureMoves(catalog, () => next("player_creature_moves"), id, speciesId)
    );

    const empty = state.player_party_slots
      .filter((s) => s.player_id === p.id && !s.player_creature_id)
      .sort((a, b) => a.slot - b.slot)[0];
    if (empty) empty.player_creature_id = id;

    emit(p.id, "PlayerCreature", id, "CreatureObtained", { species_id: speciesId });
    persist();
    return creature;
  }

  function createPlayer(name) {
    const trimmed = String(name || "").trim().slice(0, 32);
    if (!trimmed) throw new Error("Name required");
    const ts = catalog.now();
    state = store.emptyState();
    const id = state.nextIds.players++;
    state.players.push({
      id,
      name: trimmed,
      level: 1,
      experience: 0,
      created_at: ts,
      updated_at: ts,
    });
    state.player_resources.push({
      player_id: id,
      energy: 20,
      energy_max: 20,
      coins: 0,
      energy_regen_seconds: 45,
      last_energy_at: ts,
    });
    state.player_inventory.push({
      id: state.nextIds.player_inventory++,
      player_id: id,
      item_id: 1,
      quantity: 5,
    });
    for (let slot = 1; slot <= 6; slot++) {
      state.player_party_slots.push({
        id: state.nextIds.player_party_slots++,
        player_id: id,
        slot,
        player_creature_id: null,
      });
    }
    emit(id, "Player", id, "PlayerCreated", { name: trimmed });
    persist();
    return player();
  }

  // --- public API ---

  function load() {
    state = store.load();
    regenEnergy(resources());
    return hasSave();
  }

  function reset() {
    store.clear();
    state = store.emptyState();
  }

  function hasSave() {
    return !!player();
  }

  function setActiveCreature(id) {
    const p = player();
    const target = state.player_creatures.find(
      (c) => c.id === id && c.player_id === p.id
    );
    if (!target) return false;
    for (const c of state.player_creatures) {
      if (c.player_id === p.id) c.is_active = c.id === id ? 1 : 0;
    }
    persist();
    return true;
  }

  function renameCreature(id, nickname) {
    const c = state.player_creatures.find((x) => x.id === id);
    if (!c) return false;
    const species = catalog.speciesById(c.species_id);
    c.nickname = String(nickname || "").trim().slice(0, 32) || species.display_name;
    persist();
    return true;
  }

  function train(playerCreatureId, statId) {
    const r = resources();
    const res = training.train(
      state.player_creature_stats,
      r,
      playerCreatureId,
      statId
    );
    if (!res.ok) return res;
    const p = player();
    emit(p.id, "PlayerCreature", playerCreatureId, "CreatureTrained", {
      stat_id: statId,
      gain: res.gain,
      drill_id: res.drill.id,
      critical: res.critical,
    });
    persist();
    return res;
  }

  function evolve(playerCreatureId) {
    const creature = state.player_creatures.find((c) => c.id === playerCreatureId);
    if (!creature) return { ok: false, reason: "missing" };
    const res = evolution.evolve(
      creature,
      state.player_creature_stats,
      state.player_creature_moves,
      () => next("player_creature_moves"),
      creature.player_id
    );
    if (!res.ok) return res;
    addCoins(resources(), 25);
    emit(creature.player_id, "PlayerCreature", creature.id, "CreatureEvolved", {
      from: res.from,
      to: res.to,
    });
    persist();
    return { ...res, pet: enrich(creature) };
  }

  function startBattle(zoneCodeOrId) {
    const zone =
      typeof zoneCodeOrId === "number"
        ? catalog.zoneById(zoneCodeOrId)
        : catalog.zoneByCode(zoneCodeOrId);
    const cost = zone ? zone.energy_cost : 2;
    if (!spendEnergyFn(resources(), cost)) return { ok: false, reason: "energy" };

    const you = activeCreature();
    if (!you) return { ok: false, reason: "no_pet" };

    const encounter = encounters.make(zoneCodeOrId);
    const battleId = next("battles");
    const started = catalog.now();
    state.battles.push({
      id: battleId,
      player_id: player().id,
      zone_id: encounter.zone.id,
      status: "active",
      seed: Math.floor(Math.random() * 1e9),
      started_at: started,
      ended_at: null,
    });

    const youCombat = battles.combatPower(you);
    const wildCombat = encounter.combat;
    const youPart = {
      id: next("battle_participants"),
      battle_id: battleId,
      side: "player",
      player_creature_id: you.id,
      species_id: you.species_id,
      nickname: you.nickname,
      current_hp: youCombat.hp,
      max_hp: youCombat.hp,
      is_active: 1,
      snapshot_stats: youCombat,
    };
    const wildPart = {
      id: next("battle_participants"),
      battle_id: battleId,
      side: "wild",
      player_creature_id: null,
      species_id: encounter.wild.species_id,
      nickname: encounter.wild.nickname,
      current_hp: wildCombat.hp,
      max_hp: wildCombat.hp,
      is_active: 1,
      snapshot_stats: wildCombat,
    };
    state.battle_participants.push(youPart, wildPart);
    emit(player().id, "Battle", battleId, "BattleStarted", {
      zone_id: encounter.zone.id,
    });
    persist();

    return {
      ok: true,
      battleId,
      you,
      youCombat,
      youParticipantId: youPart.id,
      wildParticipantId: wildPart.id,
      ...encounter,
    };
  }

  function resolveTurn(battle, actionKind) {
    const turn = battles.resolveTurn(battle, actionKind);

    for (const a of turn.actions) {
      state.battle_actions.push({
        id: next("battle_actions"),
        battle_id: battle.battleId,
        turn_number: a.turn_number,
        actor_participant_id:
          a.actor_label === battle.you.nickname
            ? battle.youParticipantId
            : battle.wildParticipantId,
        target_participant_id:
          a.actor_label === battle.you.nickname
            ? battle.wildParticipantId
            : battle.youParticipantId,
        move_id: a.move_id,
        action_kind: a.action_kind,
        damage: a.damage,
        was_critical: a.was_critical,
        payload: a.payload,
        created_at: catalog.now(),
      });
    }

    let result = null;
    if (turn.result?.outcome === "win") {
      const coinGain = 8 + Math.floor(battle.wild.power / 4);
      addCoins(resources(), coinGain);
      const creature = state.player_creatures.find((c) => c.id === battle.you.id);
      if (creature) {
        creature.battles_won += 1;
        creature.experience += 10;
      }
      const rows = state.player_creature_stats.filter(
        (s) => s.player_creature_id === battle.you.id
      );
      let trainBoost = null;
      if (rows.length) {
        const pick = rows[Math.floor(Math.random() * rows.length)];
        pick.value += 1;
        trainBoost = { stat: catalog.statById(pick.stat_id), value: pick.value };
      }
      if (Math.random() < 0.35) {
        inventory.addItem(
          state.player_inventory,
          () => next("player_inventory"),
          player().id,
          1,
          1
        );
      }
      if (battle.wild.species.element_id === 1 && Math.random() < 0.12) {
        inventory.addItem(
          state.player_inventory,
          () => next("player_inventory"),
          player().id,
          3,
          1
        );
      }
      const b = state.battles.find((x) => x.id === battle.battleId);
      if (b) {
        b.status = "won";
        b.ended_at = catalog.now();
      }
      emit(player().id, "Battle", battle.battleId, "BattleWon", { coinGain });
      turn.log.push({ text: `Victory! +${coinGain} coins.`, reward: true });
      result = {
        outcome: "win",
        coinGain,
        trainBoost,
        canCatch: inventoryQty(1) > 0 || inventoryQty(2) > 0,
      };
    } else if (turn.result?.outcome === "lose") {
      const b = state.battles.find((x) => x.id === battle.battleId);
      if (b) {
        b.status = "lost";
        b.ended_at = catalog.now();
      }
      emit(player().id, "Battle", battle.battleId, "BattleLost", {});
      turn.log.push({ text: `${battle.you.nickname} was overwhelmed…` });
      result = { outcome: "lose" };
    }

    persist();
    return { ...turn, result };
  }

  function tryCatch(battle, itemId = 1) {
    const item = catalog.itemById(itemId);
    if (!item || item.item_kind !== "catch") return { ok: false, reason: "item" };
    if (!inventory.consumeItem(state.player_inventory, player().id, itemId, 1)) {
      return { ok: false, reason: "no_orb" };
    }
    const bonus = item.effect_payload?.catch_bonus || 0;
    if (Math.random() >= battles.catchChance(battle) + bonus) {
      persist();
      return { ok: false, reason: "broke_free" };
    }
    const caught = addPlayerCreature(battle.wild.species_id);
    const b = state.battles.find((x) => x.id === battle.battleId);
    if (b) {
      b.status = "caught";
      b.ended_at = catalog.now();
    }
    emit(player().id, "PlayerCreature", caught.id, "CreatureCaught", {
      species_id: battle.wild.species_id,
      item_id: itemId,
    });
    persist();
    return { ok: true, pet: enrich(caught) };
  }

  function rest() {
    const cost = 15;
    const r = resources();
    if (!spendCoins(r, cost)) return { ok: false, reason: "coins" };
    refillEnergy(r, catalog.now());
    emit(player().id, "Player", player().id, "PlayerRested", { cost });
    persist();
    return { ok: true };
  }

  function getState() {
    regenEnergy(resources());
    const r = resources();
    const active = activeCreature();
    return {
      player: player(),
      resources: r,
      meta: r
        ? {
            energy: r.energy,
            energyMax: r.energy_max,
            coins: r.coins,
            activePetId: active ? active.id : null,
          }
        : { energy: 0, energyMax: 0, coins: 0, activePetId: null },
      pets: playerCreatures(),
      inventory: state.player_inventory
        .filter((i) => player() && i.player_id === player().id)
        .map((i) => ({ ...i, item: catalog.itemById(i.item_id) })),
      active,
      catalog,
      events: state.domain_events.slice(-20),
    };
  }

  function spendEnergy(n) {
    const ok = spendEnergyFn(resources(), n);
    if (ok) persist();
    return ok;
  }

  return {
    load,
    save: persist,
    reset,
    hasSave,
    createPlayer,
    addPlayerPet: addPlayerCreature,
    addPlayerCreature,
    playerPets: playerCreatures,
    playerCreatures,
    getPlayerPet: getPlayerCreature,
    getPlayerCreature,
    activePet: activeCreature,
    activeCreature,
    setActivePet: setActiveCreature,
    setActiveCreature,
    renamePet: renameCreature,
    renameCreature,
    train,
    evolve,
    getEvolutionInfo: (c) =>
      evolution.getInfo(c, state.player_creature_stats, c.player_id),
    startBattle,
    resolveTurn,
    tryCatch,
    catchChance: battles.catchChance,
    combatPower: battles.combatPower,
    rest,
    getState,
    spendEnergy,
    regenEnergy: () => regenEnergy(resources()),
    inventoryQty,
  };
}
