/** Catalog seed — 6 elements, 5-stage branching trees, scan-based obtain. */

export const rarities = [
  { id: 1, code: "common", display_name: "Common", sort_order: 1 },
  { id: 2, code: "uncommon", display_name: "Uncommon", sort_order: 2 },
  { id: 3, code: "rare", display_name: "Rare", sort_order: 3 },
  { id: 4, code: "mythic", display_name: "Mythic", sort_order: 4 },
];

export const elements = [
  { id: 1, code: "ignis", display_name: "Ignis", hue: 18 },
  { id: 2, code: "veil", display_name: "Veil", hue: 198 },
  { id: 3, code: "aether", display_name: "Aether", hue: 160 },
  { id: 4, code: "terra", display_name: "Terra", hue: 35 },
  { id: 5, code: "umbral", display_name: "Umbral", hue: 265 },
  { id: 6, code: "radiance", display_name: "Radiance", hue: 48 },
];

/** Matchups: strong 1.5, weak 0.5 (incl. self-weak where noted). */
export const elementMatchups = [
  // Ignis → strong Aether; weak Veil + self
  [1, 3, 1.5], [1, 2, 0.5], [1, 1, 0.5],
  // Veil → strong Ignis; weak Terra + self
  [2, 1, 1.5], [2, 4, 0.5], [2, 2, 0.5],
  // Aether → strong Terra; weak Ignis + self
  [3, 4, 1.5], [3, 1, 0.5], [3, 3, 0.5],
  // Terra → strong Veil; weak Aether + self
  [4, 2, 1.5], [4, 3, 0.5], [4, 4, 0.5],
  // Umbral → strong Radiance; weak self
  [5, 6, 1.5], [5, 5, 0.5],
  // Radiance → strong Umbral; weak self
  [6, 5, 1.5], [6, 6, 0.5],
].map(([attacker_element_id, defender_element_id, multiplier]) => ({
  attacker_element_id, defender_element_id, multiplier,
}));

export const stats = [
  { id: 1, code: "attack", display_name: "Attack", description: "Physical strike power", color: "#E85D4C", combat_role: "offense", trainable: 1 },
  { id: 2, code: "health", display_name: "Health", description: "Hit points & recovery", color: "#3DBE8B", combat_role: "sustain", trainable: 1 },
  { id: 3, code: "speed", display_name: "Speed", description: "Turn order priority", color: "#4DB8E8", combat_role: "speed", trainable: 1 },
  { id: 4, code: "defense", display_name: "Defense", description: "Damage reduction", color: "#C4A35A", combat_role: "defense", trainable: 1 },
  { id: 5, code: "mana", display_name: "Mana", description: "Special force & spell power", color: "#5EC8C0", combat_role: "special", trainable: 1 },
  { id: 6, code: "crit_chance", display_name: "Crit Chance", description: "Chance to land critical hits (gear later)", color: "#F0C24B", combat_role: "crit", trainable: 0 },
  { id: 7, code: "crit_damage", display_name: "Crit Damage", description: "Critical hit multiplier (gear later)", color: "#F08A4B", combat_role: "crit", trainable: 0 },
  { id: 8, code: "effectiveness", display_name: "Effectiveness", description: "Chance to land attack extras", color: "#B07CFF", combat_role: "status", trainable: 0 },
  { id: 9, code: "resilience", display_name: "Resilience", description: "Chance to resist attack extras", color: "#8AA0B8", combat_role: "status", trainable: 0 },
].map((s) => ({ ...s, name: s.display_name, desc: s.description }));

export const STAGE_NAMES = Object.freeze({
  1: "Hatchling",
  2: "Fledgling",
  3: "Mature",
  4: "Ascendant",
  5: "Apex",
});

