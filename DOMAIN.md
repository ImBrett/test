# Morph domain model (data-driven DDD)

## Why the original schema fell short

The first draft captured ownership and evolution *shapes*, but left most domain
behavior in application code:

- Elements, type matchups, zones, moves, items, and encounter tables were hardcoded
- Player energy/coins lived outside the model
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
| **Catalog** | Species, Move, Zone, Item, EvolutionPath | Base stats, learnsets, matchups, encounters, drills, evolution gates |
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
| Stat | Trainable attribute (Might, Vital…) | `stats` |
| Drill | Catalog training action targeting a stat | `training_drills` |
| Move | Catalog combat action with `effect_kind` + payload | `moves` |
| Evolution path | Directed species → species transform | `evolution_paths` |
| Requirement | Data-driven gate on a path | `evolution_requirements` |
| Zone | Explore location with weighted spawns | `zones` / `zone_encounters` |
| Battle | Combat aggregate for one encounter | `battles` |

## Invariants (enforced in domain services + DB checks)

1. A creature belongs to exactly one player; nickname defaults to species `display_name` at capture.
2. Creature stats are seeded from `species_base_stats` on obtain; training mutates instance rows only.
3. Evolution is allowed iff **all** `evolution_requirements` for a path are satisfied.
4. On evolve: `species_id` changes; trained surplus over old base is preserved atop new base.
5. At most one `is_active` creature per player (party leader); party slots ≤ 6.
6. Energy cannot go negative; regen is driven by `player_resources.energy_regen_seconds`.
7. Battle actions append; battle `status` transitions are monotonic (`active` → terminal).

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

### Training
```
drill = training_drills[id]
spend energy_cost; gain base_gain (+ critical_bonus on roll)
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

- `schema.sql` — DDL
- `seed.sql` — starter catalog matching the Morph content pack
- `js/data.js` — in-browser catalog mirror of seed
- `js/game.js` — player/combat write model + localStorage persistence
