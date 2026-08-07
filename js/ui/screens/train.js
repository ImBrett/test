import { $, escapeHtml, avatarHtml } from "../dom.js";
import { toast } from "../toast.js";
import { refreshMeters } from "../navigation.js";

let trainTargetId = null;

export function renderTrain(game) {
  const { pets, meta } = game.getState();
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
      renderTrain(game);
    };
  });

  const pet = game.getPlayerCreature(trainTargetId);
  $("#train-stats").innerHTML = pet.stats
    .map(
      (s) => `
    <button class="train-btn" data-stat="${s.stat_id}">
      <div class="swatch" style="background:${s.stat.color}"></div>
      <div>
        <strong>${s.stat.display_name}</strong>
        <small>${s.stat.description} · now ${s.value}</small>
      </div>
      <div class="power-chip">+1⚡</div>
    </button>`
    )
    .join("");

  $("#train-stats").querySelectorAll(".train-btn").forEach((btn) => {
    btn.onclick = () => {
      const res = game.train(trainTargetId, Number(btn.dataset.stat));
      if (!res.ok) {
        toast(res.reason === "energy" ? "Out of energy — rest or wait" : "Can't train");
        return;
      }
      toast(`+${res.gain} ${res.stat.display_name}${res.critical ? "!" : ""}`);
      refreshMeters(game);
      renderTrain(game);
    };
  });
}
