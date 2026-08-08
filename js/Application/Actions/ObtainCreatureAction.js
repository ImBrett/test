import { ok, fail } from "../../Domain/DTOs/Result.js";
import { appendEvent } from "../../Domain/Rules/CreatureEnricher.js";
import { createCreatureModel } from "../../Domain/Models/index.js";
import { DomainEventTypes } from "../../Domain/Events/DomainEvents.js";

/** Action: ObtainCreature — capture/starter grant of a species instance. */
export function createObtainCreatureAction({ catalog, uow, clock }) {
  return {
    name: "ObtainCreature",
    execute({ speciesId, nickname = null }) {
      const player = uow.getPlayer();
      if (!player) return fail("NO_PLAYER", "Create a player first");
      const species = catalog.speciesById(speciesId);
      if (!species) return fail("UNKNOWN_SPECIES", "Species not found");

      const isFirst = uow.listCreatures().length === 0;
      const creature = uow.insertCreature(
        createCreatureModel({
          playerId: player.id,
          speciesId,
          nickname,
          speciesDisplayName: species.display_name,
          obtainedAt: clock.iso(),
          isActive: isFirst,
        })
      );

      uow.insertCreatureStats(
        catalog.baseStatsForSpecies(speciesId).map((bs) => ({
          player_creature_id: creature.id,
          stat_id: bs.stat_id,
          value: bs.value,
        }))
      );
      uow.insertCreatureMoves(
        catalog.movesForSpecies(speciesId).map((sm) => ({
          player_creature_id: creature.id,
          move_id: sm.move_id,
          slot: sm.slot,
        }))
      );

      const empty = uow
        .listPartySlots()
        .filter((s) => !s.player_creature_id)
        .sort((a, b) => a.slot - b.slot)[0];
      if (empty) empty.player_creature_id = creature.id;

      appendEvent(
        uow,
        player.id,
        "PlayerCreature",
        creature.id,
        DomainEventTypes.CREATURE_OBTAINED,
        { species_id: speciesId }
      );
      uow.commit();
      return ok({ creatureId: creature.id, speciesId, nickname: creature.nickname });
    },
  };
}
