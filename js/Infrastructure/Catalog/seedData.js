/** Catalog seed — Digimon-style 5-stage branching trees (max 3 branches / node). */

export const rarities = [
  { id: 1, code: "common", display_name: "Common", sort_order: 1 },
  { id: 2, code: "uncommon", display_name: "Uncommon", sort_order: 2 },
  { id: 3, code: "rare", display_name: "Rare", sort_order: 3 },
  { id: 4, code: "mythic", display_name: "Mythic", sort_order: 4 },
];

export const elements = [
  { id: 1, code: "ember", display_name: "Ember", hue: 18 },
  { id: 2, code: "tide", display_name: "Tide", hue: 198 },
  { id: 3, code: "gale", display_name: "Gale", hue: 160 },
  { id: 4, code: "stone", display_name: "Stone", hue: 35 },
  { id: 5, code: "shade", display_name: "Shade", hue: 265 },
  { id: 6, code: "bloom", display_name: "Bloom", hue: 130 },
];

export const elementMatchups = [
  [1, 4, 1.5], [1, 6, 1.5], [1, 2, 0.5],
  [2, 1, 1.5], [2, 4, 1.5], [2, 6, 0.5],
  [3, 6, 1.5], [3, 5, 1.5], [3, 4, 0.5],
  [4, 3, 1.5], [4, 1, 0.5], [4, 5, 1.5],
  [5, 3, 0.5], [5, 6, 1.5], [5, 5, 0.5],
  [6, 2, 1.5], [6, 4, 0.5], [6, 1, 0.5],
].map(([attacker_element_id, defender_element_id, multiplier]) => ({
  attacker_element_id, defender_element_id, multiplier,
}));

export const stats = [
  { id: 1, code: "might", display_name: "Might", description: "Raw strike power", color: "#E85D4C", combat_role: "offense" },
  { id: 2, code: "vital", display_name: "Vital", description: "Health & recovery", color: "#3DBE8B", combat_role: "sustain" },
  { id: 3, code: "swift", display_name: "Swift", description: "Speed & crit chance", color: "#4DB8E8", combat_role: "speed" },
  { id: 4, code: "guard", display_name: "Guard", description: "Damage reduction", color: "#C4A35A", combat_role: "defense" },
  { id: 5, code: "spirit", display_name: "Spirit", description: "Special force", color: "#5EC8C0", combat_role: "special" },
].map((s) => ({ ...s, name: s.display_name, desc: s.description }));

export const STAGE_NAMES = Object.freeze({
  1: "Spark",
  2: "Rookie",
  3: "Champion",
  4: "Ultimate",
  5: "Apex",
});

export const items = [
  { id: 1, code: "morph_orb", display_name: "Morph Orb", description: "Used to catch wild beasts.", item_kind: "catch", effect_payload: { catch_bonus: 0.15 }, rarity_id: 1, stackable: 1 },
  { id: 2, code: "greater_orb", display_name: "Greater Orb", description: "Higher chance to secure a catch.", item_kind: "catch", effect_payload: { catch_bonus: 0.35 }, rarity_id: 2, stackable: 1 },
  { id: 3, code: "apex_seal", display_name: "Apex Seal", description: "Required for some Apex evolutions.", item_kind: "evolution", effect_payload: {}, rarity_id: 3, stackable: 1 },
  { id: 4, code: "ration", display_name: "Ration", description: "Restores 10 energy.", item_kind: "consumable", effect_payload: { energy: 10 }, rarity_id: 1, stackable: 1 },
  { id: 5, code: "coin_pouch", display_name: "Coin Pouch", description: "Grants 50 coins when opened.", item_kind: "currency_pack", effect_payload: { coins: 50 }, rarity_id: 1, stackable: 1 },
];

/**
 * Species rows: [id, code, name, blurb, glyph, elementId, stage, rarityId, isStarter, catchRate]
 * Three Digimon-style lines (Ember / Tide / Gale), 11 forms each.
 */
