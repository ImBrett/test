# Architecture — enterprise DDD / MVC command flow

## Pipeline

```
Presentation (Web | CLI | future API)
    ↓  emit named AppEvent
EventBus
    ↓
Controller  (event → Request DTO + validate)
    ↓
Application Service
    ↓
Domain Action  (CreatePlayer, TrainCreature, …)
    ↓
Ports: CatalogPort · UnitOfWorkPort · ClockPort · RandomPort
    ↓
Adapters: SeedCatalog · LocalStorageUnitOfWork · SqliteUnitOfWork(stub) · …
    ↓
Response DTO (enriched for any UI)
```

Presentations **never** import actions or persistence — only `bus.emit(AppEvents.*, payload)`.

## Swap guide

| Concern | Port | Now | Next |
|---|---|---|---|
| Content | `CatalogPort` | `SeedCatalog` | DB/CMS |
| Persistence | `UnitOfWorkPort` | `LocalStorageUnitOfWork` | `SqliteUnitOfWork` → Postgres |
| UI | EventBus | `WebApp` | `CliApp` / HTTP |

```js
// bootstrap/createApplication.js
createApplication({ uow: createSqliteUnitOfWork(db) });
```

## Layout

See `js/ARCHITECTURE.md` for the full module map, named actions, and DTO list.

```
js/bootstrap/          DI wiring
js/ports/              contracts
js/dto/                requests (validate) + responses (enrich)
js/domain/actions/     named verbs
js/application/        EventBus + services
js/infrastructure/     adapters
js/presentation/       web + cli
```

## CLI

```bash
npm run cli
```