export const items = [
  { id: 1, code: "apex_seal", display_name: "Apex Seal", description: "Required for Apex evolutions.", item_kind: "evolution", effect_payload: {}, rarity_id: 3, stackable: 1 },
  { id: 2, code: "ration", display_name: "Ration", description: "Restores 10 energy.", item_kind: "consumable", effect_payload: { energy: 10 }, rarity_id: 1, stackable: 1 },
  { id: 3, code: "coin_pouch", display_name: "Coin Pouch", description: "Grants 50 coins when opened.", item_kind: "currency_pack", effect_payload: { coins: 50 }, rarity_id: 1, stackable: 1 },
];

/**
 * Species: [id, code, name, blurb, glyph, elementId, stage, rarityId, isStarter, baseScanGain]
 * Six lineages × 11 forms. Scan gain ≈ % filled per defeat.
 */
const SPECIES_ROWS = [
  // —— Ignis ——
  [1, "emberkit", "Emberkit", "A hatchling spark of Ignis.", "🔥", 1, 1, 1, 1, 32],
  [2, "cindertuft", "Cindertuft", "Tufts of living ember along its back.", "🕯️", 1, 2, 1, 0, 26],
  [3, "pyrewhelp", "Pyrewhelp", "Attack path — fists of furnace heat.", "🌋", 1, 3, 2, 0, 18],
  [4, "scorchpaw", "Scorchpaw", "Speed path — heat mirage runner.", "🦊", 1, 3, 2, 0, 18],
  [5, "emberveil", "Emberveil", "Mana path — veiled flame caster.", "🪄", 1, 3, 2, 0, 18],
  [6, "blazemane", "Blazemane", "A mane of solar fire.", "🦁", 1, 4, 3, 0, 12],
  [7, "cinderstreak", "Cinderstreak", "Cuts the air into burning ribbons.", "☄️", 1, 4, 3, 0, 12],
  [8, "solarwick", "Solarwick", "A living lantern of will.", "🔆", 1, 4, 3, 0, 12],
  [9, "infernox", "Infernox", "Apex of Attack — walking furnace.", "🐉", 1, 5, 4, 0, 8],
  [10, "helixion", "Helixion", "Apex of Speed — orbital blaze.", "💫", 1, 5, 4, 0, 8],
  [11, "primordial", "Primordial", "Apex of Mana — first flame.", "👁️", 1, 5, 4, 0, 8],

  // —— Veil ——
  [12, "dewlet", "Dewlet", "A droplet that dreams of oceans.", "💧", 2, 1, 1, 1, 32],
  [13, "drizzlet", "Drizzlet", "Soft rain given paws.", "🌧️", 2, 2, 1, 0, 26],
  [14, "cascara", "Cascara", "Health path — tide that never breaks.", "🌊", 2, 3, 2, 0, 18],
  [15, "rippletide", "Rippletide", "Speed path — skims every crest.", "🐟", 2, 3, 2, 0, 18],
  [16, "murkfin", "Murkfin", "Defense path — shell of the deep.", "🐚", 2, 3, 2, 0, 18],
  [17, "tidalking", "Tidalking", "Commands the swell.", "🐋", 2, 4, 3, 0, 12],
  [18, "seaverge", "Seaverge", "A blade of living current.", "🗡️", 2, 4, 3, 0, 12],
  [19, "abysshell", "Abysshell", "Pressure made armor.", "🛡️", 2, 4, 3, 0, 12],
  [20, "leviathan", "Leviathan", "Apex of Health — the deep itself.", "🦑", 2, 5, 4, 0, 8],
  [21, "spindrift", "Spindrift", "Apex of Speed — storm spray incarnate.", "🌪️", 2, 5, 4, 0, 8],
  [22, "abyssrex", "Abyssrex", "Apex of Defense — trench sovereign.", "🐊", 2, 5, 4, 0, 8],

  // —— Aether ——
  [23, "gustling", "Gustling", "A breeze that refuses to land.", "🍃", 3, 1, 1, 1, 32],
  [24, "fluffgale", "Fluffgale", "Cloud-soft and suddenly sharp.", "☁️", 3, 2, 1, 0, 26],
  [25, "zephyrix", "Zephyrix", "Speed path — ribbon of wind.", "🦅", 3, 3, 2, 0, 18],
  [26, "galeclaw", "Galeclaw", "Attack path — talons in the gale.", "🦉", 3, 3, 2, 0, 18],
  [27, "nimbat", "Nimbat", "Mana path — storm whisperer.", "🦇", 3, 3, 2, 0, 18],
  [28, "stormara", "Stormara", "Thunder-winged hunter.", "⚡", 3, 4, 3, 0, 12],
  [29, "skyshard", "Skyshard", "A spear of pressurized air.", "💠", 3, 4, 3, 0, 12],
  [30, "cyclonix", "Cyclonix", "Eye of the spinning choir.", "🌀", 3, 4, 3, 0, 12],
  [31, "tempestlord", "Tempestlord", "Apex of Speed — sky's final word.", "👑", 3, 5, 4, 0, 8],
  [32, "aetherwing", "Aetherwing", "Apex of Attack — wings that shear stone.", "🪽", 3, 5, 4, 0, 8],
  [33, "voidgale", "Voidgale", "Apex of Mana — wind from nowhere.", "🌫️", 3, 5, 4, 0, 8],

  // —— Terra ——
  [34, "pebblit", "Pebblit", "A pebble that learned to walk.", "🪨", 4, 1, 1, 1, 32],
  [35, "gravelpup", "Gravelpup", "Dusty paws, stubborn grin.", "🐕", 4, 2, 1, 0, 26],
  [36, "boulderfist", "Boulderfist", "Attack path — knuckles of granite.", "🥊", 4, 3, 2, 0, 18],
  [37, "plateback", "Plateback", "Defense path — walking rampart.", "🐢", 4, 3, 2, 0, 18],
  [38, "quartzeye", "Quartzeye", "Mana path — crystal focus.", "💎", 4, 3, 2, 0, 18],
  [39, "megolith", "Megolith", "A hillside given purpose.", "🗿", 4, 4, 3, 0, 12],
  [40, "bastion", "Bastion", "Walls that refuse siege.", "🏰", 4, 4, 3, 0, 12],
  [41, "geodeheart", "Geodeheart", "Hollow stone, radiant core.", "🔮", 4, 4, 3, 0, 12],
  [42, "tectonox", "Tectonox", "Apex of Attack — faultline tyrant.", "🌋", 4, 5, 4, 0, 8],
  [43, "aegirith", "Aegirith", "Apex of Defense — unbreakable plate.", "🛡️", 4, 5, 4, 0, 8],
  [44, "obsidian", "Obsidian", "Apex of Mana — volcanic glass mind.", "⬛", 4, 5, 4, 0, 8],

  // —— Umbral ——
  [45, "duskling", "Duskling", "A shadow that forgot the sun.", "🌑", 5, 1, 1, 1, 32],
  [46, "gloamkit", "Gloamkit", "Soft steps in the half-light.", "🐈‍⬛", 5, 2, 1, 0, 26],
  [47, "nightfang", "Nightfang", "Attack path — teeth in the dark.", "🐺", 5, 3, 2, 0, 18],
  [48, "veilwisp", "Veilwisp", "Speed path — slips between glances.", "👻", 5, 3, 2, 0, 18],
  [49, "hexmoth", "Hexmoth", "Mana path — curse-winged whisper.", "🦋", 5, 3, 2, 0, 18],
  [50, "umbrakhan", "Umbrakhan", "A throne of absence.", "🦇", 5, 4, 3, 0, 12],
  [51, "slipshade", "Slipshade", "Never quite where you look.", "🫥", 5, 4, 3, 0, 12],
  [52, "nocturne", "Nocturne", "A hymn of quiet dread.", "🎶", 5, 4, 3, 0, 12],
  [53, "voidreign", "Voidreign", "Apex of Attack — eclipse sovereign.", "👑", 5, 5, 4, 0, 8],
  [54, "phantasm", "Phantasm", "Apex of Speed — afterimage incarnate.", "🌫️", 5, 5, 4, 0, 8],
  [55, "nethercall", "Nethercall", "Apex of Mana — voice from below.", "👁️", 5, 5, 4, 0, 8],

  // —— Radiance ——
  [56, "gleamlet", "Gleamlet", "A mote that wants to be a star.", "✨", 6, 1, 1, 1, 32],
  [57, "sunfleck", "Sunfleck", "Warmth with tiny wings.", "🐥", 6, 2, 1, 0, 26],
  [58, "brightpaw", "Brightpaw", "Attack path — fists of daylight.", "☀️", 6, 3, 2, 0, 18],
  [59, "aurewing", "Aurewing", "Speed path — gold-trimmed flight.", "🕊️", 6, 3, 2, 0, 18],
  [60, "lumenhart", "Lumenhart", "Mana path — healing brilliance.", "💛", 6, 3, 2, 0, 18],
  [61, "solarix", "Solarix", "Noon given claws.", "🦁", 6, 4, 3, 0, 12],
  [62, "halcyon", "Halcyon", "Calm winds of clear light.", "🌤️", 6, 4, 3, 0, 12],
  [63, "sanctflare", "Sanctflare", "A beacon that burns clean.", "🕯️", 6, 4, 3, 0, 12],
  [64, "aurorae", "Aurorae", "Apex of Attack — dawn's judgment.", "🌅", 6, 5, 4, 0, 8],
  [65, "seraphine", "Seraphine", "Apex of Speed — skyfire courier.", "🪽", 6, 5, 4, 0, 8],
  [66, "luminarch", "Luminarch", "Apex of Mana — first light kept.", "🌟", 6, 5, 4, 0, 8],
];

