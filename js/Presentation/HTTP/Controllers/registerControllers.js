import { AppEvents } from "../../../Application/Events/AppEvents.js";

/**
 * Controllers subscribe to events and call application services.
 * Same controllers work for web UI and CLI (presentation-agnostic).
 */
export function registerControllers(bus, services) {
  const {
    playerService,
    partyService,
    evolutionService,
    exploreService,
    battleService,
    scanService,
    shopService,
    gearService,
  } = services;

  bus.on(AppEvents.CREATE_PLAYER, (e) => playerService.createPlayer(e.payload));
  bus.on(AppEvents.REFRESH_STATE, () => playerService.getState());

  bus.on(AppEvents.SELECT_STARTER, (e) => partyService.selectStarter(e.payload));
  bus.on(AppEvents.SET_ACTIVE_CREATURE, (e) => partyService.setActive(e.payload));
  bus.on(AppEvents.RENAME_CREATURE, (e) => partyService.rename(e.payload));

  bus.on(AppEvents.EVOLVE_CREATURE, (e) => evolutionService.evolve(e.payload));
  bus.on(AppEvents.DEVOLVE_CREATURE, (e) => evolutionService.devolve(e.payload));
  bus.on(AppEvents.EXPLORE_ZONE, (e) => exploreService.startEncounter(e.payload));
  bus.on(AppEvents.BATTLE_ACTION, (e) => battleService.act(e.payload));
  bus.on(AppEvents.USE_BATTLE_ITEM, (e) => battleService.useItem(e.payload));
  bus.on(AppEvents.CLAIM_SCAN, (e) => scanService.claim(e.payload));
  bus.on(AppEvents.BUY_SHOP_ITEM, (e) => shopService.buy(e.payload));
  bus.on(AppEvents.EQUIP_GEAR, (e) => gearService.equip(e.payload));
  bus.on(AppEvents.UNEQUIP_GEAR, (e) => gearService.unequip(e.payload));
  bus.on(AppEvents.REFORGE_GEAR, (e) => gearService.reforge(e.payload));
  bus.on(AppEvents.CHANGE_GEAR_SUBSTAT, (e) => gearService.changeSubstat(e.payload));

  return bus;
}
