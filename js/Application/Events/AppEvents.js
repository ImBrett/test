/** Named presentation events — shared vocabulary for web + CLI. */
export const AppEvents = Object.freeze({
  CREATE_PLAYER: "player.create",
  SELECT_STARTER: "party.selectStarter",
  SET_ACTIVE_CREATURE: "party.setActive",
  RENAME_CREATURE: "party.rename",
  TRAIN_CREATURE: "training.train",
  EVOLVE_CREATURE: "evolution.evolve",
  DEVOLVE_CREATURE: "evolution.devolve",
  EXPLORE_ZONE: "explore.start",
  BATTLE_ACTION: "battle.act",
  CATCH_CREATURE: "battle.catch",
  REST_PLAYER: "player.rest",
  REFRESH_STATE: "app.refresh",
  REGEN_ENERGY: "player.regenEnergy",
});
