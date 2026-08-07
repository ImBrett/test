/**
 * Evolution requirement strategies (OCP / LSP).
 * Add a new kind by registering an evaluator — no switch sprawl in callers.
 */

/** @typedef {{ kind: string, label: string, needed: number, have: number, met: boolean, stat?: object, item?: object }} EvaluatedRequirement */

export function createRequirementEvaluators({ catalog, inventoryQty }) {
  return {
    stat(req, creature, statsRows) {
      const row = statsRows.find(
        (s) => s.player_creature_id === creature.id && s.stat_id === req.stat_id
      );
      const have = row ? row.value : 0;
      const stat = catalog.statById(req.stat_id);
      return {
        kind: "stat",
        label: stat.display_name,
        stat,
        needed: req.threshold_value,
        have,
        met: have >= req.threshold_value,
      };
    },

    item(req, creature, _stats, playerId) {
      const item = catalog.itemById(req.item_id);
      const have = inventoryQty(playerId, req.item_id);
      return {
        kind: "item",
        label: item.display_name,
        item,
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

export function evaluateRequirement(evaluators, req, creature, statsRows, playerId) {
  const fn = evaluators[req.requirement_kind];
  if (!fn) {
    return {
      kind: req.requirement_kind,
      label: req.requirement_kind,
      needed: req.threshold_value,
      have: 0,
      met: false,
    };
  }
  return fn(req, creature, statsRows, playerId);
}
