import { $, escapeHtml, avatarHtml } from "../dom.js";
import { toast } from "../toast.js";
import { refreshMeters } from "../navigation.js";

export function renderEvolve(game) {
  const pets = game.playerCreatures().filter((p) => p.evo.canEvolve);
  const list = $("#evo-list");
  const all = game.playerCreatures();

  if (!all.length) {
    list.innerHTML = `<div class="empty">No beasts to evolve yet.</div>`;
    return;
  }
  if (!pets.length) {
    list.innerHTML = all.every((p) => !p.evo.canEvolve)
      ? `<div class="empty">Every beast in your party is fully evolved. Legendary.</div>`
      : `<div class="empty">Your beasts have reached their final forms — or need more training.</div>`;
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
            <strong>${escapeHtml(p.evo.next.display_name)}</strong>
          </div>
        </div>
        <div class="req-list">
          ${p.evo.reqs
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
        }>
          ${ready ? "Evolve" : "Keep training"}
        </button>
      </div>`;
    })
    .join("");

  list.querySelectorAll("[data-evo]").forEach((btn) => {
    btn.onclick = () => {
      const res = game.evolve(Number(btn.dataset.evo));
      if (!res.ok) {
        toast(res.reason === "item" ? "Missing evolution item" : "Not ready");
        return;
      }
      toast(`${res.from} → ${res.to}!`);
      refreshMeters(game);
      renderEvolve(game);
    };
  });
}
