/** @typedef {{ value: number, max: number, regenSeconds: number, lastAt: string }} EnergyProps */

export class Energy {
  /** @param {EnergyProps} props */
  constructor({ value, max, regenSeconds, lastAt }) {
    this.value = value;
    this.max = max;
    this.regenSeconds = regenSeconds;
    this.lastAt = lastAt;
  }

  static fromResources(row) {
    return new Energy({
      value: row.energy,
      max: row.energy_max,
      regenSeconds: row.energy_regen_seconds,
      lastAt: row.last_energy_at,
    });
  }

  canSpend(amount) {
    return this.value >= amount;
  }

  /** @returns {Energy} */
  spend(amount) {
    if (!this.canSpend(amount)) throw new Error("Insufficient energy");
    return new Energy({ ...this, value: this.value - amount });
  }

  /** @returns {Energy} */
  refill(atIso) {
    return new Energy({ ...this, value: this.max, lastAt: atIso });
  }

  /** Passive regen against a clock epoch (ms). @returns {Energy} */
  regenerate(epochMs) {
    const last = new Date(this.lastAt).getTime();
    const elapsed = Math.max(0, epochMs - last);
    const period = this.regenSeconds * 1000;
    const gained = Math.floor(elapsed / period);
    if (gained <= 0) return this;
    return new Energy({
      ...this,
      value: Math.min(this.max, this.value + gained),
      lastAt: new Date(epochMs - (elapsed % period)).toISOString(),
    });
  }

  applyTo(resourcesRow) {
    resourcesRow.energy = this.value;
    resourcesRow.energy_max = this.max;
    resourcesRow.energy_regen_seconds = this.regenSeconds;
    resourcesRow.last_energy_at = this.lastAt;
    return resourcesRow;
  }
}
