/**
 * Sequenced areas. Wild level is the area band, not the species stage.
 * Each area unlocks after a win in the previous area.
 *
 * Species ids: hatchlings 1,12,23,34,45,56 · fledglings 2,13,24,35,46,57
 * Matures: Ignis 3-5, Veil 14-16, Aether 25-27, Terra 36-38, Umbral 47-49, Radiance 58-60
 * Boss-only later stages: Blazemane 6, Tidalking 17
 */

const EMBERKIT = 1;
const CINDERTUFT = 2;
const PYREWHELP = 3;
const SCORCHPAW = 4;
const EMBERVEIL = 5;
const BLAZEMANE = 6;
const DEWLET = 12;
const DRIZZLET = 13;
const CASCARA = 14;
const RIPPLETIDE = 15;
const MURKFIN = 16;
const TIDALKING = 17;
const GUSTLING = 23;
const FLUFFGALE = 24;
const ZEPHYRIX = 25;
const GALECLAW = 26;
const NIMBAT = 27;
const PEBBLIT = 34;
const GRAVELPUP = 35;
const BOULDERFIST = 36;
const PLATEBACK = 37;
const QUARTZEYE = 38;
const DUSKLING = 45;
const GLOAMKIT = 46;
const NIGHTFANG = 47;
const VEILWISP = 48;
const HEXMOTH = 49;
const GLEAMLET = 56;
const SUNFLECK = 57;
const BRIGHTPAW = 58;
const AUREWING = 59;
const LUMENHART = 60;

const EARLY = [0.92, 1.02];
const MID = [0.9, 1.05];
const BOSS = [1.05, 1.15];

let nextZoneId = 1;
let nextEncId = 1;
let prevId = null;

function addZone({
  code,
  label,
  name,
  vibe,
  region,
  regionName,
  min,
  max,
  boss = false,
  species,
  variance = MID,
}) {
  const id = nextZoneId++;
  zones.push({
    id,
    code,
    display_name: name,
    name,
    vibe,
    region_code: region,
    region_name: regionName,
    area_label: label,
    min_wild_level: min,
    max_wild_level: max,
    is_boss: boss ? 1 : 0,
    unlock_after_zone_id: prevId,
    sort_order: id,
    min_player_level: min,
  });
  for (const speciesId of species) {
    zoneEncounters.push({
      id: nextEncId++,
      zone_id: id,
      species_id: speciesId,
      weight: 10,
      min_stage: 1,
      max_stage: 5,
      stat_variance_min: variance[0],
      stat_variance_max: variance[1],
    });
  }
  prevId = id;
}

export const zones = [];
export const zoneEncounters = [];

const R1 = ["first-wilds", "First Wilds"];
addZone({
  code: "ash-trail",
  label: "1-1",
  name: "Ash Trail",
  vibe: "Warm ash and two small shapes in the brush.",
  region: R1[0],
  regionName: R1[1],
  min: 1,
  max: 2,
  species: [EMBERKIT, DEWLET],
  variance: EARLY,
});
addZone({
  code: "wind-shelf",
  label: "1-2",
  name: "Wind Shelf",
  vibe: "A third hatchling rides the low wind.",
  region: R1[0],
  regionName: R1[1],
  min: 1,
  max: 2,
  species: [EMBERKIT, DEWLET, GUSTLING],
  variance: EARLY,
});
addZone({
  code: "low-marsh",
  label: "1-3",
  name: "Low Marsh",
  vibe: "The same three, a little tougher in the reeds.",
  region: R1[0],
  regionName: R1[1],
  min: 2,
  max: 3,
  species: [EMBERKIT, DEWLET, GUSTLING],
  variance: EARLY,
});
addZone({
  code: "stone-cut",
  label: "1-4",
  name: "Stone Cut",
  vibe: "Pebbles click where a new hatchling waits.",
  region: R1[0],
  regionName: R1[1],
  min: 2,
  max: 3,
  species: [EMBERKIT, DEWLET, GUSTLING, PEBBLIT],
  variance: EARLY,
});
addZone({
  code: "dusk-path",
  label: "1-5",
  name: "Dusk Path",
  vibe: "Shadow pools, and a dusk-born hatchling.",
  region: R1[0],
  regionName: R1[1],
  min: 3,
  max: 4,
  species: [EMBERKIT, DEWLET, GUSTLING, PEBBLIT, DUSKLING],
  variance: EARLY,
});
addZone({
  code: "dawn-verge",
  label: "1-6",
  name: "Dawn Verge",
  vibe: "All six hatchlings gather where the light breaks.",
  region: R1[0],
  regionName: R1[1],
  min: 3,
  max: 5,
  species: [EMBERKIT, DEWLET, GUSTLING, PEBBLIT, DUSKLING, GLEAMLET],
  variance: EARLY,
});
addZone({
  code: "verge-warden",
  label: "1-B",
  name: "Verge Warden",
  vibe: "A fledgling holds the gate out of the first wilds.",
  region: R1[0],
  regionName: R1[1],
  min: 5,
  max: 5,
  boss: true,
  species: [CINDERTUFT],
  variance: BOSS,
});

