import { $, escapeHtml, avatarHtml } from "./dom.js";

export function createOnboardingView(ctx) {
  let selectedStarter = null;

  function renderStarters() {
    const grid = $("#starter-grid");
    grid.innerHTML = ctx.state.starters
      .map(
        (pet) => `
      <button class="starter ${selectedStarter === pet.id ? "selected" : ""}" data-id="${pet.id}">
        ${avatarHtml(pet)}
        <strong>${escapeHtml(pet.name)}</strong>
        <small>${escapeHtml(pet.element)}</small>
      </button>`
      )
      .join("");
    grid.querySelectorAll(".starter").forEach((btn) => {
      btn.onclick = () => {
        selectedStarter = Number(btn.dataset.id);
        renderStarters();
        $("#btn-begin").disabled = false;
      };
    });
  }

  function resetStarter() {
    selectedStarter = null;
    $("#btn-begin").disabled = true;
  }

  function selectedId() {
    return selectedStarter;
  }

  return { renderStarters, resetStarter, selectedId };
}
