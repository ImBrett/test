import { ok, fail } from "../../Domain/DTOs/Result.js";
import { appendEvent, enrichCreature, regenEnergy } from "../../Domain/Rules/CreatureEnricher.js";
import { combatPower, resolveMove } from "../../Domain/Rules/CombatRules.js";
import { applyScanProgress } from "./ScanActions.js";

function weightedPick(encounters, random) {
  const total = encounters.reduce((a, e) => a + e.weight, 0);
  let roll = random.next() * total;
  for (const e of encounters) {
    roll -= e.weight;
    if (roll <= 0) return e;
  }
  return encounters[encounters.length - 1];
}

/** Action: StartEncounter — spend energy, roll zone_encounters, open Battle aggregate. */
export function createStartEncounterAction({ catalog, uow, clock, random, evaluators }) {
  return {
    name: "StartEncounter",
    execute({ zoneCode }) {
      const player = uow.getPlayer();
      if (!player) return fail("NO_PLAYER", "Create a player first");
      const zone = catalog.zoneByCode(zoneCode);
      if (!zone) return fail("UNKNOWN_ZONE", "Zone not found");

      const resources = uow.getResources();
      regenEnergy(resources, clock);
      if (resources.energy < zone.energy_cost) return fail("ENERGY", "Not enough energy");
      resources.energy -= zone.energy_cost;

      const activeRow =
        uow.listCreatures().find((c) => c.is_active) || uow.listCreatures()[0];
      if (!activeRow) return fail("NO_CREATURE", "No active creature");
      const you = enrichCreature(catalog, uow, evaluators, activeRow);

      const table = catalog.encountersForZone(zone.id);
      const pick = weightedPick(table, random);
      const species = catalog.speciesById(pick.species_id);
      const variance =
        pick.stat_variance_min +
        random.next() * (pick.stat_variance_max - pick.stat_variance_min);
      const stats = catalog.baseStatsForSpecies(species.id).map((bs) => ({
        stat_id: bs.stat_id,
        value: Math.max(1, Math.round(bs.value * variance)),
        stat: catalog.statById(bs.stat_id),
      }));
      const wild = {
        id: -1,
        species_id: species.id,
        nickname: `Wild ${species.display_name}`,
        species,
        stats,
        moves: catalog.movesForSpecies(species.id),
        power: stats.reduce((a, s) => a + s.value, 0),
        level: species.stage,
        battles_won: 0,
      };

      const youCombat = combatPower(you);
      const wildCombat = combatPower(wild);
      const battle = uow.insertBattle({
        player_id: player.id,
        zone_id: zone.id,
        status: "active",
        seed: random.intBelow(1e9),
        started_at: clock.iso(),
        ended_at: null,
      });
      const [youPart, wildPart] = uow.insertBattleParticipants([
        {
          battle_id: battle.id,
          side: "player",
          player_creature_id: you.id,
          species_id: you.species_id,
          nickname: you.nickname,
          current_hp: youCombat.hp,
          max_hp: youCombat.hp,
          is_active: 1,
          snapshot_stats: youCombat,
        },
        {
          battle_id: battle.id,
          side: "wild",
          player_creature_id: null,
          species_id: wild.species_id,
          nickname: wild.nickname,
          current_hp: wildCombat.hp,
          max_hp: wildCombat.hp,
          is_active: 1,
          snapshot_stats: wildCombat,
        },
      ]);

      appendEvent(uow, player.id, "Battle", battle.id, "BattleStarted", {
        zone_id: zone.id,
      });
      uow.commit();

      return ok({
        battleId: battle.id,
        zone,
        you,
        wild,
        youCombat,
        wildCombat,
        youHp: youCombat.hp,
        youMax: youCombat.hp,
        wildHp: wildCombat.hp,
        wildMax: wildCombat.hp,
        youParticipantId: youPart.id,
        wildParticipantId: wildPart.id,
        turnNumber: 0,
        over: false,
      });
    },
  };
}

