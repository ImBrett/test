export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function avatarHtml(species, sizeClass = "") {
  return `<div class="pet-avatar ${sizeClass}" style="--hue:${species.hue}">${species.glyph}</div>`;
}

let toastTimer;
export function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

export function showScreen(id) {
  $$(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
  const tab = id.replace("screen-", "");
  const hub = ["party", "train", "explore", "scan", "evolve"].includes(tab);
  $("#nav").classList.toggle("hidden", !hub);
  if (hub) {
    $$(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  }
}

export function paintMeters(state) {
  const r = state.player?.resources;
  $$(".meter-energy").forEach((el) => {
    el.textContent = r ? `${r.energy}/${r.energyMax}` : "0/0";
  });
  $$(".meter-coins").forEach((el) => {
    el.textContent = String(r?.coins ?? 0);
  });
  $$(".who-name").forEach((el) => {
    el.textContent = state.player?.name || "Traveler";
  });
}
