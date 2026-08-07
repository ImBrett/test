/**
 * UI composition root — depends only on the Game port + Catalog queries.
 */
import { $, $$ } from "./dom.js";
import { toast } from "./toast.js";
import { refreshMeters, showScreen } from "./navigation.js";
import { renderParty, openDetailSheet } from "./screens/party.js";
import { renderTrain } from "./screens/train.js";
import { renderExplore, setBattleNavigator } from "./screens/battle.js";
import { renderEvolve } from "./screens/evolve.js";
import { bindOnboarding, startTitleOrb } from "./screens/onboarding.js";

export function bootUI(game, catalog) {
  function showTab(tab) {
    refreshMeters(game);
    if (tab === "party") {
      renderParty(game, {
        openDetail: (id) =>
          openDetailSheet(game, id, {
            onClose: () => renderParty(game, { openDetail: (i) => openDetailSheet(game, i, {}) }),
          }),
      });
    }
    if (tab === "train") renderTrain(game);
    if (tab === "explore") renderExplore(game);
    if (tab === "evolve") renderEvolve(game);
    showScreen(`screen-${tab}`);
  }

  function enterHub() {
    showTab("party");
    $("#nav").classList.remove("hidden");
  }

  setBattleNavigator(showTab);
  bindOnboarding(game, catalog, { enterHub });
  startTitleOrb(catalog);

  $("#btn-rest").addEventListener("click", () => {
    const res = game.rest();
    if (!res.ok) {
      toast("Need 15 coins to rest");
      return;
    }
    toast("Energy restored");
    refreshMeters(game);
  });

  $$(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => showTab(btn.dataset.tab));
  });

  $("#detail-sheet").addEventListener("click", (e) => {
    if (e.target.id === "detail-sheet") e.target.classList.remove("open");
  });

  game.load();
  const has = game.hasSave();
  $("#btn-continue").classList.toggle("hidden", !has);
  showScreen("screen-title");
  $("#nav").classList.add("hidden");
  refreshMeters(game);

  setInterval(() => {
    game.regenEnergy();
    refreshMeters(game);
  }, 15000);
}
