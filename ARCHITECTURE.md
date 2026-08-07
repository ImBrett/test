# Architecture (SOLID)

Composition root: `js/main.js` — the only place that wires concrete adapters.

```
main.js
  ├── catalog/          Catalog BC (read model)
  │     seed.js         Pure content tables
  │     catalog.js      Query API
  ├── domain/           Domain services (no UI, no storage)
  │     energy.js
  │     inventory.js
  │     creature.js
  │     training.js
  │     events.js
  │     evolution/      Requirement strategies + evolve service
  │     combat/         Power, move strategies, encounters, battles
  ├── persistence/      Adapter
  │     store.js        LocalStorageGameStore
  ├── app/
  │     MorphGame.js    Application facade (UI port)
  └── ui/               Presentation
        app.js          Screen router
        screens/*       One concern per screen
```

## SOLID mapping

| Principle | How |
|---|---|
| **S**ingle responsibility | Seed ≠ queries ≠ evolve ≠ battle ≠ storage ≠ screens |
| **O**pen/closed | New evolution kinds / move effects register as strategies; catalog rows extend content |
| **L**iskov | Requirement evaluators share one shape (`{label, have, needed, met}`) |
| **I**nterface segregation | UI talks to the Game facade only — not store or combat internals |
| **D**ependency inversion | `createGame({ catalog, store })` receives ports; UI receives the game API |

Domain rule interpreters stay data-driven: they never `switch` on species names.