export const species = SPECIES_ROWS.map(
  ([id, code, display_name, blurb, glyph, element_id, stage, rarity_id, is_starter, base_scan_gain]) => {
    const element = elements.find((e) => e.id === element_id);
    return {
      id, code, display_name, blurb, glyph, element_id, stage, rarity_id, is_starter,
      base_scan_gain, base_catch_rate: base_scan_gain / 100,
      element, hue: element.hue, name: display_name, stage_name: STAGE_NAMES[stage],
    };
  }
);

/** [attack, health, speed, defense, mana, crit_chance, crit_damage, effectiveness, resilience] */
function S(atk, hp, spd, def, mana, critC = 4, critD = 5, eff = 5, res = 4) {
  return [atk, hp, spd, def, mana, critC, critD, eff, res];
}

const BASE_STATS = {
  // Ignis
  1: S(6, 5, 5, 4, 4), 2: S(9, 7, 7, 5, 5, 5, 6, 6, 5),
  3: S(15, 10, 9, 8, 7, 6, 7, 7, 5), 4: S(10, 9, 15, 7, 8, 8, 7, 7, 5), 5: S(9, 10, 9, 7, 15, 6, 7, 9, 6),
  6: S(20, 14, 12, 11, 10, 7, 9, 8, 6), 7: S(14, 12, 20, 10, 12, 10, 9, 8, 6), 8: S(12, 14, 13, 11, 20, 7, 8, 11, 7),
  9: S(28, 18, 15, 14, 12, 9, 12, 9, 7), 10: S(18, 16, 28, 13, 16, 12, 11, 9, 7), 11: S(16, 18, 17, 14, 28, 8, 10, 13, 8),
  // Veil
  12: S(4, 7, 5, 5, 4), 13: S(6, 11, 7, 7, 5, 5, 6, 6, 6),
  14: S(9, 16, 10, 11, 8, 5, 6, 7, 8), 15: S(10, 11, 16, 8, 9, 8, 7, 7, 6), 16: S(9, 13, 8, 16, 7, 5, 6, 6, 9),
  17: S(12, 22, 13, 15, 11, 6, 7, 8, 9), 18: S(14, 15, 22, 12, 13, 10, 9, 8, 7), 19: S(13, 18, 11, 22, 10, 6, 7, 7, 11),
  20: S(15, 30, 16, 18, 14, 7, 8, 9, 11), 21: S(18, 18, 30, 14, 16, 12, 11, 9, 8), 22: S(16, 22, 14, 30, 12, 7, 8, 8, 13),
  // Aether
  23: S(5, 5, 7, 3, 5), 24: S(7, 7, 11, 5, 7, 6, 6, 6, 5),
  25: S(10, 9, 16, 7, 10, 8, 7, 7, 5), 26: S(16, 10, 11, 8, 8, 6, 8, 7, 5), 27: S(9, 10, 12, 7, 16, 6, 7, 9, 6),
  28: S(13, 12, 22, 10, 14, 10, 9, 8, 6), 29: S(22, 13, 14, 11, 11, 7, 10, 8, 6), 30: S(12, 14, 16, 10, 22, 7, 8, 11, 7),
  31: S(16, 15, 30, 12, 18, 12, 11, 9, 7), 32: S(30, 16, 17, 14, 14, 9, 12, 9, 7), 33: S(15, 17, 20, 13, 30, 8, 10, 13, 8),
  // Terra
  34: S(5, 6, 3, 7, 3), 35: S(8, 9, 5, 10, 4, 4, 5, 5, 7),
  36: S(16, 12, 7, 12, 6, 5, 7, 6, 7), 37: S(10, 14, 6, 17, 6, 4, 5, 5, 10), 38: S(9, 12, 7, 12, 15, 5, 6, 9, 8),
  39: S(22, 16, 10, 16, 9, 6, 9, 7, 8), 40: S(14, 19, 9, 23, 9, 5, 6, 6, 12), 41: S(12, 16, 11, 16, 21, 6, 7, 11, 9),
  42: S(30, 20, 13, 18, 12, 8, 12, 8, 9), 43: S(17, 24, 12, 32, 12, 6, 7, 7, 14), 44: S(15, 20, 14, 18, 30, 7, 9, 13, 10),
  // Umbral
  45: S(5, 4, 6, 4, 6), 46: S(8, 6, 9, 5, 8, 6, 7, 7, 5),
  47: S(16, 9, 12, 7, 10, 7, 9, 8, 5), 48: S(10, 9, 17, 6, 11, 9, 8, 8, 5), 49: S(9, 10, 11, 7, 17, 6, 7, 11, 6),
  50: S(22, 12, 15, 10, 14, 8, 11, 9, 6), 51: S(14, 12, 23, 9, 15, 11, 10, 9, 6), 52: S(12, 14, 15, 10, 23, 7, 9, 13, 7),
  53: S(30, 15, 18, 13, 17, 10, 14, 10, 7), 54: S(17, 15, 31, 12, 18, 13, 12, 10, 7), 55: S(15, 17, 18, 13, 31, 9, 11, 15, 8),
  // Radiance
  56: S(5, 6, 5, 4, 6), 57: S(7, 9, 8, 6, 8, 5, 6, 7, 6),
  58: S(15, 12, 10, 9, 10, 6, 8, 8, 6), 59: S(10, 11, 16, 8, 11, 8, 7, 8, 6), 60: S(9, 13, 10, 9, 16, 5, 6, 10, 8),
  61: S(21, 16, 13, 12, 14, 7, 10, 9, 7), 62: S(14, 15, 22, 11, 15, 10, 9, 9, 7), 63: S(12, 18, 13, 13, 22, 6, 8, 12, 9),
  64: S(29, 20, 16, 15, 17, 9, 13, 10, 8), 65: S(17, 18, 30, 14, 18, 12, 11, 10, 8), 66: S(15, 22, 16, 16, 30, 8, 10, 14, 10),
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
  { id: 4, code: "ignis_jab", display_name: "Ignis Jab", description: "A scorching poke.", element_id: 1, effect_kind: "strike", power: 110, accuracy: 1, energy_cost: 0, effect_payload: { mult: 1.1, status_chance: 0.2, status: "burn", def_debuff: 1 } },
  { id: 5, code: "veil_lash", display_name: "Veil Lash", description: "A whipping current.", element_id: 2, effect_kind: "strike", power: 110, accuracy: 1, energy_cost: 0, effect_payload: { mult: 1.1, status_chance: 0.2, status: "soak", spd_debuff: 1 } },
  { id: 6, code: "aether_cut", display_name: "Aether Cut", description: "A slicing breeze.", element_id: 3, effect_kind: "strike", power: 105, accuracy: 1, energy_cost: 0, effect_payload: { mult: 1.05, crit_bonus: 5, status_chance: 0.15, status: "gust" } },
  { id: 7, code: "terra_wall", display_name: "Terra Wall", description: "Raise a rocky guard.", element_id: 4, effect_kind: "guard", power: 30, accuracy: 1, energy_cost: 0, effect_payload: { mult: 0.4, guarding: true, def_buff: 2 } },
  { id: 8, code: "umbral_spike", display_name: "Umbral Spike", description: "Strike from the blind spot.", element_id: 5, effect_kind: "burst", power: 140, accuracy: 0.92, energy_cost: 0, effect_payload: { mult: 1.4, status_chance: 0.25, status: "hex", atk_debuff: 1 } },
  { id: 9, code: "radiant_soothe", display_name: "Radiant Soothe", description: "Restore a little health.", element_id: 6, effect_kind: "heal", power: 0, accuracy: 1, energy_cost: 0, effect_payload: { heal_pct: 0.18 } },
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
  // Ignis
  [1, 1, 2, 1, "Fledgling"],
  [2, 2, 3, 1, "Attack"], [3, 2, 4, 2, "Speed"], [4, 2, 5, 3, "Mana"],
  [5, 3, 6, 1, "Ascendant"], [6, 4, 7, 1, "Ascendant"], [7, 5, 8, 1, "Ascendant"],
  [8, 6, 9, 1, "Apex"], [9, 7, 10, 1, "Apex"], [10, 8, 11, 1, "Apex"],
  // Veil
  [11, 12, 13, 1, "Fledgling"],
  [12, 13, 14, 1, "Health"], [13, 13, 15, 2, "Speed"], [14, 13, 16, 3, "Defense"],
  [15, 14, 17, 1, "Ascendant"], [16, 15, 18, 1, "Ascendant"], [17, 16, 19, 1, "Ascendant"],
  [18, 17, 20, 1, "Apex"], [19, 18, 21, 1, "Apex"], [20, 19, 22, 1, "Apex"],
  // Aether
  [21, 23, 24, 1, "Fledgling"],
  [22, 24, 25, 1, "Speed"], [23, 24, 26, 2, "Attack"], [24, 24, 27, 3, "Mana"],
  [25, 25, 28, 1, "Ascendant"], [26, 26, 29, 1, "Ascendant"], [27, 27, 30, 1, "Ascendant"],
  [28, 28, 31, 1, "Apex"], [29, 29, 32, 1, "Apex"], [30, 30, 33, 1, "Apex"],
  // Terra
  [31, 34, 35, 1, "Fledgling"],
  [32, 35, 36, 1, "Attack"], [33, 35, 37, 2, "Defense"], [34, 35, 38, 3, "Mana"],
  [35, 36, 39, 1, "Ascendant"], [36, 37, 40, 1, "Ascendant"], [37, 38, 41, 1, "Ascendant"],
  [38, 39, 42, 1, "Apex"], [39, 40, 43, 1, "Apex"], [40, 41, 44, 1, "Apex"],
  // Umbral
  [41, 45, 46, 1, "Fledgling"],
  [42, 46, 47, 1, "Attack"], [43, 46, 48, 2, "Speed"], [44, 46, 49, 3, "Mana"],
  [45, 47, 50, 1, "Ascendant"], [46, 48, 51, 1, "Ascendant"], [47, 49, 52, 1, "Ascendant"],
  [48, 50, 53, 1, "Apex"], [49, 51, 54, 1, "Apex"], [50, 52, 55, 1, "Apex"],
  // Radiance
  [51, 56, 57, 1, "Fledgling"],
  [52, 57, 58, 1, "Attack"], [53, 57, 59, 2, "Speed"], [54, 57, 60, 3, "Mana"],
  [55, 58, 61, 1, "Ascendant"], [56, 59, 62, 1, "Ascendant"], [57, 60, 63, 1, "Ascendant"],
  [58, 61, 64, 1, "Apex"], [59, 62, 65, 1, "Apex"], [60, 63, 66, 1, "Apex"],
].map(([id, ancestor_species_id, descendant_species_id, branch_index, label]) => ({
  id, ancestor_species_id, descendant_species_id, branch_index, label, sort_order: branch_index,
}));

