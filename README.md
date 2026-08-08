# Morph

Pocket pet RPG — data-driven DDD with MVC command flow:

`presentation → event → controller → service → action → ports/adapters`

## Layout

```
Domain/           Events · Models · DTOs · ValueObjects · Ports · Rules
Application/      Events · Actions · Services
Infrastructure/   EventBus · DependencyContainer · Persistence/{Memory,SQLite}
Presentation/     HTTP · CLI
```

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) and [`DOMAIN.md`](./DOMAIN.md).

## Run

```bash
npx serve . -l 3000    # HTTP UI
npm run cli            # same pipeline in a terminal
```

## Deploy

Vercel → Framework **Other** → no build → Deploy.
