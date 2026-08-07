import { ok, fail } from "../../dto/Result.js";
import { appendEvent } from "../CreatureEnricher.js";

/** Action: CreatePlayer — boots traveler aggregate + starter inventory/party slots. */
export function createCreatePlayerAction({ catalog, uow, clock }) {
  return {
    name: "CreatePlayer",
    execute({ name }) {
      uow.clear();
      const ts = clock.iso();
      const player = uow.insertPlayer({
        name,
        level: 1,
        experience: 0,
        created_at: ts,
        updated_at: ts,
      });
      uow.insertResources({
        player_id: player.id,
        energy: 20,
        energy_max: 20,
        coins: 0,
        energy_regen_seconds: 45,
        last_energy_at: ts,
      });
      uow.insertInventoryRow({
        player_id: player.id,
        item_id: 1,
        quantity: 5,
      });
      for (let slot = 1; slot <= 6; slot++) {
        uow.insertPartySlot({
          player_id: player.id,
          slot,
          player_creature_id: null,
        });
      }
      appendEvent(uow, player.id, "Player", player.id, "PlayerCreated", { name });
      uow.commit();
      return ok({ playerId: player.id, name: player.name });
    },
  };
}
