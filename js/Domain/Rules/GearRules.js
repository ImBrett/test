/**
 * Outerplane-inspired gear rules for Morph.
 * - 6 slots with fixed main (and gloves/boots fixed sub)
 * - Up to 4 unique random substats (never duplicating main/fixed)
 * - Reforge (gold only): fill empty sub lines, then upgrade existing ones
 * - No breakthrough / enhance — main & sub bases scale by rarity only
 */

export const GEAR_SLOTS = Object.freeze([
  "weapon",
  "accessory",
  "helmet",
  "chestplate",
  "gloves",
  "boots",
]);

export const SLOT_DEFS = Object.freeze({
  weapon: {
    label: "Weapon",
    mainPool: ["attack", "health", "defense"],
    fixedSub: null,
  },
  accessory: {
    label: "Accessory",
    mainPool: ["speed", "crit_chance", "crit_damage"],
    fixedSub: null,
  },
  helmet: {
    label: "Helmet",
    mainPool: ["health"],
    fixedSub: null,
  },
  chestplate: {
    label: "Chestplate",
    mainPool: ["defense"],
    fixedSub: null,
  },
  gloves: {
    label: "Gloves",
    mainPool: ["effectiveness"],
    fixedSub: "defense",
  },
  boots: {
    label: "Boots",
    mainPool: ["resilience"],
    fixedSub: "health",
  },
});

export const GEAR_RARITIES = Object.freeze([
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
]);

export const ALL_GEAR_STATS = Object.freeze([
  "attack",
  "health",
  "defense",
  "speed",
  "crit_chance",
  "crit_damage",
  "effectiveness",
  "resilience",
]);

export const MAX_SUB_STATS = 4;
export const MAX_SUB_LEVEL = 6;

const MAIN_BY_RARITY = Object.freeze({
  attack: { common: 8, uncommon: 14, rare: 22, epic: 34, legendary: 50 },
  health: { common: 10, uncommon: 18, rare: 28, epic: 42, legendary: 62 },
  defense: { common: 8, uncommon: 14, rare: 22, epic: 34, legendary: 50 },
  speed: { common: 6, uncommon: 11, rare: 17, epic: 26, legendary: 38 },
  crit_chance: { common: 3, uncommon: 5, rare: 8, epic: 12, legendary: 18 },
  crit_damage: { common: 6, uncommon: 12, rare: 20, epic: 32, legendary: 48 },
  effectiveness: { common: 4, uncommon: 8, rare: 14, epic: 22, legendary: 32 },
  resilience: { common: 4, uncommon: 8, rare: 14, epic: 22, legendary: 32 },
});

/** Per-level substat value (level 1 = base; reforging adds levels). */
const SUB_PER_LEVEL = Object.freeze({
  attack: { common: 3, uncommon: 5, rare: 8, epic: 12, legendary: 17 },
  health: { common: 4, uncommon: 7, rare: 11, epic: 16, legendary: 23 },
  defense: { common: 3, uncommon: 5, rare: 8, epic: 12, legendary: 17 },
  speed: { common: 2, uncommon: 4, rare: 6, epic: 9, legendary: 13 },
  crit_chance: { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 6 },
  crit_damage: { common: 2, uncommon: 4, rare: 7, epic: 11, legendary: 16 },
  effectiveness: { common: 2, uncommon: 3, rare: 5, epic: 8, legendary: 11 },
  resilience: { common: 2, uncommon: 3, rare: 5, epic: 8, legendary: 11 },
});

const REFORGE_BASE_GOLD = Object.freeze({
  common: 40,
  uncommon: 120,
  rare: 350,
  epic: 900,
  legendary: 2200,
});

const RARITY_LABELS = Object.freeze({
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
});

const SLOT_GLYPHS = Object.freeze({
  weapon: "⚔",
  accessory: "✦",
  helmet: "◈",
  chestplate: "▣",
  gloves: "⬡",
  boots: "⊿",
});

export function rarityLabel(rarity) {
  return RARITY_LABELS[rarity] || rarity;
}

export function slotLabel(slot) {
  return SLOT_DEFS[slot]?.label || slot;
}

export function slotGlyph(slot) {
  return SLOT_GLYPHS[slot] || "◆";
}

export function mainStatValue(statCode, rarity) {
  return MAIN_BY_RARITY[statCode]?.[rarity] ?? 0;
}

export function subStatValue(statCode, rarity, level = 1) {
  const per = SUB_PER_LEVEL[statCode]?.[rarity] ?? 1;
  return per * Math.max(1, Math.min(MAX_SUB_LEVEL, level));
}

export function reservedStatCodes(piece) {
  const reserved = new Set([piece.main_stat_code]);
  if (piece.fixed_sub_code) reserved.add(piece.fixed_sub_code);
  for (const s of piece.sub_stats || []) reserved.add(s.code);
  return reserved;
}

export function eligibleSubStatCodes(piece, { includeExisting = false } = {}) {
  const reserved = new Set([piece.main_stat_code]);
  if (piece.fixed_sub_code) reserved.add(piece.fixed_sub_code);
  if (!includeExisting) {
    for (const s of piece.sub_stats || []) reserved.add(s.code);
  }
  return ALL_GEAR_STATS.filter((c) => !reserved.has(c));
}

