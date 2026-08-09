/** Response / view DTOs — enrich domain rows for any presentation. */

export function toStatDto(row) {
  return {
    statId: row.stat_id,
    code: row.stat.code,
    name: row.stat.display_name,
    description: row.stat.description,
    color: row.stat.color,
    value: row.value,
  };
}

function toSpeciesBrief(sp) {
  if (!sp) return null;
  return {
    id: sp.id,
    name: sp.display_name,
    glyph: sp.glyph,
    hue: sp.hue,
    stage: sp.stage,
    stageName: sp.stage_name,
  };
}

function toTreeDto(node, currentSpeciesId, lineageSet) {
  if (!node) return null;
  return {
    ...toSpeciesBrief({
      id: node.speciesId,
      display_name: node.name,
      glyph: node.glyph,
      hue: node.hue,
      stage: node.stage,
      stage_name: node.stageName,
    }),
    isCurrent: node.speciesId === currentSpeciesId,
    onLineage: lineageSet.has(node.speciesId),
    branches: (node.branches || []).map((b) => ({
      pathId: b.pathId,
      branchIndex: b.branchIndex,
      label: b.label,
      node: toTreeDto(b.node, currentSpeciesId, lineageSet),
    })),
  };
}

export function toCreatureDto(enriched) {
  const evo = enriched.evo;
  const lineageSet = new Set((evo?.lineage || [enriched.species.id]).map(Number));
  return {
    id: enriched.id,
    nickname: enriched.nickname,
    level: enriched.level,
    experience: enriched.experience,
    battlesWon: enriched.battles_won,
    isActive: !!enriched.is_active,
    power: enriched.power,
    obtainedAt: enriched.obtained_at,
    lineage: (evo?.lineage || []).map((id) => id),
    species: {
      id: enriched.species.id,
      code: enriched.species.code,
      name: enriched.species.display_name,
      blurb: enriched.species.blurb,
      glyph: enriched.species.glyph,
      hue: enriched.species.hue,
      stage: enriched.species.stage,
      stageName: enriched.species.stage_name,
      element: enriched.species.element?.display_name ?? null,
      elementId: enriched.species.element_id,
    },
    stats: enriched.stats.map(toStatDto),
    moves: (enriched.moves || []).map((m) => ({
      slot: m.slot,
      moveId: m.move_id,
      code: m.move.code,
      name: m.move.display_name,
      effectKind: m.move.effect_kind,
    })),
    evolution: evo
      ? {
          canEvolve: evo.canEvolve,
          canDevolve: evo.canDevolve,
          ready: evo.ready,
          ancestor: toSpeciesBrief(evo.ancestor),
          branches: (evo.branches || []).map((b) => ({
            pathId: b.pathId,
            branchIndex: b.branchIndex,
            label: b.label,
            ready: b.ready,
            next: toSpeciesBrief(b.next),
            requirements: (b.reqs || []).map((r) => ({
              kind: r.kind,
              label: r.label,
              have: r.have,
              needed: r.needed,
              met: r.met,
            })),
          })),
          lineageSpecies: (evo.lineageSpecies || []).map(toSpeciesBrief),
          tree: toTreeDto(evo.tree, enriched.species.id, lineageSet),
        }
      : {
          canEvolve: false,
          canDevolve: false,
          ready: false,
          ancestor: null,
          branches: [],
          lineageSpecies: [],
          tree: null,
        },
  };
}

export function toPlayerDto(player, resources) {
  if (!player) return null;
  return {
    id: player.id,
    name: player.name,
    level: player.level,
    experience: player.experience,
    resources: resources
      ? {
          energy: resources.energy,
          energyMax: resources.energy_max,
          coins: resources.coins,
          energyRegenSeconds: resources.energy_regen_seconds,
        }
      : null,
  };
}

export function toZoneDto(zone) {
  return {
    id: zone.id,
    code: zone.code,
    name: zone.display_name,
    vibe: zone.vibe,
    energyCost: zone.energy_cost,
  };
}

export function toInventoryDto(rows, catalog) {
  return rows
    .filter((r) => r.quantity > 0)
    .map((r) => {
      const item = catalog.itemById(r.item_id);
      return {
        itemId: r.item_id,
        code: item.code,
        name: item.display_name,
        kind: item.item_kind,
        quantity: r.quantity,
      };
    });
}

export function toScanDto(row, catalog) {
  const species = catalog.speciesById(row.species_id);
  if (!species) return null;
  return {
    speciesId: row.species_id,
    scanLevel: row.scan_level,
    claimed: !!row.claimed,
    canClaim: row.scan_level >= 100 && !row.claimed,
    species: {
      id: species.id,
      name: species.display_name,
      glyph: species.glyph,
      hue: species.hue,
      stage: species.stage,
      stageName: species.stage_name,
      element: species.element?.display_name ?? null,
      blurb: species.blurb,
    },
  };
}

export function toAppStateDto({ player, resources, creatures, inventory, scans = [], catalog, events }) {
  const active = creatures.find((c) => c.isActive) || creatures[0] || null;
  return {
    player: toPlayerDto(player, resources),
    party: creatures,
    activeCreatureId: active?.id ?? null,
    inventory,
    scans,
    zones: catalog.zones.map(toZoneDto),
    starters: catalog.starterSpeciesIds().map((id) => {
      const s = catalog.speciesById(id);
      return {
        id: s.id,
        name: s.display_name,
        glyph: s.glyph,
        hue: s.hue,
        element: s.element.display_name,
        blurb: s.blurb,
      };
    }),
    stats: catalog.stats.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.display_name,
      description: s.description,
      color: s.color,
      trainable: !!s.trainable,
    })),
    recentEvents: events,
  };
}

export function toBattleSessionDto(session) {
  return {
    battleId: session.battleId,
    zone: toZoneDto(session.zone),
    you: {
      creatureId: session.you.id,
      nickname: session.you.nickname,
      species: session.you.species,
      hp: session.youHp,
      hpMax: session.youMax,
      power: session.you.power,
    },
    wild: {
      nickname: session.wild.nickname,
      species: session.wild.species,
      hp: session.wildHp,
      hpMax: session.wildMax,
      power: session.wild.power,
    },
    turnNumber: session.turnNumber || 0,
    over: !!session.over,
  };
}

export function toTrainResultDto(result) {
  return {
    gain: result.gain,
    value: result.value,
    critical: !!result.critical,
    stat: {
      id: result.stat.id,
      name: result.stat.display_name,
      color: result.stat.color,
    },
  };
}
