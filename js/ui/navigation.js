import { $, $$ } from "./dom.js";

export function refreshMeters(game) {
  const { meta, player } = game.getState();
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

export function showScreen(id) {
  $$(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
  const tab = id.replace("screen-", "");
  const hub = ["party", "train", "explore", "evolve"].includes(tab);
  $("#nav").classList.toggle("hidden", !hub);
  if (hub) {
    $$(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  }
}