function pick(random, list) {
  if (!list.length) return null;
  return list[random.intBelow(list.length)];
}

/**
 * Roll a new gear piece of the given rarity (random slot unless forced).
 */
export function rollGearPiece({ rarity, random, slot = null, playerId }) {
  if (!GEAR_RARITIES.includes(rarity)) {
    throw new Error(`Unknown gear rarity: ${rarity}`);
  }
  const chosenSlot = slot && SLOT_DEFS[slot] ? slot : pick(random, GEAR_SLOTS);
  const def = SLOT_DEFS[chosenSlot];
  const mainCode = pick(random, def.mainPool);
  const piece = {
    player_id: playerId,
    slot: chosenSlot,
    rarity,
    main_stat_code: mainCode,
    main_stat_value: mainStatValue(mainCode, rarity),
    fixed_sub_code: def.fixedSub,
    fixed_sub_value: def.fixedSub ? subStatValue(def.fixedSub, rarity, 1) : null,
    sub_stats: [],
    reforge_count: 0,
    equipped_creature_id: null,
  };
  return piece;
}

export function reforgeCost(piece) {
  const base = REFORGE_BASE_GOLD[piece.rarity] || 100;
  return Math.floor(base * (1 + (piece.reforge_count || 0) * 0.4));
}

/**
 * Reforge: add a substat until 4, then upgrade a random under-capped sub.
 * Always succeeds (Morph simplification vs Outerplane's RNG gel fail).
 */
export function applyReforge(piece, random) {
  const next = {
    ...piece,
    sub_stats: (piece.sub_stats || []).map((s) => ({ ...s })),
  };
  const cost = reforgeCost(next);

  if (next.sub_stats.length < MAX_SUB_STATS) {
    const pool = eligibleSubStatCodes(next);
    if (!pool.length) {
      return { ok: false, reason: "NO_POOL", message: "No substats left to roll" };
    }
    const code = pick(random, pool);
    next.sub_stats.push({
      code,
      level: 1,
      value: subStatValue(code, next.rarity, 1),
    });
    next.reforge_count = (next.reforge_count || 0) + 1;
    return {
      ok: true,
      piece: next,
      cost,
      outcome: "added",
      changed: next.sub_stats[next.sub_stats.length - 1],
    };
  }

  const upgradable = next.sub_stats
    .map((s, index) => ({ s, index }))
    .filter(({ s }) => s.level < MAX_SUB_LEVEL);
  if (!upgradable.length) {
    return { ok: false, reason: "MAXED", message: "All substats are fully reforged" };
  }
  const pickUp = pick(random, upgradable);
  const sub = next.sub_stats[pickUp.index];
  sub.level += 1;
  sub.value = subStatValue(sub.code, next.rarity, sub.level);
  next.reforge_count = (next.reforge_count || 0) + 1;
  return {
    ok: true,
    piece: next,
    cost,
    outcome: "upgraded",
    changed: sub,
  };
}

/**
 * Change one substat line to a different eligible type; keep level.
 */
export function changeSubstat(piece, subIndex, random) {
  const next = {
    ...piece,
    sub_stats: (piece.sub_stats || []).map((s) => ({ ...s })),
  };
  if (subIndex < 0 || subIndex >= next.sub_stats.length) {
    return { ok: false, reason: "BAD_INDEX", message: "Invalid substat" };
  }
  const current = next.sub_stats[subIndex];
  const pool = eligibleSubStatCodes({
    ...next,
    sub_stats: next.sub_stats.filter((_, i) => i !== subIndex),
  });
  if (!pool.length) {
    return { ok: false, reason: "NO_POOL", message: "No alternate substats available" };
  }
  const code = pick(random, pool);
  next.sub_stats[subIndex] = {
    code,
    level: current.level,
    value: subStatValue(code, next.rarity, current.level),
  };
  return {
    ok: true,
    piece: next,
    previous: current,
    changed: next.sub_stats[subIndex],
  };
}

/** Sum all main + fixed + sub bonuses from equipped pieces. */
export function sumGearBonuses(pieces) {
  const out = Object.fromEntries(ALL_GEAR_STATS.map((c) => [c, 0]));
  for (const p of pieces || []) {
    if (p.main_stat_code) out[p.main_stat_code] = (out[p.main_stat_code] || 0) + (p.main_stat_value || 0);
    if (p.fixed_sub_code) out[p.fixed_sub_code] = (out[p.fixed_sub_code] || 0) + (p.fixed_sub_value || 0);
    for (const s of p.sub_stats || []) {
      out[s.code] = (out[s.code] || 0) + (s.value || 0);
    }
  }
  return out;
}

export function gearDisplayName(piece) {
  return `${rarityLabel(piece.rarity)} ${slotLabel(piece.slot)}`;
}

export function serializeSubStats(subs) {
  return JSON.stringify(subs || []);
}

export function parseSubStats(raw) {
  if (Array.isArray(raw)) return raw.map((s) => ({ ...s }));
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}
