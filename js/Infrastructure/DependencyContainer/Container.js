/**
 * DependencyContainer — composition root.
 * Wires ports → adapters → actions → services → event bus → controllers.
 * Web (HTTP) and CLI both call createApplication().
 */
import { createEventBus } from "../EventBus/EventBus.js";
import { createApplicationServices } from "../../Application/Services/ApplicationServices.js";
import { createRequirementEvaluators } from "../../Domain/Rules/EvolutionRequirements.js";
import { createMoveResolvers } from "../../Domain/Rules/CombatRules.js";
import { createCreatePlayerAction } from "../../Application/Actions/CreatePlayerAction.js";
import { createObtainCreatureAction } from "../../Application/Actions/ObtainCreatureAction.js";
import {
  createSetActiveCreatureAction,
  createRenameCreatureAction,
} from "../../Application/Actions/PartyActions.js";
import {
  createEvolveCreatureAction,
  createDevolveCreatureAction,
} from "../../Application/Actions/EvolveCreatureAction.js";
import {
  createStartEncounterAction,
  createResolveBattleTurnAction,
} from "../../Application/Actions/BattleActions.js";
import { createClaimScannedSpeciesAction } from "../../Application/Actions/ScanActions.js";
import { createBuyStatBoostAction } from "../../Application/Actions/ShopActions.js";
import { createSeedCatalog } from "../Catalog/SeedCatalog.js";
import { createMemoryUnitOfWork } from "../Persistence/Memory/MemoryUnitOfWork.js";
import { createSystemClock } from "../Clock/SystemClock.js";
import { createMathRandom } from "../Random/MathRandom.js";
import { registerControllers } from "../../Presentation/HTTP/Controllers/registerControllers.js";

/**
 * @param {object} [options]
 */
export function createApplication(options = {}) {
  const clock = options.clock || createSystemClock();
  const random = options.random || createMathRandom();
  const catalog = options.catalog || createSeedCatalog(clock);
  const uow =
    options.uow ||
    createMemoryUnitOfWork(options.storage || globalThis.localStorage);
  uow.load();

  const evaluators = createRequirementEvaluators({ catalog, uow });
  const moveResolvers = createMoveResolvers({ catalog, random });

  const obtainCreature = createObtainCreatureAction({ catalog, uow, clock });
  const actions = {
    createPlayer: createCreatePlayerAction({ catalog, uow, clock }),
    obtainCreature,
    setActiveCreature: createSetActiveCreatureAction({ uow }),
    renameCreature: createRenameCreatureAction({ catalog, uow }),
    evolveCreature: createEvolveCreatureAction({ catalog, uow, evaluators }),
    devolveCreature: createDevolveCreatureAction({ catalog, uow }),
    startEncounter: createStartEncounterAction({
      catalog,
      uow,
      clock,
      random,
      evaluators,
    }),
    resolveBattleTurn: createResolveBattleTurnAction({
      catalog,
      uow,
      clock,
      random,
      moveResolvers,
    }),
    claimScannedSpecies: createClaimScannedSpeciesAction({
      catalog,
      uow,
      obtainCreature,
    }),
    buyStatBoost: createBuyStatBoostAction({ catalog, uow }),
  };

  const services = createApplicationServices({
    catalog,
    uow,
    evaluators,
    actions,
  });

  const bus = registerControllers(createEventBus(), services);

  return { bus, services, catalog, uow, actions, clock, random };
}
