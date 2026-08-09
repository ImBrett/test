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
  const { bus, services } = createApplication({ storage: createMemoryStorage() });
  const emit = async (type, payload) => (await bus.emit(type, payload))[0];

  let res = await emit(AppEvents.CREATE_PLAYER, { name: "TerminalHero" });
  console.log("create →", res.data.player.name, "coins", res.data.player.resources.coins);

  res = await emit(AppEvents.SELECT_STARTER, { speciesId: 1 });
  const creatureId = res.data.party[0].id;
  console.log("starter →", res.data.party[0].nickname, "Lv.", res.data.party[0].level);

  const dust = res.data.shop.find((s) => s.code === "attack_dust");
  res = await emit(AppEvents.BUY_STAT_BOOST, { itemId: dust.itemId, creatureId });
  console.log("shop →", `+${res.data.purchase.gain} ${res.data.purchase.stat.name}`);

  res = await emit(AppEvents.EXPLORE_ZONE, { zoneCode: "cinderwaste" });
  console.log("encounter →", res.data.battle.wild.nickname);

  let session = res.data.session;
  for (let i = 0; i < 20 && !session.over; i++) {
    res = await emit(AppEvents.BATTLE_ACTION, { battleSession: session, actionCode: "burst" });
    if (!res.ok) break;
    session = res.data.session;
    if (res.data.turn?.result) {
      console.log("win →", res.data.turn.result);
    }
  }

  const st = services.getAppState();
  console.log("party level →", st.party[0].level, "xp", st.party[0].experience);
  console.log("scans →", st.scans.length);
  console.log("OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
