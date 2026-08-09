import { ok, fail } from "../../Domain/DTOs/Result.js";
import { appendEvent } from "../../Domain/Rules/CreatureEnricher.js";
import {
  applyReforge,
  changeSubstat,
  GEAR_SLOTS,
  reforgeCost,
  rollGearPiece,
  SLOT_DEFS,
} from "../../Domain/Rules/GearRules.js";

const SUBSTAT_CHANGER_CODE = "substat_changer";

function itemByCode(catalog, code) {
  return (catalog.items || []).find((i) => i.code === code) || null;
}

/** Equip a gear piece onto a creature (swaps previous in that slot). */
export function createEquipGearAction({ uow }) {
  return {
    name: "EquipGear",
    execute({ gearId, creatureId }) {
      const player = uow.getPlayer();
      if (!player) return fail("NO_PLAYER", "Create a player first");

      const gear = uow.getGear(gearId);
      if (!gear || gear.player_id !== player.id) {
        return fail("NOT_FOUND", "Gear not found");
      }
      if (!SLOT_DEFS[gear.slot]) return fail("SLOT", "Invalid gear slot");

      const creature = uow.getCreature(creatureId);
      if (!creature || creature.player_id !== player.id) {
        return fail("NOT_FOUND", "Creature not found");
      }

      const occupied = uow
        .listGear()
        .find(
          (g) =>
            g.equipped_creature_id === creatureId &&
            g.slot === gear.slot &&
            g.id !== gear.id
        );
      if (occupied) occupied.equipped_creature_id = null;
      gear.equipped_creature_id = creatureId;

      appendEvent(uow, player.id, "PlayerGear", gear.id, "GearEquipped", {
        creature_id: creatureId,
        slot: gear.slot,
      });
      uow.commit();
      return ok({ gearId: gear.id, creatureId, slot: gear.slot });
    },
  };
}

export function createUnequipGearAction({ uow }) {
  return {
    name: "UnequipGear",
    execute({ gearId }) {
      const player = uow.getPlayer();
      if (!player) return fail("NO_PLAYER", "Create a player first");
      const gear = uow.getGear(gearId);
      if (!gear || gear.player_id !== player.id) {
        return fail("NOT_FOUND", "Gear not found");
      }
      if (!gear.equipped_creature_id) {
        return fail("NOT_EQUIPPED", "Gear is not equipped");
      }
      const creatureId = gear.equipped_creature_id;
      gear.equipped_creature_id = null;
      appendEvent(uow, player.id, "PlayerGear", gear.id, "GearUnequipped", {
        creature_id: creatureId,
        slot: gear.slot,
      });
      uow.commit();
      return ok({ gearId: gear.id, creatureId, slot: gear.slot });
    },
  };
}

export function createReforgeGearAction({ uow, random }) {
  return {
    name: "ReforgeGear",
    execute({ gearId }) {
      const player = uow.getPlayer();
      if (!player) return fail("NO_PLAYER", "Create a player first");
      const gear = uow.getGear(gearId);
      if (!gear || gear.player_id !== player.id) {
        return fail("NOT_FOUND", "Gear not found");
      }

      const cost = reforgeCost(gear);
      const resources = uow.getResources();
      if (resources.coins < cost) {
        return fail("COINS", `Need ${cost} coins to reforge`);
      }

      const result = applyReforge(gear, random);
      if (!result.ok) return fail(result.reason, result.message);

      resources.coins -= cost;
      gear.sub_stats = result.piece.sub_stats;
      gear.reforge_count = result.piece.reforge_count;

      appendEvent(uow, player.id, "PlayerGear", gear.id, "GearReforged", {
        outcome: result.outcome,
        cost,
        changed: result.changed,
      });
      uow.commit();
      return ok({
        gearId: gear.id,
        outcome: result.outcome,
        changed: result.changed,
        cost,
        coins: resources.coins,
        gear: { ...gear, sub_stats: [...gear.sub_stats] },
      });
    },
  };
}

/** Change one substat line using a Substat Changer inventory item. */
export function createChangeGearSubstatAction({ catalog, uow, random }) {
  return {
    name: "ChangeGearSubstat",
    execute({ gearId, subIndex }) {
      const player = uow.getPlayer();
      if (!player) return fail("NO_PLAYER", "Create a player first");
      const gear = uow.getGear(gearId);
      if (!gear || gear.player_id !== player.id) {
        return fail("NOT_FOUND", "Gear not found");
      }

      const item = itemByCode(catalog, SUBSTAT_CHANGER_CODE);
      if (!item) return fail("ITEM", "Substat Changer not in catalog");

      if (!uow.consumeInventory(item.id, 1)) {
        return fail("NO_ITEM", "No Substat Changer in inventory");
      }

      const result = changeSubstat(gear, Number(subIndex), random);
      if (!result.ok) {
        uow.addInventory(item.id, 1);
        return fail(result.reason, result.message);
      }

      gear.sub_stats = result.piece.sub_stats;
      appendEvent(uow, player.id, "PlayerGear", gear.id, "GearSubstatChanged", {
        previous: result.previous,
        changed: result.changed,
        sub_index: Number(subIndex),
      });
      uow.commit();
      return ok({
        gearId: gear.id,
        previous: result.previous,
        changed: result.changed,
        gear: { ...gear, sub_stats: [...gear.sub_stats] },
        changersLeft: uow.inventoryQty(item.id),
      });
    },
  };
}

/** Open a rarity chest: roll gear into the player's stash. */
export function grantGearFromChest({ uow, random, rarity, slot = null }) {
  const player = uow.getPlayer();
  if (!player) return null;
  const rolled = rollGearPiece({
    rarity,
    random,
    slot: slot && GEAR_SLOTS.includes(slot) ? slot : null,
    playerId: player.id,
  });
  return uow.insertGear(rolled);
}

export { SUBSTAT_CHANGER_CODE };
