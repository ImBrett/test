/** Polymorphic evolution requirement evaluators + branching chain projection. */

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

export function parseLineage(creature) {
  try {
    const raw = creature.lineage_json;
    const arr = typeof raw === "string" ? JSON.parse(raw || "[]") : raw || [];
    if (Array.isArray(arr) && arr.length) return arr.map(Number);
  } catch {
    /* fall through */
  }
  return [creature.species_id];
}

export function evaluateBranch(evaluators, catalog, creature, path) {
  const next = catalog.speciesById(path.descendant_species_id);
  const reqs = catalog.requirementsForPath(path.id).map((r) => {
    const fn = evaluators[r.requirement_kind];
    return fn
      ? fn(r, creature)
      : {
          kind: r.requirement_kind,
          label: r.requirement_kind,
          needed: r.threshold_value,
          have: 0,
          met: false,
        };
  });
  return {
    pathId: path.id,
    branchIndex: path.branch_index,
    label: path.label,
    ready: reqs.every((r) => r.met),
    next,
    reqs,
  };
}

/**
 * Full evolution projection for a creature:
 * branches from current form, devolve eligibility, lineage, and whole-tree view.
 */
export function evaluateEvolutionState(evaluators, catalog, creature) {
  const lineage = parseLineage(creature);
  const rootId = lineage[0] || creature.species_id;
  const paths = catalog.evolutionPathsFrom(creature.species_id);
  const branches = paths.map((p) => evaluateBranch(evaluators, catalog, creature, p));
  const canDevolve = lineage.length > 1;
  const ancestorId = canDevolve ? lineage[lineage.length - 2] : null;
  const ancestor = ancestorId ? catalog.speciesById(ancestorId) : null;

  return {
    canEvolve: branches.length > 0,
    canDevolve,
    ready: branches.some((b) => b.ready),
    branches,
    // compat: first ready branch or first branch
    next: (branches.find((b) => b.ready) || branches[0] || null)?.next || null,
    path: paths[0] || null,
    reqs: (branches.find((b) => b.ready) || branches[0] || null)?.reqs || [],
    lineage,
    lineageSpecies: lineage.map((id) => catalog.speciesById(id)).filter(Boolean),
    ancestor,
    tree: catalog.buildEvolutionTree(rootId),
  };
}

/** @deprecated prefer evaluateEvolutionState */
export function evaluateAll(evaluators, catalog, creature) {
  return evaluateEvolutionState(evaluators, catalog, creature);
}
