import { ok } from "../../Domain/DTOs/Result.js";
import { appendEvent } from "../../Domain/Rules/CreatureEnricher.js";
import { createPlayerModel } from "../../Domain/Models/index.js";
import { DomainEventTypes } from "../../Domain/Events/DomainEvents.js";

/** Action: CreatePlayer — boots traveler aggregate + party slots. */
export function createCreatePlayerAction({ catalog, uow, clock }) {
  return {
    name: "CreatePlayer",
    execute({ name }) {
      uow.clear();
      const ts = clock.iso();
      const player = uow.insertPlayer(
        createPlayerModel({
          name,
          createdAt: ts,
          updatedAt: ts,
        })
      );
      uow.insertResources({
        player_id: player.id,
        energy: 0,
        energy_max: 0,
        coins: 40,
        energy_regen_seconds: 0,
        last_energy_at: ts,
      });
      for (let slot = 1; slot <= 6; slot++) {
        uow.insertPartySlot({
          player_id: player.id,
          slot,
          player_creature_id: null,
        });
      }
      appendEvent(
        uow,
        player.id,
        "Player",
        player.id,
        DomainEventTypes.PLAYER_CREATED,
        { name }
      );
      uow.commit();
      return ok({ playerId: player.id, name: player.name });
    },
  };
}
