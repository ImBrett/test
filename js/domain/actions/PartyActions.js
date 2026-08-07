import { ok, fail } from "../../dto/Result.js";

export function createSetActiveCreatureAction({ uow }) {
  return {
    name: "SetActiveCreature",
    execute({ creatureId }) {
      const player = uow.getPlayer();
      if (!player) return fail("NO_PLAYER", "Create a player first");
      const target = uow.getCreature(creatureId);
      if (!target || target.player_id !== player.id) {
        return fail("NOT_FOUND", "Creature not found");
      }
      for (const c of uow.listCreatures()) {
        c.is_active = c.id === creatureId ? 1 : 0;
      }
      uow.commit();
      return ok({ creatureId });
    },
  };
}

export function createRenameCreatureAction({ catalog, uow }) {
  return {
    name: "RenameCreature",
    execute({ creatureId, nickname }) {
      const player = uow.getPlayer();
      if (!player) return fail("NO_PLAYER", "Create a player first");
      const creature = uow.getCreature(creatureId);
      if (!creature || creature.player_id !== player.id) {
        return fail("NOT_FOUND", "Creature not found");
      }
      const species = catalog.speciesById(creature.species_id);
      creature.nickname = nickname || species.display_name;
      uow.commit();
      return ok({ creatureId, nickname: creature.nickname });
    },
  };
}
