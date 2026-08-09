import {
  requireString,
  requireInt,
  assertValid,
} from "../Validation.js";

export class CreatePlayerRequest {
  constructor(raw) {
    this.name = String(raw?.name ?? "").trim();
  }
  static from(raw) {
    const dto = new CreatePlayerRequest(raw);
    dto.validate();
    return dto;
  }
  validate() {
    assertValid(requireString(this.name, "name", { min: 1, max: 32 }));
  }
}

export class SelectStarterRequest {
  constructor(raw) {
    this.speciesId = Number(raw?.speciesId);
  }
  static from(raw) {
    const dto = new SelectStarterRequest(raw);
    dto.validate();
    return dto;
  }
  validate() {
    assertValid(requireInt(this.speciesId, "speciesId", { min: 1 }));
  }
}

export class SetActiveCreatureRequest {
  constructor(raw) {
    this.creatureId = Number(raw?.creatureId);
  }
  static from(raw) {
    const dto = new SetActiveCreatureRequest(raw);
    dto.validate();
    return dto;
  }
  validate() {
    assertValid(requireInt(this.creatureId, "creatureId", { min: 1 }));
  }
}

export class RenameCreatureRequest {
  constructor(raw) {
    this.creatureId = Number(raw?.creatureId);
    this.nickname = String(raw?.nickname ?? "").trim();
  }
  static from(raw) {
    const dto = new RenameCreatureRequest(raw);
    dto.validate();
    return dto;
  }
  validate() {
    assertValid([
      ...requireInt(this.creatureId, "creatureId", { min: 1 }),
      ...requireString(this.nickname, "nickname", { min: 1, max: 32 }),
    ]);
  }
}

export class EvolveCreatureRequest {
  constructor(raw) {
    this.creatureId = Number(raw?.creatureId);
    this.pathId = Number(raw?.pathId);
  }
  static from(raw) {
    const dto = new EvolveCreatureRequest(raw);
    dto.validate();
    return dto;
  }
  validate() {
    assertValid([
      ...requireInt(this.creatureId, "creatureId", { min: 1 }),
      ...requireInt(this.pathId, "pathId", { min: 1 }),
    ]);
  }
}

export class DevolveCreatureRequest {
  constructor(raw) {
    this.creatureId = Number(raw?.creatureId);
  }
  static from(raw) {
    const dto = new DevolveCreatureRequest(raw);
    dto.validate();
    return dto;
  }
  validate() {
    assertValid(requireInt(this.creatureId, "creatureId", { min: 1 }));
  }
}

export class ExploreZoneRequest {
  constructor(raw) {
    this.zoneCode = String(raw?.zoneCode ?? "").trim();
  }
  static from(raw) {
    const dto = new ExploreZoneRequest(raw);
    dto.validate();
    return dto;
  }
  validate() {
    assertValid(requireString(this.zoneCode, "zoneCode", { min: 1, max: 32 }));
  }
}

export class BattleActionRequest {
  constructor(raw) {
    this.battleSession = raw?.battleSession;
    this.actionCode = String(raw?.actionCode ?? "").trim();
  }
  static from(raw) {
    const dto = new BattleActionRequest(raw);
    dto.validate();
    return dto;
  }
  validate() {
    const errors = requireString(this.actionCode, "actionCode", { min: 1, max: 32 });
    if (!this.battleSession) {
      errors.push({ field: "battleSession", message: "battleSession is required" });
    }
    assertValid(errors);
  }
}

export class ClaimScanRequest {
  constructor(raw) {
    this.speciesId = Number(raw?.speciesId);
  }
  static from(raw) {
    const dto = new ClaimScanRequest(raw);
    dto.validate();
    return dto;
  }
  validate() {
    assertValid(requireInt(this.speciesId, "speciesId", { min: 1 }));
  }
}

export class BuyShopItemRequest {
  constructor(raw) {
    this.itemId = Number(raw?.itemId);
    this.creatureId = raw?.creatureId != null ? Number(raw.creatureId) : null;
  }
  static from(raw) {
    const dto = new BuyShopItemRequest(raw);
    dto.validate();
    return dto;
  }
  validate() {
    const errors = requireInt(this.itemId, "itemId", { min: 1 });
    if (this.creatureId != null) {
      errors.push(...requireInt(this.creatureId, "creatureId", { min: 1 }));
    }
    assertValid(errors);
  }
}

/** @deprecated */
export class BuyStatBoostRequest extends BuyShopItemRequest {}

export class UseBattleItemRequest {
  constructor(raw) {
    this.battleSession = raw?.battleSession;
    this.itemId = Number(raw?.itemId);
  }
  static from(raw) {
    const dto = new UseBattleItemRequest(raw);
    dto.validate();
    return dto;
  }
  validate() {
    const errors = requireInt(this.itemId, "itemId", { min: 1 });
    if (!this.battleSession) {
      errors.push({ field: "battleSession", message: "battleSession is required" });
    }
    assertValid(errors);
  }
}
