# Architecture — enterprise DDD / MVC command flow

## Request pipeline

```
Presentation (Web | CLI | future API)
    ↓  emit named AppEvent
EventBus
    ↓
Controller  (maps event → Request DTO)
    ↓  validate DTO
Application Service
    ↓  orchestrate
Domain Action  (CreatePlayer, TrainCreature, …)
    ↓  ports
CatalogPort  +  UnitOfWorkPort  +  ClockPort  +  RandomPort
    ↓
Infrastructure adapters (SeedCatalog, LocalStorage UoW, SQLite stub, …)
    ↓
Response DTO (enriched view model)
```

Presentations **never** import actions or persistence. They only `bus.emit(AppEvents.*, payload)`.

## Swap targets

| Concern | Port | Current adapter | Next adapter |
|---|---|---|---|
| Content | `CatalogPort` | `SeedCatalog` | DB/CMS catalog |
| Write model | `UnitOfWorkPort` | `LocalStorageUnitOfWork` | `SqliteUnitOfWork` → Postgres |
| Time | `ClockPort` | `SystemClock` | frozen clock in tests |
| RNG | `RandomPort` | `MathRandom` | seeded RNG |
| UI | EventBus consumers | `WebApp` | `CliApp` / HTTP controllers |

Wire alternatives in `bootstrap/createApplication.js`:

```js
createApplication({
  uow: createSqliteUnitOfWork(db), // when ready
});
```

## Module map

```
js/
  main.js                          web composition root
  bootstrap/createApplication.js   DI / wiring
  ports/                           contracts (JSDoc)
  dto/
    requests/                      inbound validation
    responses/                     outbound enrichment
    Result.js                      ok/fail
  domain/
    actions/                       named use-case verbs
    combat/  evolution/            pure domain rules
  application/
    EventBus.js
    services/ApplicationServices.js
  infrastructure/
    catalog/  persistence/  clock/  random/
  presentation/
    shared/AppEvents.js
    web/                           DOM views + emit events
    cli/                           terminal demo (same bus)
```

## Named actions

`CreatePlayer` · `ObtainCreature` · `TrainCreature` · `SetActiveCreature` ·
`RenameCreature` · `EvolveCreature` · `StartEncounter` · `ResolveBattleTurn` ·
`CatchWildCreature` · `RestPlayer` · `RegenerateEnergy`

## DTOs

- **Requests** — `SomethingRequest.from(raw)` validates before the service runs
- **Responses** — `toCreatureDto` / `toAppStateDto` / `toBattleSessionDto` enrich for any UI

## CLI demo

```bash
node js/presentation/cli/CliApp.js
```
