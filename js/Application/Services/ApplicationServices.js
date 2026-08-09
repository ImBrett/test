/**
 * Application services — orchestrate actions + map to response DTOs.
 * Controllers call these; presentations never call actions directly.
 */
import { ok, fail } from "../../Domain/DTOs/Result.js";
import { ValidationError } from "../../Domain/DTOs/Validation.js";
import {
  CreatePlayerRequest,
  SelectStarterRequest,
  SetActiveCreatureRequest,
  RenameCreatureRequest,
  EvolveCreatureRequest,
  DevolveCreatureRequest,
  ExploreZoneRequest,
  BattleActionRequest,
  ClaimScanRequest,
  BuyStatBoostRequest,
} from "../../Domain/DTOs/Requests/index.js";
import {
  toCreatureDto,
  toAppStateDto,
  toInventoryDto,
  toBattleSessionDto,
  toScanDto,
  toShopListingDto,
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
      setActiveCreature,
      renameCreature,
      evolveCreature,
      devolveCreature,
      startEncounter,
      resolveBattleTurn,
      claimScannedSpecies,
      buyStatBoost,
    },
  } = deps;

  function enrichedParty() {
    return uow.listCreatures().map((c) =>
      toCreatureDto(enrichCreature(catalog, uow, evaluators, c))
    );
  }

  function scanEntries() {
    return uow
      .listScans()
      .map((row) => toScanDto(row, catalog))
      .filter(Boolean)
      .sort((a, b) => b.scanLevel - a.scanLevel || a.species.name.localeCompare(b.species.name));
  }

  function getAppState() {
    return toAppStateDto({
      player: uow.getPlayer(),
      resources: uow.getResources(),
      creatures: enrichedParty(),
      inventory: toInventoryDto(uow.listInventory(), catalog),
      scans: scanEntries(),
      shop: catalog.shopListings().map(toShopListingDto),
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
  };

  const scanService = {
    claim: guard((raw) => {
      const req = ClaimScanRequest.from(raw);
      const result = claimScannedSpecies.execute(req);
      if (!result.ok) return result;
      return ok({
        claimed: result.data,
        state: getAppState(),
      });
    }),
    list: guard(() => ok(scanEntries())),
  };

  const shopService = {
    buy: guard((raw) => {
      const req = BuyStatBoostRequest.from(raw);
      const result = buyStatBoost.execute(req);
      if (!result.ok) return result;
      return ok({
        purchase: {
          gain: result.data.gain,
          value: result.data.value,
          price: result.data.price,
          stat: {
            id: result.data.stat.id,
            name: result.data.stat.display_name,
            color: result.data.stat.color,
          },
        },
        state: getAppState(),
      });
    }),
  };

  return {
    playerService,
    partyService,
    evolutionService,
    exploreService,
    battleService,
    scanService,
    shopService,
    getAppState,
  };
}
