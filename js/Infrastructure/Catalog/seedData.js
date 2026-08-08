/** Catalog seed — pure data. Behavior lives in domain interpreters. */

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
  attacker_element_id,
  defender_element_id,
  multiplier,
}));

export const stats = [
  { id: 1, code: "might", display_name: "Might", description: "Raw strike power", color: "#E85D4C", combat_role: "offense" },
  { id: 2, code: "vital", display_name: "Vital", description: "Health & recovery", color: "#3DBE8B", combat_role: "sustain" },
  { id: 3, code: "swift", display_name: "Swift", description: "Speed & crit chance", color: "#4DB8E8", combat_role: "speed" },
  { id: 4, code: "guard", display_name: "Guard", description: "Damage reduction", color: "#C4A35A", combat_role: "defense" },
  { id: 5, code: "spirit", display_name: "Spirit", description: "Special force", color: "#5EC8C0", combat_role: "special" },
].map((s) => ({ ...s, name: s.display_name, desc: s.description }));

export const items = [
  { id: 1, code: "morph_orb", display_name: "Morph Orb", description: "Used to catch wild beasts.", item_kind: "catch", effect_payload: { catch_bonus: 0.15 }, rarity_id: 1, stackable: 1 },
  { id: 2, code: "greater_orb", display_name: "Greater Orb", description: "Higher chance to secure a catch.", item_kind: "catch", effect_payload: { catch_bonus: 0.35 }, rarity_id: 2, stackable: 1 },
  { id: 3, code: "ember_stone", display_name: "Ember Stone", description: "Catalyzes ember-line evolutions.", item_kind: "evolution", effect_payload: { elements: ["ember"] }, rarity_id: 3, stackable: 1 },
  { id: 4, code: "ration", display_name: "Ration", description: "Restores 10 energy.", item_kind: "consumable", effect_payload: { energy: 10 }, rarity_id: 1, stackable: 1 },
  { id: 5, code: "coin_pouch", display_name: "Coin Pouch", description: "Grants 50 coins when opened.", item_kind: "currency_pack", effect_payload: { coins: 50 }, rarity_id: 1, stackable: 1 },
];

const SPECIES_ROWS = [
  [1, "emberkit", "Emberkit", "A spark-bound cub that sneezes cinders.", "🔥", 1, 1, 1, 1, 0.45],
  [2, "pyreling", "Pyreling", "Flames cling to its mane like living armor.", "🌋", 1, 2, 2, 0, 0.28],
  [3, "infernox", "Infernox", "A walking furnace that answers only to strength.", "☄️", 1, 3, 3, 0, 0.12],
  [4, "dewlet", "Dewlet", "A droplet pup that sings in puddles.", "💧", 2, 1, 1, 1, 0.45],
  [5, "cascara", "Cascara", "Currents coil around its fins mid-battle.", "🌊", 2, 2, 2, 0, 0.28],
  [6, "tidalking", "Tidalking", "Commands the swell with a single roar.", "🐋", 2, 3, 3, 0, 0.12],
  [7, "gustling", "Gustling", "A breezy fluff that never quite lands.", "🍃", 3, 1, 1, 1, 0.45],
  [8, "zephyrix", "Zephyrix", "Cuts the air into ribbons of speed.", "🌪️", 3, 2, 2, 0, 0.28],
  [9, "stormara", "Stormara", "A thunder-winged apex of the skies.", "⚡", 3, 3, 3, 0, 0.12],
  [10, "pebblet", "Pebblet", "A rolling pebble with stubborn eyes.", "🪨", 4, 1, 1, 1, 0.45],
  [11, "boulderkin", "Boulderkin", "Its shell shrugs off all but the fiercest blows.", "🗿", 4, 2, 2, 0, 0.28],
  [12, "titanox", "Titanox", "A living mountain that refuses to fall.", "🦏", 4, 3, 3, 0, 0.12],
  [13, "shadegrub", "Shadegrub", "A shy shadow that feeds on quiet.", "🌑", 5, 1, 1, 1, 0.45],
  [14, "umbrawisp", "Umbrawisp", "Slips between moments to strike.", "👻", 5, 2, 2, 0, 0.28],
  [15, "voidrex", "Voidrex", "An abyss given teeth and will.", "👁️", 5, 3, 3, 0, 0.12],
  [16, "sproutling", "Sproutling", "A seed-beast that sprouts after every nap.", "🌱", 6, 1, 1, 1, 0.45],
  [17, "bloomara", "Bloomara", "Petals shield allies and poison foes.", "🌸", 6, 2, 2, 0, 0.28],
  [18, "verdantis", "Verdantis", "The grove itself, walking.", "🌳", 6, 3, 3, 0, 0.12],
];

