import { evaluateEvolutionState } from "./EvolutionRequirements.js";
import { Energy } from "../ValueObjects/Energy.js";
import { raiseDomainEvent } from "../Events/DomainEvents.js";

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
  const evo = evaluateEvolutionState(evaluators, catalog, creature);
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
  Energy.fromResources(resources).regenerate(clock.epochMs()).applyTo(resources);
}

export function appendEvent(uow, playerId, aggregateType, aggregateId, eventType, payload = {}) {
  raiseDomainEvent(uow, {
    playerId,
    aggregateType,
    aggregateId,
    eventType,
    payload,
  });
}
