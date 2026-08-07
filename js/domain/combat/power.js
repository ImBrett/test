/** Combat power derivation from creature stats. */

export function combatPower(enriched) {
  const map = Object.fromEntries(enriched.stats.map((s) => [s.stat_id, s.value]));
  const might = map[1] || 0;
  const vital = map[2] || 0;
  const swift = map[3] || 0;
  const guard = map[4] || 0;
  const spirit = map[5] || 0;
  return {
    hp: 48 + vital * 5 + guard * 2,
    atk: 8 + might * 2 + Math.floor(spirit * 0.6),
    spd: 5 + swift,
    def: 3 + Math.floor(guard * 1.3),
    crit: Math.min(38, 6 + Math.floor(swift * 0.8) + Math.floor(spirit * 0.4)),
    element_id: enriched.species?.element_id ?? enriched.pet?.element_id,
    map,
  };
}
