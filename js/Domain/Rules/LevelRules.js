export const MAX_CREATURE_LEVEL = 100;

/** XP required to advance from the given level to the next. */
export function xpToNextLevel(level) {
  const lv = Math.max(1, Math.min(MAX_CREATURE_LEVEL, level));
  return 18 + lv * 7;
}

/** XP awarded for defeating a wild of the given stage (1–5). */
export function xpForWildStage(stage) {
  const table = { 1: 14, 2: 22, 3: 34, 4: 48, 5: 64 };
  return table[stage] || 14;
}

/**
 * Apply XP to a creature row; levels up in place up to MAX_CREATURE_LEVEL.
 * @returns {{ xpGain: number, levelsGained: number, level: number, experience: number }}
 */
export function grantCreatureXp(creature, amount) {
  const xpGain = Math.max(0, Math.floor(amount));
  if (!creature || xpGain <= 0 || creature.level >= MAX_CREATURE_LEVEL) {
    return {
      xpGain: 0,
      levelsGained: 0,
      level: creature?.level ?? 1,
      experience: creature?.experience ?? 0,
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
  };
}
