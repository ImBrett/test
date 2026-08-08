/** Polymorphic evolution requirement evaluators (OCP). */

export function createRequirementEvaluators({ catalog, uow }) {
  return {
    stat(req, creature) {
      const row = uow
        .statsForCreature(creature.id)
        .find((s) => s.stat_id === req.stat_id);
      const have = row ? row.value : 0;
      const stat = catalog.statById(req.stat_id);
      return {
        kind: "stat",
        label: stat.display_name,
        needed: req.threshold_value,
        have,
        met: have >= req.threshold_value,
      };
    },
    item(req) {
      const item = catalog.itemById(req.item_id);
      const have = uow.inventoryQty(req.item_id);
      return {
        kind: "item",
        label: item.display_name,
        needed: req.threshold_value,
        have,
        met: have >= req.threshold_value,
      };
    },
    level(req, creature) {
      return {
        kind: "level",
        label: "Level",
        needed: req.threshold_value,
        have: creature.level,
        met: creature.level >= req.threshold_value,
      };
    },
    battles_won(req, creature) {
      return {
        kind: "battles_won",
        label: "Battles won",
        needed: req.threshold_value,
        have: creature.battles_won,
        met: creature.battles_won >= req.threshold_value,
      };
    },
  };
}

export function evaluateAll(evaluators, catalog, creature) {
  const path = catalog.evolutionPathForSpecies(creature.species_id);
  if (!path) return { canEvolve: false, ready: false, next: null, path: null, reqs: [] };
  const next = catalog.speciesById(path.descendant_species_id);
  const reqs = catalog.requirementsForPath(path.id).map((r) => {
    const fn = evaluators[r.requirement_kind];
    return fn
      ? fn(r, creature)
      : { kind: r.requirement_kind, label: r.requirement_kind, needed: r.threshold_value, have: 0, met: false };
  });
  return { canEvolve: true, ready: reqs.every((r) => r.met), next, path, reqs };
}
