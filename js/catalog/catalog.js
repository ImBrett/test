/**
 * Catalog — read model / query API over seed tables.
 * Single responsibility: answer content questions. No player state.
 */
import * as seed from "./seed.js";

export function createCatalog() {
  const byId = (rows) => {
    const map = new Map(rows.map((r) => [r.id, r]));
    return (id) => map.get(id);
  };

  const speciesById = byId(seed.species);
  const statById = byId(seed.stats);
  const itemById = byId(seed.items);
  const moveById = byId(seed.moves);
  const zoneById = byId(seed.zones);

  const zoneByCode = (code) => seed.zones.find((z) => z.code === code);

  const baseStatsForSpecies = (speciesId) =>
    seed.speciesBaseStats.filter((r) => r.species_id === speciesId);

  const movesForSpecies = (speciesId) =>
    seed.speciesMoves
      .filter((sm) => sm.species_id === speciesId)
      .sort((a, b) => a.slot - b.slot)
      .map((sm) => ({ ...sm, move: moveById(sm.move_id) }));

  const matchupMultiplier = (attackerElementId, defenderElementId) => {
    if (!attackerElementId || !defenderElementId) return 1;
    const row = seed.elementMatchups.find(
      (m) =>
        m.attacker_element_id === attackerElementId &&
        m.defender_element_id === defenderElementId
    );
    return row ? row.multiplier : 1;
  };

  const starters = () => seed.species.filter((s) => s.is_starter).map((s) => s.id);

  const pathForSpecies = (speciesId) =>
    seed.evolutionPaths.find((p) => p.ancestor_species_id === speciesId);

  const requirementsForPath = (pathId) =>
    seed.evolutionRequirements.filter((r) => r.evolution_path_id === pathId);

  const drillForStat = (statId) =>
    seed.trainingDrills.find((d) => d.stat_id === statId);

  const encountersForZone = (zoneId) =>
    seed.zoneEncounters.filter((e) => e.zone_id === zoneId);

  const moveByCodeOrKind = (action) =>
    seed.moves.find((m) => m.code === action || m.effect_kind === action) ||
    moveById(1);

  return {
    // tables (read-only)
    rarities: seed.rarities,
    elements: seed.elements,
    element_matchups: seed.elementMatchups,
    stats: seed.stats,
    items: seed.items,
    species: seed.species,
    species_base_stats: seed.speciesBaseStats,
    moves: seed.moves,
    species_moves: seed.speciesMoves,
    evolution_paths: seed.evolutionPaths,
    evolution_requirements: seed.evolutionRequirements,
    zones: seed.zones,
    zone_encounters: seed.zoneEncounters,
    training_drills: seed.trainingDrills,
    // queries
    now: () => new Date().toISOString(),
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
    pathForSpecies,
    requirementsForPath,
    drillForStat,
    encountersForZone,
    moveByCodeOrKind,
  };
}
