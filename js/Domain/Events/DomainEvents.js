/** Domain event type vocabulary (Ledger BC). */
export const DomainEventTypes = Object.freeze({
  PLAYER_CREATED: "PlayerCreated",
  CREATURE_OBTAINED: "CreatureObtained",
  CREATURE_EVOLVED: "CreatureEvolved",
  CREATURE_DEVOLVED: "CreatureDevolved",
  CREATURE_CAUGHT: "CreatureCaught",
  CREATURE_LEVELED: "CreatureLeveled",
  STAT_BOOSTED: "StatBoosted",
  SCAN_PROGRESS: "ScanProgress",
  SPECIES_CLAIMED: "SpeciesClaimed",
  BATTLE_STARTED: "BattleStarted",
  BATTLE_WON: "BattleWon",
  BATTLE_LOST: "BattleLost",
});

/**
 * Append an immutable domain event via the UnitOfWork port.
 * @param {import('../Ports/UnitOfWorkPort.js').UnitOfWorkPort} uow
 */
export function raiseDomainEvent(uow, { playerId, aggregateType, aggregateId, eventType, payload = {}, occurredAt }) {
  uow.appendDomainEvent({
    player_id: playerId,
    aggregate_type: aggregateType,
    aggregate_id: aggregateId,
    event_type: eventType,
    event_version: 1,
    payload,
    occurred_at: occurredAt || new Date().toISOString(),
  });
}
