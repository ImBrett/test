# Morph

Pocket pet RPG — **data-driven DDD** with an MVC command pipeline:

`presentation → event → controller → service → action → ports/adapters`

## Docs

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — pipeline, ports, swap guide
- [`DOMAIN.md`](./DOMAIN.md) — bounded contexts & ubiquitous language
- `schema.sql` / `seed.sql` — SQL DDL + content pack

## Run

```bash
npx serve . -l 3000          # web UI
npm run cli                  # same services via terminal events
```

## Deploy (Vercel)

Import repo → Framework **Other** → no build → Deploy.

## Swap persistence later

```js
import { createSqliteUnitOfWork } from "./js/infrastructure/persistence/sqlite/SqliteUnitOfWork.js";
createApplication({ uow: createSqliteUnitOfWork(db) });
```
