/**
 * Web presentation — emits AppEvents; never calls services/actions directly.
 * Flow: view interaction → bus.emit(event) → controller → service → action → DTO
 */
import { AppEvents } from "../shared/AppEvents.js";
import { $, $$, escapeHtml, avatarHtml, toast, showScreen, paintMeters } from "./views/dom.js";

export function bootWebPresentation({ bus, services, catalog }) {
  let state = services.getAppState();
  let selectedStarter = null;
  let trainTargetId = null;
  let battleSession = null;

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
    renderParty();
    showScreen("screen-party");
    $("#nav").classList.remove("hidden");
  }

  function renderParty() {
    paintMeters(state);
    const grid = $("#party-grid");
    if (!state.party.length) {
      grid.innerHTML = `<div class="empty">No beasts yet. Explore the wilds!</div>`;
      return;
    }
    grid.innerHTML = state.party
      .map(
        (p) => `
      <button class="pet-card ${p.id === state.activeCreatureId ? "active" : ""}" data-id="${p.id}">
        ${avatarHtml(p.species)}
        <div class="pet-meta">
          <strong>${escapeHtml(p.nickname)}</strong>
          <small>${escapeHtml(p.species.name)} · Stage ${p.species.stage}</small>
        </div>
        <div class="power-chip">${p.power}</div>
      </button>`
      )
      .join("");
    grid.querySelectorAll(".pet-card").forEach((btn) => {
      btn.onclick = () => openDetail(Number(btn.dataset.id));
    });
  }

  function openDetail(id) {
    const p = state.party.find((c) => c.id === id);
    if (!p) return;
    const sheet = $("#detail-sheet");
    const body = $("#detail-body");
    const maxStat = Math.max(...p.stats.map((s) => s.value), 30);
    body.innerHTML = `
      <div class="sheet-handle"></div>
      <div class="detail-hero">
        ${avatarHtml(p.species)}
        <h2>${escapeHtml(p.nickname)}</h2>
        <p>${escapeHtml(p.species.name)} · ${escapeHtml(p.species.blurb)}</p>
      </div>
      <div class="stat-list">
        ${p.stats
          .map(
            (s) => `
          <div class="stat-row">
            <div class="name" style="color:${s.color}">${s.name}</div>
            <div class="bar"><span style="width:${Math.min(100, (s.value / maxStat) * 100)}%;background:${s.color}"></span></div>
            <div class="val">${s.value}</div>
          </div>`
          )
          .join("")}
      </div>
      <div class="action-row">
        <button class="btn btn-secondary" id="btn-set-active">Set Active</button>
        <button class="btn btn-secondary" id="btn-rename">Rename</button>
        <button class="btn btn-primary wide" id="btn-close-detail">Close</button>
      </div>`;
    requestAnimationFrame(() => {
      body.querySelectorAll(".bar > span").forEach((el) => {
        const w = el.style.width;
        el.style.width = "0";
        requestAnimationFrame(() => {
          el.style.width = w;
        });
      });
    });
    $("#btn-set-active").onclick = async () => {
      await dispatch(AppEvents.SET_ACTIVE_CREATURE, { creatureId: id });
      toast(`${p.nickname} leads the party`);
      sheet.classList.remove("open");
      renderParty();
    };
    $("#btn-rename").onclick = async () => {
      const name = prompt("Nickname", p.nickname);
      if (name != null) {
        await dispatch(AppEvents.RENAME_CREATURE, { creatureId: id, nickname: name });
        openDetail(id);
        renderParty();
      }
    };
    $("#btn-close-detail").onclick = () => sheet.classList.remove("open");
    sheet.classList.add("open");
  }

  function renderTrain() {
    paintMeters(state);
    const pick = $("#train-pick");
    if (!state.party.length) {
      pick.innerHTML = "";
      $("#train-stats").innerHTML = `<div class="empty">Catch a beast first.</div>`;
      return;
    }
    if (!trainTargetId || !state.party.find((p) => p.id === trainTargetId)) {
      trainTargetId = state.activeCreatureId || state.party[0].id;
    }
    pick.innerHTML = state.party
      .map(
        (p) => `
      <button class="train-chip ${p.id === trainTargetId ? "selected" : ""}" data-id="${p.id}">
        ${avatarHtml(p.species)}
        <span>${escapeHtml(p.nickname)}</span>
      </button>`
      )
      .join("");
    pick.querySelectorAll(".train-chip").forEach((btn) => {
      btn.onclick = () => {
        trainTargetId = Number(btn.dataset.id);
        renderTrain();
      };
    });
    const pet = state.party.find((p) => p.id === trainTargetId);
    $("#train-stats").innerHTML = pet.stats
      .map(
        (s) => `
      <button class="train-btn" data-stat="${s.statId}">
        <div class="swatch" style="background:${s.color}"></div>
        <div>
          <strong>${s.name}</strong>
          <small>${s.description} · now ${s.value}</small>
        </div>
        <div class="power-chip">+1⚡</div>
      </button>`
      )
      .join("");
    $("#train-stats").querySelectorAll(".train-btn").forEach((btn) => {
      btn.onclick = async () => {
        const res = await dispatch(AppEvents.TRAIN_CREATURE, {
          creatureId: trainTargetId,
          statId: Number(btn.dataset.stat),
        });
        if (res?.ok) {
          const t = res.data.train;
          toast(`+${t.gain} ${t.stat.name}${t.critical ? "!" : ""}`);
          renderTrain();
        }
      };
    });
  }

  function renderExplore() {
    paintMeters(state);
    $("#zone-list").innerHTML = state.zones
      .map(
        (z) => `
      <button class="zone-card" data-zone="${z.code}">
        <h3>${escapeHtml(z.name)}</h3>
        <p>${escapeHtml(z.vibe)}</p>
        <div class="cost">Explore · ${z.energyCost} energy</div>
      </button>`
      )
      .join("");
    $("#zone-list").querySelectorAll(".zone-card").forEach((btn) => {
      btn.onclick = async () => {
        const res = await dispatch(AppEvents.EXPLORE_ZONE, { zoneCode: btn.dataset.zone });
        if (!res?.ok) return;
        battleSession = res.data.session;
        paintBattle("A wild beast appears!");
        showScreen("screen-battle");
        $("#nav").classList.add("hidden");
      };
    });
  }

  function paintBattle(logLine) {
    const b = battleSession;
    const youPct = Math.max(0, (b.youHp / b.youMax) * 100);
    const foePct = Math.max(0, (b.wildHp / b.wildMax) * 100);
    $("#battle-root").innerHTML = `
      <div class="section-head">
        <h1>${escapeHtml(b.zone.display_name || b.zone.name)}</h1>
        <span>Battle</span>
      </div>
      <div class="battle">
        <div class="arena">
          <div class="fighter foe">
            <div class="finfo">
              <strong>${escapeHtml(b.wild.nickname)}</strong>
              <div class="hpbar foe"><span style="width:${foePct}%"></span></div>
            </div>
            ${avatarHtml(b.wild.species)}
          </div>
          <div class="fighter you">
            ${avatarHtml(b.you.species)}
            <div class="finfo">
              <strong>${escapeHtml(b.you.nickname)}</strong>
              <div class="hpbar"><span style="width:${youPct}%"></span></div>
            </div>
          </div>
        </div>
        <div class="battle-log" id="battle-log"></div>
        <div class="battle-actions" id="battle-actions">
          <button class="btn btn-primary" data-act="strike">Strike<small>Solid hit</small></button>
          <button class="btn btn-secondary" data-act="guard">Guard<small>Brace</small></button>
          <button class="btn btn-secondary" data-act="burst">Burst<small>Risky</small></button>
        </div>
        <div class="result-banner" id="result-banner"></div>
      </div>`;
    if (logLine) appendLog(logLine);
    $("#battle-actions").querySelectorAll("[data-act]").forEach((btn) => {
      btn.onclick = () => doTurn(btn.dataset.act);
    });
  }

  function appendLog(text) {
    const log = $("#battle-log");
    if (!log) return;
    const line = document.createElement("div");
    line.className = "line";
    line.textContent = text;
    log.prepend(line);
  }

  async function doTurn(actionCode) {
    if (!battleSession || battleSession.over) return;
    const res = await dispatch(AppEvents.BATTLE_ACTION, {
      battleSession,
      actionCode,
    });
    if (!res?.ok) return;
    battleSession = res.data.session;
    const turn = res.data.turn;
    const youBar = $(".fighter.you .hpbar > span");
    const foeBar = $(".fighter.foe .hpbar > span");
    if (youBar) youBar.style.width = `${Math.max(0, (battleSession.youHp / battleSession.youMax) * 100)}%`;
    if (foeBar) foeBar.style.width = `${Math.max(0, (battleSession.wildHp / battleSession.wildMax) * 100)}%`;
    turn.log.forEach((l) => appendLog(l.text));

    if (turn.result) {
      battleSession.over = true;
      $("#battle-actions").classList.add("hidden");
      const banner = $("#result-banner");
      banner.classList.add("show");
      if (turn.result.outcome === "win") {
        banner.innerHTML = `
          <h3>Victory</h3>
          <p>+${turn.result.coinGain} coins${
            turn.result.trainBoost ? ` · +1 ${turn.result.trainBoost.stat.display_name}` : ""
          }</p>
          <div class="action-row">
            ${
              turn.result.canCatch
                ? `<button class="btn btn-primary" id="btn-catch">Catch · 1 Orb</button>`
                : ""
            }
            <button class="btn btn-secondary ${turn.result.canCatch ? "" : "wide"}" id="btn-leave">Return</button>
          </div>`;
        $("#btn-catch")?.addEventListener("click", async () => {
          const c = await dispatch(AppEvents.CATCH_CREATURE, {
            battleSession,
            itemId: 1,
          });
          if (c?.ok) {
            toast(`Caught ${c.data.caught.nickname}!`);
            leaveBattle();
          } else if (c && !c.ok) {
            toast(c.error.message || "It broke free…");
          }
        });
        $("#btn-leave").onclick = leaveBattle;
      } else {
        banner.classList.add("lose");
        banner.innerHTML = `
          <h3>Defeated</h3>
          <p>Retreat, train harder, try again.</p>
          <button class="btn btn-secondary wide" id="btn-leave">Return</button>`;
        $("#btn-leave").onclick = leaveBattle;
      }
    }
  }

  function leaveBattle() {
    battleSession = null;
    renderExplore();
    showScreen("screen-explore");
  }

  function renderEvolve() {
    paintMeters(state);
    const evolvable = state.party.filter((p) => p.evolution.canEvolve);
    const list = $("#evo-list");
    if (!state.party.length) {
      list.innerHTML = `<div class="empty">No beasts to evolve yet.</div>`;
      return;
    }
    if (!evolvable.length) {
      list.innerHTML = `<div class="empty">Every beast is fully evolved — or needs more training.</div>`;
      return;
    }
    list.innerHTML = evolvable
      .map((p) => {
        const ready = p.evolution.ready;
        return `
        <div class="evo-card ${ready ? "ready" : ""}">
          <div class="evo-path">
            <div style="text-align:center">
              ${avatarHtml(p.species)}
              <strong>${escapeHtml(p.nickname)}</strong>
            </div>
            <div class="arrow">→</div>
            <div style="text-align:center">
              ${avatarHtml(p.evolution.next)}
              <strong>${escapeHtml(p.evolution.next.name)}</strong>
            </div>
          </div>
          <div class="req-list">
            ${p.evolution.requirements
              .map(
                (r) => `
              <div class="req ${r.met ? "met" : ""}">
                <span>${escapeHtml(r.label)}</span>
                <span>${r.have} / ${r.needed}</span>
              </div>`
              )
              .join("")}
          </div>
          <button class="btn ${ready ? "btn-primary" : "btn-secondary"} wide" data-evo="${p.id}" ${
            ready ? "" : "disabled"
          }>${ready ? "Evolve" : "Keep training"}</button>
        </div>`;
      })
      .join("");
    list.querySelectorAll("[data-evo]").forEach((btn) => {
      btn.onclick = async () => {
        const res = await dispatch(AppEvents.EVOLVE_CREATURE, {
          creatureId: Number(btn.dataset.evo),
        });
        if (res?.ok) {
          toast(`${res.data.evolution.from} → ${res.data.evolution.to}!`);
          renderEvolve();
        }
      };
    });
  }

  function renderStarters() {
    const grid = $("#starter-grid");
    grid.innerHTML = state.starters
      .map(
        (pet) => `
      <button class="starter ${selectedStarter === pet.id ? "selected" : ""}" data-id="${pet.id}">
        ${avatarHtml(pet)}
        <strong>${escapeHtml(pet.name)}</strong>
        <small>${escapeHtml(pet.element)}</small>
      </button>`
      )
      .join("");
    grid.querySelectorAll(".starter").forEach((btn) => {
      btn.onclick = () => {
        selectedStarter = Number(btn.dataset.id);
        renderStarters();
        $("#btn-begin").disabled = false;
      };
    });
  }

  // bindings
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
    selectedStarter = null;
    $("#btn-begin").disabled = true;
    renderStarters();
    showScreen("screen-starter");
  });
  $("#btn-begin").addEventListener("click", async () => {
    if (!selectedStarter) return;
    const res = await dispatch(AppEvents.SELECT_STARTER, { speciesId: selectedStarter });
    if (!res?.ok) return;
    toast("Your journey begins");
    enterHub();
  });
  $("#btn-rest").addEventListener("click", async () => {
    await dispatch(AppEvents.REST_PLAYER);
    toast("Energy restored");
  });
  $$(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      if (tab === "party") renderParty();
      if (tab === "train") renderTrain();
      if (tab === "explore") renderExplore();
      if (tab === "evolve") renderEvolve();
      showScreen(`screen-${tab}`);
    });
  });
  $("#detail-sheet").addEventListener("click", (e) => {
    if (e.target.id === "detail-sheet") e.target.classList.remove("open");
  });

  // title orb
  const glyphs = catalog.species.filter((p) => p.stage === 3);
  let gi = 0;
  setInterval(() => {
    gi = (gi + 1) % glyphs.length;
    $("#title-glyph").textContent = glyphs[gi].glyph;
    $("#title-orb").style.setProperty("--orb-hue", glyphs[gi].hue);
  }, 3200);

  // boot
  state = services.getAppState();
  $("#btn-continue").classList.toggle("hidden", !services.playerService.hasSave());
  showScreen("screen-title");
  $("#nav").classList.add("hidden");
  paintMeters(state);
  setInterval(async () => {
    await dispatch(AppEvents.REGEN_ENERGY);
  }, 15000);
}