/** Requirements: [pathId, kind, statId|null, itemId|null, threshold] — Apex Seal is item 1 */
let erId = 1;
export const evolutionRequirements = [
  // Ignis
  [1, "stat", 1, null, 10],
  [2, "stat", 1, null, 16], [3, "stat", 3, null, 16], [4, "stat", 5, null, 16],
  [5, "stat", 1, null, 22], [5, "battles_won", null, null, 3],
  [6, "stat", 3, null, 22], [6, "battles_won", null, null, 3],
  [7, "stat", 5, null, 22], [7, "battles_won", null, null, 3],
  [8, "stat", 1, null, 28], [8, "item", null, 1, 1],
  [9, "stat", 3, null, 28], [9, "item", null, 1, 1],
  [10, "stat", 5, null, 28], [10, "item", null, 1, 1],
  // Veil
  [11, "stat", 2, null, 10],
  [12, "stat", 2, null, 16], [13, "stat", 3, null, 16], [14, "stat", 4, null, 16],
  [15, "stat", 2, null, 22], [15, "battles_won", null, null, 3],
  [16, "stat", 3, null, 22], [16, "battles_won", null, null, 3],
  [17, "stat", 4, null, 22], [17, "battles_won", null, null, 3],
  [18, "stat", 2, null, 28], [18, "item", null, 1, 1],
  [19, "stat", 3, null, 28], [19, "item", null, 1, 1],
  [20, "stat", 4, null, 28], [20, "item", null, 1, 1],
  // Aether
  [21, "stat", 3, null, 10],
  [22, "stat", 3, null, 16], [23, "stat", 1, null, 16], [24, "stat", 5, null, 16],
  [25, "stat", 3, null, 22], [25, "battles_won", null, null, 3],
  [26, "stat", 1, null, 22], [26, "battles_won", null, null, 3],
  [27, "stat", 5, null, 22], [27, "battles_won", null, null, 3],
  [28, "stat", 3, null, 28], [28, "item", null, 1, 1],
  [29, "stat", 1, null, 28], [29, "item", null, 1, 1],
  [30, "stat", 5, null, 28], [30, "item", null, 1, 1],
  // Terra
  [31, "stat", 4, null, 10],
  [32, "stat", 1, null, 16], [33, "stat", 4, null, 16], [34, "stat", 5, null, 16],
  [35, "stat", 1, null, 22], [35, "battles_won", null, null, 3],
  [36, "stat", 4, null, 22], [36, "battles_won", null, null, 3],
  [37, "stat", 5, null, 22], [37, "battles_won", null, null, 3],
  [38, "stat", 1, null, 28], [38, "item", null, 1, 1],
  [39, "stat", 4, null, 28], [39, "item", null, 1, 1],
  [40, "stat", 5, null, 28], [40, "item", null, 1, 1],
  // Umbral
  [41, "stat", 5, null, 10],
  [42, "stat", 1, null, 16], [43, "stat", 3, null, 16], [44, "stat", 5, null, 16],
  [45, "stat", 1, null, 22], [45, "battles_won", null, null, 3],
  [46, "stat", 3, null, 22], [46, "battles_won", null, null, 3],
  [47, "stat", 5, null, 22], [47, "battles_won", null, null, 3],
  [48, "stat", 1, null, 28], [48, "item", null, 1, 1],
  [49, "stat", 3, null, 28], [49, "item", null, 1, 1],
  [50, "stat", 5, null, 28], [50, "item", null, 1, 1],
  // Radiance
  [51, "stat", 2, null, 10],
  [52, "stat", 1, null, 16], [53, "stat", 3, null, 16], [54, "stat", 5, null, 16],
  [55, "stat", 1, null, 22], [55, "battles_won", null, null, 3],
  [56, "stat", 3, null, 22], [56, "battles_won", null, null, 3],
  [57, "stat", 5, null, 22], [57, "battles_won", null, null, 3],
  [58, "stat", 1, null, 28], [58, "item", null, 1, 1],
  [59, "stat", 3, null, 28], [59, "item", null, 1, 1],
  [60, "stat", 5, null, 28], [60, "item", null, 1, 1],
].map(([evolution_path_id, requirement_kind, stat_id, item_id, threshold_value]) => ({
  id: erId++,
  evolution_path_id,
  requirement_kind,
  stat_id,
  item_id,
  threshold_value,
}));

