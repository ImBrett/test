/**
 * Move effect strategies (OCP) — keyed by effect_kind.
 * New move behaviors register here without editing the battle loop.
 */

export function createMoveResolvers({ catalog }) {
  function dealDamage(attacker, defender, move, attackerLabel, payload) {
    if (Math.random() > (move.accuracy || 1)) {
      return [{ text: `${attackerLabel}'s ${move.display_name} missed!`, dmg: 0 }];
    }

    let mult = payload.mult != null ? payload.mult : 1;
    const matchup = catalog.matchupMultiplier(
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
    return [
      {
        text: `${attackerLabel} uses ${move.display_name} for ${mitigated}${crit ? "!" : "."}${tip}`,
        crit,
        dmg: mitigated,
        matchup,
      },
    ];
  }

  return {
    heal(attacker, _defender, move, attackerLabel, payload) {
      const heal = Math.round(attacker.hpMax * (payload.heal_pct || 0.1));
      attacker.hp = Math.min(attacker.hpMax, attacker.hp + heal);
      return [{ text: `${attackerLabel} recovers ${heal} HP.`, dmg: 0 }];
    },

    guard(attacker, defender, move, attackerLabel, payload) {
      attacker._guarding = true;
      if (payload.def_buff) attacker.def += payload.def_buff;
      return dealDamage(attacker, defender, move, attackerLabel, payload);
    },

    strike: dealDamage,
    burst: dealDamage,
    buff: dealDamage,
    debuff: dealDamage,
  };
}

export function resolveMove(resolvers, attacker, defender, move, attackerLabel) {
  const payload = move.effect_payload || {};
  const fn = resolvers[move.effect_kind] || resolvers.strike;
  return fn(attacker, defender, move, attackerLabel, payload);
}
