/** @implements {import('../../Domain/Ports/CatalogPort.js').CatalogPort} */
import * as seed from "./seedData.js";

export function createSeedCatalog(clock) {
  const byId = (rows) => {
    const map = new Map(rows.map((r) => [r.id, r]));
    return (id) => map.get(id);
  };

  const speciesById = byId(seed.species);
  const statById = byId(seed.stats);
  const itemById = byId(seed.items);
  const moveById = byId(seed.moves);
  const zoneById = byId(seed.zones);

  return {
    nowIso: () => clock.iso(),
    speciesById,
    statById,
    itemById,
    moveById,
    zoneById,
    zoneByCode: (code) => seed.zones.find((z) => z.code === code),
    baseStatsForSpecies: (speciesId) =>
      seed.speciesBaseStats.filter((r) => r.species_id === speciesId),
    movesForSpecies: (speciesId) =>
      seed.speciesMoves
        .filter((sm) => sm.species_id === speciesId)
        .sort((a, b) => a.slot - b.slot)
        .map((sm) => ({ ...sm, move: moveById(sm.move_id) })),
    matchupMultiplier: (attackerElementId, defenderElementId) => {
      if (!attackerElementId || !defenderElementId) return 1;
      const row = seed.elementMatchups.find(
        (m) =>
          m.attacker_element_id === attackerElementId &&
          m.defender_element_id === defenderElementId
      );
      return row ? row.multiplier : 1;
    },
    starterSpeciesIds: () => seed.species.filter((s) => s.is_starter).map((s) => s.id),
    evolutionPathForSpecies: (speciesId) =>
      seed.evolutionPaths.find((p) => p.ancestor_species_id === speciesId),
    requirementsForPath: (pathId) =>
      seed.evolutionRequirements.filter((r) => r.evolution_path_id === pathId),
    drillForStat: (statId) => seed.trainingDrills.find((d) => d.stat_id === statId),
    encountersForZone: (zoneId) =>
      seed.zoneEncounters.filter((e) => e.zone_id === zoneId),
    moveByCodeOrKind: (action) =>
      seed.moves.find((m) => m.code === action || m.effect_kind === action) ||
      moveById(1),
    stats: seed.stats,
    zones: seed.zones,
    species: seed.species,
    items: seed.items,
    moves: seed.moves,
    training_drills: seed.trainingDrills,
  };
}
