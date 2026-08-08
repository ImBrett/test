export function combatPower(enriched) {
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
    element_id: enriched.species?.element_id,
    map,
  };
}

export function createMoveResolvers({ catalog, random }) {
  function dealDamage(attacker, defender, move, label, payload) {
    if (random.next() > (move.accuracy || 1)) {
      return [{ text: `${label}'s ${move.display_name} missed!`, dmg: 0 }];
    }
    let mult = payload.mult != null ? payload.mult : 1;
    const matchup = catalog.matchupMultiplier(
      move.element_id || attacker.element_id,
      defender.element_id
    );
    mult *= matchup;
    const crit = random.next() * 100 < attacker.crit + (payload.crit_bonus || 0);
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
        text: `${label} uses ${move.display_name} for ${mitigated}${crit ? "!" : "."}${tip}`,
        crit,
        dmg: mitigated,
        matchup,
      },
    ];
  }

  return {
    heal(attacker, _d, move, label, payload) {
      const heal = Math.round(attacker.hpMax * (payload.heal_pct || 0.1));
      attacker.hp = Math.min(attacker.hpMax, attacker.hp + heal);
      return [{ text: `${label} recovers ${heal} HP.`, dmg: 0 }];
    },
    guard(attacker, defender, move, label, payload) {
      attacker._guarding = true;
      if (payload.def_buff) attacker.def += payload.def_buff;
      return dealDamage(attacker, defender, move, label, payload);
    },
    strike: dealDamage,
    burst: dealDamage,
  };
}

export function resolveMove(resolvers, attacker, defender, move, label) {
  const payload = move.effect_payload || {};
  const fn = resolvers[move.effect_kind] || resolvers.strike;
  return fn(attacker, defender, move, label, payload);
}
