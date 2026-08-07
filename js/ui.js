/* Morph — UI controller */

window.MorphUI = (() => {
  const G = () => window.MorphGame;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  let selectedStarter = null;
  let trainTargetId = null;
  let detailPetId = null;
  let battle = null;
  let toastTimer = null;

  function showScreen(id) {
    $$(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
    const hub = ["party", "train", "explore", "evolve"].includes(id.replace("screen-", ""));
    $("#nav").classList.toggle("hidden", !hub && id !== "screen-battle");
    if (id === "screen-battle") {
      // keep nav hidden during battle
      $("#nav").classList.add("hidden");
    }
    if (hub) {
      const tab = id.replace("screen-", "");
      $$(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    }
  }

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function refreshMeters() {
    const { meta, player } = G().getState();
    $$(".meter-energy").forEach((el) => {
      el.textContent = `${meta.energy}/${meta.energyMax}`;
    });
    $$(".meter-coins").forEach((el) => {
      el.textContent = String(meta.coins);
    });
    $$(".who-name").forEach((el) => {
      el.textContent = player ? player.name : "Traveler";
    });
  }

  function avatarHtml(pet, sizeClass = "") {
    return `<div class="pet-avatar ${sizeClass}" style="--hue:${pet.hue}">${pet.glyph}</div>`;
  }

  function renderParty() {
    const { pets, meta } = G().getState();
    const grid = $("#party-grid");
    if (!pets.length) {
      grid.innerHTML = `<div class="empty">No beasts yet. Explore the wilds!</div>`;
      return;
    }
    grid.innerHTML = pets
      .map(
        (p) => `
      <button class="pet-card ${p.id === meta.activePetId ? "active" : ""}" data-id="${p.id}">
        ${avatarHtml(p.pet)}
        <div class="pet-meta">
          <strong>${escapeHtml(p.nickname)}</strong>
          <small>${escapeHtml(p.pet.display_name || p.pet.name)} · Stage ${p.pet.stage}</small>
        </div>
        <div class="power-chip">${p.power}</div>
      </button>`
      )
      .join("");

    grid.querySelectorAll(".pet-card").forEach((btn) => {
      btn.addEventListener("click", () => openDetail(Number(btn.dataset.id)));
    });
  }

  function openDetail(id) {
    detailPetId = id;
    const p = G().getPlayerPet(id);
    if (!p) return;
    const sheet = $("#detail-sheet");
    const body = $("#detail-body");
    const maxStat = Math.max(...p.stats.map((s) => s.value), 30);

    body.innerHTML = `
      <div class="sheet-handle"></div>
      <div class="detail-hero">
        ${avatarHtml(p.pet)}
        <h2>${escapeHtml(p.nickname)}</h2>
        <p>${escapeHtml(p.pet.display_name || p.pet.name)} · ${escapeHtml(p.pet.blurb)}</p>
      </div>
      <div class="stat-list">
        ${p.stats
          .map(
            (s) => `
          <div class="stat-row">
            <div class="name" style="color:${s.stat.color}">${s.stat.display_name || s.stat.name}</div>
            <div class="bar"><span style="width:${Math.min(100, (s.value / maxStat) * 100)}%;background:${s.stat.color}"></span></div>
            <div class="val">${s.value}</div>
          </div>`
          )
          .join("")}
      </div>
      <div class="action-row">
        <button class="btn btn-secondary" id="btn-set-active">Set Active</button>
        <button class="btn btn-secondary" id="btn-rename">Rename</button>
        <button class="btn btn-primary wide" id="btn-close-detail">Close</button>
      </div>
    `;

    // animate bars
    requestAnimationFrame(() => {
      body.querySelectorAll(".bar > span").forEach((el) => {
        const w = el.style.width;
        el.style.width = "0";
        requestAnimationFrame(() => {
          el.style.width = w;
        });
      });
    });

    $("#btn-set-active").onclick = () => {
      G().setActivePet(id);
      toast(`${p.nickname} leads the party`);
      renderParty();
      refreshMeters();
    };
    $("#btn-rename").onclick = () => {
      const name = prompt("Nickname", p.nickname);
      if (name != null) {
        G().renamePet(id, name);
        openDetail(id);
        renderParty();
      }
    };
    $("#btn-close-detail").onclick = () => closeDetail();
    sheet.classList.add("open");
  }

  function closeDetail() {
    $("#detail-sheet").classList.remove("open");
  }

  function renderTrain() {
    const { pets, meta } = G().getState();
    const pick = $("#train-pick");
    if (!pets.length) {
      pick.innerHTML = "";
      $("#train-stats").innerHTML = `<div class="empty">Catch a beast first.</div>`;
      return;
    }
    if (!trainTargetId || !pets.find((p) => p.id === trainTargetId)) {
      trainTargetId = meta.activePetId || pets[0].id;
    }

    pick.innerHTML = pets
      .map(
        (p) => `
      <button class="train-chip ${p.id === trainTargetId ? "selected" : ""}" data-id="${p.id}">
        ${avatarHtml(p.pet)}
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

    const pet = G().getPlayerPet(trainTargetId);
    $("#train-stats").innerHTML = pet.stats
      .map(
        (s) => `
      <button class="train-btn" data-stat="${s.stat_id}">
        <div class="swatch" style="background:${s.stat.color}"></div>
        <div>
          <strong>${s.stat.display_name || s.stat.name}</strong>
          <small>${s.stat.description || s.stat.desc} · now ${s.value}</small>
        </div>
        <div class="power-chip">+1⚡</div>
      </button>`
      )
      .join("");

    $("#train-stats").querySelectorAll(".train-btn").forEach((btn) => {
      btn.onclick = () => {
        const res = G().train(trainTargetId, Number(btn.dataset.stat));
        if (!res.ok) {
          toast(res.reason === "energy" ? "Out of energy — rest or wait" : "Can't train");
          return;
        }
        toast(`+${res.gain} ${res.stat.display_name || res.stat.name}${res.critical ? "!" : ""}`);
        refreshMeters();
        renderTrain();
      };
    });
  }

  function renderExplore() {
    const zones = window.MORPH_DATA.zones;
    $("#zone-list").innerHTML = zones
      .map(
        (z) => `
      <button class="zone-card" data-zone="${z.code}">
        <h3>${escapeHtml(z.display_name || z.name)}</h3>
        <p>${escapeHtml(z.vibe)}</p>
        <div class="cost">Explore · ${z.energy_cost} energy</div>
      </button>`
      )
      .join("");

    $("#zone-list").querySelectorAll(".zone-card").forEach((btn) => {
      btn.onclick = () => beginBattle(btn.dataset.zone);
    });
  }

  function beginBattle(zoneCode) {
    const res = G().startBattle(zoneCode);
    if (!res.ok) {
      toast(res.reason === "energy" ? "Need 2 energy" : "No active pet");
      refreshMeters();
      return;
    }
    battle = {
      you: res.you,
      wild: res.wild,
      zone: res.zone,
      youCombat: res.youCombat,
      wildCombat: res.combat,
      youHp: res.youCombat.hp,
      youMax: res.youCombat.hp,
      wildHp: res.combat.hp,
      wildMax: res.combat.hp,
      battleId: res.battleId,
      youParticipantId: res.youParticipantId,
      wildParticipantId: res.wildParticipantId,
      turnNumber: 0,
      over: false,
    };
    refreshMeters();
    paintBattle("A wild beast appears!");
    showScreen("screen-battle");
  }

  function paintBattle(logLine) {
    const b = battle;
    const root = $("#battle-root");
    const youPct = Math.max(0, (b.youHp / b.youMax) * 100);
    const foePct = Math.max(0, (b.wildHp / b.wildMax) * 100);

    root.innerHTML = `
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
            ${avatarHtml(b.wild.pet)}
          </div>
          <div class="fighter you">
            ${avatarHtml(b.you.pet)}
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
      </div>
    `;

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

  function doTurn(action) {
    if (!battle || battle.over) return;
    const turn = G().resolveTurn(
      {
        you: battle.you,
        wild: battle.wild,
        youCombat: battle.youCombat,
        wildCombat: battle.wildCombat,
        youHp: battle.youHp,
        wildHp: battle.wildHp,
        youMax: battle.youMax,
        wildMax: battle.wildMax,
        battleId: battle.battleId,
        youParticipantId: battle.youParticipantId,
        wildParticipantId: battle.wildParticipantId,
        turnNumber: battle.turnNumber,
      },
      action
    );

    battle.youHp = turn.youHp;
    battle.wildHp = turn.wildHp;
    battle.turnNumber = turn.turnNumber;

    // update bars without full re-render to keep log
    const youBar = $(".fighter.you .hpbar > span");
    const foeBar = $(".fighter.foe .hpbar > span");
    if (youBar) youBar.style.width = `${Math.max(0, (battle.youHp / battle.youMax) * 100)}%`;
    if (foeBar) foeBar.style.width = `${Math.max(0, (battle.wildHp / battle.wildMax) * 100)}%`;

    turn.log.forEach((l) => appendLog(l.text));

    // hit animation
    const foeAv = $(".fighter.foe .pet-avatar");
    const youAv = $(".fighter.you .pet-avatar");
    if (turn.log.some((l) => l.text.startsWith(battle.you.nickname))) {
      foeAv?.classList.remove("hit");
      void foeAv?.offsetWidth;
      foeAv?.classList.add("hit");
    }
    if (turn.log.some((l) => l.text.startsWith(battle.wild.nickname))) {
      youAv?.classList.remove("hit");
      void youAv?.offsetWidth;
      youAv?.classList.add("hit");
    }

    if (turn.result) {
      battle.over = true;
      $("#battle-actions").classList.add("hidden");
      const banner = $("#result-banner");
      banner.classList.add("show");
      if (turn.result.outcome === "win") {
        banner.innerHTML = `
          <h3>Victory</h3>
          <p>+${turn.result.coinGain} coins${
          turn.result.trainBoost
            ? ` · +1 ${turn.result.trainBoost.stat.display_name || turn.result.trainBoost.stat.name}`
            : ""
        }</p>
          <div class="action-row">
            ${
              turn.result.canCatch
                ? `<button class="btn btn-primary" id="btn-catch">Catch · 1 Orb</button>`
                : `<p style="grid-column:1/-1;color:var(--muted);margin:0 0 8px;font-size:0.9rem">No Morph Orbs left — win more battles to find them.</p>`
            }
            <button class="btn btn-secondary ${turn.result.canCatch ? "" : "wide"}" id="btn-leave">Return</button>
          </div>
        `;
        const catchBtn = $("#btn-catch");
        if (catchBtn) {
          catchBtn.onclick = () => {
            const c = G().tryCatch(battle, 1);
            if (c.ok) {
              toast(`Caught ${c.pet.nickname}!`);
              leaveBattle();
            } else if (c.reason === "no_orb") {
              toast("No Morph Orbs");
            } else {
              toast("It broke free…");
              if (G().inventoryQty(1) + G().inventoryQty(2) <= 0) catchBtn.remove();
            }
          };
        }
        $("#btn-leave").onclick = leaveBattle;
      } else {
        banner.classList.add("lose");
        banner.innerHTML = `
          <h3>Defeated</h3>
          <p>Retreat, train harder, try again.</p>
          <button class="btn btn-secondary wide" id="btn-leave">Return</button>
        `;
        $("#btn-leave").onclick = leaveBattle;
      }
      refreshMeters();
    }
  }

  function leaveBattle() {
    battle = null;
    showTab("explore");
  }

  function renderEvolve() {
    const pets = G().playerPets().filter((p) => p.evo.canEvolve);
    const list = $("#evo-list");
    if (!pets.length) {
      list.innerHTML = `<div class="empty">Your beasts have reached their final forms — or need more training.</div>`;
      // still show maxed ones briefly?
      const all = G().playerPets();
      if (all.length && all.every((p) => !p.evo.canEvolve)) {
        list.innerHTML = `<div class="empty">Every beast in your party is fully evolved. Legendary.</div>`;
      } else if (!all.length) {
        list.innerHTML = `<div class="empty">No beasts to evolve yet.</div>`;
      }
      return;
    }

    list.innerHTML = pets
      .map((p) => {
        const ready = p.evo.ready;
        return `
        <div class="evo-card ${ready ? "ready" : ""}">
          <div class="evo-path">
            <div style="text-align:center">
              ${avatarHtml(p.pet)}
              <strong>${escapeHtml(p.nickname)}</strong>
            </div>
            <div class="arrow">→</div>
            <div style="text-align:center">
              ${avatarHtml(p.evo.next)}
              <strong>${escapeHtml(p.evo.next.display_name || p.evo.next.name)}</strong>
            </div>
          </div>
          <div class="req-list">
            ${p.evo.reqs
              .map(
                (r) => `
              <div class="req ${r.met ? "met" : ""}">
                <span>${escapeHtml(r.label || r.stat.display_name || r.stat.name)}</span>
                <span>${r.have} / ${r.needed}</span>
              </div>`
              )
              .join("")}
          </div>
          <button class="btn ${ready ? "btn-primary" : "btn-secondary"} wide" data-evo="${p.id}" ${
          ready ? "" : "disabled"
        }>
            ${ready ? "Evolve" : "Keep training"}
          </button>
        </div>`;
      })
      .join("");

    list.querySelectorAll("[data-evo]").forEach((btn) => {
      btn.onclick = () => {
        const res = G().evolve(Number(btn.dataset.evo));
        if (!res.ok) {
          toast("Not ready");
          return;
        }
        toast(`${res.from} → ${res.to}!`);
        refreshMeters();
        renderEvolve();
        renderParty();
      };
    });
  }

  function renderStarters() {
    const ids = window.MORPH_DATA.starters();
    const grid = $("#starter-grid");
    grid.innerHTML = ids
      .map((id) => {
        const pet = window.MORPH_DATA.speciesById(id);
        const el = pet.element?.display_name || pet.element?.code || "";
        return `
        <button class="starter ${selectedStarter === id ? "selected" : ""}" data-id="${id}">
          ${avatarHtml(pet)}
          <strong>${escapeHtml(pet.display_name)}</strong>
          <small>${escapeHtml(el)}</small>
        </button>`;
      })
      .join("");

    grid.querySelectorAll(".starter").forEach((btn) => {
      btn.onclick = () => {
        selectedStarter = Number(btn.dataset.id);
        renderStarters();
        $("#btn-begin").disabled = false;
      };
    });
  }

  function showTab(tab) {
    refreshMeters();
    if (tab === "party") renderParty();
    if (tab === "train") renderTrain();
    if (tab === "explore") renderExplore();
    if (tab === "evolve") renderEvolve();
    showScreen(`screen-${tab}`);
  }

  function enterHub() {
    showTab("party");
    $("#nav").classList.remove("hidden");
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function bind() {
    $("#btn-continue")?.addEventListener("click", () => {
      if (G().hasSave()) enterHub();
    });

    $("#btn-new-game").addEventListener("click", () => {
      showScreen("screen-create");
      $("#player-name").value = "";
      $("#player-name").focus();
    });

    $("#btn-to-starter").addEventListener("click", () => {
      const name = $("#player-name").value.trim();
      if (!name) {
        toast("Pick a name, traveler");
        return;
      }
      try {
        G().createPlayer(name);
      } catch {
        toast("Invalid name");
        return;
      }
      selectedStarter = null;
      $("#btn-begin").disabled = true;
      renderStarters();
      showScreen("screen-starter");
      // animate orb hue on title was separate
    });

    $("#btn-begin").addEventListener("click", () => {
      if (!selectedStarter) return;
      G().addPlayerPet(selectedStarter);
      toast("Your journey begins");
      enterHub();
    });

    $("#btn-rest").addEventListener("click", () => {
      const res = G().rest();
      if (!res.ok) {
        toast("Need 15 coins to rest");
        return;
      }
      toast("Energy restored");
      refreshMeters();
    });

    $$(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", () => showTab(btn.dataset.tab));
    });

    $("#detail-sheet").addEventListener("click", (e) => {
      if (e.target.id === "detail-sheet") closeDetail();
    });

    // title creature cycle
    const glyphs = window.MORPH_DATA.species.filter((p) => p.stage === 3);
    let gi = 0;
    const orb = $("#title-orb");
    const glyph = $("#title-glyph");
    setInterval(() => {
      gi = (gi + 1) % glyphs.length;
      glyph.textContent = glyphs[gi].glyph;
      orb.style.setProperty("--orb-hue", glyphs[gi].hue);
    }, 3200);
  }

  function boot() {
    G().load();
    bind();
    const has = G().hasSave();
    $("#btn-continue").classList.toggle("hidden", !has);
    showScreen("screen-title");
    $("#nav").classList.add("hidden");
    refreshMeters();

    // energy tick
    setInterval(() => {
      G().regenEnergy();
      refreshMeters();
    }, 15000);
  }

  return { boot, showTab, toast };
})();

document.addEventListener("DOMContentLoaded", () => MorphUI.boot());
