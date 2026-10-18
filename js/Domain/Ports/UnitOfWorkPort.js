/**
 * @file UnitOfWorkPort — write-model persistence boundary (Player/Combat/Ledger).
 * Implementations: LocalStorageUnitOfWork, SqliteUnitOfWork (stub), future Postgres…
 *
 * @typedef {object} UnitOfWorkPort
 * @property {() => void} load
 * @property {() => void} commit
 * @property {() => void} clear
 * @property {() => object|null} getPlayer
 * @property {() => object|null} getResources
 * @property {() => object[]} listCreatures
 * @property {(id: number) => object|undefined} getCreature
 * @property {() => object[]} listCreatureStats
 * @property {(creatureId: number) => object[]} statsForCreature
 * @property {() => object[]} listCreatureMoves
 * @property {(creatureId: number) => object[]} movesForCreature
 * @property {() => object[]} listInventory
 * @property {() => object[]} listGear
 * @property {(id: number) => object|undefined} getGear
 * @property {(creatureId: number) => object[]} gearForCreature
 * @property {(row: object) => object} insertGear
 * @property {(itemId: number) => number} inventoryQty
 * @property {(itemId: number, qty?: number) => void} addInventory
 * @property {(itemId: number, qty?: number) => boolean} consumeInventory
 * @property {() => object[]} listScans
 * @property {(speciesId: number) => object|null} getScan
 * @property {(speciesId: number, gain: number) => object} upsertScan
 * @property {(speciesId: number) => object|undefined} markScanClaimed
 * @property {() => object[]} listPartySlots
 * @property {(player: object) => object} insertPlayer
 * @property {(resources: object) => void} insertResources
 * @property {(creature: object) => object} insertCreature
 * @property {(rows: object[]) => void} insertCreatureStats
 * @property {(rows: object[]) => void} insertCreatureMoves
 * @property {(rows: object[]) => void} replaceCreatureMoves
 * @property {(slot: object) => void} insertPartySlot
 * @property {(item: object) => void} insertInventoryRow
 * @property {(battle: object) => object} insertBattle
 * @property {(participants: object[]) => void} insertBattleParticipants
 * @property {(action: object) => void} insertBattleAction
 * @property {(event: object) => void} appendDomainEvent
 * @property {(key: string) => number} nextId
 * @property {() => number[]} clearedZoneIds
 * @property {(zoneId: number) => void} markZoneCleared
 * @property {() => object[]} recentDomainEvents
 */

export {};