const SPECIES_ROWS = [
  // —— Ember ——
  [1, "emberkit", "Emberkit", "A spark that barely knows fire yet.", "🔥", 1, 1, 1, 1, 0.5],
  [2, "cindertuft", "Cindertuft", "Tufts of living ember along its back.", "🕯️", 1, 2, 1, 0, 0.4],
  [3, "pyrewhelp", "Pyrewhelp", "Champions the might path — fists first.", "🌋", 1, 3, 2, 0, 0.28],
  [4, "scorchpaw", "Scorchpaw", "Champions the swift path — heat mirage.", "🦊", 1, 3, 2, 0, 0.28],
  [5, "emberveil", "Emberveil", "Champions the spirit path — veiled flame.", "🪄", 1, 3, 2, 0, 0.28],
  [6, "blazemane", "Blazemane", "A mane of solar fire.", "🦁", 1, 4, 3, 0, 0.16],
  [7, "cinderstreak", "Cinderstreak", "Cuts the air into burning ribbons.", "☄️", 1, 4, 3, 0, 0.16],
  [8, "solarwick", "Solarwick", "A living lantern of will.", "🔆", 1, 4, 3, 0, 0.16],
  [9, "infernox", "Infernox", "Apex of might — walking furnace.", "🐉", 1, 5, 4, 0, 0.08],
  [10, "helixion", "Helixion", "Apex of swift — orbital blaze.", "💫", 1, 5, 4, 0, 0.08],
  [11, "primordial", "Primordial", "Apex of spirit — first flame.", "👁️", 1, 5, 4, 0, 0.08],

  // —— Tide ——
  [12, "dewlet", "Dewlet", "A droplet that dreams of oceans.", "💧", 2, 1, 1, 1, 0.5],
  [13, "drizzlet", "Drizzlet", "Soft rain given paws.", "🌧️", 2, 2, 1, 0, 0.4],
  [14, "cascara", "Cascara", "Champions vital — tide that never breaks.", "🌊", 2, 3, 2, 0, 0.28],
  [15, "rippletide", "Rippletide", "Champions swift — skims every crest.", "🐟", 2, 3, 2, 0, 0.28],
  [16, "murkfin", "Murkfin", "Champions guard — shell of the deep.", "🐢", 2, 3, 2, 0, 0.28],
  [17, "tidalking", "Tidalking", "Commands the swell.", "🐋", 2, 4, 3, 0, 0.16],
  [18, "seaverge", "Seaverge", "A blade of living current.", "🗡️", 2, 4, 3, 0, 0.16],
  [19, "abysshell", "Abysshell", "Pressure made armor.", "🛡️", 2, 4, 3, 0, 0.16],
  [20, "leviathan", "Leviathan", "Apex of vital — the deep itself.", "🦑", 2, 5, 4, 0, 0.08],
  [21, "spindrift", "Spindrift", "Apex of swift — storm spray incarnate.", "🌪️", 2, 5, 4, 0, 0.08],
  [22, "abyssrex", "Abyssrex", "Apex of guard — trench sovereign.", "🐊", 2, 5, 4, 0, 0.08],

  // —— Gale ——
  [23, "gustling", "Gustling", "A breeze that refuses to land.", "🍃", 3, 1, 1, 1, 0.5],
  [24, "fluffgale", "Fluffgale", "Cloud-soft and suddenly sharp.", "☁️", 3, 2, 1, 0, 0.4],
  [25, "zephyrix", "Zephyrix", "Champions swift — ribbon of wind.", "🦅", 3, 3, 2, 0, 0.28],
  [26, "galeclaw", "Galeclaw", "Champions might — talons in the gale.", "🦉", 3, 3, 2, 0, 0.28],
  [27, "nimbat", "Nimbat", "Champions spirit — storm whisperer.", "🦇", 3, 3, 2, 0, 0.28],
  [28, "stormara", "Stormara", "Thunder-winged hunter.", "⚡", 3, 4, 3, 0, 0.16],
  [29, "skyshard", "Skyshard", "A spear of pressurized air.", "💠", 3, 4, 3, 0, 0.16],
  [30, "cyclonix", "Cyclonix", "Eye of the spinning choir.", "🌀", 3, 4, 3, 0, 0.16],
  [31, "tempestlord", "Tempestlord", "Apex of swift — sky's final word.", "👑", 3, 5, 4, 0, 0.08],
  [32, "aetherwing", "Aetherwing", "Apex of might — wings that shear stone.", "🪽", 3, 5, 4, 0, 0.08],
  [33, "voidgale", "Voidgale", "Apex of spirit — wind from nowhere.", "🌫️", 3, 5, 4, 0, 0.08],
];

