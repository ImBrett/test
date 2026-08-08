/**
 * HTTP (browser) composition root.
 * presentation → event → controller → service → action
 */
import { createApplication } from "./Infrastructure/DependencyContainer/Container.js";
import { bootHttpPresentation } from "./Presentation/HTTP/HttpApp.js";

const app = createApplication();
bootHttpPresentation(app);
