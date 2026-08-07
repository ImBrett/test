/* Morph — catalog mirror of schema.sql + seed.sql (Catalog BC) */

window.MORPH_DATA = (() => {
  const now = () => new Date().toISOString();

  const rarities = [
    { id: 1, code: "common", display_name: "Common", sort_order: 1 },
    { id: 2, code: "uncommon", display_name: "Uncommon", sort_order: 2 },
    { id: 3, code: "rare", display_name: "Rare", sort_order: 3 },
    { id: 4, code: "mythic", display_name: "Mythic", sort_order: 4 },
  ];

  const elements = [
    { id: 1, code: "ember", display_name: "Ember", hue: 18 },
    { id: 2, code: "tide", display_name: "Tide", hue: 198 },
    { id: 3, code: "gale", display_name: "Gale", hue: 160 },
    { id: 4, code: "stone", display_name: "Stone", hue: 35 },
    { id: 5, code: "shade", display_name: "Shade", hue: 265 },
    { id: 6, code: "bloom", display_name: "Bloom", hue: 130 },
  ];

  const element_matchups = [
    { attacker_element_id: 1, defender_element_id: 4, multiplier: 1.5 },
    { attacker_element_id: 1, defender_element_id: 6, multiplier: 1.5 },
    { attacker_element_id: 1, defender_element_id: 2, multiplier: 0.5 },
    { attacker_element_id: 2, defender_element_id: 1, multiplier: 1.5 },
    { attacker_element_id: 2, defender_element_id: 4, multiplier: 1.5 },
    { attacker_element_id: 2, defender_element_id: 6, multiplier: 0.5 },
    { attacker_element_id: 3, defender_element_id: 6, multiplier: 1.5 },
    { attacker_element_id: 3, defender_element_id: 5, multiplier: 1.5 },
    { attacker_element_id: 3, defender_element_id: 4, multiplier: 0.5 },
    { attacker_element_id: 4, defender_element_id: 3, multiplier: 1.5 },
    { attacker_element_id: 4, defender_element_id: 1, multiplier: 0.5 },
    { attacker_element_id: 4, defender_element_id: 5, multiplier: 1.5 },
    { attacker_element_id: 5, defender_element_id: 3, multiplier: 0.5 },
    { attacker_element_id: 5, defender_element_id: 6, multiplier: 1.5 },
    { attacker_element_id: 5, defender_element_id: 5, multiplier: 0.5 },
    { attacker_element_id: 6, defender_element_id: 2, multiplier: 1.5 },
    { attacker_element_id: 6, defender_element_id: 4, multiplier: 0.5 },
    { attacker_element_id: 6, defender_element_id: 1, multiplier: 0.5 },
  ];

  const stats = [
    { id: 1, code: "might", display_name: "Might", description: "Raw strike power", color: "#E85D4C", combat_role: "offense" },
    { id: 2, code: "vital", display_name: "Vital", description: "Health & recovery", color: "#3DBE8B", combat_role: "sustain" },
    { id: 3, code: "swift", display_name: "Swift", description: "Speed & crit chance", color: "#4DB8E8", combat_role: "speed" },
    { id: 4, code: "guard", display_name: "Guard", description: "Damage reduction", color: "#C4A35A", combat_role: "defense" },
    { id: 5, code: "spirit", display_name: "Spirit", description: "Special force", color: "#5EC8C0", combat_role: "special" },
  ].map((s) => ({ ...s, name: s.display_name, desc: s.description }));

  const items = [
    { id: 1, code: "morph_orb", display_name: "Morph Orb", description: "Used to catch wild beasts.", item_kind: "catch", effect_payload: { catch_bonus: 0.15 }, rarity_id: 1, stackable: 1 },
    { id: 2, code: "greater_orb", display_name: "Greater Orb", description: "Higher chance to secure a catch.", item_kind: "catch", effect_payload: { catch_bonus: 0.35 }, rarity_id: 2, stackable: 1 },
    { id: 3, code: "ember_stone", display_name: "Ember Stone", description: "Catalyzes ember-line evolutions.", item_kind: "evolution", effect_payload: { elements: ["ember"] }, rarity_id: 3, stackable: 1 },
    { id: 4, code: "ration", display_name: "Ration", description: "Restores 10 energy.", item_kind: "consumable", effect_payload: { energy: 10 }, rarity_id: 1, stackable: 1 },
    { id: 5, code: "coin_pouch", display_name: "Coin Pouch", description: "Grants 50 coins when opened.", item_kind: "currency_pack", effect_payload: { coins: 50 }, rarity_id: 1, stackable: 1 },
  ];

  const species = [
    { id: 1, code: "emberkit", display_name: "Emberkit", blurb: "A spark-bound cub that sneezes cinders.", glyph: "🔥", element_id: 1, stage: 1, rarity_id: 1, is_starter: 1, base_catch_rate: 0.45 },
    { id: 2, code: "pyreling", display_name: "Pyreling", blurb: "Flames cling to its mane like living armor.", glyph: "🌋", element_id: 1, stage: 2, rarity_id: 2, is_starter: 0, base_catch_rate: 0.28 },
    { id: 3, code: "infernox", display_name: "Infernox", blurb: "A walking furnace that answers only to strength.", glyph: "☄️", element_id: 1, stage: 3, rarity_id: 3, is_starter: 0, base_catch_rate: 0.12 },
    { id: 4, code: "dewlet", display_name: "Dewlet", blurb: "A droplet pup that sings in puddles.", glyph: "💧", element_id: 2, stage: 1, rarity_id: 1, is_starter: 1, base_catch_rate: 0.45 },
    { id: 5, code: "cascara", display_name: "Cascara", blurb: "Currents coil around its fins mid-battle.", glyph: "🌊", element_id: 2, stage: 2, rarity_id: 2, is_starter: 0, base_catch_rate: 0.28 },
    { id: 6, code: "tidalking", display_name: "Tidalking", blurb: "Commands the swell with a single roar.", glyph: "🐋", element_id: 2, stage: 3, rarity_id: 3, is_starter: 0, base_catch_rate: 0.12 },
    { id: 7, code: "gustling", display_name: "Gustling", blurb: "A breezy fluff that never quite lands.", glyph: "🍃", element_id: 3, stage: 1, rarity_id: 1, is_starter: 1, base_catch_rate: 0.45 },
    { id: 8, code: "zephyrix", display_name: "Zephyrix", blurb: "Cuts the air into ribbons of speed.", glyph: "🌪️", element_id: 3, stage: 2, rarity_id: 2, is_starter: 0, base_catch_rate: 0.28 },
    { id: 9, code: "stormara", display_name: "Stormara", blurb: "A thunder-winged apex of the skies.", glyph: "⚡", element_id: 3, stage: 3, rarity_id: 3, is_starter: 0, base_catch_rate: 0.12 },
    { id: 10, code: "pebblet", display_name: "Pebblet", blurb: "A rolling pebble with stubborn eyes.", glyph: "🪨", element_id: 4, stage: 1, rarity_id: 1, is_starter: 1, base_catch_rate: 0.45 },
    { id: 11, code: "boulderkin", display_name: "Boulderkin", blurb: "Its shell shrugs off all but the fiercest blows.", glyph: "🗿", element_id: 4, stage: 2, rarity_id: 2, is_starter: 0, base_catch_rate: 0.28 },
    { id: 12, code: "titanox", display_name: "Titanox", blurb: "A living mountain that refuses to fall.", glyph: "🦏", element_id: 4, stage: 3, rarity_id: 3, is_starter: 0, base_catch_rate: 0.12 },
    { id: 13, code: "shadegrub", display_name: "Shadegrub", blurb: "A shy shadow that feeds on quiet.", glyph: "🌑", element_id: 5, stage: 1, rarity_id: 1, is_starter: 1, base_catch_rate: 0.45 },
    { id: 14, code: "umbrawisp", display_name: "Umbrawisp", blurb: "Slips between moments to strike.", glyph: "👻", element_id: 5, stage: 2, rarity_id: 2, is_starter: 0, base_catch_rate: 0.28 },
    { id: 15, code: "voidrex", display_name: "Voidrex", blurb: "An abyss given teeth and will.", glyph: "👁️", element_id: 5, stage: 3, rarity_id: 3, is_starter: 0, base_catch_rate: 0.12 },
    { id: 16, code: "sproutling", display_name: "Sproutling", blurb: "A seed-beast that sprouts after every nap.", glyph: "🌱", element_id: 6, stage: 1, rarity_id: 1, is_starter: 1, base_catch_rate: 0.45 },
    { id: 17, code: "bloomara", display_name: "Bloomara", blurb: "Petals shield allies and poison foes.", glyph: "🌸", element_id: 6, stage: 2, rarity_id: 2, is_starter: 0, base_catch_rate: 0.28 },
    { id: 18, code: "verdantis", display_name: "Verdantis", blurb: "The grove itself, walking.", glyph: "🌳", element_id: 6, stage: 3, rarity_id: 3, is_starter: 0, base_catch_rate: 0.12 },
  ].map((s) => {
    const el = elements.find((e) => e.id === s.element_id);
    return { ...s, element: el, hue: el.hue, name: s.display_name };
  });

  const basePairs = {
    1: [8, 6, 5, 4, 3],
    2: [14, 10, 8, 7, 5],
    3: [22, 15, 12, 11, 8],
    4: [4, 9, 5, 6, 4],
    5: [7, 15, 9, 10, 7],
    6: [11, 23, 13, 15, 10],
    7: [5, 5, 9, 3, 4],
    8: [9, 8, 16, 6, 7],
    9: [13, 12, 24, 9, 12],
    10: [5, 7, 3, 9, 2],
    11: [8, 12, 5, 16, 4],
    12: [13, 18, 7, 24, 6],
    13: [4, 5, 6, 3, 9],
    14: [7, 8, 10, 6, 15],
    15: [11, 12, 14, 9, 23],
    16: [5, 7, 5, 5, 6],
    17: [8, 12, 9, 9, 10],
    18: [12, 18, 13, 14, 16],
  };

  let sbsId = 1;
  const species_base_stats = [];
  for (const [speciesId, values] of Object.entries(basePairs)) {
    values.forEach((value, i) => {
      species_base_stats.push({
        id: sbsId++,
        species_id: Number(speciesId),
        stat_id: i + 1,
        value,
      });
    });
  }

  const moves = [
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

  const elementalMoveByElement = { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9 };
  const species_moves = [];
  let smId = 1;
  for (const s of species) {
    [
      [1, 1],
      [2, 2],
      [3, 3],
      [elementalMoveByElement[s.element_id], 4],
    ].forEach(([moveId, slot]) => {
      species_moves.push({
        id: smId++,
        species_id: s.id,
        move_id: moveId,
        unlock_stage: 1,
        slot,
      });
    });
  }

  const evolution_paths = [
    { id: 1, ancestor_species_id: 1, descendant_species_id: 2, sort_order: 1 },
    { id: 2, ancestor_species_id: 2, descendant_species_id: 3, sort_order: 2 },
    { id: 3, ancestor_species_id: 4, descendant_species_id: 5, sort_order: 1 },
    { id: 4, ancestor_species_id: 5, descendant_species_id: 6, sort_order: 2 },
    { id: 5, ancestor_species_id: 7, descendant_species_id: 8, sort_order: 1 },
    { id: 6, ancestor_species_id: 8, descendant_species_id: 9, sort_order: 2 },
    { id: 7, ancestor_species_id: 10, descendant_species_id: 11, sort_order: 1 },
    { id: 8, ancestor_species_id: 11, descendant_species_id: 12, sort_order: 2 },
    { id: 9, ancestor_species_id: 13, descendant_species_id: 14, sort_order: 1 },
    { id: 10, ancestor_species_id: 14, descendant_species_id: 15, sort_order: 2 },
    { id: 11, ancestor_species_id: 16, descendant_species_id: 17, sort_order: 1 },
    { id: 12, ancestor_species_id: 17, descendant_species_id: 18, sort_order: 2 },
  ];

  let erId = 1;
  const evolution_requirements = [
    [1, "stat", 1, null, 14],
    [2, "stat", 1, null, 24],
    [2, "stat", 2, null, 16],
    [2, "item", null, 3, 1],
    [3, "stat", 2, null, 14],
    [4, "stat", 2, null, 24],
    [4, "stat", 4, null, 14],
    [5, "stat", 3, null, 14],
    [6, "stat", 3, null, 24],
    [6, "stat", 5, null, 12],
    [7, "stat", 4, null, 14],
    [8, "stat", 4, null, 24],
    [8, "stat", 2, null, 16],
    [9, "stat", 5, null, 14],
    [10, "stat", 5, null, 24],
    [10, "stat", 3, null, 14],
    [11, "stat", 2, null, 12],
    [11, "stat", 5, null, 10],
    [12, "stat", 2, null, 20],
    [12, "stat", 4, null, 14],
    [12, "stat", 5, null, 16],
  ].map(([pathId, kind, statId, itemId, value]) => ({
    id: erId++,
    evolution_path_id: pathId,
    requirement_kind: kind,
    stat_id: statId,
    item_id: itemId,
    threshold_value: value,
  }));

  const zones = [
    { id: 1, code: "emberfield", display_name: "Emberfield", vibe: "Ash drifts over cracked earth.", energy_cost: 2, min_player_level: 1 },
    { id: 2, code: "mistshore", display_name: "Mistshore", vibe: "Fog curls between tidepools.", energy_cost: 2, min_player_level: 1 },
    { id: 3, code: "shadehollow", display_name: "Shadehollow", vibe: "Roots whisper under dim light.", energy_cost: 2, min_player_level: 1 },
    { id: 4, code: "highridge", display_name: "Highridge", vibe: "Wind shears the cliff edge.", energy_cost: 2, min_player_level: 1 },
  ].map((z) => ({ ...z, name: z.display_name }));

  let zeId = 1;
  const zone_encounters = [
    [1, 1, 40, 1, 1],
    [1, 2, 15, 2, 2],
    [1, 10, 30, 1, 1],
    [1, 11, 10, 2, 2],
    [2, 4, 40, 1, 1],
    [2, 5, 15, 2, 2],
    [2, 7, 30, 1, 1],
    [2, 8, 10, 2, 2],
    [3, 13, 35, 1, 1],
    [3, 14, 15, 2, 2],
    [3, 16, 35, 1, 1],
    [3, 17, 15, 2, 2],
    [4, 7, 30, 1, 1],
    [4, 8, 15, 2, 2],
    [4, 10, 30, 1, 1],
    [4, 11, 15, 2, 2],
  ].map(([zoneId, speciesId, weight, minS, maxS]) => ({
    id: zeId++,
    zone_id: zoneId,
    species_id: speciesId,
    weight,
    min_stage: minS,
    max_stage: maxS,
    stat_variance_min: minS === 1 ? 0.72 : 0.8,
    stat_variance_max: minS === 1 ? 1.0 : 1.05,
  }));

  const training_drills = stats.map((s, i) => ({
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

  // Helpers used by the write-model interpreter
  function speciesById(id) {
    return species.find((s) => s.id === id);
  }
  function statById(id) {
    return stats.find((s) => s.id === id);
  }
  function itemById(id) {
    return items.find((i) => i.id === id);
  }
  function moveById(id) {
    return moves.find((m) => m.id === id);
  }
  function zoneById(id) {
    return zones.find((z) => z.id === id);
  }
  function zoneByCode(code) {
    return zones.find((z) => z.code === code);
  }
  function baseStatsForSpecies(speciesId) {
    return species_base_stats.filter((r) => r.species_id === speciesId);
  }
  function movesForSpecies(speciesId) {
    return species_moves
      .filter((sm) => sm.species_id === speciesId)
      .sort((a, b) => a.slot - b.slot)
      .map((sm) => ({ ...sm, move: moveById(sm.move_id) }));
  }
  function matchupMultiplier(attackerElementId, defenderElementId) {
    if (!attackerElementId || !defenderElementId) return 1;
    const row = element_matchups.find(
      (m) =>
        m.attacker_element_id === attackerElementId &&
        m.defender_element_id === defenderElementId
    );
    return row ? row.multiplier : 1;
  }
  function starters() {
    return species.filter((s) => s.is_starter).map((s) => s.id);
  }

  return {
    rarities,
    elements,
    element_matchups,
    stats,
    items,
    species,
    species_base_stats,
    moves,
    species_moves,
    evolution_paths,
    evolution_requirements,
    zones,
    zone_encounters,
    training_drills,
    // compat aliases used lightly by UI during transition
    pets: species,
    pet_stats: species_base_stats,
    now,
    speciesById,
    statById,
    itemById,
    moveById,
    zoneById,
    zoneByCode,
    baseStatsForSpecies,
    movesForSpecies,
    matchupMultiplier,
    starters,
  };
})();