export const species = SPECIES_ROWS.map(
  ([id, code, display_name, blurb, glyph, element_id, stage, rarity_id, is_starter, base_catch_rate]) => {
    const element = elements.find((e) => e.id === element_id);
    return {
      id, code, display_name, blurb, glyph, element_id, stage, rarity_id, is_starter, base_catch_rate,
      element, hue: element.hue, name: display_name, stage_name: STAGE_NAMES[stage],
    };
  }
);

/** Primary-focused base stats by species id: [might, vital, swift, guard, spirit] */
const BASE_STATS = {
  // Ember
  1: [6, 5, 5, 4, 4], 2: [9, 7, 7, 5, 5],
  3: [15, 10, 9, 8, 7], 4: [10, 9, 15, 7, 8], 5: [9, 10, 9, 7, 15],
  6: [20, 14, 12, 11, 10], 7: [14, 12, 20, 10, 12], 8: [12, 14, 13, 11, 20],
  9: [28, 18, 15, 14, 12], 10: [18, 16, 28, 13, 16], 11: [16, 18, 17, 14, 28],
  // Tide
  12: [4, 7, 5, 5, 4], 13: [6, 11, 7, 7, 5],
  14: [9, 16, 10, 11, 8], 15: [10, 11, 16, 8, 9], 16: [9, 13, 8, 16, 7],
  17: [12, 22, 13, 15, 11], 18: [14, 15, 22, 12, 13], 19: [13, 18, 11, 22, 10],
  20: [15, 30, 16, 18, 14], 21: [18, 18, 30, 14, 16], 22: [16, 22, 14, 30, 12],
  // Gale
  23: [5, 5, 7, 3, 5], 24: [7, 7, 11, 5, 7],
  25: [10, 9, 16, 7, 10], 26: [16, 10, 11, 8, 8], 27: [9, 10, 12, 7, 16],
  28: [13, 12, 22, 10, 14], 29: [22, 13, 14, 11, 11], 30: [12, 14, 16, 10, 22],
  31: [16, 15, 30, 12, 18], 32: [30, 16, 17, 14, 14], 33: [15, 17, 20, 13, 30],
};

let sbsId = 1;
export const speciesBaseStats = Object.entries(BASE_STATS).flatMap(([speciesId, values]) =>
  values.map((value, i) => ({
    id: sbsId++,
    species_id: Number(speciesId),
    stat_id: i + 1,
    value,
  }))
);

