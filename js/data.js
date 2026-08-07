/* Morph — catalog data mirroring the SQL schema */

window.MORPH_DATA = (() => {
  const now = () => new Date().toISOString();

  const stats = [
    { id: 1, name: "Might", key: "might", color: "#E85D4C", desc: "Raw strike power" },
    { id: 2, name: "Vital", key: "vital", color: "#3DBE8B", desc: "Health & recovery" },
    { id: 3, name: "Swift", key: "swift", color: "#4DB8E8", desc: "Speed & crit chance" },
    { id: 4, name: "Guard", key: "guard", color: "#C4A35A", desc: "Damage reduction" },
    { id: 5, name: "Spirit", key: "spirit", color: "#5EC8C0", desc: "Special force" },
  ];

  // Pet species — SVG glyph + palette + base vibes
  const pets = [
    { id: 1, name: "Emberkit", stage: 1, element: "ember", glyph: "🔥", hue: 18, blurb: "A spark-bound cub that sneezes cinders." },
    { id: 2, name: "Pyreling", stage: 2, element: "ember", glyph: "🌋", hue: 12, blurb: "Flames cling to its mane like living armor." },
    { id: 3, name: "Infernox", stage: 3, element: "ember", glyph: "☄️", hue: 8, blurb: "A walking furnace that answers only to strength." },

    { id: 4, name: "Dewlet", stage: 1, element: "tide", glyph: "💧", hue: 198, blurb: "A droplet pup that sings in puddles." },
    { id: 5, name: "Cascara", stage: 2, element: "tide", glyph: "🌊", hue: 205, blurb: "Currents coil around its fins mid-battle." },
    { id: 6, name: "Tidalking", stage: 3, element: "tide", glyph: "🐋", hue: 210, blurb: "Commands the swell with a single roar." },

    { id: 7, name: "Gustling", stage: 1, element: "gale", glyph: "🍃", hue: 160, blurb: "A breezy fluff that never quite lands." },
    { id: 8, name: "Zephyrix", stage: 2, element: "gale", glyph: "🌪️", hue: 170, blurb: "Cuts the air into ribbons of speed." },
    { id: 9, name: "Stormara", stage: 3, element: "gale", glyph: "⚡", hue: 185, blurb: "A thunder-winged apex of the skies." },

    { id: 10, name: "Pebblet", stage: 1, element: "stone", glyph: "🪨", hue: 35, blurb: "A rolling pebble with stubborn eyes." },
    { id: 11, name: "Boulderkin", stage: 2, element: "stone", glyph: "🗿", hue: 28, blurb: "Its shell shrugs off all but the fiercest blows." },
    { id: 12, name: "Titanox", stage: 3, element: "stone", glyph: "🦏", hue: 22, blurb: "A living mountain that refuses to fall." },

    { id: 13, name: "Shadegrub", stage: 1, element: "shade", glyph: "🌑", hue: 265, blurb: "A shy shadow that feeds on quiet." },
    { id: 14, name: "Umbrawisp", stage: 2, element: "shade", glyph: "👻", hue: 270, blurb: "Slips between moments to strike." },
    { id: 15, name: "Voidrex", stage: 3, element: "shade", glyph: "👁️", hue: 280, blurb: "An abyss given teeth and will." },

    { id: 16, name: "Sproutling", stage: 1, element: "bloom", glyph: "🌱", hue: 130, blurb: "A seed-beast that sprouts after every nap." },
    { id: 17, name: "Bloomara", stage: 2, element: "bloom", glyph: "🌸", hue: 140, blurb: "Petals shield allies and poison foes." },
    { id: 18, name: "Verdantis", stage: 3, element: "bloom", glyph: "🌳", hue: 125, blurb: "The grove itself, walking." },
  ];

  // Base pet_stats: [pet_id] -> { stat_id: value }
  const baseByPet = {
    1:  { 1: 8, 2: 6, 3: 5, 4: 4, 5: 3 },
    2:  { 1: 14, 2: 10, 3: 8, 4: 7, 5: 5 },
    3:  { 1: 22, 2: 15, 3: 12, 4: 11, 5: 8 },
    4:  { 1: 4, 2: 9, 3: 5, 4: 6, 5: 4 },
    5:  { 1: 7, 2: 15, 3: 9, 4: 10, 5: 7 },
    6:  { 1: 11, 2: 23, 3: 13, 4: 15, 5: 10 },
    7:  { 1: 5, 2: 5, 3: 9, 4: 3, 5: 4 },
    8:  { 1: 9, 2: 8, 3: 16, 4: 6, 5: 7 },
    9:  { 1: 13, 2: 12, 3: 24, 4: 9, 5: 12 },
    10: { 1: 5, 2: 7, 3: 3, 4: 9, 5: 2 },
    11: { 1: 8, 2: 12, 3: 5, 4: 16, 5: 4 },
    12: { 1: 13, 2: 18, 3: 7, 4: 24, 5: 6 },
    13: { 1: 4, 2: 5, 3: 6, 4: 3, 5: 9 },
    14: { 1: 7, 2: 8, 3: 10, 4: 6, 5: 15 },
    15: { 1: 11, 2: 12, 3: 14, 4: 9, 5: 23 },
    16: { 1: 5, 2: 7, 3: 5, 4: 5, 5: 6 },
    17: { 1: 8, 2: 12, 3: 9, 4: 9, 5: 10 },
    18: { 1: 12, 2: 18, 3: 13, 4: 14, 5: 16 },
  };

  let petStatId = 1;
  const pet_stats = [];
  for (const pet of pets) {
    const bases = baseByPet[pet.id];
    for (const [statId, value] of Object.entries(bases)) {
      pet_stats.push({
        id: petStatId++,
        pet_id: pet.id,
        stat_id: Number(statId),
        value,
      });
    }
  }

  // Evolutions: ancestor -> descendant
  const evolutions = [
    { id: 1, ancestor_id: 1, descendant_id: 2 },
    { id: 2, ancestor_id: 2, descendant_id: 3 },
    { id: 3, ancestor_id: 4, descendant_id: 5 },
    { id: 4, ancestor_id: 5, descendant_id: 6 },
    { id: 5, ancestor_id: 7, descendant_id: 8 },
    { id: 6, ancestor_id: 8, descendant_id: 9 },
    { id: 7, ancestor_id: 10, descendant_id: 11 },
    { id: 8, ancestor_id: 11, descendant_id: 12 },
    { id: 9, ancestor_id: 13, descendant_id: 14 },
    { id: 10, ancestor_id: 14, descendant_id: 15 },
    { id: 11, ancestor_id: 16, descendant_id: 17 },
    { id: 12, ancestor_id: 17, descendant_id: 18 },
  ];

  // Requirements keyed by evolution id: { pet_stat_id matching ancestor, required value }
  // We require raising the player's instance stats past thresholds.
  const reqDefs = [
    // Emberkit -> Pyreling: Might 14
    { evo: 1, petId: 1, statId: 1, value: 14 },
    // Pyreling -> Infernox: Might 24, Vital 16
    { evo: 2, petId: 2, statId: 1, value: 24 },
    { evo: 2, petId: 2, statId: 2, value: 16 },
    // Dewlet -> Cascara: Vital 14
    { evo: 3, petId: 4, statId: 2, value: 14 },
    // Cascara -> Tidalking: Vital 24, Guard 14
    { evo: 4, petId: 5, statId: 2, value: 24 },
    { evo: 4, petId: 5, statId: 4, value: 14 },
    // Gustling -> Zephyrix: Swift 14
    { evo: 5, petId: 7, statId: 3, value: 14 },
    // Zephyrix -> Stormara: Swift 24, Spirit 12
    { evo: 6, petId: 8, statId: 3, value: 24 },
    { evo: 6, petId: 8, statId: 5, value: 12 },
    // Pebblet -> Boulderkin: Guard 14
    { evo: 7, petId: 10, statId: 4, value: 14 },
    // Boulderkin -> Titanox: Guard 24, Vital 16
    { evo: 8, petId: 11, statId: 4, value: 24 },
    { evo: 8, petId: 11, statId: 2, value: 16 },
    // Shadegrub -> Umbrawisp: Spirit 14
    { evo: 9, petId: 13, statId: 5, value: 14 },
    // Umbrawisp -> Voidrex: Spirit 24, Swift 14
    { evo: 10, petId: 14, statId: 5, value: 24 },
    { evo: 10, petId: 14, statId: 3, value: 14 },
    // Sproutling -> Bloomara: Vital 12, Spirit 10
    { evo: 11, petId: 16, statId: 2, value: 12 },
    { evo: 11, petId: 16, statId: 5, value: 10 },
    // Bloomara -> Verdantis: Vital 20, Guard 14, Spirit 16
    { evo: 12, petId: 17, statId: 2, value: 20 },
    { evo: 12, petId: 17, statId: 4, value: 14 },
    { evo: 12, petId: 17, statId: 5, value: 16 },
  ];

  let reqId = 1;
  const pet_evolution_stat_requirements = reqDefs.map((r) => {
    const petStat = pet_stats.find((ps) => ps.pet_id === r.petId && ps.stat_id === r.statId);
    return {
      id: reqId++,
      pet_evolution_id: r.evo,
      pet_stat_id: petStat.id,
      value: r.value,
      // denormalized helpers for UI
      _stat_id: r.statId,
      _pet_id: r.petId,
    };
  });

  const starters = [1, 4, 7, 10, 13, 16]; // stage-1 of each line
  const wildPool = pets.filter((p) => p.stage <= 2).map((p) => p.id);

  const zones = [
    { id: "emberfield", name: "Emberfield", elements: ["ember", "stone"], vibe: "Ash drifts over cracked earth." },
    { id: "mistshore", name: "Mistshore", elements: ["tide", "gale"], vibe: "Fog curls between tidepools." },
    { id: "shadehollow", name: "Shadehollow", elements: ["shade", "bloom"], vibe: "Roots whisper under dim light." },
    { id: "highridge", name: "Highridge", elements: ["gale", "stone"], vibe: "Wind shears the cliff edge." },
  ];

  return {
    stats,
    pets,
    pet_stats,
    pet_evolutions: evolutions,
    pet_evolution_stat_requirements,
    starters,
    wildPool,
    zones,
    now,
  };
})();
