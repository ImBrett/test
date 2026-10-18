import { ok, fail } from "../../Domain/DTOs/Result.js";
import { appendEvent } from "../../Domain/Rules/CreatureEnricher.js";
import { DomainEventTypes } from "../../Domain/Events/DomainEvents.js";
import { grantGearFromChest } from "./GearActions.js";
import { gearDisplayName } from "../../Domain/Rules/GearRules.js";

/**
 * Action: BuyShopItem
 * - training (stat_boost): spend coins, apply to creature immediately
 * - items (consumable): spend coins, add to inventory
 * - equipment gear_chest: spend coins, roll gear into stash
 * - equipment gear_tool (substat changer): spend coins, add to inventory
 */
export function createBuyShopItemAction({ catalog, uow, random }) {
  return {
    name: "BuyShopItem",
    execute({ itemId, creatureId = null }) {
      const player = uow.getPlayer();
      if (!player) return fail("NO_PLAYER", "Create a player first");

      const listing = catalog.shopListingByItemId(itemId);
      if (!listing) return fail("NOT_FOR_SALE", "Item is not sold in the shop");
      if (listing.available === false) {
        return fail("UNAVAILABLE", "This listing is not available");
      }

      const item = catalog.itemById(itemId);
      if (!item) return fail("ITEM", "Unknown item");

      const resources = uow.getResources();
      if (resources.coins < listing.price) {
        return fail("COINS", `Need ${listing.price} coins`);
      }

      const category = listing.category || item.shop_category;
      const payload = item.effect_payload || {};

      if (category === "training" || item.item_kind === "stat_boost") {
        if (!creatureId) return fail("NO_CREATURE", "Pick a party member first");
        const creature = uow.getCreature(creatureId);
        if (!creature || creature.player_id !== player.id) {
          return fail("NOT_FOUND", "Creature not found");
        }
        const statId = payload.stat_id;
        const gain = payload.gain || 1;
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

      if (category === "equipment" || item.item_kind === "equipment" || item.item_kind === "gear_tool") {
        if (payload.gear_chest && payload.rarity) {
          if (!random) return fail("RANDOM", "Random port required for gear chests");
          resources.coins -= listing.price;
          const gear = grantGearFromChest({
            uow,
            random,
            rarity: payload.rarity,
            slot: payload.slot || null,
          });
          appendEvent(uow, player.id, "PlayerGear", gear.id, "GearChestOpened", {
            item_id: itemId,
            rarity: payload.rarity,
            slot: gear.slot,
            price: listing.price,
          });
          uow.commit();
          return ok({
            kind: "gear_chest",
            itemId,
            name: item.display_name,
            price: listing.price,
            coins: resources.coins,
            gear: {
              id: gear.id,
              slot: gear.slot,
              rarity: gear.rarity,
              displayName: gearDisplayName(gear),
              mainStatCode: gear.main_stat_code,
              mainStatValue: gear.main_stat_value,
            },
          });
        }

        if (payload.gear === "change_substat" || item.item_kind === "gear_tool") {
          resources.coins -= listing.price;
          uow.addInventory(itemId, 1);
          appendEvent(uow, player.id, "Player", player.id, "ItemPurchased", {
            item_id: itemId,
            price: listing.price,
          });
          uow.commit();
          return ok({
            kind: "gear_tool",
            itemId,
            name: item.display_name,
            price: listing.price,
            quantity: uow.inventoryQty(itemId),
            coins: resources.coins,
          });
        }

        return fail("UNAVAILABLE", "Unknown equipment listing");
      }

      return fail("UNAVAILABLE", "Item cannot be purchased");
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
        log.push({
          text: `${battleSession.you.nickname} feels clear again.`,
          dmg: 0,
          side: "you",
        });
      }

      if (payload.heal_pct) {
        const heal = Math.round(you.hpMax * payload.heal_pct);
        you.hp = Math.min(you.hpMax, you.hp + heal);
        log.push({
          text: `${item.display_name} restores ${heal} HP.`,
          dmg: 0,
          side: "you",
        });
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
