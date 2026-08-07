/**
 * Composition root helpers — build the application graph once.
 * Web and CLI both call createApplication().
 */
import { createEventBus } from "../application/EventBus.js";
import { createApplicationServices } from "../application/services/ApplicationServices.js";
import { createRequirementEvaluators } from "../domain/evolution/RequirementEvaluator.js";
import { createMoveResolvers } from "../domain/combat/CombatRules.js";
import { createCreatePlayerAction } from "../domain/actions/CreatePlayerAction.js";
import { createObtainCreatureAction } from "../domain/actions/ObtainCreatureAction.js";
import { createTrainCreatureAction } from "../domain/actions/TrainCreatureAction.js";
import {
  createSetActiveCreatureAction,
  createRenameCreatureAction,
} from "../domain/actions/PartyActions.js";
import { createEvolveCreatureAction } from "../domain/actions/EvolveCreatureAction.js";
import {
  createStartEncounterAction,
  createResolveBattleTurnAction,
  createCatchWildCreatureAction,
} from "../domain/actions/BattleActions.js";
import {
  createRestPlayerAction,
  createRegenerateEnergyAction,
} from "../domain/actions/RestPlayerAction.js";
import { createSeedCatalog } from "../infrastructure/catalog/SeedCatalog.js";
import { createLocalStorageUnitOfWork } from "../infrastructure/persistence/localStorage/LocalStorageUnitOfWork.js";
import { createSystemClock } from "../infrastructure/clock/SystemClock.js";
import { createMathRandom } from "../infrastructure/random/MathRandom.js";
import { registerControllers } from "../presentation/web/controllers/registerControllers.js";

/**
 * @param {object} [options]
 * @param {Storage} [options.storage]
 * @param {object} [options.uow] — inject SqliteUnitOfWork later
 * @param {object} [options.catalog]
 * @param {object} [options.clock]
 * @param {object} [options.random]
 */
export function createApplication(options = {}) {
  const clock = options.clock || createSystemClock();
  const random = options.random || createMathRandom();
  const catalog = options.catalog || createSeedCatalog(clock);
  const uow = options.uow || createLocalStorageUnitOfWork(options.storage || globalThis.localStorage);
  uow.load();

  const evaluators = createRequirementEvaluators({ catalog, uow });
  const moveResolvers = createMoveResolvers({ catalog, random });

  const obtainCreature = createObtainCreatureAction({ catalog, uow, clock });
  const actions = {
    createPlayer: createCreatePlayerAction({ catalog, uow, clock }),
    obtainCreature,
    trainCreature: createTrainCreatureAction({ catalog, uow, clock, random }),
    setActiveCreature: createSetActiveCreatureAction({ uow }),
    renameCreature: createRenameCreatureAction({ catalog, uow }),
    evolveCreature: createEvolveCreatureAction({ catalog, uow, evaluators }),
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
    catchWildCreature: createCatchWildCreatureAction({
      catalog,
      uow,
      random,
      obtainCreature,
    }),
    restPlayer: createRestPlayerAction({ uow, clock }),
    regenerateEnergy: createRegenerateEnergyAction({ uow, clock }),
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
