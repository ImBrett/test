/**
 * Web presentation — emits AppEvents; never calls services/actions directly.
 * Screens live in Views/. This module owns dispatch, navigation, and boot.
 */
import { AppEvents } from "../../Application/Events/AppEvents.js";
import { $, $$, toast, showScreen, paintMeters } from "./Views/dom.js";
import { createPartyView } from "./Views/partyView.js";
import { createExploreView } from "./Views/exploreView.js";
import { createBattleView } from "./Views/battleView.js";
import { createScanView } from "./Views/scanView.js";
import { createShopView } from "./Views/shopView.js";
import { createEvolveView } from "./Views/evolveView.js";
import { createBagView } from "./Views/bagView.js";
import { createOnboardingView } from "./Views/onboardingView.js";

export function bootHttpPresentation({ bus, services, catalog }) {
  let state = services.getAppState();
  let battleSession = null;
  let returnScreen = "screen-party";

  const ctx = {
    get state() {
      return state;
    },
    dispatch,
    paint() {
      paintMeters(state);
    },
    showScreen,
    showExplore() {
      explore.render();
      showScreen("screen-explore");
    },
    showScan() {
      scan.render();
      showScreen("screen-scan");
    },
    openEvolve(id) {
      evolve.open(id);
    },
    async enterZone(zoneCode) {
      const res = await dispatch(AppEvents.EXPLORE_ZONE, { zoneCode });
      if (!res?.ok) return;
      battle.enter(res.data.session);
    },
    getSession: () => battleSession,
    setSession(session) {
      battleSession = session;
    },
  };

  const party = createPartyView(ctx);
  const explore = createExploreView(ctx);
  const battle = createBattleView(ctx);
  const scan = createScanView(ctx);
  const shop = createShopView(ctx);
  const evolve = createEvolveView(ctx);
  const bag = createBagView(ctx);
  const onboarding = createOnboardingView(ctx);

  async function dispatch(eventName, payload = {}) {
    const results = await bus.emit(eventName, payload);
    const result = results[0];
    if (!result) return null;
    if (!result.ok) {
      toast(result.error?.message || result.error?.code || "Action failed");
      return result;
    }
    if (result.data?.state) state = result.data.state;
    else if (result.data?.player || result.data?.party) state = result.data;
    paintMeters(state);
    return result;
  }

  function enterHub() {
    party.render();
    showScreen("screen-party");
  }

  function openBag() {
    const active = document.querySelector(".screen.active");
    if (active && active.id !== "screen-bag") returnScreen = active.id;
    bag.render();
    showScreen("screen-bag");
  }

  function closeBag() {
    const id = returnScreen || "screen-party";
    if (id === "screen-party") party.render();
    if (id === "screen-explore") explore.render();
    if (id === "screen-scan") scan.render();
    if (id === "screen-shop") shop.render();
    if (id === "screen-evolve") evolve.render();
    showScreen(id);
  }

  $("#btn-continue")?.addEventListener("click", () => {
    if (services.playerService.hasSave()) {
      state = services.getAppState();
      enterHub();
    }
  });
  $("#btn-new-game").addEventListener("click", () => {
    showScreen("screen-create");
    $("#player-name").value = "";
    $("#player-name").focus();
  });
  $("#btn-to-starter").addEventListener("click", async () => {
    const name = $("#player-name").value.trim();
    const res = await dispatch(AppEvents.CREATE_PLAYER, { name });
    if (!res?.ok) return;
    onboarding.resetStarter();
    onboarding.renderStarters();
    showScreen("screen-starter");
  });
  $("#btn-begin").addEventListener("click", async () => {
    const speciesId = onboarding.selectedId();
    if (!speciesId) return;
    const res = await dispatch(AppEvents.SELECT_STARTER, { speciesId });
    if (!res?.ok) return;
    toast("Your journey begins");
    enterHub();
  });
  $("#btn-evo-back")?.addEventListener("click", () => {
    party.render();
    showScreen("screen-party");
  });
  $("#btn-bag-back")?.addEventListener("click", closeBag);
  $$(".btn-bag").forEach((btn) => btn.addEventListener("click", openBag));
  $$(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      if (tab === "bag") {
        openBag();
        return;
      }
      if (tab === "party") party.render();
      if (tab === "explore") explore.render();
      if (tab === "scan") scan.render();
      if (tab === "shop") shop.render();
      showScreen(`screen-${tab}`);
    });
  });
  $("#detail-sheet").addEventListener("click", (e) => {
    if (e.target.id === "detail-sheet") e.target.classList.remove("open");
  });

  const glyphs = catalog.species.filter((p) => p.stage === 5);
  let gi = 0;
  setInterval(() => {
    gi = (gi + 1) % glyphs.length;
    const glyph = $("#title-glyph");
    const orb = $("#title-orb");
    if (!glyph || !orb || !glyphs.length) return;
    glyph.textContent = glyphs[gi].glyph;
    orb.style.setProperty("--orb-hue", glyphs[gi].hue);
  }, 3200);

  state = services.getAppState();
  $("#btn-continue").classList.toggle("hidden", !services.playerService.hasSave());
  showScreen("screen-title");
  paintMeters(state);
}
