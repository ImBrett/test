import { $, escapeHtml, avatarHtml } from "../dom.js";
import { toast } from "../toast.js";
import { showScreen } from "../navigation.js";

let selectedStarter = null;

export function bindOnboarding(game, catalog, { enterHub }) {
  $("#btn-continue")?.addEventListener("click", () => {
    if (game.hasSave()) enterHub();
  });

  $("#btn-new-game").addEventListener("click", () => {
    showScreen("screen-create");
    $("#player-name").value = "";
    $("#player-name").focus();
  });

  $("#btn-to-starter").addEventListener("click", () => {
    const name = $("#player-name").value.trim();
    if (!name) {
      toast("Pick a name, traveler");
      return;
    }
    try {
      game.createPlayer(name);
    } catch {
      toast("Invalid name");
      return;
    }
    selectedStarter = null;
    $("#btn-begin").disabled = true;
    renderStarters(catalog);
    showScreen("screen-starter");
  });

  $("#btn-begin").addEventListener("click", () => {
    if (!selectedStarter) return;
    game.addPlayerCreature(selectedStarter);
    toast("Your journey begins");
    enterHub();
  });
}

function renderStarters(catalog) {
  const ids = catalog.starters();
  const grid = $("#starter-grid");
  grid.innerHTML = ids
    .map((id) => {
      const pet = catalog.speciesById(id);
      return `
      <button class="starter ${selectedStarter === id ? "selected" : ""}" data-id="${id}">
        ${avatarHtml(pet)}
        <strong>${escapeHtml(pet.display_name)}</strong>
        <small>${escapeHtml(pet.element.display_name)}</small>
      </button>`;
    })
    .join("");

  grid.querySelectorAll(".starter").forEach((btn) => {
    btn.onclick = () => {
      selectedStarter = Number(btn.dataset.id);
      renderStarters(catalog);
      $("#btn-begin").disabled = false;
    };
  });
}

export function startTitleOrb(catalog) {
  const glyphs = catalog.species.filter((p) => p.stage === 3);
  let gi = 0;
  const orb = $("#title-orb");
  const glyph = $("#title-glyph");
  setInterval(() => {
    gi = (gi + 1) % glyphs.length;
    glyph.textContent = glyphs[gi].glyph;
    orb.style.setProperty("--orb-hue", glyphs[gi].hue);
  }, 3200);
}