const R2 = ["fledgling-range", "Fledgling Range"];
addZone({
  code: "cinder-path",
  label: "2-1",
  name: "Cinder Path",
  vibe: "The first fledglings hunt in pairs.",
  region: R2[0],
  regionName: R2[1],
  min: 5,
  max: 6,
  species: [CINDERTUFT, DRIZZLET],
});
addZone({
  code: "gale-step",
  label: "2-2",
  name: "Gale Step",
  vibe: "A third fledgling drops out of the gusts.",
  region: R2[0],
  regionName: R2[1],
  min: 5,
  max: 6,
  species: [CINDERTUFT, DRIZZLET, FLUFFGALE],
});
addZone({
  code: "gravel-run",
  label: "2-3",
  name: "Gravel Run",
  vibe: "The same three, quicker on the loose stone.",
  region: R2[0],
  regionName: R2[1],
  min: 6,
  max: 7,
  species: [CINDERTUFT, DRIZZLET, FLUFFGALE],
});
addZone({
  code: "gloam-hollow",
  label: "2-4",
  name: "Gloam Hollow",
  vibe: "A heavy fledgling joins the hollow.",
  region: R2[0],
  regionName: R2[1],
  min: 6,
  max: 8,
  species: [CINDERTUFT, DRIZZLET, FLUFFGALE, GRAVELPUP],
});
addZone({
  code: "shade-line",
  label: "2-5",
  name: "Shade Line",
  vibe: "Dusk fledglings pad the tree line.",
  region: R2[0],
  regionName: R2[1],
  min: 7,
  max: 8,
  species: [CINDERTUFT, DRIZZLET, FLUFFGALE, GRAVELPUP, GLOAMKIT],
});
addZone({
  code: "sun-ridge",
  label: "2-6",
  name: "Sun Ridge",
  vibe: "Every fledgling affinity walks the ridge.",
  region: R2[0],
  regionName: R2[1],
  min: 8,
  max: 10,
  species: [CINDERTUFT, DRIZZLET, FLUFFGALE, GRAVELPUP, GLOAMKIT, SUNFLECK],
});
addZone({
  code: "ridge-tyrant",
  label: "2-B",
  name: "Ridge Tyrant",
  vibe: "A mature beast claims the ridge.",
  region: R2[0],
  regionName: R2[1],
  min: 10,
  max: 10,
  boss: true,
  species: [PYREWHELP],
  variance: BOSS,
});

