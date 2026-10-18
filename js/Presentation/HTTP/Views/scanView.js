import { AppEvents } from "../../../Application/Events/AppEvents.js";
import { $, escapeHtml, avatarHtml, toast } from "./dom.js";

export function createScanView(ctx) {
  function render() {
    ctx.paint();
    const list = $("#scan-list");
    const scans = ctx.state.scans || [];
    if (!scans.length) {
      list.innerHTML = `
        <div class="empty">
          <p>Defeat wild beasts to fill scan data. At 100%, claim them here.</p>
          <button class="btn btn-primary wide" id="btn-scan-explore" style="margin-top:16px">Explore the wilds</button>
        </div>`;
      $("#btn-scan-explore").onclick = () => ctx.showExplore();
      return;
    }
    list.innerHTML = scans
      .map((s) => {
        const pct = Math.min(100, s.scanLevel);
        return `
        <div class="scan-card ${s.canClaim ? "ready" : ""} ${s.claimed ? "claimed" : ""}">
          <div class="scan-head">
            ${avatarHtml(s.species)}
            <div>
              <strong>${escapeHtml(s.species.name)}</strong>
              <small>${escapeHtml(s.species.element)} · ${escapeHtml(s.species.stageName)}</small>
            </div>
            <div class="power-chip">${pct}%</div>
          </div>
          <div class="scan-bar"><span style="width:${pct}%"></span></div>
          <p class="scan-blurb">${escapeHtml(s.species.blurb)}</p>
          ${
            s.canClaim
              ? `<button class="btn btn-primary wide" data-claim="${s.speciesId}">Obtain</button>`
              : s.claimed
                ? `<div class="scan-status">Obtained</div>`
                : `<div class="scan-status">Keep battling to complete the scan</div>`
          }
        </div>`;
      })
      .join("");
    list.querySelectorAll("[data-claim]").forEach((btn) => {
      btn.onclick = async () => {
        const res = await ctx.dispatch(AppEvents.CLAIM_SCAN, {
          speciesId: Number(btn.dataset.claim),
        });
        if (res?.ok) {
          toast(`Obtained ${res.data.claimed.nickname}!`);
          render();
        }
      };
    });
  }

  return { render };
}
