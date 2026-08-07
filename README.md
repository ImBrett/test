# Morph

A pocket pet RPG for your phone. Train stats, battle the wilds, evolve when thresholds wake.

Built from a relational schema (`players`, `pets`, `stats`, `pet_stats`, `player_pets`, `player_pet_stats`, `pet_evolutions`, `pet_evolution_stat_requirements`) and persisted in `localStorage`.

## Play

Open the deployed Vercel URL on your phone, or locally:

```bash
npx serve . -l 3000
```

## Deploy to Vercel

1. Push this repo to GitHub (already done if you merge the PR).
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Framework preset: **Other** (static). Root directory: `.`
4. Deploy — no build step required.

Or with the CLI:

```bash
npx vercel --yes
```

## How to play

1. **New Journey** — name yourself, pick a starter lineage.
2. **Train** — spend energy to raise Might / Vital / Swift / Guard / Spirit.
3. **Explore** — fight wild beasts in four zones (2 energy).
4. **Catch** — after a win, sometimes bag the wild pet.
5. **Evolve** — when your instance stats hit the evolution requirements, morph into the next form.

Energy regenerates over time (1 / 45s). Rest for 15 coins to refill.

## Stack

Static HTML / CSS / JS. Zero dependencies. Mobile-first.