const R3 = ["mature-wilds", "Mature Wilds"];
addZone({
  code: "ember-break",
  label: "3-1",
  name: "Ember Break",
  vibe: "Mature Ignis split the cooling crust.",
  region: R3[0],
  regionName: R3[1],
  min: 10,
  max: 12,
  species: [PYREWHELP, SCORCHPAW],
});
addZone({
  code: "tide-pools",
  label: "3-2",
  name: "Tide Pools",
  vibe: "More mature forms gather at the water.",
  region: R3[0],
  regionName: R3[1],
  min: 11,
  max: 13,
  species: [PYREWHELP, SCORCHPAW, EMBERVEIL, CASCARA],
});
addZone({
  code: "high-shelf",
  label: "3-3",
  name: "High Shelf",
  vibe: "Veil and Aether matures share the ledge.",
  region: R3[0],
  regionName: R3[1],
  min: 12,
  max: 14,
  species: [RIPPLETIDE, MURKFIN, ZEPHYRIX],
});
addZone({
  code: "gale-teeth",
  label: "3-4",
  name: "Gale Teeth",
  vibe: "Wind and stone matures clash on the teeth.",
  region: R3[0],
  regionName: R3[1],
  min: 13,
  max: 15,
  species: [GALECLAW, NIMBAT, BOULDERFIST],
});
addZone({
  code: "deep-stone",
  label: "3-5",
  name: "Deep Stone",
  vibe: "Terra and the first umbral matures.",
  region: R3[0],
  regionName: R3[1],
  min: 14,
  max: 16,
  species: [PLATEBACK, QUARTZEYE, NIGHTFANG],
});
addZone({
  code: "night-glow",
  label: "3-6",
  name: "Night Glow",
  vibe: "Umbral shapes, and a radiance mature.",
  region: R3[0],
  regionName: R3[1],
  min: 15,
  max: 17,
  species: [VEILWISP, HEXMOTH, BRIGHTPAW],
});
addZone({
  code: "dawn-crown",
  label: "3-7",
  name: "Dawn Crown",
  vibe: "The last radiance matures hold the crown.",
  region: R3[0],
  regionName: R3[1],
  min: 16,
  max: 18,
  species: [AUREWING, LUMENHART],
});
addZone({
  code: "crown-beast",
  label: "3-B",
  name: "Crown Beast",
  vibe: "An ascendant waits above the mature wilds.",
  region: R3[0],
  regionName: R3[1],
  min: 18,
  max: 18,
  boss: true,
  species: [BLAZEMANE],
  variance: BOSS,
});

const R4 = ["high-country", "High Country"];
addZone({
  code: "high-mix",
  label: "4-1",
  name: "High Mix",
  vibe: "Mature beasts from every affinity, higher up.",
  region: R4[0],
  regionName: R4[1],
  min: 18,
  max: 22,
  species: [PYREWHELP, CASCARA, ZEPHYRIX, BOULDERFIST],
});
addZone({
  code: "storm-shelf",
  label: "4-2",
  name: "Storm Shelf",
  vibe: "Another mix, harder winds.",
  region: R4[0],
  regionName: R4[1],
  min: 20,
  max: 24,
  species: [SCORCHPAW, RIPPLETIDE, GALECLAW, NIGHTFANG],
});
addZone({
  code: "deep-glow",
  label: "4-3",
  name: "Deep Glow",
  vibe: "Light and armor in the deep cuts.",
  region: R4[0],
  regionName: R4[1],
  min: 22,
  max: 26,
  species: [EMBERVEIL, MURKFIN, PLATEBACK, BRIGHTPAW],
});
addZone({
  code: "last-light",
  label: "4-4",
  name: "Last Light",
  vibe: "The last mature remix before the tyrant.",
  region: R4[0],
  regionName: R4[1],
  min: 24,
  max: 28,
  species: [QUARTZEYE, HEXMOTH, AUREWING, LUMENHART],
});
addZone({
  code: "high-tyrant",
  label: "4-B",
  name: "High Tyrant",
  vibe: "An ascendant of the tides rules the high country.",
  region: R4[0],
  regionName: R4[1],
  min: 28,
  max: 28,
  boss: true,
  species: [TIDALKING],
  variance: BOSS,
});
