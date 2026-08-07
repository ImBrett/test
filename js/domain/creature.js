/**
 * Creature factory + enrichment (Player BC entity helpers).
 */

export function enrichCreature(catalog, creature, statsRows, moveRows, evolutionInfo) {
  const species = catalog.speciesById(creature.species_id);
  const stats = statsRows
    .filter((s) => s.player_creature_id === creature.id)
    .map((s) => ({ ...s, stat: catalog.statById(s.stat_id) }));
  const moves = moveRows
    .filter((m) => m.player_creature_id === creature.id)
    .sort((a, b) => a.slot - b.slot)
    .map((m) => ({ ...m, move: catalog.moveById(m.move_id) }));
  const power = stats.reduce((a, s) => a + s.value, 0);
  return {
    ...creature,
    species,
    pet: species,
    stats,
    moves,
    power,
    evo: evolutionInfo,
  };
}

export function createCreatureRecord({
  id,
  playerId,
  speciesId,
  nickname,
  speciesDisplayName,
  isActive,
  obtainedAt,
}) {
  return {
    id,
    player_id: playerId,
    species_id: speciesId,
    nickname: nickname || speciesDisplayName,
    level: 1,
    experience: 0,
    battles_won: 0,
    obtained_at: obtainedAt,
    is_active: isActive ? 1 : 0,
  };
}

export function seedCreatureStats(catalog, nextId, creatureId, speciesId) {
  return catalog.baseStatsForSpecies(speciesId).map((bs) => ({
    id: nextId(),
    player_creature_id: creatureId,
    stat_id: bs.stat_id,
    value: bs.value,
  }));
}

export function seedCreatureMoves(catalog, nextId, creatureId, speciesId) {
  return catalog.movesForSpecies(speciesId).map((sm) => ({
    id: nextId(),
    player_creature_id: creatureId,
    move_id: sm.move_id,
    slot: sm.slot,
  }));
}
