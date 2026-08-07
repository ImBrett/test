/* Morph — Player + Combat write models (data-driven interpreters) */

window.MorphGame = (() => {
  const SAVE_KEY = "morph_rpg_v2";
  const D = () => window.MORPH_DATA;

  const defaults = () => ({
    players: [],
    player_resources: [],
    player_creatures: [],
    player_creature_stats: [],
    player_creature_moves: [],
    player_party_slots: [],
    player_inventory: [],
    battles: [],
    battle_participants: [],
    battle_actions: [],
    domain_events: [],
    nextIds: {
      players: 1,
      player_creatures: 1,
      player_creature_stats: 1,
      player_creature_moves: 1,
      player_party_slots: 1,
      player_inventory: 1,
      battles: 1,
      battle_participants: 1,
      battle_actions: 1,
      domain_events: 1,
    },
  });

  let state = defaults();

  function save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) {
        // one-shot migration: drop v1 saves (incompatible shape)
        localStorage.removeItem("morph_rpg_v1");
        return false;
      }
      state = { ...defaults(), ...JSON.parse(raw) };
      regenEnergy();
      return true;
    } catch {
      state = defaults();
      return false;
    }
  }

  function reset() {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem("morph_rpg_v1");
    state = defaults();
  }

  function player() {
    return state.players[0] || null;
  }

  function resources() {
    const p = player();
    if (!p) return null;
    return state.player_resources.find((r) => r.player_id === p.id) || null;
  }

  function hasSave() {
    return !!player();
  }

  function emit(aggregateType, aggregateId, eventType, payload = {}) {
    const p = player();
    state.domain_events.push({
      id: state.nextIds.domain_events++,
      player_id: p ? p.id : null,
      aggregate_type: aggregateType,
      aggregate_id: aggregateId,
      event_type: eventType,
      event_version: 1,
      payload,
      occurred_at: D().now(),
    });
  }

  function regenEnergy() {
    const r = resources();
    if (!r) return;
    const now = Date.now();
    const last = new Date(r.last_energy_at).getTime();
    const elapsed = Math.max(0, now - last);
    const gained = Math.floor(elapsed / (r.energy_regen_seconds * 1000));
    if (gained > 0) {
      r.energy = Math.min(r.energy_max, r.energy + gained);
      r.last_energy_at = new Date(
        now - (elapsed % (r.energy_regen_seconds * 1000))
      ).toISOString();
      save();
    }
  }

  function spendEnergy(n = 1) {
    regenEnergy();
    const r = resources();
    if (!r || r.energy < n) return false;
    r.energy -= n;
    save();
    return true;
  }

  function addInventory(itemId, qty = 1) {
    const p = player();
    let row = state.player_inventory.find(
      (i) => i.player_id === p.id && i.item_id === itemId
    );
    if (!row) {
      row = {
        id: state.nextIds.player_inventory++,
        player_id: p.id,
        item_id: itemId,
        quantity: 0,
      };
      state.player_inventory.push(row);
    }
    row.quantity += qty;
  }

  function inventoryQty(itemId) {
    const p = player();
    if (!p) return 0;
    const row = state.player_inventory.find(
      (i) => i.player_id === p.id && i.item_id === itemId
    );
    return row ? row.quantity : 0;
  }

  function consumeItem(itemId, qty = 1) {
    const p = player();
    const row = state.player_inventory.find(
      (i) => i.player_id === p.id && i.item_id === itemId
    );
    if (!row || row.quantity < qty) return false;
    row.quantity -= qty;
    return true;
  }

  function createPlayer(name) {
    const trimmed = String(name || "").trim().slice(0, 32);
    if (!trimmed) throw new Error("Name required");
    const ts = D().now();
    state = defaults();
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
    // starter kit: catch orbs
    state.player_inventory.push({
      id: state.nextIds.player_inventory++,
      player_id: id,
      item_id: 1,
      quantity: 5,
    });
    // party slots 1..6
    for (let slot = 1; slot <= 6; slot++) {
      state.player_party_slots.push({
        id: state.nextIds.player_party_slots++,
        player_id: id,
        slot,
        player_creature_id: null,
      });
    }
    emit("Player", id, "PlayerCreated", { name: trimmed });
    save();
    return player();
  }

  function addPlayerCreature(speciesId, nickname) {
    const species = D().speciesById(speciesId);
    if (!species) throw new Error("Unknown species");
    const p = player();
    if (!p) throw new Error("No player");

    const id = state.nextIds.player_creatures++;
    const obtained = D().now();
    const nick = (nickname && nickname.trim()) || species.display_name;
    const isFirst = !state.player_creatures.some((c) => c.player_id === p.id);

    const creature = {
      id,
      player_id: p.id,
      species_id: speciesId,
      nickname: nick,
      level: 1,
      experience: 0,
      battles_won: 0,
      obtained_at: obtained,
      is_active: isFirst ? 1 : 0,
    };
    state.player_creatures.push(creature);

    for (const bs of D().baseStatsForSpecies(speciesId)) {
      state.player_creature_stats.push({
        id: state.nextIds.player_creature_stats++,
        player_creature_id: id,
        stat_id: bs.stat_id,
        value: bs.value,
      });
    }

    for (const sm of D().movesForSpecies(speciesId)) {
      state.player_creature_moves.push({
        id: state.nextIds.player_creature_moves++,
        player_creature_id: id,
        move_id: sm.move_id,
        slot: sm.slot,
      });
    }

    // Fill next empty party slot
    const empty = state.player_party_slots
      .filter((s) => s.player_id === p.id && !s.player_creature_id)
      .sort((a, b) => a.slot - b.slot)[0];
    if (empty) empty.player_creature_id = id;

    emit("PlayerCreature", id, "CreatureObtained", { species_id: speciesId, nickname: nick });
    save();
    return creature;
  }

  // Compat alias for UI
  function addPlayerPet(speciesId, nickname) {
    return addPlayerCreature(speciesId, nickname);
  }

  function enrichCreature(c) {
    const species = D().speciesById(c.species_id);
    const stats = state.player_creature_stats
      .filter((s) => s.player_creature_id === c.id)
      .map((s) => ({
        ...s,
        stat: D().statById(s.stat_id),
      }));
    const moves = state.player_creature_moves
      .filter((m) => m.player_creature_id === c.id)
      .sort((a, b) => a.slot - b.slot)
      .map((m) => ({ ...m, move: D().moveById(m.move_id) }));
    const power = stats.reduce((a, s) => a + s.value, 0);
    const evo = getEvolutionInfo(c);
    return {
      ...c,
      species,
      pet: species, // UI compat
      stats,
      moves,
      power,
      evo,
    };
  }

  function playerCreatures() {
    const p = player();
    if (!p) return [];
    return state.player_creatures
      .filter((c) => c.player_id === p.id)
      .map(enrichCreature);
  }

  function playerPets() {
    return playerCreatures();
  }

  function getPlayerCreature(id) {
    const c = state.player_creatures.find((x) => x.id === id);
    return c ? enrichCreature(c) : null;
  }

  function getPlayerPet(id) {
    return getPlayerCreature(id);
  }

  function activeCreature() {
    const p = player();
    if (!p) return null;
    const active = state.player_creatures.find(
      (c) => c.player_id === p.id && c.is_active
    );
    if (active) return enrichCreature(active);
    return playerCreatures()[0] || null;
  }

  function activePet() {
    return activeCreature();
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
    save();
    return true;
  }

  function setActivePet(id) {
    return setActiveCreature(id);
  }

  function renameCreature(id, nickname) {
    const c = state.player_creatures.find((x) => x.id === id);
    if (!c) return false;
    const species = D().speciesById(c.species_id);
    c.nickname =
      String(nickname || "").trim().slice(0, 32) || species.display_name;
    save();
    return true;
  }

  function renamePet(id, nickname) {
    return renameCreature(id, nickname);
  }

  /** Data-driven training via training_drills catalog */
  function train(playerCreatureId, statId) {
    const drill = D().training_drills.find((d) => d.stat_id === statId);
    if (!drill) return { ok: false, reason: "missing_drill" };
    if (!spendEnergy(drill.energy_cost)) return { ok: false, reason: "energy" };

    const row = state.player_creature_stats.find(
      (s) => s.player_creature_id === playerCreatureId && s.stat_id === statId
    );
    if (!row) return { ok: false, reason: "missing" };

    const crit = Math.random() < drill.critical_chance;
    const gain = drill.base_gain + (crit ? drill.critical_bonus : 0);
    row.value += gain;
    const r = resources();
    r.coins += drill.coin_reward;

    emit("PlayerCreature", playerCreatureId, "CreatureTrained", {
      stat_id: statId,
      gain,
      drill_id: drill.id,
      critical: crit,
    });
    save();
    return {
      ok: true,
      gain,
      value: row.value,
      stat: D().statById(statId),
      critical: crit,
    };
  }

  /** Interprets evolution_requirements rows (stat | item | level | battles_won) */
  function evaluateRequirement(creature, req) {
    switch (req.requirement_kind) {
      case "stat": {
        const row = state.player_creature_stats.find(
          (s) =>
            s.player_creature_id === creature.id && s.stat_id === req.stat_id
        );
        const have = row ? row.value : 0;
        const stat = D().statById(req.stat_id);
        return {
          kind: "stat",
          label: stat.display_name,
          stat,
          needed: req.threshold_value,
          have,
          met: have >= req.threshold_value,
        };
      }
      case "item": {
        const item = D().itemById(req.item_id);
        const have = inventoryQty(req.item_id);
        return {
          kind: "item",
          label: item.display_name,
          item,
          needed: req.threshold_value,
          have,
          met: have >= req.threshold_value,
        };
      }
      case "level": {
        return {
          kind: "level",
          label: "Level",
          needed: req.threshold_value,
          have: creature.level,
          met: creature.level >= req.threshold_value,
        };
      }
      case "battles_won": {
        return {
          kind: "battles_won",
          label: "Battles won",
          needed: req.threshold_value,
          have: creature.battles_won,
          met: creature.battles_won >= req.threshold_value,
        };
      }
      default:
        return {
          kind: req.requirement_kind,
          label: req.requirement_kind,
          needed: req.threshold_value,
          have: 0,
          met: false,
        };
    }
  }

  function getEvolutionInfo(creature) {
    const path = D().evolution_paths.find(
      (e) => e.ancestor_species_id === creature.species_id
    );
    if (!path) return { canEvolve: false, ready: false, next: null, reqs: [] };

    const next = D().speciesById(path.descendant_species_id);
    const reqs = D()
      .evolution_requirements.filter((r) => r.evolution_path_id === path.id)
      .map((r) => {
        const evaluated = evaluateRequirement(creature, r);
        // UI compat shape
        return {
          ...evaluated,
          stat: evaluated.stat || { name: evaluated.label, color: "#7dcea0" },
          name: evaluated.label,
        };
      });

    return {
      canEvolve: true,
      ready: reqs.every((r) => r.met),
      next,
      path,
      evo: path,
      reqs,
    };
  }

  function evolve(playerCreatureId) {
    const creature = state.player_creatures.find((c) => c.id === playerCreatureId);
    if (!creature) return { ok: false, reason: "missing" };
    const info = getEvolutionInfo(creature);
    if (!info.canEvolve) return { ok: false, reason: "max" };
    if (!info.ready) return { ok: false, reason: "reqs" };

    // Consume item requirements
    const itemReqs = D().evolution_requirements.filter(
      (r) =>
        r.evolution_path_id === info.path.id && r.requirement_kind === "item"
    );
    for (const req of itemReqs) {
      if (!consumeItem(req.item_id, req.threshold_value)) {
        return { ok: false, reason: "item" };
      }
    }

    const oldSpecies = D().speciesById(creature.species_id);
    const wasDefaultNick = creature.nickname === oldSpecies.display_name;
    creature.species_id = info.next.id;
    if (wasDefaultNick) creature.nickname = info.next.display_name;

    const oldBases = Object.fromEntries(
      D()
        .baseStatsForSpecies(info.path.ancestor_species_id)
        .map((bs) => [bs.stat_id, bs.value])
    );
    const newBases = Object.fromEntries(
      D()
        .baseStatsForSpecies(info.next.id)
        .map((bs) => [bs.stat_id, bs.value])
    );

    for (const row of state.player_creature_stats.filter(
      (s) => s.player_creature_id === creature.id
    )) {
      const trained = Math.max(0, row.value - (oldBases[row.stat_id] || 0));
      row.value = (newBases[row.stat_id] || row.value) + trained;
    }

    // Refresh moveset from new species catalog
    state.player_creature_moves = state.player_creature_moves.filter(
      (m) => m.player_creature_id !== creature.id
    );
    for (const sm of D().movesForSpecies(info.next.id)) {
      state.player_creature_moves.push({
        id: state.nextIds.player_creature_moves++,
        player_creature_id: creature.id,
        move_id: sm.move_id,
        slot: sm.slot,
      });
    }

    resources().coins += 25;
    emit("PlayerCreature", creature.id, "CreatureEvolved", {
      from: oldSpecies.id,
      to: info.next.id,
    });
    save();
    return {
      ok: true,
      pet: enrichCreature(creature),
      from: oldSpecies.display_name,
      to: info.next.display_name,
    };
  }

  function combatPower(enriched) {
    const map = Object.fromEntries(enriched.stats.map((s) => [s.stat_id, s.value]));
    const might = map[1] || 0;
    const vital = map[2] || 0;
    const swift = map[3] || 0;
    const guard = map[4] || 0;
    const spirit = map[5] || 0;
    return {
      hp: 48 + vital * 5 + guard * 2,
      atk: 8 + might * 2 + Math.floor(spirit * 0.6),
      spd: 5 + swift,
      def: 3 + Math.floor(guard * 1.3),
      crit: Math.min(38, 6 + Math.floor(swift * 0.8) + Math.floor(spirit * 0.4)),
      element_id: enriched.species ? enriched.species.element_id : enriched.pet?.element_id,
      map,
    };
  }

  function weightedPick(encounters) {
    const total = encounters.reduce((a, e) => a + e.weight, 0);
    let roll = Math.random() * total;
    for (const e of encounters) {
      roll -= e.weight;
      if (roll <= 0) return e;
    }
    return encounters[encounters.length - 1];
  }

  /** Data-driven wild encounter from zone_encounters */
  function makeWildEncounter(zoneCodeOrId) {
    const zone =
      typeof zoneCodeOrId === "number"
        ? D().zoneById(zoneCodeOrId)
        : D().zoneByCode(zoneCodeOrId) || D().zones[0];

    const table = D().zone_encounters.filter((e) => e.zone_id === zone.id);
    const pick = weightedPick(table);
    const species = D().speciesById(pick.species_id);
    const variance =
      pick.stat_variance_min +
      Math.random() * (pick.stat_variance_max - pick.stat_variance_min);

    const stats = D()
      .baseStatsForSpecies(species.id)
      .map((bs) => ({
        stat_id: bs.stat_id,
        value: Math.max(1, Math.round(bs.value * variance)),
        stat: D().statById(bs.stat_id),
      }));

    const moves = D().movesForSpecies(species.id);
    const wild = {
      id: -1,
      species_id: species.id,
      nickname: `Wild ${species.display_name}`,
      species,
      pet: species,
      stats,
      moves,
      power: stats.reduce((a, s) => a + s.value, 0),
      level: species.stage,
      battles_won: 0,
    };
    return { zone, wild, combat: combatPower(wild), encounter: pick };
  }

  function startBattle(zoneCodeOrId) {
    const zone =
      typeof zoneCodeOrId === "number"
        ? D().zoneById(zoneCodeOrId)
        : D().zoneByCode(zoneCodeOrId);
    const cost = zone ? zone.energy_cost : 2;
    if (!spendEnergy(cost)) return { ok: false, reason: "energy" };

    const you = activeCreature();
    if (!you) return { ok: false, reason: "no_pet" };

    const encounter = makeWildEncounter(zoneCodeOrId);
    const battleId = state.nextIds.battles++;
    const started = D().now();

    state.battles.push({
      id: battleId,
      player_id: player().id,
      zone_id: encounter.zone.id,
      status: "active",
      seed: Math.floor(Math.random() * 1e9),
      started_at: started,
      ended_at: null,
    });

    const youCombat = combatPower(you);
    const wildCombat = encounter.combat;

    const youPart = {
      id: state.nextIds.battle_participants++,
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
      id: state.nextIds.battle_participants++,
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
    emit("Battle", battleId, "BattleStarted", { zone_id: encounter.zone.id });
    save();

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

  function resolveMove(attacker, defender, move, attackerLabel) {
    const log = [];
    const payload = move.effect_payload || {};

    if (move.effect_kind === "heal") {
      const heal = Math.round(attacker.hpMax * (payload.heal_pct || 0.1));
      attacker.hp = Math.min(attacker.hpMax, attacker.hp + heal);
      log.push({ text: `${attackerLabel} recovers ${heal} HP.`, dmg: 0 });
      return log;
    }

    if (move.effect_kind === "guard" || payload.guarding) {
      defender._incomingGuard = true; // actually self-guard: mark attacker
      attacker._guarding = true;
      if (payload.def_buff) attacker.def += payload.def_buff;
    }

    if (Math.random() > (move.accuracy || 1)) {
      log.push({ text: `${attackerLabel}'s ${move.display_name} missed!`, dmg: 0 });
      return log;
    }

    let mult = payload.mult != null ? payload.mult : 1;
    const matchup = D().matchupMultiplier(
      move.element_id || attacker.element_id,
      defender.element_id
    );
    mult *= matchup;

    const critChance = attacker.crit + (payload.crit_bonus || 0);
    const crit = Math.random() * 100 < critChance;
    if (crit) mult *= 1.6;

    const raw = attacker.atk * mult * (move.power / 100);
    const mitigated = Math.max(
      1,
      Math.round(raw - defender.def * (defender._guarding ? 1.8 : 1))
    );
    defender.hp = Math.max(0, defender.hp - mitigated);
    defender._guarding = false;

    const tip =
      matchup > 1 ? " It's super effective!" : matchup < 1 ? " It's not very effective…" : "";
    log.push({
      text: `${attackerLabel} uses ${move.display_name} for ${mitigated}${crit ? "!" : "."}${tip}`,
      crit,
      dmg: mitigated,
      matchup,
    });
    return log;
  }

  function resolveTurn(battle, actionKind) {
    // actionKind: strike | guard | burst | or move code
    const log = [];
    const youMove =
      D().moves.find((m) => m.code === actionKind || m.effect_kind === actionKind) ||
      D().moveById(1);
    const foeMoves = D().movesForSpecies(battle.wild.species_id).map((m) => m.move);
    const foeMove =
      foeMoves[Math.floor(Math.random() * foeMoves.length)] || D().moveById(1);

    const you = {
      ...battle.youCombat,
      hp: battle.youHp,
      hpMax: battle.youMax || battle.youCombat.hp,
      element_id: battle.you.species.element_id,
    };
    const foe = {
      ...battle.wildCombat,
      hp: battle.wildHp,
      hpMax: battle.wildMax || battle.wildCombat.hp,
      element_id: battle.wild.species.element_id,
    };

    const youFirst = you.spd + Math.random() * 3 >= foe.spd + Math.random() * 3;
    const order = youFirst
      ? [
          ["you", you, foe, youMove, battle.you.nickname],
          ["foe", foe, you, foeMove, battle.wild.nickname],
        ]
      : [
          ["foe", foe, you, foeMove, battle.wild.nickname],
          ["you", you, foe, youMove, battle.you.nickname],
        ];

    let turnNumber = (battle.turnNumber || 0) + 1;

    for (const [, actor, target, move, label] of order) {
      if (actor.hp <= 0) continue;
      const lines = resolveMove(actor, target, move, label);
      log.push(...lines);

      if (battle.battleId) {
        state.battle_actions.push({
          id: state.nextIds.battle_actions++,
          battle_id: battle.battleId,
          turn_number: turnNumber,
          actor_participant_id:
            label === battle.you.nickname
              ? battle.youParticipantId
              : battle.wildParticipantId,
          target_participant_id:
            label === battle.you.nickname
              ? battle.wildParticipantId
              : battle.youParticipantId,
          move_id: move.id,
          action_kind: "move",
          damage: lines.reduce((a, l) => a + (l.dmg || 0), 0),
          was_critical: lines.some((l) => l.crit) ? 1 : 0,
          payload: { effect_kind: move.effect_kind },
          created_at: D().now(),
        });
      }
    }

    let result = null;
    if (foe.hp <= 0) {
      const coinGain = 8 + Math.floor(battle.wild.power / 4);
      resources().coins += coinGain;
      const creature = state.player_creatures.find((c) => c.id === battle.you.id);
      if (creature) {
        creature.battles_won += 1;
        creature.experience += 10;
      }
      // random stat bump
      const rows = state.player_creature_stats.filter(
        (s) => s.player_creature_id === battle.you.id
      );
      let trainBoost = null;
      if (rows.length) {
        const pick = rows[Math.floor(Math.random() * rows.length)];
        pick.value += 1;
        trainBoost = { stat: D().statById(pick.stat_id), value: pick.value };
      }
      // reward: sometimes drop morph orb or ember stone
      if (Math.random() < 0.35) addInventory(1, 1);
      if (battle.wild.species.element_id === 1 && Math.random() < 0.12) {
        addInventory(3, 1);
      }

      if (battle.battleId) {
        const b = state.battles.find((x) => x.id === battle.battleId);
        if (b) {
          b.status = "won";
          b.ended_at = D().now();
        }
      }
      emit("Battle", battle.battleId || 0, "BattleWon", { coinGain });
      log.push({ text: `Victory! +${coinGain} coins.`, reward: true });
      result = {
        outcome: "win",
        coinGain,
        trainBoost,
        canCatch: inventoryQty(1) > 0 || inventoryQty(2) > 0,
      };
      save();
    } else if (you.hp <= 0) {
      if (battle.battleId) {
        const b = state.battles.find((x) => x.id === battle.battleId);
        if (b) {
          b.status = "lost";
          b.ended_at = D().now();
        }
      }
      emit("Battle", battle.battleId || 0, "BattleLost", {});
      log.push({ text: `${battle.you.nickname} was overwhelmed…` });
      result = { outcome: "lose" };
      save();
    }

    return {
      youHp: you.hp,
      wildHp: foe.hp,
      turnNumber,
      log,
      result,
    };
  }

  function catchChance(battle) {
    const species = battle.wild.species;
    const base = species.base_catch_rate || 0.35;
    const ratio = battle.you.power / Math.max(1, battle.wild.power);
    const hpFactor =
      1 - (battle.wildHp || 0) / Math.max(1, battle.wildMax || battle.wildCombat.hp);
    return Math.min(0.85, base + Math.max(0, ratio - 1) * 0.12 + hpFactor * 0.2);
  }

  function tryCatch(battle, itemId = 1) {
    const item = D().itemById(itemId);
    if (!item || item.item_kind !== "catch") return { ok: false, reason: "item" };
    if (!consumeItem(itemId, 1)) return { ok: false, reason: "no_orb" };

    const bonus = (item.effect_payload && item.effect_payload.catch_bonus) || 0;
    const chance = catchChance(battle) + bonus;
    if (Math.random() >= chance) {
      save();
      return { ok: false, reason: "broke_free" };
    }

    const caught = addPlayerCreature(battle.wild.species_id);
    if (battle.battleId) {
      const b = state.battles.find((x) => x.id === battle.battleId);
      if (b) {
        b.status = "caught";
        b.ended_at = D().now();
      }
    }
    emit("PlayerCreature", caught.id, "CreatureCaught", {
      species_id: battle.wild.species_id,
      item_id: itemId,
    });
    save();
    return { ok: true, pet: enrichCreature(caught) };
  }

  function rest() {
    const cost = 15;
    const r = resources();
    if (!r || r.coins < cost) return { ok: false, reason: "coins" };
    r.coins -= cost;
    r.energy = r.energy_max;
    r.last_energy_at = D().now();
    emit("Player", player().id, "PlayerRested", { cost });
    save();
    return { ok: true };
  }

  function getState() {
    regenEnergy();
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
        .map((i) => ({ ...i, item: D().itemById(i.item_id) })),
      active,
      catalog: D(),
      events: state.domain_events.slice(-20),
    };
  }

  return {
    load,
    save,
    reset,
    hasSave,
    createPlayer,
    addPlayerPet,
    addPlayerCreature,
    playerPets,
    playerCreatures,
    getPlayerPet,
    getPlayerCreature,
    activePet,
    activeCreature,
    setActivePet,
    setActiveCreature,
    renamePet,
    renameCreature,
    train,
    evolve,
    getEvolutionInfo,
    startBattle,
    resolveTurn,
    tryCatch,
    catchChance,
    combatPower,
    rest,
    getState,
    spendEnergy,
    regenEnergy,
    inventoryQty,
  };
})();
