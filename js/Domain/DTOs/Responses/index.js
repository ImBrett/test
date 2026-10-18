/** Response / view DTOs — enrich domain rows for any presentation. */

import {
  GEAR_SLOTS,
  gearDisplayName,
  rarityLabel,
  reforgeCost,
  slotGlyph,
  slotLabel,
  sumGearBonuses,
} from "../../Rules/GearRules.js";
import { isZoneUnlocked } from "../../Rules/EncounterRules.js";

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

function statMeta(catalog, code) {
  const stat = (catalog?.stats || []).find((s) => s.code === code);
  return {
    code,
    name: stat?.display_name || code,
    color: stat?.color || "#9ab",
  };
}

export function toGearPieceDto(piece, catalog) {
  if (!piece) return null;
  return {
    id: piece.id,
    slot: piece.slot,
    slotLabel: slotLabel(piece.slot),
    glyph: slotGlyph(piece.slot),
    rarity: piece.rarity,
    rarityLabel: rarityLabel(piece.rarity),
    displayName: gearDisplayName(piece),
    mainStat: {
      ...statMeta(catalog, piece.main_stat_code),
      value: piece.main_stat_value,
    },
    fixedSubStat: piece.fixed_sub_code
      ? {
          ...statMeta(catalog, piece.fixed_sub_code),
          value: piece.fixed_sub_value,
        }
      : null,
    subStats: (piece.sub_stats || []).map((s) => ({
      ...statMeta(catalog, s.code),
      value: s.value,
      level: s.level,
    })),
    reforgeCount: piece.reforge_count || 0,
    reforgeCost: reforgeCost(piece),
    equippedCreatureId: piece.equipped_creature_id ?? null,
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

export function toCreatureDto(enriched, catalog = null) {
  const evo = enriched.evo;
  const lineageSet = new Set((evo?.lineage || [enriched.species.id]).map(Number));
  const gearBonuses = enriched.gearBonuses || sumGearBonuses([]);
  const equipped = {};
  for (const slot of GEAR_SLOTS) {
    const piece = enriched.equippedGear?.[slot] || null;
    equipped[slot] = piece ? toGearPieceDto(piece, catalog) : null;
  }
  return {
    id: enriched.id,
    nickname: enriched.nickname,
    level: enriched.level,
    experience: enriched.experience,
    xpToNext: enriched.xpToNext ?? 0,
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
    gearBonuses,
    equippedGear: equipped,
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
          coins: resources.coins,
        }
      : null,
  };
}

export function toShopListingDto(listing) {
  const item = listing.item;
  const payload = item.effect_payload || {};
  return {
    itemId: listing.item_id,
    price: listing.price,
    category: listing.category || item.shop_category,
    available: listing.available !== false,
    code: item.code,
    name: item.display_name,
    description: item.description,
    kind: item.item_kind,
    gain: payload.gain ?? 0,
    statId: payload.stat_id ?? null,
    gearRarity: payload.rarity ?? null,
    isGearChest: !!payload.gear_chest,
    isSubstatChanger: payload.gear === "change_substat",
  };
}

export function toZoneDto(zone, catalog = null, clearedIds = []) {
  const encounters = catalog?.encountersForZone?.(zone.id) || [];
  const species = [];
  for (const row of encounters) {
    const sp = catalog.speciesById(row.species_id);
    if (sp && !species.includes(sp.display_name)) species.push(sp.display_name);
  }
  const cleared = clearedIds.includes(zone.id);
  return {
    id: zone.id,
    code: zone.code,
    name: zone.display_name || zone.name,
    vibe: zone.vibe,
    region: zone.region_code || "wilds",
    regionName: zone.region_name || "Wilds",
    label: zone.area_label || "",
    minLevel: zone.min_wild_level ?? 1,
    maxLevel: zone.max_wild_level ?? zone.min_wild_level ?? 1,
    isBoss: !!zone.is_boss,
    species,
    unlocked: isZoneUnlocked(zone, clearedIds),
    cleared,
    sortOrder: zone.sort_order ?? zone.id,
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
        description: item.description || "",
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

export function toAppStateDto({
  player,
  resources,
  creatures,
  inventory,
  gear = [],
  scans = [],
  shop = [],
  catalog,
  events,
  clearedZoneIds = [],
}) {
  const active = creatures.find((c) => c.isActive) || creatures[0] || null;
  return {
    player: toPlayerDto(player, resources),
    party: creatures,
    activeCreatureId: active?.id ?? null,
    inventory,
    gear,
    gearSlots: GEAR_SLOTS.map((slot) => ({
      id: slot,
      label: slotLabel(slot),
      glyph: slotGlyph(slot),
    })),
    scans,
    shop,
    shopCategories: (catalog.shopCategories?.() || []).map((c) => ({
      id: c.id,
      label: c.label,
    })),
    zones: catalog.zones
      .slice()
      .sort((a, b) => (a.sort_order ?? a.id) - (b.sort_order ?? b.id))
      .map((zone) => toZoneDto(zone, catalog, clearedZoneIds)),
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
      level: session.you.level,
      hp: session.youHp,
      hpMax: session.youMax,
      power: session.you.power,
    },
    wild: {
      nickname: session.wild.nickname,
      species: session.wild.species,
      level: session.wild.level,
      hp: session.wildHp,
      hpMax: session.wildMax,
      power: session.wild.power,
    },
    turnNumber: session.turnNumber || 0,
    over: !!session.over,
  };
}

