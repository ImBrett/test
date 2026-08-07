/**
 * Energy / wallet resource service (Player BC).
 * Depends on a resources row — no UI, no catalog.
 */

export function regenEnergy(resources) {
  if (!resources) return;
  const now = Date.now();
  const last = new Date(resources.last_energy_at).getTime();
  const elapsed = Math.max(0, now - last);
  const period = resources.energy_regen_seconds * 1000;
  const gained = Math.floor(elapsed / period);
  if (gained > 0) {
    resources.energy = Math.min(resources.energy_max, resources.energy + gained);
    resources.last_energy_at = new Date(now - (elapsed % period)).toISOString();
  }
}

export function spendEnergy(resources, n = 1) {
  regenEnergy(resources);
  if (!resources || resources.energy < n) return false;
  resources.energy -= n;
  return true;
}

export function refillEnergy(resources, nowIso) {
  resources.energy = resources.energy_max;
  resources.last_energy_at = nowIso;
}

export function spendCoins(resources, amount) {
  if (!resources || resources.coins < amount) return false;
  resources.coins -= amount;
  return true;
}

export function addCoins(resources, amount) {
  if (!resources) return;
  resources.coins += amount;
}
