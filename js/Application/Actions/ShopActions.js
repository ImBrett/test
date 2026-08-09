import { ok, fail } from "../../Domain/DTOs/Result.js";
import { appendEvent } from "../../Domain/Rules/CreatureEnricher.js";
import { DomainEventTypes } from "../../Domain/Events/DomainEvents.js";

/**
 * Action: BuyShopItem
 * - training (stat_boost): spend coins, apply to creature immediately
 * - items (consumable): spend coins, add to inventory
 * - equipment: stub — not purchasable yet
 */
export function createBuyShopItemAction({ catalog, uow }) {
  return {
    name: "BuyShopItem",
    execute({ itemId, creatureId = null }) {
      const player = uow.getPlayer();
      if (!player) return fail("NO_PLAYER", "Create a player first");

      const listing = catalog.shopListingByItemId(itemId);
      if (!listing) return fail("NOT_FOR_SALE", "Item is not sold in the shop");
      if (listing.available === false) {
        return fail("UNAVAILABLE", "Equipment is not available yet");
      }

      const item = catalog.itemById(itemId);
      if (!item) return fail("ITEM", "Unknown item");

      const resources = uow.getResources();
      if (resources.coins < listing.price) {
        return fail("COINS", `Need ${listing.price} coins`);
      }

      const category = listing.category || item.shop_category;

      if (category === "training" || item.item_kind === "stat_boost") {
        if (!creatureId) return fail("NO_CREATURE", "Pick a party member first");
        const creature = uow.getCreature(creatureId);
        if (!creature || creature.player_id !== player.id) {
          return fail("NOT_FOUND", "Creature not found");
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
          kind: "training",
          creatureId,
          itemId,
          gain,
          value: row.value,
          price: listing.price,
          stat: catalog.statById(statId),
          coins: resources.coins,
        });
      }

      if (category === "items" || item.item_kind === "consumable") {
        resources.coins -= listing.price;
        uow.addInventory(itemId, 1);
        appendEvent(uow, player.id, "Player", player.id, "ItemPurchased", {
          item_id: itemId,
          price: listing.price,
        });
        uow.commit();
        return ok({
          kind: "items",
          itemId,
          name: item.display_name,
          price: listing.price,
          quantity: uow.inventoryQty(itemId),
          coins: resources.coins,
        });
      }

      return fail("UNAVAILABLE", "Equipment is not available yet");
    },
  };
}

/** @deprecated alias */
export function createBuyStatBoostAction(deps) {
  return createBuyShopItemAction(deps);
}

/**
 * Action: UseBattleItem — consume an inventory consumable during an active battle.
 */
export function createUseBattleItemAction({ catalog, uow }) {
  return {
    name: "UseBattleItem",
    execute({ battleSession, itemId }) {
      if (!battleSession || battleSession.over) {
        return fail("BATTLE_OVER", "Battle is not active");
      }
      const item = catalog.itemById(itemId);
      if (!item || item.item_kind !== "consumable") {
        return fail("ITEM", "Not a usable battle item");
      }
      if (!uow.consumeInventory(itemId, 1)) {
        return fail("NO_ITEM", "None left in inventory");
      }

      const payload = item.effect_payload || {};
      const you = {
        ...battleSession.youCombat,
        hp: battleSession.youHp,
        hpMax: battleSession.youMax,
      };
      const log = [];

      if (payload.battle === "clear_debuffs" || payload.clear_debuffs) {
        you.atk = battleSession.youCombat.atk;
        you.def = battleSession.youCombat.def;
        you.spd = battleSession.youCombat.spd;
        you._guarding = false;
        log.push({ text: `${battleSession.you.nickname} feels clear again.`, dmg: 0 });
      }

      if (payload.heal_pct) {
        const heal = Math.round(you.hpMax * payload.heal_pct);
        you.hp = Math.min(you.hpMax, you.hp + heal);
        log.push({ text: `${item.display_name} restores ${heal} HP.`, dmg: 0 });
      }

      if (!log.length) {
        uow.addInventory(itemId, 1); // refund unused
        return fail("ITEM", "Item has no battle effect");
      }

      const player = uow.getPlayer();
      appendEvent(uow, player.id, "Battle", battleSession.battleId, "ItemUsed", {
        item_id: itemId,
      });
      uow.commit();

      return ok({
        youHp: you.hp,
        youCombat: {
          ...battleSession.youCombat,
          atk: you.atk,
          def: you.def,
          spd: you.spd,
        },
        log,
        itemName: item.display_name,
      });
    },
  };
}
