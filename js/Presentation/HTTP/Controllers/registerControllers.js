import { AppEvents } from "../../../Application/Events/AppEvents.js";

/**
 * Controllers subscribe to events and call application services.
 * Same controllers work for web UI and CLI (presentation-agnostic).
 */
export function registerControllers(bus, services) {
  const {
    playerService,
    partyService,
    trainingService,
    evolutionService,
    exploreService,
    battleService,
    scanService,
  } = services;

  bus.on(AppEvents.CREATE_PLAYER, (e) => playerService.createPlayer(e.payload));
  bus.on(AppEvents.REST_PLAYER, () => playerService.rest());
  bus.on(AppEvents.REGEN_ENERGY, () => playerService.regenerateEnergy());
  bus.on(AppEvents.REFRESH_STATE, () => playerService.getState());

  bus.on(AppEvents.SELECT_STARTER, (e) => partyService.selectStarter(e.payload));
  bus.on(AppEvents.SET_ACTIVE_CREATURE, (e) => partyService.setActive(e.payload));
  bus.on(AppEvents.RENAME_CREATURE, (e) => partyService.rename(e.payload));

  bus.on(AppEvents.TRAIN_CREATURE, (e) => trainingService.train(e.payload));
  bus.on(AppEvents.EVOLVE_CREATURE, (e) => evolutionService.evolve(e.payload));
  bus.on(AppEvents.DEVOLVE_CREATURE, (e) => evolutionService.devolve(e.payload));
  bus.on(AppEvents.EXPLORE_ZONE, (e) => exploreService.startEncounter(e.payload));
  bus.on(AppEvents.BATTLE_ACTION, (e) => battleService.act(e.payload));
  bus.on(AppEvents.CLAIM_SCAN, (e) => scanService.claim(e.payload));

  return bus;
}
