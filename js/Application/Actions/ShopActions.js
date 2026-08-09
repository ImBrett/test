import { ok, fail } from "../../Domain/DTOs/Result.js";
import { appendEvent } from "../../Domain/Rules/CreatureEnricher.js";
import { DomainEventTypes } from "../../Domain/Events/DomainEvents.js";

/** Action: BuyStatBoost — spend coins at the shop to raise a creature's trainable stat. */
export function createBuyStatBoostAction({ catalog, uow }) {
  return {
    name: "BuyStatBoost",
    execute({ itemId, creatureId }) {
      const player = uow.getPlayer();
      if (!player) return fail("NO_PLAYER", "Create a player first");

      const listing = catalog.shopListingByItemId(itemId);
      if (!listing) return fail("NOT_FOR_SALE", "Item is not sold in the shop");

      const item = catalog.itemById(itemId);
      if (!item || item.item_kind !== "stat_boost") {
        return fail("ITEM", "Not a stat boost item");
      }

      const creature = uow.getCreature(creatureId);
      if (!creature || creature.player_id !== player.id) {
        return fail("NOT_FOUND", "Creature not found");
      }

      const resources = uow.getResources();
      if (resources.coins < listing.price) {
        return fail("COINS", `Need ${listing.price} coins`);
      }

      const statId = item.effect_payload?.stat_id;
      const gain = item.effect_payload?.gain || 1;
      const row = uow.statsForCreature(creatureId).find((s) => s.stat_id === statId);
      if (!row) return fail("MISSING_STAT", "Stat row missing");

      resources.coins -= listing.price;
      row.value += gain;

      appendEvent(uow, player.id, "PlayerCreature", creatureId, DomainEventTypes.STAT_BOOSTED, {
        item_id: itemId,
        stat_id: statId,
        gain,
        price: listing.price,
      });
      uow.commit();

      return ok({
        creatureId,
        itemId,
        gain,
        value: row.value,
        price: listing.price,
        stat: catalog.statById(statId),
        coins: resources.coins,
      });
    },
  };
}