export const moves = [
  { id: 1, code: "strike", display_name: "Strike", description: "A solid blow.", element_id: null, effect_kind: "strike", power: 100, accuracy: 1, energy_cost: 0, effect_payload: { mult: 1.0 } },
  { id: 2, code: "guard", display_name: "Guard", description: "Brace and reduce damage taken.", element_id: null, effect_kind: "guard", power: 40, accuracy: 1, energy_cost: 0, effect_payload: { mult: 0.55, guarding: true } },
  { id: 3, code: "burst", display_name: "Burst", description: "Risky all-out assault.", element_id: null, effect_kind: "burst", power: 155, accuracy: 0.9, energy_cost: 0, effect_payload: { mult: 1.55 } },
  { id: 4, code: "cinder_jab", display_name: "Cinder Jab", description: "Ember poke that scorches.", element_id: 1, effect_kind: "strike", power: 110, accuracy: 1, energy_cost: 0, effect_payload: { mult: 1.1 } },
  { id: 5, code: "tide_lash", display_name: "Tide Lash", description: "A whipping current.", element_id: 2, effect_kind: "strike", power: 110, accuracy: 1, energy_cost: 0, effect_payload: { mult: 1.1 } },
  { id: 6, code: "gust_cut", display_name: "Gust Cut", description: "A slicing breeze.", element_id: 3, effect_kind: "strike", power: 105, accuracy: 1, energy_cost: 0, effect_payload: { mult: 1.05, crit_bonus: 5 } },
  { id: 7, code: "stone_wall", display_name: "Stone Wall", description: "Raise a rocky guard.", element_id: 4, effect_kind: "guard", power: 30, accuracy: 1, energy_cost: 0, effect_payload: { mult: 0.4, guarding: true, def_buff: 2 } },
  { id: 8, code: "umbra_spike", display_name: "Umbra Spike", description: "Strike from the blind spot.", element_id: 5, effect_kind: "burst", power: 140, accuracy: 0.92, energy_cost: 0, effect_payload: { mult: 1.4 } },
  { id: 9, code: "bloom_soothe", display_name: "Bloom Soothe", description: "Restore a little vitality.", element_id: 6, effect_kind: "heal", power: 0, accuracy: 1, energy_cost: 0, effect_payload: { heal_pct: 0.18 } },
];

const ELEMENTAL_MOVE = { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9 };
let smId = 1;
export const speciesMoves = species.flatMap((s) =>
  [[1, 1], [2, 2], [3, 3], [ELEMENTAL_MOVE[s.element_id] || 1, 4]].map(([move_id, slot]) => ({
    id: smId++,
    species_id: s.id,
    move_id,
    unlock_stage: 1,
    slot,
  }))
);

/**
 * Paths: [id, ancestor, descendant, branchIndex, label]
 * Max 3 branches from any ancestor.
 */
export const evolutionPaths = [
  // Ember
  [1, 1, 2, 1, "Rookie"],
  [2, 2, 3, 1, "Might"], [3, 2, 4, 2, "Swift"], [4, 2, 5, 3, "Spirit"],
  [5, 3, 6, 1, "Might Ult"], [6, 4, 7, 1, "Swift Ult"], [7, 5, 8, 1, "Spirit Ult"],
  [8, 6, 9, 1, "Apex"], [9, 7, 10, 1, "Apex"], [10, 8, 11, 1, "Apex"],
  // Tide
  [11, 12, 13, 1, "Rookie"],
  [12, 13, 14, 1, "Vital"], [13, 13, 15, 2, "Swift"], [14, 13, 16, 3, "Guard"],
  [15, 14, 17, 1, "Vital Ult"], [16, 15, 18, 1, "Swift Ult"], [17, 16, 19, 1, "Guard Ult"],
  [18, 17, 20, 1, "Apex"], [19, 18, 21, 1, "Apex"], [20, 19, 22, 1, "Apex"],
  // Gale
  [21, 23, 24, 1, "Rookie"],
  [22, 24, 25, 1, "Swift"], [23, 24, 26, 2, "Might"], [24, 24, 27, 3, "Spirit"],
  [25, 25, 28, 1, "Swift Ult"], [26, 26, 29, 1, "Might Ult"], [27, 27, 30, 1, "Spirit Ult"],
  [28, 28, 31, 1, "Apex"], [29, 29, 32, 1, "Apex"], [30, 30, 33, 1, "Apex"],
].map(([id, ancestor_species_id, descendant_species_id, branch_index, label]) => ({
  id, ancestor_species_id, descendant_species_id, branch_index, label, sort_order: branch_index,
}));

