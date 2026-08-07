# Morph

A pocket pet RPG for your phone. Train stats, battle the wilds, evolve when thresholds wake.

Built as a **data-driven DDD** game: catalog tables own behavior; the client interprets rows.

## Domain

See [`DOMAIN.md`](./DOMAIN.md) for bounded contexts, aggregates, and rule interpreters.

| File | Role |
|---|---|
| `schema.sql` | DDL — Catalog / Player / Combat / Ledger |
| `seed.sql` | Content pack (species, moves, zones, evolutions…) |
| `js/data.js` | In-browser catalog mirror |
| `js/game.js` | Player + combat write model + `localStorage` |
| `js/ui.js` | Mobile UI |

## Play

```bash
npx serve . -l 3000
```

## Deploy to Vercel

Import the GitHub repo → Framework **Other** → no build command → Deploy.

Or: `npx vercel --yes`

## How to play

1. **New Journey** — name yourself, pick a starter lineage
2. **Train** — drills from `training_drills` spend energy to raise stats
3. **Explore** — weighted `zone_encounters` spawn wild beasts
4. **Catch** — spend Morph Orbs (inventory) after a win
5. **Evolve** — when all `evolution_requirements` are met (stats, items, …)

Energy regenerates from `player_resources.energy_regen_seconds`. Rest costs 15 coins.
