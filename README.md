# Morph

A pocket pet RPG for your phone. Train stats, battle the wilds, evolve when thresholds wake.

**Data-driven DDD** + **SOLID ES modules** — catalog tables own behavior; domain services interpret rows.

## Docs

- [`DOMAIN.md`](./DOMAIN.md) — bounded contexts & ubiquitous language
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — SOLID module map
- `schema.sql` / `seed.sql` — DDL + content pack

## Play

```bash
npx serve . -l 3000
```

## Deploy to Vercel

Import the repo → Framework **Other** → no build → Deploy.

## Module map

```
js/main.js          composition root
js/catalog/         content + queries
js/domain/          energy, inventory, training, evolution, combat
js/persistence/     localStorage adapter
js/app/MorphGame.js application facade (UI port)
js/ui/              screens + navigation
```
