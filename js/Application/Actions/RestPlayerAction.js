import { ok, fail } from "../../Domain/DTOs/Result.js";
import { appendEvent, regenEnergy } from "../../Domain/Rules/CreatureEnricher.js";

/** Action: RestPlayer — spend coins to refill energy. */
export function createRestPlayerAction({ uow, clock }) {
  return {
    name: "RestPlayer",
    execute() {
      const player = uow.getPlayer();
      if (!player) return fail("NO_PLAYER", "Create a player first");
      const resources = uow.getResources();
      const cost = 15;
      if (resources.coins < cost) return fail("COINS", "Need 15 coins to rest");
      resources.coins -= cost;
      resources.energy = resources.energy_max;
      resources.last_energy_at = clock.iso();
      appendEvent(uow, player.id, "Player", player.id, "PlayerRested", { cost });
      uow.commit();
      return ok({ energy: resources.energy });
    },
  };
}

/** Action: RegenerateEnergy — tick passive regen from last_energy_at. */
export function createRegenerateEnergyAction({ uow, clock }) {
  return {
    name: "RegenerateEnergy",
    execute() {
      const resources = uow.getResources();
      if (!resources) return ok(null);
      regenEnergy(resources, clock);
      uow.commit();
      return ok({
        energy: resources.energy,
        energyMax: resources.energy_max,
      });
    },
  };
}
