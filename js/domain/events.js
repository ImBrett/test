/** Append-only domain event factory (Ledger BC). */

export function createEventEmitter(getState, nextId) {
  return function emit(playerId, aggregateType, aggregateId, eventType, payload = {}) {
    getState().domain_events.push({
      id: nextId(),
      player_id: playerId,
      aggregate_type: aggregateType,
      aggregate_id: aggregateId,
      event_type: eventType,
      event_version: 1,
      payload,
      occurred_at: new Date().toISOString(),
    });
  };
}