export const zones = [
  [1, "cinderwaste", "Cinderwaste", "Ash drifts over cracked Ignis earth.", 2],
  [2, "mistveil", "Mistveil", "Fog curls between Veil tidepools.", 2],
  [3, "skyshear", "Skyshear", "Aether winds shear the cliff edge.", 2],
  [4, "stoneheart", "Stoneheart", "Terra ridges hum underfoot.", 2],
  [5, "nightwell", "Nightwell", "Umbral dark pools without a bottom.", 2],
  [6, "dawnfield", "Dawnfield", "Radiance light pools in the grass.", 2],
  [7, "crossroads", "Crossroads", "All six affinities wander here.", 3],
].map(([id, code, display_name, vibe, energy_cost]) => ({
  id, code, display_name, vibe, energy_cost, min_player_level: 1, name: display_name,
}));

let zeId = 1;
export const zoneEncounters = [
  // Cinderwaste — Ignis
  [1, 1, 35, 1], [1, 2, 30, 2], [1, 3, 12, 3], [1, 4, 12, 3], [1, 5, 11, 3],
  // Mistveil — Veil
  [2, 12, 35, 1], [2, 13, 30, 2], [2, 14, 12, 3], [2, 15, 12, 3], [2, 16, 11, 3],
  // Skyshear — Aether
  [3, 23, 35, 1], [3, 24, 30, 2], [3, 25, 12, 3], [3, 26, 12, 3], [3, 27, 11, 3],
  // Stoneheart — Terra
  [4, 34, 35, 1], [4, 35, 30, 2], [4, 36, 12, 3], [4, 37, 12, 3], [4, 38, 11, 3],
  // Nightwell — Umbral
  [5, 45, 35, 1], [5, 46, 30, 2], [5, 47, 12, 3], [5, 48, 12, 3], [5, 49, 11, 3],
  // Dawnfield — Radiance
  [6, 56, 35, 1], [6, 57, 30, 2], [6, 58, 12, 3], [6, 59, 12, 3], [6, 60, 11, 3],
  // Crossroads — mixed hatchlings / fledglings
  [7, 1, 12, 1], [7, 12, 12, 1], [7, 23, 12, 1], [7, 34, 12, 1], [7, 45, 12, 1], [7, 56, 12, 1],
  [7, 2, 8, 2], [7, 13, 8, 2], [7, 24, 8, 2], [7, 35, 7, 2], [7, 46, 7, 2], [7, 57, 7, 2],
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

export const trainingDrills = stats
  .filter((s) => s.trainable)
  .map((s, i) => ({
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
