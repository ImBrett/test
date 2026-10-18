import { $, escapeHtml } from "./dom.js";

export function createBagView(ctx) {
  function ownerLabel(creatureId) {
    if (!creatureId) return "In stash";
    const pet = (ctx.state.party || []).find((p) => p.id === creatureId);
    return pet ? `Equipped on ${pet.nickname}` : "Equipped";
  }

  function render() {
    ctx.paint();
    const items = (ctx.state.inventory || []).filter((i) => i.quantity > 0);
    const gear = ctx.state.gear || [];
    const slots = ctx.state.gearSlots || [];
    const gearHtml = slots
      .map((slot) => {
        const pieces = gear.filter((g) => g.slot === slot.id);
        return `
        <section class="bag-group">
          <h3>${escapeHtml(slot.glyph)} ${escapeHtml(slot.label)}</h3>
          ${
            pieces.length
              ? pieces
                  .map(
                    (g) => `
              <div class="bag-row">
                <strong class="rarity-${escapeHtml(g.rarity)}">${escapeHtml(g.displayName)}</strong>
                <small>${escapeHtml(g.rarityLabel)} · ${escapeHtml(g.mainStat?.name || "Stat")} +${
                  g.mainStat?.value ?? 0
                }</small>
                <em>${escapeHtml(ownerLabel(g.equippedCreatureId))}</em>
              </div>`
                  )
                  .join("")
              : `<p class="muted">None</p>`
          }
        </section>`;
      })
      .join("");

    $("#bag-root").innerHTML = `
      <section class="bag-section">
        <h2>Items</h2>
        ${
          items.length
            ? items
                .map(
                  (item) => `
            <div class="bag-row">
              <strong>${escapeHtml(item.name)} ×${item.quantity}</strong>
              <small>${escapeHtml(item.description || item.kind)}</small>
            </div>`
                )
                .join("")
            : `<p class="muted">No items yet. The Shop sells salves and tools.</p>`
        }
      </section>
      <section class="bag-section">
        <h2>Equipment</h2>
        <p class="muted bag-note">Equip and reforge from a beast on the Party screen.</p>
        ${gear.length ? gearHtml : `<p class="muted">No gear yet. Buy a chest in the Shop.</p>`}
      </section>`;
  }

  return { render };
}
