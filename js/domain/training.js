/** Training domain service — interprets training_drills rows. */

export function createTrainingService({ catalog, spendEnergy, addCoins }) {
  function train(statsRows, resources, playerCreatureId, statId) {
    const drill = catalog.drillForStat(statId);
    if (!drill) return { ok: false, reason: "missing_drill" };
    if (!spendEnergy(resources, drill.energy_cost)) return { ok: false, reason: "energy" };

    const row = statsRows.find(
      (s) => s.player_creature_id === playerCreatureId && s.stat_id === statId
    );
    if (!row) return { ok: false, reason: "missing" };

    const critical = Math.random() < drill.critical_chance;
    const gain = drill.base_gain + (critical ? drill.critical_bonus : 0);
    row.value += gain;
    addCoins(resources, drill.coin_reward);

    return {
      ok: true,
      gain,
      value: row.value,
      critical,
      drill,
      stat: catalog.statById(statId),
    };
  }

  return { train };
}
