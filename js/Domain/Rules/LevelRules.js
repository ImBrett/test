export const MAX_CREATURE_LEVEL = 100;

/** Primary stat ids that grow on level-up. */
export const LEVEL_GROWTH_STATS = Object.freeze([
  { statId: 1, gain: 1 }, // Attack
  { statId: 2, gain: 2 }, // Health
  { statId: 3, gain: 1 }, // Speed
  { statId: 4, gain: 1 }, // Defense
  { statId: 5, gain: 1 }, // Mana
]);

/** XP required to advance from the given level to the next. */
export function xpToNextLevel(level) {
  const lv = Math.max(1, Math.min(MAX_CREATURE_LEVEL, level));
  return 18 + lv * 7;
}

/** XP awarded for defeating a wild of the given stage/level. */
export function xpForWild(stage, level = 1) {
  const table = { 1: 14, 2: 22, 3: 34, 4: 48, 5: 64 };
  return (table[stage] || 14) + Math.floor(Math.max(1, level) * 1.25);
}

/** @deprecated use xpForWild */
export function xpForWildStage(stage) {
  return xpForWild(stage, 1);
}

/**
 * Apply N levels of growth to creature stat rows.
 * @returns {{ statId: number, name: string, gain: number, value: number }[]}
 */
export function applyLevelUpStatGains({ catalog, uow, creatureId, levels }) {
  if (!levels || levels < 1) return [];
  const rows = uow.statsForCreature(creatureId);
  const totals = new Map();
  for (let i = 0; i < levels; i++) {
    for (const { statId, gain } of LEVEL_GROWTH_STATS) {
      const row = rows.find((r) => r.stat_id === statId);
      if (!row) continue;
      row.value += gain;
      totals.set(statId, (totals.get(statId) || 0) + gain);
    }
  }
  return [...totals.entries()].map(([statId, gain]) => {
    const stat = catalog.statById(statId);
    const row = rows.find((r) => r.stat_id === statId);
    return {
      statId,
      name: stat?.display_name || `Stat ${statId}`,
      color: stat?.color,
      gain,
      value: row?.value ?? 0,
    };
  });
}

/**
 * Scale a base stat value as if the creature reached `level` via level-ups.
 * Level 1 = base; each extra level adds the same growth table.
 */
export function scaleStatForLevel(statId, baseValue, level) {
  const lv = Math.max(1, Math.min(MAX_CREATURE_LEVEL, level));
  const growth = LEVEL_GROWTH_STATS.find((g) => g.statId === statId);
  const perLevel = growth?.gain ?? 0;
  return Math.max(1, Math.round(baseValue + (lv - 1) * perLevel));
}

/**
 * @deprecated Wild levels come from the area band in EncounterRules.rollLevelInBand.
 * Stage is ignored so a leftover caller cannot jump a level-1 pet to level 6+.
 */
export function rollWildLevel(playerLevel, _stage, random) {
  const base = Math.max(1, playerLevel || 1);
  const jitter = random.intBelow(3) - 1; // -1..+1
  return Math.max(1, Math.min(MAX_CREATURE_LEVEL, base + jitter));
}

/**
 * Apply XP to a creature row; levels up in place up to MAX_CREATURE_LEVEL.
 * @returns {{ xpGain, levelsGained, level, experience, leveled: boolean }}
 */
export function grantCreatureXp(creature, amount) {
  const xpGain = Math.max(0, Math.floor(amount));
  if (!creature || xpGain <= 0 || creature.level >= MAX_CREATURE_LEVEL) {
    return {
      xpGain: 0,
      levelsGained: 0,
      level: creature?.level ?? 1,
      experience: creature?.experience ?? 0,
      leveled: false,
    };
  }

  creature.experience += xpGain;
  let levelsGained = 0;
  while (creature.level < MAX_CREATURE_LEVEL) {
    const need = xpToNextLevel(creature.level);
    if (creature.experience < need) break;
    creature.experience -= need;
    creature.level += 1;
    levelsGained += 1;
  }
  if (creature.level >= MAX_CREATURE_LEVEL) {
    creature.level = MAX_CREATURE_LEVEL;
    creature.experience = 0;
  }
  return {
    xpGain,
    levelsGained,
    level: creature.level,
    experience: creature.experience,
    leveled: levelsGained > 0,
  };
}
