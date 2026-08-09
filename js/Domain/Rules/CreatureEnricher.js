import { evaluateEvolutionState } from "./EvolutionRequirements.js";
import { raiseDomainEvent } from "../Events/DomainEvents.js";
import { MAX_CREATURE_LEVEL, xpToNextLevel } from "./LevelRules.js";
import { GEAR_SLOTS, sumGearBonuses } from "./GearRules.js";

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
  const level = creature.level || 1;
  const equipped =
    typeof uow.gearForCreature === "function" ? uow.gearForCreature(creature.id) : [];
  const gearBySlot = Object.fromEntries(GEAR_SLOTS.map((s) => [s, null]));
  for (const g of equipped) gearBySlot[g.slot] = g;
  const gearBonuses = sumGearBonuses(equipped);
  return {
    ...creature,
    species,
    pet: species,
    stats,
    moves,
    equippedGear: gearBySlot,
    gearBonuses,
    power: stats.filter((s) => s.stat_id <= 5).reduce((a, s) => a + s.value, 0),
    xpToNext: level >= MAX_CREATURE_LEVEL ? 0 : xpToNextLevel(level),
    evo,
  };
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
