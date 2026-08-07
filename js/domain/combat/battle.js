/**
 * Battle domain service — turn resolution + catch chance.
 * Depends on move resolvers + catalog (DIP via injection).
 */
import { combatPower } from "./power.js";
import { resolveMove } from "./moves.js";

export function createBattleService({ catalog, moveResolvers }) {
  function catchChance(battle) {
    const species = battle.wild.species;
    const base = species.base_catch_rate || 0.35;
    const ratio = battle.you.power / Math.max(1, battle.wild.power);
    const hpFactor =
      1 - (battle.wildHp || 0) / Math.max(1, battle.wildMax || battle.wildCombat.hp);
    return Math.min(0.85, base + Math.max(0, ratio - 1) * 0.12 + hpFactor * 0.2);
  }

  function resolveTurn(battle, actionKind) {
    const youMove = catalog.moveByCodeOrKind(actionKind);
    const foeMoves = catalog.movesForSpecies(battle.wild.species_id).map((m) => m.move);
    const foeMove = foeMoves[Math.floor(Math.random() * foeMoves.length)] || catalog.moveById(1);

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
          [you, foe, youMove, battle.you.nickname],
          [foe, you, foeMove, battle.wild.nickname],
        ]
      : [
          [foe, you, foeMove, battle.wild.nickname],
          [you, foe, youMove, battle.you.nickname],
        ];

    const log = [];
    const actions = [];
    const turnNumber = (battle.turnNumber || 0) + 1;

    for (const [actor, target, move, label] of order) {
      if (actor.hp <= 0) continue;
      const lines = resolveMove(moveResolvers, actor, target, move, label);
      log.push(...lines);
      actions.push({
        turn_number: turnNumber,
        actor_label: label,
        move_id: move.id,
        action_kind: "move",
        damage: lines.reduce((a, l) => a + (l.dmg || 0), 0),
        was_critical: lines.some((l) => l.crit) ? 1 : 0,
        payload: { effect_kind: move.effect_kind },
      });
    }

    let result = null;
    if (foe.hp <= 0) result = { outcome: "win" };
    else if (you.hp <= 0) result = { outcome: "lose" };

    return { youHp: you.hp, wildHp: foe.hp, turnNumber, log, actions, result };
  }

  return { combatPower, catchChance, resolveTurn };
}
