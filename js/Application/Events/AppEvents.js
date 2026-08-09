/** Named presentation events — shared vocabulary for web + CLI. */
export const AppEvents = Object.freeze({
  CREATE_PLAYER: "player.create",
  SELECT_STARTER: "party.selectStarter",
  SET_ACTIVE_CREATURE: "party.setActive",
  RENAME_CREATURE: "party.rename",
  EVOLVE_CREATURE: "evolution.evolve",
  DEVOLVE_CREATURE: "evolution.devolve",
  EXPLORE_ZONE: "explore.start",
  BATTLE_ACTION: "battle.act",
  CLAIM_SCAN: "scan.claim",
  BUY_STAT_BOOST: "shop.buyStatBoost",
  REFRESH_STATE: "app.refresh",
});
