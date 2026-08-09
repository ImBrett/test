# Morph domain model (data-driven DDD)

## Why the original schema fell short

The first draft captured ownership and evolution *shapes*, but left most domain
behavior in application code:

- Elements, type matchups, zones, moves, items, and encounter tables were hardcoded
- Player coins lived outside the model
- Evolution gates only knew about `pet_stats` rows (awkward join), not polymorphic rules
- Combat was ephemeral with no aggregate boundary
- No event stream for projections or audit

This schema treats **catalog tables as the behavior source**. Interpreters in the
app read rows; designers change content without code changes.

## Bounded contexts

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Catalog   │────▶│   Player    │────▶│   Combat    │
│  (content)  │     │ (write model│     │ (encounters)│
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                   │
                           ▼                   ▼
                    ┌─────────────────────────────┐
                    │  Ledger (domain_events)     │
                    └─────────────────────────────┘
```

| Context | Aggregate roots | Owns |
|---|---|---|
| **Catalog** | Species, Move, Zone, Item, EvolutionPath | Base stats, learnsets, matchups, encounters, shop, evolution gates |
| **Player** | Player | Creatures, stats, moves, party, inventory, resources |
| **Combat** | Battle | Participants, turn actions |
| **Ledger** | (append-only) | Domain events for audit / read models |

Cross-context references use IDs only (no shared mutable state).

## Ubiquitous language

| Term | Meaning | Table |
|---|---|---|
| Species | Catalog identity of a morphable beast | `species` |
| Creature | A player's owned instance of a species | `player_creatures` |
| Element | Affinity that drives matchups | `elements` |
| Stat | Attribute (Attack, Health, Speed, Defense, Mana + crit/status) | `stats` |
| Scan | Defeat progress 0–100% toward obtaining a species | `player_species_scans` |
| Move | Catalog combat action with `effect_kind` + payload | `moves` |
| Evolution path | Directed species → species transform | `evolution_paths` |
| Requirement | Data-driven gate on a path | `evolution_requirements` |
| Zone | Explore location with weighted spawns | `zones` / `zone_encounters` |
| Battle | Combat aggregate for one encounter | `battles` |

## Evolution (Digimon-style)

1. Stages: **Hatchling → Fledgling → Mature → Ascendant → Apex** (`species.stage` 1–5).
2. From any form, at most **3 branches** (`evolution_paths.branch_index`).
3. Evolve only if **all** requirements on the chosen path are met.
4. Creature stores `lineage_json` (Hatchling → … → current) for chain UI and devolve.
5. On evolve: carry trained surplus over new bases; push species onto lineage.
6. On devolve: pop lineage; **reset stats to ancestor base** (no free re-train exploit).

## Scan obtain (Digimon-style)

1. Defeat a wild species → fill `player_species_scans.scan_level` (0–100).
2. Fixed gains by stage: Hatchling **30%**, Fledgling **20%**, Mature **10%**, Ascendant **5%**, Apex **1%**.
3. At 100%, claim from the Scan UI once (`claimed = 1`). No catch items.
4. Elements: **Ignis, Veil, Aether, Terra, Umbral, Radiance** with self-weakness where noted.

## Leveling & shop

1. Creatures (and wilds) have **level 1–100**. Wilds scale with your active creature.
2. Wild victories grant XP; each level-up raises Attack/Speed/Defense/Mana by **+1** and Health by **+2**.
3. Shop aisles: **Training** (expensive permanent boosts), **Items** (battle consumables), **Equipment** (stub).
4. Evolution paths mix **level + stat** (and Apex Seal on final forms).


## Data-driven rule interpreters

Application services should *never* switch on species names. They interpret rows:

### Evolution
```
for requirement in path.requirements:
  match requirement.kind:
    stat        → creature.stat(stat_id) >= threshold
    item        → inventory.qty(item_id) >= threshold
    level       → creature.level >= threshold
    battles_won → creature.battles_won >= threshold
```

### Combat damage (sketch)
```
move = catalog.move(move_id)
matchup = element_matchups[move.element][defender.element] || 1.0
payload = json(move.effect_payload)
raw = f(attacker.stats, move.power, payload, matchup)
```

### Encounters
```
pick weighted species from zone_encounters where stage in [min,max]
scale base stats by uniform(variance_min, variance_max)
```

### Shop training
```
listing = shopListings[item_id]
spend coins; apply effect_payload.gain to creature.stat(stat_id)
```

## Mapping from the original schema

| Old | New |
|---|---|
| `pets` | `species` |
| `pet_stats` | `species_base_stats` |
| `player_pets` | `player_creatures` |
| `player_pet_stats` | `player_creature_stats` |
| `pet_evolutions` | `evolution_paths` |
| `pet_evolution_stat_requirements` | `evolution_requirements` (`requirement_kind='stat'`) |
| *(missing)* | `elements`, `element_matchups`, `moves`, `zones`, `items`, `battles`, `domain_events`, … |

## Files

- `schema.sql` / `seed.sql` — DDL + content pack
- `ARCHITECTURE.md` — layered folder map + swap guide
- `js/Domain/` · `js/Application/` · `js/Infrastructure/` · `js/Presentation/`
