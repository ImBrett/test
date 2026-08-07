import { $, $$, escapeHtml, avatarHtml } from "../dom.js";
import { toast } from "../toast.js";
import { refreshMeters, showScreen } from "../navigation.js";

let battle = null;
let showTabFn = null;

export function setBattleNavigator(fn) {
  showTabFn = fn;
}

export function renderExplore(game) {
  const zones = game.getState().catalog.zones;
  $("#zone-list").innerHTML = zones
    .map(
      (z) => `
    <button class="zone-card" data-zone="${z.code}">
      <h3>${escapeHtml(z.display_name)}</h3>
      <p>${escapeHtml(z.vibe)}</p>
      <div class="cost">Explore · ${z.energy_cost} energy</div>
    </button>`
    )
    .join("");

  $("#zone-list").querySelectorAll(".zone-card").forEach((btn) => {
    btn.onclick = () => beginBattle(game, btn.dataset.zone);
  });
}

function beginBattle(game, zoneCode) {
  const res = game.startBattle(zoneCode);
  if (!res.ok) {
    toast(res.reason === "energy" ? "Need energy to explore" : "No active pet");
    refreshMeters(game);
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
  refreshMeters(game);
  paintBattle(game, "A wild beast appears!");
  showScreen("screen-battle");
  $("#nav").classList.add("hidden");
}

function paintBattle(game, logLine) {
  const b = battle;
  const root = $("#battle-root");
  const youPct = Math.max(0, (b.youHp / b.youMax) * 100);
  const foePct = Math.max(0, (b.wildHp / b.wildMax) * 100);

  root.innerHTML = `
    <div class="section-head">
      <h1>${escapeHtml(b.zone.display_name)}</h1>
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
    btn.onclick = () => doTurn(game, btn.dataset.act);
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

function doTurn(game, action) {
  if (!battle || battle.over) return;
  const turn = game.resolveTurn(
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

  const youBar = $(".fighter.you .hpbar > span");
  const foeBar = $(".fighter.foe .hpbar > span");
  if (youBar) youBar.style.width = `${Math.max(0, (battle.youHp / battle.youMax) * 100)}%`;
  if (foeBar) foeBar.style.width = `${Math.max(0, (battle.wildHp / battle.wildMax) * 100)}%`;

  turn.log.forEach((l) => appendLog(l.text));

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
            ? ` · +1 ${turn.result.trainBoost.stat.display_name}`
            : ""
        }</p>
        <div class="action-row">
          ${
            turn.result.canCatch
              ? `<button class="btn btn-primary" id="btn-catch">Catch · 1 Orb</button>`
              : `<p style="grid-column:1/-1;color:var(--muted);margin:0 0 8px;font-size:0.9rem">No Morph Orbs left.</p>`
          }
          <button class="btn btn-secondary ${turn.result.canCatch ? "" : "wide"}" id="btn-leave">Return</button>
        </div>
      `;
      const catchBtn = $("#btn-catch");
      if (catchBtn) {
        catchBtn.onclick = () => {
          const c = game.tryCatch(battle, 1);
          if (c.ok) {
            toast(`Caught ${c.pet.nickname}!`);
            leaveBattle();
          } else if (c.reason === "no_orb") {
            toast("No Morph Orbs");
          } else {
            toast("It broke free…");
            if (game.inventoryQty(1) + game.inventoryQty(2) <= 0) catchBtn.remove();
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
    refreshMeters(game);
  }
}

function leaveBattle() {
  battle = null;
  showTabFn?.("explore");
}
