import { $, escapeHtml, avatarHtml } from "../dom.js";
import { toast } from "../toast.js";
import { refreshMeters } from "../navigation.js";

export function renderParty(game, { openDetail }) {
  const { pets, meta } = game.getState();
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
        <small>${escapeHtml(p.pet.display_name)} · Stage ${p.pet.stage}</small>
      </div>
      <div class="power-chip">${p.power}</div>
    </button>`
    )
    .join("");

  grid.querySelectorAll(".pet-card").forEach((btn) => {
    btn.addEventListener("click", () => openDetail(Number(btn.dataset.id)));
  });
}

export function openDetailSheet(game, id, { onClose }) {
  const p = game.getPlayerCreature(id);
  if (!p) return;
  const sheet = $("#detail-sheet");
  const body = $("#detail-body");
  const maxStat = Math.max(...p.stats.map((s) => s.value), 30);

  body.innerHTML = `
    <div class="sheet-handle"></div>
    <div class="detail-hero">
      ${avatarHtml(p.pet)}
      <h2>${escapeHtml(p.nickname)}</h2>
      <p>${escapeHtml(p.pet.display_name)} · ${escapeHtml(p.pet.blurb)}</p>
    </div>
    <div class="stat-list">
      ${p.stats
        .map(
          (s) => `
        <div class="stat-row">
          <div class="name" style="color:${s.stat.color}">${s.stat.display_name}</div>
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
    game.setActiveCreature(id);
    toast(`${p.nickname} leads the party`);
    refreshMeters(game);
    onClose?.();
    renderParty(game, { openDetail: (i) => openDetailSheet(game, i, { onClose }) });
  };
  $("#btn-rename").onclick = () => {
    const name = prompt("Nickname", p.nickname);
    if (name != null) {
      game.renameCreature(id, name);
      openDetailSheet(game, id, { onClose });
    }
  };
  $("#btn-close-detail").onclick = () => {
    sheet.classList.remove("open");
    onClose?.();
  };
  sheet.classList.add("open");
}
