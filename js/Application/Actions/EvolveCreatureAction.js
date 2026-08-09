import { ok, fail } from "../../Domain/DTOs/Result.js";
import { appendEvent } from "../../Domain/Rules/CreatureEnricher.js";
import {
  evaluateEvolutionState,
  parseLineage,
} from "../../Domain/Rules/EvolutionRequirements.js";
import { DomainEventTypes } from "../../Domain/Events/DomainEvents.js";

function applySpeciesKit(catalog, uow, creature, speciesId, { resetStats }) {
  const bases = catalog.baseStatsForSpecies(speciesId);
  if (resetStats) {
    for (const row of uow.statsForCreature(creature.id)) {
      const base = bases.find((b) => b.stat_id === row.stat_id);
      row.value = base ? base.value : row.value;
    }
  } else {
    const oldBases = Object.fromEntries(
      catalog.baseStatsForSpecies(creature.species_id).map((b) => [b.stat_id, b.value])
    );
    const newBases = Object.fromEntries(bases.map((b) => [b.stat_id, b.value]));
    for (const row of uow.statsForCreature(creature.id)) {
      const trained = Math.max(0, row.value - (oldBases[row.stat_id] || 0));
      row.value = (newBases[row.stat_id] || row.value) + trained;
    }
  }
  uow.replaceCreatureMoves(
    creature.id,
    catalog.movesForSpecies(speciesId).map((sm) => ({
      player_creature_id: creature.id,
      move_id: sm.move_id,
      slot: sm.slot,
    }))
  );
}

/** Action: EvolveCreature — choose a branch pathId (Digimon-style). */
export function createEvolveCreatureAction({ catalog, uow, evaluators }) {
  return {
    name: "EvolveCreature",
    execute({ creatureId, pathId }) {
      const player = uow.getPlayer();
      if (!player) return fail("NO_PLAYER", "Create a player first");
      const creature = uow.getCreature(creatureId);
      if (!creature || creature.player_id !== player.id) {
        return fail("NOT_FOUND", "Creature not found");
      }

      const state = evaluateEvolutionState(evaluators, catalog, creature);
      if (!state.canEvolve) return fail("MAX_STAGE", "Already Apex form");

      const branch = state.branches.find((b) => b.pathId === Number(pathId));
      if (!branch) return fail("INVALID_BRANCH", "That evolution path is not available");
      if (!branch.ready) return fail("REQUIREMENTS", "Evolution requirements not met");

      const path = catalog.pathById(branch.pathId);
      for (const req of catalog.requirementsForPath(path.id)) {
        if (req.requirement_kind === "item") {
          if (!uow.consumeInventory(req.item_id, req.threshold_value)) {
            return fail("ITEM", "Missing evolution item");
          }
        }
      }

      const oldSpecies = catalog.speciesById(creature.species_id);
      const next = branch.next;
      const wasDefault = creature.nickname === oldSpecies.display_name;

      applySpeciesKit(catalog, uow, creature, next.id, { resetStats: false });
      creature.species_id = next.id;
      if (wasDefault) creature.nickname = next.display_name;

      const lineage = parseLineage(creature);
      lineage.push(next.id);
      creature.lineage_json = JSON.stringify(lineage);

      const resources = uow.getResources();
      resources.coins += 25;
      appendEvent(uow, player.id, "PlayerCreature", creature.id, DomainEventTypes.CREATURE_EVOLVED, {
        from: oldSpecies.id,
        to: next.id,
        path_id: path.id,
      });
      uow.commit();
      return ok({
        from: oldSpecies.display_name,
        to: next.display_name,
        creatureId: creature.id,
        pathId: path.id,
        lineage,
      });
    },
  };
}

/**
 * Action: DevolveCreature — walk back one step on the lineage.
 * Stats reset to the ancestor's base (no free re-roll of training).
 */
export function createDevolveCreatureAction({ catalog, uow }) {
  return {
    name: "DevolveCreature",
    execute({ creatureId }) {
      const player = uow.getPlayer();
      if (!player) return fail("NO_PLAYER", "Create a player first");
      const creature = uow.getCreature(creatureId);
      if (!creature || creature.player_id !== player.id) {
        return fail("NOT_FOUND", "Creature not found");
      }

      const lineage = parseLineage(creature);
      if (lineage.length <= 1) return fail("NO_ANCESTOR", "Already at Hatchling form");

      const fromSpecies = catalog.speciesById(creature.species_id);
      lineage.pop();
      const ancestorId = lineage[lineage.length - 1];
      const ancestor = catalog.speciesById(ancestorId);
      if (!ancestor) return fail("BAD_LINEAGE", "Lineage is corrupted");

      const wasDefault = creature.nickname === fromSpecies.display_name;
      applySpeciesKit(catalog, uow, creature, ancestor.id, { resetStats: true });
      creature.species_id = ancestor.id;
      creature.lineage_json = JSON.stringify(lineage);
      if (wasDefault) creature.nickname = ancestor.display_name;

      appendEvent(
        uow,
        player.id,
        "PlayerCreature",
        creature.id,
        DomainEventTypes.CREATURE_DEVOLVED,
        { from: fromSpecies.id, to: ancestor.id, lineage }
      );
      uow.commit();
      return ok({
        from: fromSpecies.display_name,
        to: ancestor.display_name,
        creatureId: creature.id,
        lineage,
        statsReset: true,
      });
    },
  };
}
