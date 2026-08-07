/** Shared creature enrichment used by services/actions. */
import { evaluateAll } from "./evolution/RequirementEvaluator.js";

export function enrichCreature(catalog, uow, evaluators, creature) {
  const species = catalog.speciesById(creature.species_id);
  const stats = uow.statsForCreature(creature.id).map((s) => ({
    ...s,
    stat: catalog.statById(s.stat_id),
  }));
  const moves = uow
    .movesForCreature(creature.id)
    .sort((a, b) => a.slot - b.slot)
    .map((m) => ({ ...m, move: catalog.moveById(m.move_id) }));
  const evo = evaluateAll(evaluators, catalog, creature);
  return {
    ...creature,
    species,
    pet: species,
    stats,
    moves,
    power: stats.reduce((a, s) => a + s.value, 0),
    evo,
  };
}

export function regenEnergy(resources, clock) {
  if (!resources) return;
  const now = clock.epochMs();
  const last = new Date(resources.last_energy_at).getTime();
  const elapsed = Math.max(0, now - last);
  const period = resources.energy_regen_seconds * 1000;
  const gained = Math.floor(elapsed / period);
  if (gained > 0) {
    resources.energy = Math.min(resources.energy_max, resources.energy + gained);
    resources.last_energy_at = new Date(now - (elapsed % period)).toISOString();
  }
}

export function appendEvent(uow, playerId, aggregateType, aggregateId, eventType, payload = {}) {
  uow.appendDomainEvent({
    player_id: playerId,
    aggregate_type: aggregateType,
    aggregate_id: aggregateId,
    event_type: eventType,
    event_version: 1,
    payload,
    occurred_at: new Date().toISOString(),
  });
}
