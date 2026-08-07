export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function avatarHtml(pet, sizeClass = "") {
  return `<div class="pet-avatar ${sizeClass}" style="--hue:${pet.hue}">${pet.glyph}</div>`;
}
