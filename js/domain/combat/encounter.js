/** Data-driven wild encounter builder from zone_encounters. */
import { combatPower } from "./power.js";

function weightedPick(encounters) {
  const total = encounters.reduce((a, e) => a + e.weight, 0);
  let roll = Math.random() * total;
  for (const e of encounters) {
    roll -= e.weight;
    if (roll <= 0) return e;
  }
  return encounters[encounters.length - 1];
}

export function createEncounterService(catalog) {
  function make(zoneCodeOrId) {
    const zone =
      typeof zoneCodeOrId === "number"
        ? catalog.zoneById(zoneCodeOrId)
        : catalog.zoneByCode(zoneCodeOrId) || catalog.zones[0];

    const table = catalog.encountersForZone(zone.id);
    const pick = weightedPick(table);
    const species = catalog.speciesById(pick.species_id);
    const variance =
      pick.stat_variance_min +
      Math.random() * (pick.stat_variance_max - pick.stat_variance_min);

    const stats = catalog.baseStatsForSpecies(species.id).map((bs) => ({
      stat_id: bs.stat_id,
      value: Math.max(1, Math.round(bs.value * variance)),
      stat: catalog.statById(bs.stat_id),
    }));

    const wild = {
      id: -1,
      species_id: species.id,
      nickname: `Wild ${species.display_name}`,
      species,
      pet: species,
      stats,
      moves: catalog.movesForSpecies(species.id),
      power: stats.reduce((a, s) => a + s.value, 0),
      level: species.stage,
      battles_won: 0,
    };

    return { zone, wild, combat: combatPower(wild), encounter: pick };
  }

  return { make };
}
