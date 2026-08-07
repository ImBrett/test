/**
 * Persistence adapter — LocalStorageGameStore.
 * Implements a narrow store port used by the application service (DIP).
 */

const SAVE_KEY = "morph_rpg_v2";
const LEGACY_KEY = "morph_rpg_v1";

export function emptyState() {
  return {
    players: [],
    player_resources: [],
    player_creatures: [],
    player_creature_stats: [],
    player_creature_moves: [],
    player_party_slots: [],
    player_inventory: [],
    battles: [],
    battle_participants: [],
    battle_actions: [],
    domain_events: [],
    nextIds: {
      players: 1,
      player_creatures: 1,
      player_creature_stats: 1,
      player_creature_moves: 1,
      player_party_slots: 1,
      player_inventory: 1,
      battles: 1,
      battle_participants: 1,
      battle_actions: 1,
      domain_events: 1,
    },
  };
}

export function createGameStore(storage = globalThis.localStorage) {
  function load() {
    try {
      const raw = storage.getItem(SAVE_KEY);
      if (!raw) {
        storage.removeItem(LEGACY_KEY);
        return emptyState();
      }
      return { ...emptyState(), ...JSON.parse(raw) };
    } catch {
      return emptyState();
    }
  }

  function save(state) {
    storage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  function clear() {
    storage.removeItem(SAVE_KEY);
    storage.removeItem(LEGACY_KEY);
  }

  return { load, save, clear, emptyState };
}
