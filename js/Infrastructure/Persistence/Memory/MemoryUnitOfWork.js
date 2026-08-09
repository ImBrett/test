const SAVE_KEY = "morph_rpg_v9";
const LEGACY_KEYS = [
  "morph_rpg_v8",
  "morph_rpg_v7",
  "morph_rpg_v6",
  "morph_rpg_v5",
  "morph_rpg_v4",
  "morph_rpg_v3",
  "morph_rpg_v2",
  "morph_rpg_v1",
];

export function emptyState() {
  return {
    players: [],
    player_resources: [],
    player_creatures: [],
    player_creature_stats: [],
    player_creature_moves: [],
    player_party_slots: [],
    player_inventory: [],
    player_gear: [],
    player_species_scans: [],
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
      player_gear: 1,
      player_species_scans: 1,
      battles: 1,
      battle_participants: 1,
      battle_actions: 1,
      domain_events: 1,
    },
  };
}

/**
 * Memory / localStorage-backed Unit of Work.
 * @implements {import('../../../Domain/Ports/UnitOfWorkPort.js').UnitOfWorkPort}
 */
export function createMemoryUnitOfWork(storage = globalThis.localStorage) {
  let state = emptyState();

  function load() {
    try {
      const raw = storage.getItem(SAVE_KEY);
      if (!raw) {
        for (const k of LEGACY_KEYS) storage.removeItem(k);
        state = emptyState();
        return;
      }
      const parsed = JSON.parse(raw);
      state = { ...emptyState(), ...parsed };
      if (!Array.isArray(state.player_gear)) state.player_gear = [];
      if (!state.nextIds.player_gear) state.nextIds.player_gear = 1;
      for (const g of state.player_gear) {
        if (!Array.isArray(g.sub_stats)) g.sub_stats = [];
      }
    } catch {
      state = emptyState();
    }
  }

  function commit() {
    storage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  function clear() {
    for (const k of [SAVE_KEY, ...LEGACY_KEYS]) storage.removeItem(k);
    state = emptyState();
  }

  const player = () => state.players[0] || null;

  return {
    load,
    commit,
    clear,
    getPlayer: () => player(),
    getResources: () => {
      const p = player();
      return p ? state.player_resources.find((r) => r.player_id === p.id) || null : null;
    },
    listCreatures: () => {
      const p = player();
      return p ? state.player_creatures.filter((c) => c.player_id === p.id) : [];
    },
    getCreature: (id) => state.player_creatures.find((c) => c.id === id),
    listCreatureStats: () => state.player_creature_stats,
    statsForCreature: (creatureId) =>
      state.player_creature_stats.filter((s) => s.player_creature_id === creatureId),
    listCreatureMoves: () => state.player_creature_moves,
    movesForCreature: (creatureId) =>
      state.player_creature_moves.filter((m) => m.player_creature_id === creatureId),
    listInventory: () => {
      const p = player();
      return p ? state.player_inventory.filter((i) => i.player_id === p.id) : [];
    },
    listGear: () => {
      const p = player();
      return p ? state.player_gear.filter((g) => g.player_id === p.id) : [];
    },
    getGear: (id) => state.player_gear.find((g) => g.id === id),
    gearForCreature: (creatureId) =>
      state.player_gear.filter((g) => g.equipped_creature_id === creatureId),
    insertGear: (row) => {
      const id = state.nextIds.player_gear++;
      const gear = {
        ...row,
        id,
        sub_stats: Array.isArray(row.sub_stats) ? row.sub_stats.map((s) => ({ ...s })) : [],
        reforge_count: row.reforge_count || 0,
        equipped_creature_id: row.equipped_creature_id ?? null,
      };
      state.player_gear.push(gear);
      return gear;
    },
    listScans: () => {
      const p = player();
      return p ? state.player_species_scans.filter((s) => s.player_id === p.id) : [];
    },
    getScan: (speciesId) => {
      const p = player();
      if (!p) return null;
      return (
        state.player_species_scans.find(
          (s) => s.player_id === p.id && s.species_id === speciesId
        ) || null
      );
    },
    upsertScan: (speciesId, gain) => {
      const p = player();
      let row = state.player_species_scans.find(
        (s) => s.player_id === p.id && s.species_id === speciesId
      );
      if (!row) {
        row = {
          id: state.nextIds.player_species_scans++,
          player_id: p.id,
          species_id: speciesId,
          scan_level: 0,
          claimed: 0,
        };
        state.player_species_scans.push(row);
      }
      row.scan_level = Math.min(100, row.scan_level + Math.max(0, gain));
      return row;
    },
    markScanClaimed: (speciesId) => {
      const row = (() => {
        const p = player();
        return state.player_species_scans.find(
          (s) => s.player_id === p.id && s.species_id === speciesId
        );
      })();
      if (row) row.claimed = 1;
      return row;
    },
    inventoryQty: (itemId) => {
      const p = player();
      if (!p) return 0;
      const row = state.player_inventory.find(
        (i) => i.player_id === p.id && i.item_id === itemId
      );
      return row ? row.quantity : 0;
    },
    addInventory: (itemId, qty = 1) => {
      const p = player();
      let row = state.player_inventory.find(
        (i) => i.player_id === p.id && i.item_id === itemId
      );
      if (!row) {
        row = {
          id: state.nextIds.player_inventory++,
          player_id: p.id,
          item_id: itemId,
          quantity: 0,
        };
        state.player_inventory.push(row);
      }
      row.quantity += qty;
    },
    consumeInventory: (itemId, qty = 1) => {
      const p = player();
      const row = state.player_inventory.find(
        (i) => i.player_id === p.id && i.item_id === itemId
      );
      if (!row || row.quantity < qty) return false;
      row.quantity -= qty;
      return true;
    },
    listPartySlots: () => {
      const p = player();
      return p ? state.player_party_slots.filter((s) => s.player_id === p.id) : [];
    },
    insertPlayer: (row) => {
      const id = state.nextIds.players++;
      const playerRow = { ...row, id };
      state.players = [playerRow];
      return playerRow;
    },
    insertResources: (row) => {
      state.player_resources = [row];
    },
    insertCreature: (row) => {
      const id = state.nextIds.player_creatures++;
      const creature = {
        ...row,
        id,
        lineage_json: row.lineage_json || JSON.stringify([row.species_id]),
      };
      state.player_creatures.push(creature);
      return creature;
    },
    insertCreatureStats: (rows) => {
      for (const r of rows) {
        state.player_creature_stats.push({
          ...r,
          id: state.nextIds.player_creature_stats++,
        });
      }
    },
    insertCreatureMoves: (rows) => {
      for (const r of rows) {
        state.player_creature_moves.push({
          ...r,
          id: state.nextIds.player_creature_moves++,
        });
      }
    },
    replaceCreatureMoves: (creatureId, rows) => {
      state.player_creature_moves = state.player_creature_moves.filter(
        (m) => m.player_creature_id !== creatureId
      );
      for (const r of rows) {
        state.player_creature_moves.push({
          ...r,
          id: state.nextIds.player_creature_moves++,
        });
      }
    },
    insertPartySlot: (row) => {
      state.player_party_slots.push({
        ...row,
        id: state.nextIds.player_party_slots++,
      });
    },
    insertInventoryRow: (row) => {
      state.player_inventory.push({
        ...row,
        id: state.nextIds.player_inventory++,
      });
    },
    insertBattle: (row) => {
      const id = state.nextIds.battles++;
      const battle = { ...row, id };
      state.battles.push(battle);
      return battle;
    },
    insertBattleParticipants: (rows) => {
      const out = [];
      for (const r of rows) {
        const part = { ...r, id: state.nextIds.battle_participants++ };
        state.battle_participants.push(part);
        out.push(part);
      }
      return out;
    },
    insertBattleAction: (row) => {
      state.battle_actions.push({
        ...row,
        id: state.nextIds.battle_actions++,
      });
    },
    appendDomainEvent: (event) => {
      state.domain_events.push({
        ...event,
        id: state.nextIds.domain_events++,
      });
    },
    nextId: (key) => state.nextIds[key]++,
    recentDomainEvents: () => state.domain_events.slice(-30),
    /** @internal test helper */
    _state: () => state,
  };
}
