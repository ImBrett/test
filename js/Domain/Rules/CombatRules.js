export function combatPower(enriched) {
  const map = Object.fromEntries(enriched.stats.map((s) => [s.stat_id, s.value]));
  const attack = map[1] || 0;
  const health = map[2] || 0;
  const speed = map[3] || 0;
  const defense = map[4] || 0;
  const mana = map[5] || 0;
  const critChance = map[6] || 0;
  const critDamage = map[7] || 0;
  const effectiveness = map[8] || 0;
  const resilience = map[9] || 0;
  return {
    hp: 48 + health * 5 + defense * 2,
    atk: 8 + attack * 2 + Math.floor(mana * 0.6),
    spd: 5 + speed,
    def: 3 + Math.floor(defense * 1.3),
    crit: Math.min(45, 4 + critChance + Math.floor(speed * 0.3)),
    critMult: 1.5 + critDamage * 0.02,
    effectiveness,
    resilience,
    mana,
    element_id: enriched.species?.element_id,
    map,
  };
}

function tryExtraEffect(random, attacker, defender, payload, label, lines) {
  const chance = payload.status_chance;
  if (!chance) return;
  const land =
    chance +
    (attacker.effectiveness || 0) * 0.01 -
    (defender.resilience || 0) * 0.01;
  if (random.next() > Math.max(0.05, Math.min(0.85, land))) {
    lines.push({ text: `${label}'s extra effect failed to stick.`, dmg: 0 });
    return;
  }
  if (payload.def_debuff) {
    defender.def = Math.max(0, defender.def - payload.def_debuff);
    lines.push({ text: `${label}'s ${payload.status || "effect"} softens their defense!`, dmg: 0 });
  }
  if (payload.spd_debuff) {
    defender.spd = Math.max(0, defender.spd - payload.spd_debuff);
    lines.push({ text: `${label}'s ${payload.status || "effect"} slows them!`, dmg: 0 });
  }
  if (payload.atk_debuff) {
    defender.atk = Math.max(1, defender.atk - payload.atk_debuff);
    lines.push({ text: `${label}'s ${payload.status || "effect"} saps their attack!`, dmg: 0 });
  }
  if (payload.status && !payload.def_debuff && !payload.spd_debuff && !payload.atk_debuff) {
    lines.push({ text: `${label} lands ${payload.status}!`, dmg: 0 });
  }
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
    if (crit) mult *= attacker.critMult || 1.6;
    const raw = attacker.atk * mult * (move.power / 100);
    const mitigated = Math.max(
      1,
      Math.round(raw - defender.def * (defender._guarding ? 1.8 : 1))
    );
    defender.hp = Math.max(0, defender.hp - mitigated);
    defender._guarding = false;
    const tip =
      matchup > 1 ? " It's super effective!" : matchup < 1 ? " It's not very effective…" : "";
    const lines = [
      {
        text: `${label} uses ${move.display_name} for ${mitigated}${crit ? "!" : "."}${tip}`,
        crit,
        dmg: mitigated,
        matchup,
      },
    ];
    tryExtraEffect(random, attacker, defender, payload, label, lines);
    return lines;
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
