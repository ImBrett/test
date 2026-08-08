import { ok, fail } from "../../Domain/DTOs/Result.js";
import { appendEvent, regenEnergy } from "../../Domain/Rules/CreatureEnricher.js";

/** Action: TrainCreature — apply a catalog training drill to one stat. */
export function createTrainCreatureAction({ catalog, uow, clock, random }) {
  return {
    name: "TrainCreature",
    execute({ creatureId, statId }) {
      const player = uow.getPlayer();
      if (!player) return fail("NO_PLAYER", "Create a player first");
      const creature = uow.getCreature(creatureId);
      if (!creature || creature.player_id !== player.id) {
        return fail("NOT_FOUND", "Creature not found");
      }
      const drill = catalog.drillForStat(statId);
      if (!drill) return fail("MISSING_DRILL", "No drill for stat");

      const resources = uow.getResources();
      regenEnergy(resources, clock);
      if (resources.energy < drill.energy_cost) {
        return fail("ENERGY", "Not enough energy");
      }
      resources.energy -= drill.energy_cost;

      const row = uow.statsForCreature(creatureId).find((s) => s.stat_id === statId);
      if (!row) return fail("MISSING_STAT", "Stat row missing");

      const critical = random.next() < drill.critical_chance;
      const gain = drill.base_gain + (critical ? drill.critical_bonus : 0);
      row.value += gain;
      resources.coins += drill.coin_reward;

      appendEvent(uow, player.id, "PlayerCreature", creatureId, "CreatureTrained", {
        stat_id: statId,
        gain,
        drill_id: drill.id,
        critical,
      });
      uow.commit();
      return ok({
        gain,
        value: row.value,
        critical,
        drill,
        stat: catalog.statById(statId),
      });
    },
  };
}
