/**
 * Application services — orchestrate actions + map to response DTOs.
 * Controllers call these; presentations never call actions directly.
 */
import { ok, fail } from "../../Domain/DTOs/Result.js";
import { ValidationError } from "../../Domain/DTOs/Validation.js";
import {
  CreatePlayerRequest,
  SelectStarterRequest,
  TrainCreatureRequest,
  SetActiveCreatureRequest,
  RenameCreatureRequest,
  EvolveCreatureRequest,
  DevolveCreatureRequest,
  ExploreZoneRequest,
  BattleActionRequest,
  CatchCreatureRequest,
  RestPlayerRequest,
} from "../../Domain/DTOs/Requests/index.js";
import {
  toCreatureDto,
  toAppStateDto,
  toInventoryDto,
  toTrainResultDto,
  toBattleSessionDto,
} from "../../Domain/DTOs/Responses/index.js";
import { enrichCreature } from "../../Domain/Rules/CreatureEnricher.js";

function guard(fn) {
  return (...args) => {
    try {
      return fn(...args);
    } catch (err) {
      if (err instanceof ValidationError) {
        return fail("VALIDATION", err.message, err.errors);
      }
      throw err;
    }
  };
}

export function createApplicationServices(deps) {
  const {
    catalog,
    uow,
    evaluators,
    actions: {
      createPlayer,
      obtainCreature,
      trainCreature,
      setActiveCreature,
      renameCreature,
      evolveCreature,
      devolveCreature,
      startEncounter,
      resolveBattleTurn,
      catchWildCreature,
      restPlayer,
      regenerateEnergy,
    },
  } = deps;

  function enrichedParty() {
    return uow.listCreatures().map((c) =>
      toCreatureDto(enrichCreature(catalog, uow, evaluators, c))
    );
  }

  function getAppState() {
    regenerateEnergy.execute();
    return toAppStateDto({
      player: uow.getPlayer(),
      resources: uow.getResources(),
      creatures: enrichedParty(),
      inventory: toInventoryDto(uow.listInventory(), catalog),
      catalog,
      events: uow.recentDomainEvents().map((e) => ({
        type: e.event_type,
        aggregate: e.aggregate_type,
        at: e.occurred_at,
        payload: e.payload,
      })),
    });
  }

  const playerService = {
    createPlayer: guard((raw) => {
      const req = CreatePlayerRequest.from(raw);
      const result = createPlayer.execute(req);
      if (!result.ok) return result;
      return ok(getAppState());
    }),
    rest: guard(() => {
      RestPlayerRequest.from();
      const result = restPlayer.execute();
      if (!result.ok) return result;
      return ok(getAppState());
    }),
    regenerateEnergy: guard(() => {
      regenerateEnergy.execute();
      return ok(getAppState());
    }),
    getState: guard(() => ok(getAppState())),
    hasSave: () => !!uow.getPlayer(),
  };

  const partyService = {
    selectStarter: guard((raw) => {
      const req = SelectStarterRequest.from(raw);
      if (!catalog.starterSpeciesIds().includes(req.speciesId)) {
        return fail("INVALID_STARTER", "Not a starter species");
      }
      const result = obtainCreature.execute({ speciesId: req.speciesId });
      if (!result.ok) return result;
      return ok(getAppState());
    }),
    setActive: guard((raw) => {
      const req = SetActiveCreatureRequest.from(raw);
      const result = setActiveCreature.execute(req);
      if (!result.ok) return result;
      return ok(getAppState());
    }),
    rename: guard((raw) => {
      const req = RenameCreatureRequest.from(raw);
      const result = renameCreature.execute(req);
      if (!result.ok) return result;
      return ok(getAppState());
    }),
    getParty: guard(() => ok(enrichedParty())),
  };

  const trainingService = {
    train: guard((raw) => {
      const req = TrainCreatureRequest.from(raw);
      const result = trainCreature.execute(req);
      if (!result.ok) return result;
      return ok({
        train: toTrainResultDto(result.data),
        state: getAppState(),
      });
    }),
  };

  const evolutionService = {
    evolve: guard((raw) => {
      const req = EvolveCreatureRequest.from(raw);
      const result = evolveCreature.execute(req);
      if (!result.ok) return result;
      return ok({
        evolution: result.data,
        state: getAppState(),
      });
    }),
    devolve: guard((raw) => {
      const req = DevolveCreatureRequest.from(raw);
      const result = devolveCreature.execute(req);
      if (!result.ok) return result;
      return ok({
        devolution: result.data,
        state: getAppState(),
      });
    }),
  };

  const exploreService = {
    startEncounter: guard((raw) => {
      const req = ExploreZoneRequest.from(raw);
      const result = startEncounter.execute(req);
      if (!result.ok) return result;
      return ok({
        battle: toBattleSessionDto(result.data),
        session: result.data,
        state: getAppState(),
      });
    }),
  };

  const battleService = {
    act: guard((raw) => {
      const req = BattleActionRequest.from(raw);
      const result = resolveBattleTurn.execute(req);
      if (!result.ok) return result;
      const session = {
        ...req.battleSession,
        youHp: result.data.youHp,
        wildHp: result.data.wildHp,
        turnNumber: result.data.turnNumber,
        over: !!result.data.result,
      };
      return ok({
        turn: result.data,
        battle: toBattleSessionDto(session),
        session,
        state: getAppState(),
      });
    }),
    catch: guard((raw) => {
      const req = CatchCreatureRequest.from(raw);
      const result = catchWildCreature.execute(req);
      if (!result.ok) return result;
      return ok({
        caught: result.data,
        state: getAppState(),
      });
    }),
  };

  return {
    playerService,
    partyService,
    trainingService,
    evolutionService,
    exploreService,
    battleService,
    getAppState,
  };
}
