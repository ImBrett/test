/**
 * CLI presentation — same EventBus + controllers + services as HTTP.
 * Run: npm run cli
 */
import { createApplication } from "../../Infrastructure/DependencyContainer/Container.js";
import { AppEvents } from "../../Application/Events/AppEvents.js";

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

async function main() {
  const { bus, services, uow } = createApplication({ storage: createMemoryStorage() });
  const emit = async (type, payload) => (await bus.emit(type, payload))[0];

  let res = await emit(AppEvents.CREATE_PLAYER, { name: "TerminalHero" });
  console.log("create →", res.data.player.name, "coins", res.data.player.resources.coins);

  res = await emit(AppEvents.SELECT_STARTER, { speciesId: 1 });
  console.log("starter →", res.data.party[0].nickname, "Lv.", res.data.party[0].level);

  const salve = res.data.shop.find((s) => s.code === "field_salve");
  res = await emit(AppEvents.BUY_SHOP_ITEM, { itemId: salve.itemId });
  console.log("shop →", res.data.purchase.name, "×", res.data.purchase.quantity);

  // Gear smoke: fund wallet, buy chest, equip, reforge
  uow.getResources().coins += 5000;
  uow.commit();
  const chest = services.getAppState().shop.find((s) => s.code === "gear_chest_common");
  res = await emit(AppEvents.BUY_SHOP_ITEM, { itemId: chest.itemId });
  const gear = res.data.purchase.gear;
  console.log("chest →", gear.displayName, gear.slot, gear.mainStatCode, "+", gear.mainStatValue);

  const creatureId = services.getAppState().party[0].id;
  res = await emit(AppEvents.EQUIP_GEAR, { gearId: gear.id, creatureId });
  console.log("equip →", res.data.equip.slot);

  res = await emit(AppEvents.REFORGE_GEAR, { gearId: gear.id });
  console.log("reforge →", res.data.reforge.outcome, res.data.reforge.changed);

  res = await emit(AppEvents.EXPLORE_ZONE, { zoneCode: "ash-trail" });
  console.log(
    "encounter →",
    res.data.battle.wild.nickname,
    "Lv.",
    res.data.battle.wild.level
  );

  let session = res.data.session;
  for (let i = 0; i < 20 && !session.over; i++) {
    res = await emit(AppEvents.BATTLE_ACTION, { battleSession: session, actionCode: "burst" });
    if (!res.ok) break;
    session = res.data.session;
    if (res.data.turn?.result) {
      console.log("win →", {
        coins: res.data.turn.result.coinGain,
        xp: res.data.turn.result.xp,
        scan: res.data.turn.result.scan,
      });
    }
  }

  const st = services.getAppState();
  console.log("party level →", st.party[0].level, "xp", st.party[0].experience);
  console.log("attack →", st.party[0].stats.find((s) => s.code === "attack")?.value);
  console.log("gear bonus atk →", st.party[0].gearBonuses?.attack || 0);
  console.log("gear pieces →", st.gear.length);
  console.log("scans →", st.scans.length);
  console.log("OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
