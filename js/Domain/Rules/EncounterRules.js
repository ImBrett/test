import { MAX_CREATURE_LEVEL } from "./LevelRules.js";

/** Weighted row from a zone encounter table. */
export function weightedPick(encounters, random) {
  if (!encounters?.length) return null;
  const total = encounters.reduce((sum, row) => sum + row.weight, 0);
  let roll = random.next() * total;
  for (const row of encounters) {
    roll -= row.weight;
    if (roll <= 0) return row;
  }
  return encounters[encounters.length - 1];
}

/** Inclusive level roll inside an area's band. Stage does not shift it. */
export function rollLevelInBand(minLevel, maxLevel, random) {
  const min = Math.max(1, Math.min(MAX_CREATURE_LEVEL, minLevel || 1));
  const max = Math.max(min, Math.min(MAX_CREATURE_LEVEL, maxLevel || min));
  return min + random.intBelow(max - min + 1);
}

/** First area is open. Later areas open after a win in the previous one. */
export function isZoneUnlocked(zone, clearedIds = []) {
  if (!zone?.unlock_after_zone_id) return true;
  return clearedIds.includes(zone.unlock_after_zone_id);
}
