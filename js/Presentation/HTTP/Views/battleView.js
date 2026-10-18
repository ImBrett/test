import { AppEvents } from "../../../Application/Events/AppEvents.js";
import { $, escapeHtml, avatarHtml, toast, showScreen } from "./dom.js";

export function createBattleView(ctx) {
  function paint(intro) {
    const b = ctx.getSession();
    const youPct = Math.max(0, (b.youHp / b.youMax) * 100);
    const foePct = Math.max(0, (b.wildHp / b.wildMax) * 100);
    const boss = !!b.zone?.is_boss;
    $("#battle-root").innerHTML = `
      <div class="section-head">
        <h1>${escapeHtml(b.zone.area_label ? `${b.zone.area_label} ${b.zone.display_name || b.zone.name}` : b.zone.display_name || b.zone.name)}</h1>
        <span>${boss ? "Boss" : "Battle"}</span>
      </div>
      <div class="battle">
        <div class="arena">
          <div class="fighter foe">
            <div class="finfo">
              <strong>${escapeHtml(b.wild.nickname)}</strong>
              <small>Lv.${b.wild.level || 1}</small>
              <div class="hpbar foe"><span style="width:${foePct}%"></span></div>
            </div>
            ${avatarHtml(b.wild.species)}
          </div>
          <div class="fighter you">
            ${avatarHtml(b.you.species)}
            <div class="finfo">
              <strong>${escapeHtml(b.you.nickname)}</strong>
              <small>Lv.${b.you.level || 1}</small>
              <div class="hpbar"><span style="width:${youPct}%"></span></div>
            </div>
          </div>
        </div>
        <div class="battle-feed" id="battle-feed">
          <div class="feed-line you" id="feed-you">
            <span class="who">${escapeHtml(b.you.nickname)}</span>
            <span class="what">—</span>
          </div>
          <div class="feed-line foe" id="feed-foe">
            <span class="who">${escapeHtml(b.wild.nickname)}</span>
            <span class="what">${escapeHtml(intro || (boss ? "A boss blocks the path." : "A wild beast appears."))}</span>
          </div>
        </div>
        <div class="battle-actions" id="battle-actions">
          <button class="btn btn-primary" data-act="strike">Strike<small>Solid hit</small></button>
          <button class="btn btn-secondary" data-act="guard">Guard<small>Brace</small></button>
          <button class="btn btn-secondary" data-act="burst">Burst<small>Risky</small></button>
          <button class="btn btn-secondary" id="btn-battle-item">Item<small>Bag</small></button>
        </div>
        <div class="result-banner" id="result-banner"></div>
      </div>`;
    $("#battle-actions").querySelectorAll("[data-act]").forEach((btn) => {
      btn.onclick = () => doTurn(btn.dataset.act);
    });
    $("#btn-battle-item")?.addEventListener("click", () => openBattleItems());
  }

  function setSide(id, text) {
    const el = $(`#${id} .what`);
    if (el) el.textContent = text || "—";
  }

  function applyActionLog(log) {
    const you = (log || []).filter((l) => l.side === "you" && !l.reward).map((l) => l.text);
    const foe = (log || []).filter((l) => l.side === "foe" && !l.reward).map((l) => l.text);
    setSide("feed-you", you.join(" "));
    setSide("feed-foe", foe.join(" "));
  }

  function openBattleItems() {
    const consumables = (ctx.state.inventory || []).filter((i) => i.kind === "consumable");
    const sheet = $("#detail-sheet");
    const body = $("#detail-body");
    body.innerHTML = `
      <div class="sheet-handle"></div>
      <div class="detail-hero">
        <h2>Items</h2>
        <p>Use one on your beast. The foe does not act.</p>
      </div>
      <div class="gear-pick-list">
        ${
          consumables.length
            ? consumables
                .map(
                  (item) => `
            <button class="gear-pick" data-item="${item.itemId}">
              <strong>${escapeHtml(item.name)} ×${item.quantity}</strong>
              <small>${escapeHtml(item.description || "Consumable")}</small>
            </button>`
                )
                .join("")
            : `<div class="empty">No battle items. Buy salves in the Shop.</div>`
        }
      </div>
      <div class="action-row">
        <button class="btn btn-secondary wide" id="btn-items-close">Close</button>
      </div>`;
    body.querySelectorAll("[data-item]").forEach((btn) => {
      btn.onclick = () => useBattleItem(Number(btn.dataset.item));
    });
    $("#btn-items-close").onclick = () => sheet.classList.remove("open");
    sheet.classList.add("open");
  }

  async function useBattleItem(itemId) {
    const session = ctx.getSession();
    if (!session || session.over) return;
    const res = await ctx.dispatch(AppEvents.USE_BATTLE_ITEM, {
      battleSession: session,
      itemId,
    });
    if (!res?.ok) return;
    ctx.setSession(res.data.session);
    $("#detail-sheet").classList.remove("open");
    const next = ctx.getSession();
    const youBar = $(".fighter.you .hpbar > span");
    if (youBar) {
      youBar.style.width = `${Math.max(0, (next.youHp / next.youMax) * 100)}%`;
    }
    const text = (res.data.itemUse.log || []).map((l) => l.text).join(" ");
    setSide("feed-you", text);
    toast("Item used");
  }

  async function doTurn(actionCode) {
    const session = ctx.getSession();
    if (!session || session.over) return;
    const res = await ctx.dispatch(AppEvents.BATTLE_ACTION, {
      battleSession: session,
      actionCode,
    });
    if (!res?.ok) return;
    ctx.setSession(res.data.session);
    const turn = res.data.turn;
    const next = ctx.getSession();
    const youBar = $(".fighter.you .hpbar > span");
    const foeBar = $(".fighter.foe .hpbar > span");
    if (youBar) youBar.style.width = `${Math.max(0, (next.youHp / next.youMax) * 100)}%`;
    if (foeBar) foeBar.style.width = `${Math.max(0, (next.wildHp / next.wildMax) * 100)}%`;
    applyActionLog(turn.log);

    if (turn.result) {
      next.over = true;
      ctx.setSession(next);
      $("#battle-actions").classList.add("hidden");
      const banner = $("#result-banner");
      banner.classList.add("show");
      if (turn.result.outcome === "win") {
        const scan = turn.result.scan;
        const xp = turn.result.xp;
        const scanLine = scan
          ? `Scan ${scan.speciesName}: ${scan.previousLevel}% → ${scan.scanLevel}%`
          : "";
        const xpLine = xp
          ? xp.levelsGained > 0
            ? `+${xp.xpGain} XP · Level up! Lv.${xp.level}`
            : `+${xp.xpGain} XP`
          : "";
        const gainsLine = xp?.statGains?.length
          ? xp.statGains.map((g) => `${g.name} +${g.gain}`).join(" · ")
          : "";
        banner.innerHTML = `
          <h3>Victory</h3>
          <p>+${turn.result.coinGain} coins${xpLine ? ` · ${escapeHtml(xpLine)}` : ""}</p>
          ${gainsLine ? `<p class="level-gains">${escapeHtml(gainsLine)}</p>` : ""}
          ${scanLine ? `<p class="scan-toast">${escapeHtml(scanLine)}${scan.canClaim ? " · ready to claim" : ""}</p>` : ""}
          <div class="action-row">
            ${
              scan?.canClaim
                ? `<button class="btn btn-primary" id="btn-to-scan">Open Scan</button>`
                : ""
            }
            <button class="btn btn-secondary ${scan?.canClaim ? "" : "wide"}" id="btn-leave">Return</button>
          </div>`;
        $("#btn-to-scan")?.addEventListener("click", () => {
          ctx.setSession(null);
          ctx.showScan();
        });
        $("#btn-leave").onclick = () => ctx.showExplore();
      } else {
        banner.classList.add("lose");
        banner.innerHTML = `
          <h3>Defeated</h3>
          <p>Shop for boosts, then try again.</p>
          <button class="btn btn-secondary wide" id="btn-leave">Return</button>`;
        $("#btn-leave").onclick = () => ctx.showExplore();
      }
    }
  }

  function enter(session) {
    ctx.setSession(session);
    const boss = !!session.zone?.is_boss;
    paint(boss ? "A boss blocks the path." : "A wild beast appears.");
    showScreen("screen-battle");
  }

  return { enter };
}