export const species = SPECIES_ROWS.map(
  ([id, code, display_name, blurb, glyph, element_id, stage, rarity_id, is_starter, base_catch_rate]) => {
    const element = elements.find((e) => e.id === element_id);
    return {
      id, code, display_name, blurb, glyph, element_id, stage, rarity_id, is_starter, base_catch_rate,
      element, hue: element.hue, name: display_name,
    };
  }
);

const BASE_STATS = {
  1: [8, 6, 5, 4, 3], 2: [14, 10, 8, 7, 5], 3: [22, 15, 12, 11, 8],
  4: [4, 9, 5, 6, 4], 5: [7, 15, 9, 10, 7], 6: [11, 23, 13, 15, 10],
  7: [5, 5, 9, 3, 4], 8: [9, 8, 16, 6, 7], 9: [13, 12, 24, 9, 12],
  10: [5, 7, 3, 9, 2], 11: [8, 12, 5, 16, 4], 12: [13, 18, 7, 24, 6],
  13: [4, 5, 6, 3, 9], 14: [7, 8, 10, 6, 15], 15: [11, 12, 14, 9, 23],
  16: [5, 7, 5, 5, 6], 17: [8, 12, 9, 9, 10], 18: [12, 18, 13, 14, 16],
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
  [[1, 1], [2, 2], [3, 3], [ELEMENTAL_MOVE[s.element_id], 4]].map(([move_id, slot]) => ({
    id: smId++,
    species_id: s.id,
    move_id,
    unlock_stage: 1,
    slot,
  }))
);

export const evolutionPaths = [
  [1, 1, 2], [2, 2, 3], [3, 4, 5], [4, 5, 6], [5, 7, 8], [6, 8, 9],
  [7, 10, 11], [8, 11, 12], [9, 13, 14], [10, 14, 15], [11, 16, 17], [12, 17, 18],
].map(([id, ancestor_species_id, descendant_species_id], i) => ({
  id, ancestor_species_id, descendant_species_id, sort_order: (i % 2) + 1,
}));

let erId = 1;
export const evolutionRequirements = [
  [1, "stat", 1, null, 14],
  [2, "stat", 1, null, 24], [2, "stat", 2, null, 16], [2, "item", null, 3, 1],
  [3, "stat", 2, null, 14],
  [4, "stat", 2, null, 24], [4, "stat", 4, null, 14],
  [5, "stat", 3, null, 14],
  [6, "stat", 3, null, 24], [6, "stat", 5, null, 12],
  [7, "stat", 4, null, 14],
  [8, "stat", 4, null, 24], [8, "stat", 2, null, 16],
  [9, "stat", 5, null, 14],
  [10, "stat", 5, null, 24], [10, "stat", 3, null, 14],
  [11, "stat", 2, null, 12], [11, "stat", 5, null, 10],
  [12, "stat", 2, null, 20], [12, "stat", 4, null, 14], [12, "stat", 5, null, 16],
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
  [3, "shadehollow", "Shadehollow", "Roots whisper under dim light.", 2],
  [4, "highridge", "Highridge", "Wind shears the cliff edge.", 2],
].map(([id, code, display_name, vibe, energy_cost]) => ({
  id, code, display_name, vibe, energy_cost, min_player_level: 1, name: display_name,
}));

let zeId = 1;
export const zoneEncounters = [
  [1, 1, 40, 1], [1, 2, 15, 2], [1, 10, 30, 1], [1, 11, 10, 2],
  [2, 4, 40, 1], [2, 5, 15, 2], [2, 7, 30, 1], [2, 8, 10, 2],
  [3, 13, 35, 1], [3, 14, 15, 2], [3, 16, 35, 1], [3, 17, 15, 2],
  [4, 7, 30, 1], [4, 8, 15, 2], [4, 10, 30, 1], [4, 11, 15, 2],
].map(([zone_id, species_id, weight, stage]) => ({
  id: zeId++,
  zone_id,
  species_id,
  weight,
  min_stage: stage,
  max_stage: stage,
  stat_variance_min: stage === 1 ? 0.72 : 0.8,
  stat_variance_max: stage === 1 ? 1.0 : 1.05,
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
