# Architecture

```
Presentation → Event → Controller → Service → Action → Ports → Adapters → Response DTO
```

## Folder layout

```
js/
  Domain/
    Events/           domain event types + raise helper
    Models/           Player, Creature, Battle factories
    DTOs/             Requests (validate) · Responses (enrich)
    ValueObjects/     Energy, Nickname, Money, StatValue
    Ports/            Catalog · UnitOfWork · Clock · Random
    Rules/            combat, evolution requirements, enrichers
  Application/
    Events/           AppEvents (integration / UI commands)
    Actions/          CreatePlayer, TrainCreature, …
    Services/         orchestrate actions → DTOs
  Infrastructure/
    EventBus/
    DependencyContainer/   composition root
    Persistence/
      Memory/              localStorage UoW
      SQLite/              stub for later
    Catalog/  Clock/  Random/
  Presentation/
    HTTP/             browser UI + controllers
    CLI/              terminal adapter (same bus)
  main.js             HTTP entry
```

## Swap persistence / UI

```js
import { createApplication } from "./Infrastructure/DependencyContainer/Container.js";
import { createSqliteUnitOfWork } from "./Infrastructure/Persistence/SQLite/SqliteUnitOfWork.js";

createApplication({ uow: createSqliteUnitOfWork(db) });
```

CLI: `npm run cli` — same container, no DOM.
