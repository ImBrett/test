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
  console.log("create →", res.data.player.name);

  res = await emit(AppEvents.SELECT_STARTER, { speciesId: 1 });
  const creatureId = res.data.party[0].id;
  console.log("starter →", res.data.party[0].nickname);

  res = await emit(AppEvents.TRAIN_CREATURE, { creatureId, statId: 1 });
  console.log("train →", `+${res.data.train.gain} ${res.data.train.stat.name}`);

  res = await emit(AppEvents.EXPLORE_ZONE, { zoneCode: "cinderwaste" });
  console.log("encounter →", res.data.battle.wild.nickname);

  // Force a win loop via act until over (or skip if already over)
  let session = res.data.session;
  for (let i = 0; i < 20 && !session.over; i++) {
    res = await emit(AppEvents.BATTLE_ACTION, { battleSession: session, actionCode: "burst" });
    if (!res.ok) break;
    session = res.data.session;
    if (res.data.turn?.result?.scan) {
      console.log("scan →", res.data.turn.result.scan);
    }
  }

  console.log("energy →", services.getAppState().player.resources.energy);
  console.log("scans →", services.getAppState().scans.length);
  console.log("OK — swap createApplication({ uow: createSqliteUnitOfWork(db) }) when ready.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
