/**
 * Web composition root.
 * presentation → event → controller → service → action
 */
import { createApplication } from "./bootstrap/createApplication.js";
import { bootWebPresentation } from "./presentation/web/WebApp.js";

const app = createApplication();
bootWebPresentation(app);
