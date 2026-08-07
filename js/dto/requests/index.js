import { requireString, requireInt, assertValid } from "../validation.js";

export class CreatePlayerRequest {
  /** @param {{ name: string }} raw */
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

export class TrainCreatureRequest {
  constructor(raw) {
    this.creatureId = Number(raw?.creatureId);
    this.statId = Number(raw?.statId);
  }
  static from(raw) {
    const dto = new TrainCreatureRequest(raw);
    dto.validate();
    return dto;
  }
  validate() {
    assertValid([
      ...requireInt(this.creatureId, "creatureId", { min: 1 }),
      ...requireInt(this.statId, "statId", { min: 1, max: 5 }),
    ]);
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
  }
  static from(raw) {
    const dto = new EvolveCreatureRequest(raw);
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
    if (!this.battleSession) errors.push({ field: "battleSession", message: "battleSession is required" });
    assertValid(errors);
  }
}

export class CatchCreatureRequest {
  constructor(raw) {
    this.battleSession = raw?.battleSession;
    this.itemId = Number(raw?.itemId ?? 1);
  }
  static from(raw) {
    const dto = new CatchCreatureRequest(raw);
    dto.validate();
    return dto;
  }
  validate() {
    const errors = requireInt(this.itemId, "itemId", { min: 1 });
    if (!this.battleSession) errors.push({ field: "battleSession", message: "battleSession is required" });
    assertValid(errors);
  }
}

export class RestPlayerRequest {
  static from() {
    return new RestPlayerRequest();
  }
  validate() {}
}
