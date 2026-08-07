/**
 * Evolution domain service — interprets evolution_paths + requirements.
 */
import { evaluateRequirement } from "./requirements.js";

export function createEvolutionService({ catalog, evaluators, consumeItem }) {
  function getInfo(creature, statsRows, playerId) {
    const path = catalog.pathForSpecies(creature.species_id);
    if (!path) return { canEvolve: false, ready: false, next: null, reqs: [] };

    const next = catalog.speciesById(path.descendant_species_id);
    const reqs = catalog.requirementsForPath(path.id).map((r) => {
      const evaluated = evaluateRequirement(evaluators, r, creature, statsRows, playerId);
      return {
        ...evaluated,
        stat: evaluated.stat || { name: evaluated.label, color: "#7dcea0" },
        name: evaluated.label,
      };
    });

    return { canEvolve: true, ready: reqs.every((r) => r.met), next, path, evo: path, reqs };
  }

  function evolve(creature, statsRows, moveRows, nextMoveId, playerId) {
    const info = getInfo(creature, statsRows, playerId);
    if (!info.canEvolve) return { ok: false, reason: "max" };
    if (!info.ready) return { ok: false, reason: "reqs" };

    const itemReqs = catalog
      .requirementsForPath(info.path.id)
      .filter((r) => r.requirement_kind === "item");
    for (const req of itemReqs) {
      if (!consumeItem(playerId, req.item_id, req.threshold_value)) {
        return { ok: false, reason: "item" };
      }
    }

    const oldSpecies = catalog.speciesById(creature.species_id);
    const wasDefault = creature.nickname === oldSpecies.display_name;
    creature.species_id = info.next.id;
    if (wasDefault) creature.nickname = info.next.display_name;

    const oldBases = Object.fromEntries(
      catalog.baseStatsForSpecies(info.path.ancestor_species_id).map((b) => [b.stat_id, b.value])
    );
    const newBases = Object.fromEntries(
      catalog.baseStatsForSpecies(info.next.id).map((b) => [b.stat_id, b.value])
    );

    for (const row of statsRows.filter((s) => s.player_creature_id === creature.id)) {
      const trained = Math.max(0, row.value - (oldBases[row.stat_id] || 0));
      row.value = (newBases[row.stat_id] || row.value) + trained;
    }

    // Replace moveset from catalog (open for new species kits)
    const kept = moveRows.filter((m) => m.player_creature_id !== creature.id);
    moveRows.length = 0;
    moveRows.push(...kept);
    for (const sm of catalog.movesForSpecies(info.next.id)) {
      moveRows.push({
        id: nextMoveId(),
        player_creature_id: creature.id,
        move_id: sm.move_id,
        slot: sm.slot,
      });
    }

    return {
      ok: true,
      from: oldSpecies.display_name,
      to: info.next.display_name,
      path: info.path,
    };
  }

  return { getInfo, evolve };
}
