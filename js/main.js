/**
 * Composition root — wires concrete adapters to the application service.
 * This is the only place that knows about LocalStorage + seed catalog.
 */
import { createCatalog } from "./catalog/catalog.js";
import { createGameStore } from "./persistence/store.js";
import { createGame } from "./app/MorphGame.js";
import { bootUI } from "./ui/app.js";

const catalog = createCatalog();
const store = createGameStore(localStorage);
const game = createGame({ catalog, store });

bootUI(game, catalog);
