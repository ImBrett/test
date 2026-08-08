export class Nickname {
  /** @param {string} value */
  constructor(value) {
    const trimmed = String(value ?? "").trim();
    if (!trimmed) throw new Error("Nickname is required");
    if (trimmed.length > 32) throw new Error("Nickname max length is 32");
    this.value = trimmed;
  }

  static fromSpeciesDefault(speciesDisplayName) {
    return new Nickname(speciesDisplayName);
  }

  toString() {
    return this.value;
  }
}

export class Money {
  /** @param {number} coins */
  constructor(coins) {
    if (!Number.isInteger(coins) || coins < 0) throw new Error("Coins must be a non-negative integer");
    this.coins = coins;
  }

  canAfford(amount) {
    return this.coins >= amount;
  }

  spend(amount) {
    if (!this.canAfford(amount)) throw new Error("Insufficient coins");
    return new Money(this.coins - amount);
  }

  add(amount) {
    return new Money(this.coins + amount);
  }
}

export class StatValue {
  constructor(statId, value) {
    if (!Number.isInteger(statId) || statId < 1) throw new Error("Invalid statId");
    if (!Number.isInteger(value) || value < 0) throw new Error("Invalid stat value");
    this.statId = statId;
    this.value = value;
  }

  increase(by) {
    return new StatValue(this.statId, this.value + by);
  }
}