/** Action: ResolveBattleTurn — one round of move resolution. */
export function createResolveBattleTurnAction({ catalog, uow, clock, random, moveResolvers }) {
  return {
    name: "ResolveBattleTurn",
    execute({ battleSession, actionCode }) {
      if (!battleSession || battleSession.over) {
        return fail("BATTLE_OVER", "Battle is not active");
      }
      const youMove = catalog.moveByCodeOrKind(actionCode);
      const foeMoves = catalog
        .movesForSpecies(battleSession.wild.species_id)
        .map((m) => m.move);
      const foeMove =
        foeMoves[random.intBelow(foeMoves.length)] || catalog.moveById(1);

      const you = {
        ...battleSession.youCombat,
        hp: battleSession.youHp,
        hpMax: battleSession.youMax,
        element_id: battleSession.you.species.element_id,
      };
      const foe = {
        ...battleSession.wildCombat,
        hp: battleSession.wildHp,
        hpMax: battleSession.wildMax,
        element_id: battleSession.wild.species.element_id,
      };

      const youFirst =
        you.spd + random.next() * 3 >= foe.spd + random.next() * 3;
      const order = youFirst
        ? [
            [you, foe, youMove, battleSession.you.nickname, true],
            [foe, you, foeMove, battleSession.wild.nickname, false],
          ]
        : [
            [foe, you, foeMove, battleSession.wild.nickname, false],
            [you, foe, youMove, battleSession.you.nickname, true],
          ];

      const log = [];
      const turnNumber = (battleSession.turnNumber || 0) + 1;
      for (const [actor, target, move, label, isPlayer] of order) {
        if (actor.hp <= 0) continue;
        const lines = resolveMove(moveResolvers, actor, target, move, label);
        log.push(...lines);
        uow.insertBattleAction({
          battle_id: battleSession.battleId,
          turn_number: turnNumber,
          actor_participant_id: isPlayer
            ? battleSession.youParticipantId
            : battleSession.wildParticipantId,
          target_participant_id: isPlayer
            ? battleSession.wildParticipantId
            : battleSession.youParticipantId,
          move_id: move.id,
          action_kind: "move",
          damage: lines.reduce((a, l) => a + (l.dmg || 0), 0),
          was_critical: lines.some((l) => l.crit) ? 1 : 0,
          payload: { effect_kind: move.effect_kind },
          created_at: clock.iso(),
        });
      }

      let result = null;
      const player = uow.getPlayer();
      if (foe.hp <= 0) {
        const coinGain = 8 + Math.floor(battleSession.wild.power / 4);
        const resources = uow.getResources();
        resources.coins += coinGain;
        const creature = uow.getCreature(battleSession.you.id);
        if (creature) {
          creature.battles_won += 1;
          creature.experience += 10;
        }
        const rows = uow.statsForCreature(battleSession.you.id);
        let trainBoost = null;
        if (rows.length) {
          const trainable = rows.filter((r) => r.stat_id <= 5);
          const pick = (trainable.length ? trainable : rows)[random.intBelow((trainable.length || rows.length))];
          pick.value += 1;
          trainBoost = { stat: catalog.statById(pick.stat_id), value: pick.value };
        }
        if (random.next() < 0.25) uow.addInventory(2, 1); // ration
        if (random.next() < 0.08) uow.addInventory(1, 1); // Apex Seal

        const scan = applyScanProgress({
          catalog,
          uow,
          random,
          speciesId: battleSession.wild.species_id,
        });

        appendEvent(uow, player.id, "Battle", battleSession.battleId, "BattleWon", {
          coinGain,
          scan,
        });
        log.push({ text: `Victory! +${coinGain} coins.`, reward: true });
        if (scan) {
          log.push({
            text: `Scan ${scan.speciesName}: +${scan.gain}% → ${scan.scanLevel}%${
              scan.canClaim ? " — ready to claim!" : ""
            }`,
            reward: true,
          });
        }
        result = {
          outcome: "win",
          coinGain,
          trainBoost,
          scan,
        };
      } else if (you.hp <= 0) {
        appendEvent(uow, player.id, "Battle", battleSession.battleId, "BattleLost", {});
        log.push({ text: `${battleSession.you.nickname} was overwhelmed…` });
        result = { outcome: "lose" };
      }

      uow.commit();
      return ok({
        youHp: you.hp,
        wildHp: foe.hp,
        turnNumber,
        log,
        result,
      });
    },
  };
}