/** Requirements: [pathId, kind, statId|null, itemId|null, threshold] */
let erId = 1;
export const evolutionRequirements = [
  // Ember S1→S2
  [1, "stat", 1, null, 10],
  // S2→S3 branches
  [2, "stat", 1, null, 16], [3, "stat", 3, null, 16], [4, "stat", 5, null, 16],
  // S3→S4
  [5, "stat", 1, null, 22], [5, "battles_won", null, null, 3],
  [6, "stat", 3, null, 22], [6, "battles_won", null, null, 3],
  [7, "stat", 5, null, 22], [7, "battles_won", null, null, 3],
  // S4→S5 (+ apex seal)
  [8, "stat", 1, null, 28], [8, "item", null, 3, 1],
  [9, "stat", 3, null, 28], [9, "item", null, 3, 1],
  [10, "stat", 5, null, 28], [10, "item", null, 3, 1],
  // Tide
  [11, "stat", 2, null, 10],
  [12, "stat", 2, null, 16], [13, "stat", 3, null, 16], [14, "stat", 4, null, 16],
  [15, "stat", 2, null, 22], [15, "battles_won", null, null, 3],
  [16, "stat", 3, null, 22], [16, "battles_won", null, null, 3],
  [17, "stat", 4, null, 22], [17, "battles_won", null, null, 3],
  [18, "stat", 2, null, 28], [18, "item", null, 3, 1],
  [19, "stat", 3, null, 28], [19, "item", null, 3, 1],
  [20, "stat", 4, null, 28], [20, "item", null, 3, 1],
  // Gale
  [21, "stat", 3, null, 10],
  [22, "stat", 3, null, 16], [23, "stat", 1, null, 16], [24, "stat", 5, null, 16],
  [25, "stat", 3, null, 22], [25, "battles_won", null, null, 3],
  [26, "stat", 1, null, 22], [26, "battles_won", null, null, 3],
  [27, "stat", 5, null, 22], [27, "battles_won", null, null, 3],
  [28, "stat", 3, null, 28], [28, "item", null, 3, 1],
  [29, "stat", 1, null, 28], [29, "item", null, 3, 1],
  [30, "stat", 5, null, 28], [30, "item", null, 3, 1],
].map(([evolution_path_id, requirement_kind, stat_id, item_id, threshold_value]) => ({
  id: erId++,
  evolution_path_id,
  requirement_kind,
  stat_id,
  item_id,
  threshold_value,
}));

export const zones = [
  [1, "emberfield", "Emberfield", "Ash drifts over cracked earth.", 2],
  [2, "mistshore", "Mistshore", "Fog curls between tidepools.", 2],
  [3, "highridge", "Highridge", "Wind shears the cliff edge.", 2],
  [4, "shadehollow", "Shadehollow", "Where all three lines roam wild.", 2],
].map(([id, code, display_name, vibe, energy_cost]) => ({
  id, code, display_name, vibe, energy_cost, min_player_level: 1, name: display_name,
}));

let zeId = 1;
export const zoneEncounters = [
  // Emberfield — ember spark/rookie/champion
  [1, 1, 35, 1], [1, 2, 30, 2], [1, 3, 12, 3], [1, 4, 12, 3], [1, 5, 11, 3],
  // Mistshore — tide
  [2, 12, 35, 1], [2, 13, 30, 2], [2, 14, 12, 3], [2, 15, 12, 3], [2, 16, 11, 3],
  // Highridge — gale
  [3, 23, 35, 1], [3, 24, 30, 2], [3, 25, 12, 3], [3, 26, 12, 3], [3, 27, 11, 3],
  // Shadehollow — mixed early forms
  [4, 1, 20, 1], [4, 12, 20, 1], [4, 23, 20, 1], [4, 2, 15, 2], [4, 13, 15, 2], [4, 24, 10, 2],
].map(([zone_id, species_id, weight, stage]) => ({
  id: zeId++,
  zone_id,
  species_id,
  weight,
  min_stage: stage,
  max_stage: stage,
  stat_variance_min: stage <= 2 ? 0.72 : 0.8,
  stat_variance_max: stage <= 2 ? 1.0 : 1.05,
}));

export const trainingDrills = stats.map((s, i) => ({
  id: i + 1,
  code: `${s.code}_drill`,
  display_name: `${s.display_name} Drill`,
  description: s.description,
  stat_id: s.id,
  energy_cost: 1,
  base_gain: 1,
  critical_chance: 0.18,
  critical_bonus: 1,
  coin_reward: 1,
}));
