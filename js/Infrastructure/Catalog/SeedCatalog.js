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
  const pathById = byId(seed.evolutionPaths);

  const evolutionPathsFrom = (speciesId) =>
    seed.evolutionPaths
      .filter((p) => p.ancestor_species_id === speciesId)
      .sort((a, b) => a.branch_index - b.branch_index);

  const evolutionPathTo = (speciesId) =>
    seed.evolutionPaths.find((p) => p.descendant_species_id === speciesId);

  /** Nested tree from a Hatchling root (for chain UI). */
  function buildEvolutionTree(rootSpeciesId) {
    const walk = (speciesId) => {
      const sp = speciesById(speciesId);
      if (!sp) return null;
      const children = evolutionPathsFrom(speciesId).map((path) => ({
        pathId: path.id,
        branchIndex: path.branch_index,
        label: path.label,
        node: walk(path.descendant_species_id),
      }));
      return {
        speciesId: sp.id,
        name: sp.display_name,
        glyph: sp.glyph,
        hue: sp.hue,
        stage: sp.stage,
        stageName: sp.stage_name,
        branches: children,
      };
    };
    return walk(rootSpeciesId);
  }

  return {
    nowIso: () => clock.iso(),
    stageNames: seed.STAGE_NAMES,
    speciesById,
    statById,
    itemById,
    moveById,
    zoneById,
    pathById,
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
    /** @deprecated use evolutionPathsFrom — kept for soft compat */
    evolutionPathForSpecies: (speciesId) => evolutionPathsFrom(speciesId)[0],
    evolutionPathsFrom,
    evolutionPathTo,
    buildEvolutionTree,
    requirementsForPath: (pathId) =>
      seed.evolutionRequirements.filter((r) => r.evolution_path_id === pathId),
    drillForStat: (statId) => seed.trainingDrills.find((d) => d.stat_id === statId),
    shopListingByItemId: (itemId) =>
      seed.shopListings.find((l) => l.item_id === itemId),
    shopCategories: () => seed.SHOP_CATEGORIES,
    shopListings: (category = null) =>
      seed.shopListings
        .filter((l) => !category || l.category === category)
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((l) => ({
          ...l,
          item: itemById(l.item_id),
        })),
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
    evolution_paths: seed.evolutionPaths,
  };
}
