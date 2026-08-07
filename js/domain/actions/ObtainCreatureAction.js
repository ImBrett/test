import { ok, fail } from "../../dto/Result.js";
import { appendEvent } from "../CreatureEnricher.js";

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
      const creature = uow.insertCreature({
        player_id: player.id,
        species_id: speciesId,
        nickname: (nickname && nickname.trim()) || species.display_name,
        level: 1,
        experience: 0,
        battles_won: 0,
        obtained_at: clock.iso(),
        is_active: isFirst ? 1 : 0,
      });

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

      appendEvent(uow, player.id, "PlayerCreature", creature.id, "CreatureObtained", {
        species_id: speciesId,
      });
      uow.commit();
      return ok({ creatureId: creature.id, speciesId, nickname: creature.nickname });
    },
  };
}
