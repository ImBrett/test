import { ok, fail } from "../../dto/Result.js";
import { appendEvent } from "../CreatureEnricher.js";
import { evaluateAll } from "../evolution/RequirementEvaluator.js";

/** Action: EvolveCreature — interpret evolution_paths + requirements. */
export function createEvolveCreatureAction({ catalog, uow, evaluators }) {
  return {
    name: "EvolveCreature",
    execute({ creatureId }) {
      const player = uow.getPlayer();
      if (!player) return fail("NO_PLAYER", "Create a player first");
      const creature = uow.getCreature(creatureId);
      if (!creature || creature.player_id !== player.id) {
        return fail("NOT_FOUND", "Creature not found");
      }

      const info = evaluateAll(evaluators, catalog, creature);
      if (!info.canEvolve) return fail("MAX_STAGE", "Already final form");
      if (!info.ready) return fail("REQUIREMENTS", "Evolution requirements not met");

      for (const req of catalog.requirementsForPath(info.path.id)) {
        if (req.requirement_kind === "item") {
          if (!uow.consumeInventory(req.item_id, req.threshold_value)) {
            return fail("ITEM", "Missing evolution item");
          }
        }
      }

      const oldSpecies = catalog.speciesById(creature.species_id);
      const wasDefault = creature.nickname === oldSpecies.display_name;
      creature.species_id = info.next.id;
      if (wasDefault) creature.nickname = info.next.display_name;

      const oldBases = Object.fromEntries(
        catalog
          .baseStatsForSpecies(info.path.ancestor_species_id)
          .map((b) => [b.stat_id, b.value])
      );
      const newBases = Object.fromEntries(
        catalog.baseStatsForSpecies(info.next.id).map((b) => [b.stat_id, b.value])
      );
      for (const row of uow.statsForCreature(creature.id)) {
        const trained = Math.max(0, row.value - (oldBases[row.stat_id] || 0));
        row.value = (newBases[row.stat_id] || row.value) + trained;
      }

      uow.replaceCreatureMoves(
        creature.id,
        catalog.movesForSpecies(info.next.id).map((sm) => ({
          player_creature_id: creature.id,
          move_id: sm.move_id,
          slot: sm.slot,
        }))
      );

      const resources = uow.getResources();
      resources.coins += 25;
      appendEvent(uow, player.id, "PlayerCreature", creature.id, "CreatureEvolved", {
        from: oldSpecies.id,
        to: info.next.id,
      });
      uow.commit();
      return ok({
        from: oldSpecies.display_name,
        to: info.next.display_name,
        creatureId: creature.id,
      });
    },
  };
}
