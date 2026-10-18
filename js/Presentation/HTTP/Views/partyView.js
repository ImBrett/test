import { AppEvents } from "../../../Application/Events/AppEvents.js";
import { $, escapeHtml, avatarHtml, toast } from "./dom.js";

export function createPartyView(ctx) {
  function gearSlotsMeta() {
    return (
      ctx.state.gearSlots || [
        { id: "weapon", label: "Weapon", glyph: "⚔" },
        { id: "accessory", label: "Accessory", glyph: "✦" },
        { id: "helmet", label: "Helmet", glyph: "◈" },
        { id: "chestplate", label: "Chestplate", glyph: "▣" },
        { id: "gloves", label: "Gloves", glyph: "⬡" },
        { id: "boots", label: "Boots", glyph: "⊿" },
      ]
    );
  }

  function formatGearStat(stat) {
    if (!stat) return "";
    return `<span style="color:${stat.color}">${escapeHtml(stat.name)}</span> +${stat.value}${
      stat.level ? ` · L${stat.level}` : ""
    }`;
  }

  function render() {
    ctx.paint();
    const grid = $("#party-grid");
    if (!ctx.state.party.length) {
      grid.innerHTML = `<div class="empty">No beasts yet. Explore the wilds!</div>`;
      return;
    }
    grid.innerHTML = ctx.state.party
      .map(
        (p) => `
      <div class="pet-card ${p.id === ctx.state.activeCreatureId ? "active" : ""}">
        <button class="pet-card-main" data-detail="${p.id}">
          ${avatarHtml(p.species)}
          <div class="pet-meta">
            <strong>${escapeHtml(p.nickname)}</strong>
            <small>${escapeHtml(p.species.name)} · ${escapeHtml(p.species.stageName || `Stage ${p.species.stage}`)}</small>
          </div>
          <div class="power-chip">Lv.${p.level}</div>
        </button>
        <button class="btn btn-secondary btn-sm pet-evolve-btn" data-evolve-open="${p.id}">
          Evolve
        </button>
      </div>`
      )
      .join("");
    grid.querySelectorAll("[data-detail]").forEach((btn) => {
      btn.onclick = () => openDetail(Number(btn.dataset.detail));
    });
    grid.querySelectorAll("[data-evolve-open]").forEach((btn) => {
      btn.onclick = (e) => {
        e.stopPropagation();
        ctx.openEvolve(Number(btn.dataset.evolveOpen));
      };
    });
  }

  function openGearPiece(creatureId, gearId) {
    const piece = (ctx.state.gear || []).find((g) => g.id === gearId);
    if (!piece) return;
    const sheet = $("#detail-sheet");
    const body = $("#detail-body");
    const changers =
      (ctx.state.inventory || []).find((i) => i.code === "substat_changer")?.quantity || 0;
    const coins = ctx.state.player?.resources?.coins ?? 0;
    const canReforge = coins >= piece.reforgeCost;
    body.innerHTML = `
      <div class="sheet-handle"></div>
      <div class="detail-hero">
        <div class="gear-glyph rarity-${escapeHtml(piece.rarity)}">${escapeHtml(piece.glyph)}</div>
        <h2>${escapeHtml(piece.displayName)}</h2>
        <p>${escapeHtml(piece.rarityLabel)} · ${escapeHtml(piece.slotLabel)}</p>
      </div>
      <div class="gear-stat-block">
        <div class="gear-stat main">${formatGearStat(piece.mainStat)} <em>main</em></div>
        ${
          piece.fixedSubStat
            ? `<div class="gear-stat fixed">${formatGearStat(piece.fixedSubStat)} <em>fixed</em></div>`
            : ""
        }
        ${(piece.subStats || [])
          .map(
            (s, i) => `
          <div class="gear-stat sub">
            ${formatGearStat(s)}
            ${
              changers > 0
                ? `<button class="btn btn-ghost btn-sm" data-change-sub="${i}">Change</button>`
                : ""
            }
          </div>`
          )
          .join("")}
        ${
          !(piece.subStats || []).length
            ? `<p class="muted">No random substats yet — reforge to add (up to 4).</p>`
            : ""
        }
      </div>
      <div class="action-row">
        <button class="btn btn-primary ${canReforge ? "" : "disabled"}" id="btn-reforge"
          ${canReforge ? "" : "disabled"}>
          Reforge · ${piece.reforgeCost}🪙
        </button>
        ${
          piece.equippedCreatureId
            ? `<button class="btn btn-secondary" id="btn-unequip">Unequip</button>`
            : creatureId
              ? `<button class="btn btn-secondary" id="btn-equip-here">Equip</button>`
              : ""
        }
        <button class="btn btn-secondary wide" id="btn-gear-back">Back</button>
      </div>
      ${changers ? `<p class="muted">Substat Changers ×${changers}</p>` : ""}`;

    $("#btn-reforge").onclick = async () => {
      const res = await ctx.dispatch(AppEvents.REFORGE_GEAR, { gearId });
      if (!res?.ok) return;
      const r = res.data.reforge;
      toast(
        r.outcome === "added"
          ? `New substat: ${r.changed.code.replace(/_/g, " ")}`
          : `Upgraded ${r.changed.code.replace(/_/g, " ")} → L${r.changed.level}`
      );
      openGearPiece(creatureId, gearId);
    };
    $("#btn-unequip")?.addEventListener("click", async () => {
      const res = await ctx.dispatch(AppEvents.UNEQUIP_GEAR, { gearId });
      if (!res?.ok) return;
      toast("Unequipped");
      if (creatureId) openDetail(creatureId);
      else sheet.classList.remove("open");
    });
    $("#btn-equip-here")?.addEventListener("click", async () => {
      const res = await ctx.dispatch(AppEvents.EQUIP_GEAR, { gearId, creatureId });
      if (!res?.ok) return;
      toast("Equipped");
      openDetail(creatureId);
    });
    body.querySelectorAll("[data-change-sub]").forEach((btn) => {
      btn.onclick = async () => {
        if (!confirm("Spend 1 Substat Changer to reroll this line?")) return;
        const res = await ctx.dispatch(AppEvents.CHANGE_GEAR_SUBSTAT, {
          gearId,
          subIndex: Number(btn.dataset.changeSub),
        });
        if (!res?.ok) return;
        const c = res.data.change.changed;
        toast(`Substat → ${c.name || c.code}`);
        openGearPiece(creatureId, gearId);
      };
    });
    $("#btn-gear-back").onclick = () => {
      if (creatureId) openDetail(creatureId);
      else sheet.classList.remove("open");
    };
    sheet.classList.add("open");
  }

  function openSlotPicker(creatureId, slot) {
    const stash = (ctx.state.gear || []).filter(
      (g) => g.slot === slot && (!g.equippedCreatureId || g.equippedCreatureId === creatureId)
    );
    const sheet = $("#detail-sheet");
    const body = $("#detail-body");
    const slotMeta = gearSlotsMeta().find((s) => s.id === slot);
    body.innerHTML = `
      <div class="sheet-handle"></div>
      <div class="detail-hero">
        <h2>${escapeHtml(slotMeta?.label || slot)}</h2>
        <p>Choose a piece to equip</p>
      </div>
      <div class="gear-pick-list">
        ${
          stash.length
            ? stash
                .map(
                  (g) => `
            <button class="gear-pick" data-gear="${g.id}">
              <strong class="rarity-${escapeHtml(g.rarity)}">${escapeHtml(g.displayName)}</strong>
              <small>${formatGearStat(g.mainStat)}</small>
            </button>`
                )
                .join("")
            : `<div class="empty">No ${escapeHtml(slotMeta?.label || slot)} in stash. Buy a chest in the Shop.</div>`
        }
      </div>
      <div class="action-row">
        <button class="btn btn-secondary wide" id="btn-slot-back">Back</button>
      </div>`;
    body.querySelectorAll("[data-gear]").forEach((btn) => {
      btn.onclick = async () => {
        const gearId = Number(btn.dataset.gear);
        const piece = stash.find((g) => g.id === gearId);
        if (piece?.equippedCreatureId === creatureId) {
          openGearPiece(creatureId, gearId);
          return;
        }
        const res = await ctx.dispatch(AppEvents.EQUIP_GEAR, { gearId, creatureId });
        if (!res?.ok) return;
        toast("Equipped");
        openDetail(creatureId);
      };
    });
    $("#btn-slot-back").onclick = () => openDetail(creatureId);
    sheet.classList.add("open");
  }

  function openDetail(id) {
    const p = ctx.state.party.find((c) => c.id === id);
    if (!p) return;
    const sheet = $("#detail-sheet");
    const body = $("#detail-body");
    const xpLine =
      p.xpToNext > 0
        ? `Lv.${p.level} · ${p.experience}/${p.xpToNext} XP`
        : `Lv.${p.level} · MAX`;
    const bonuses = p.gearBonuses || {};
    body.innerHTML = `
      <div class="sheet-handle"></div>
      <div class="detail-hero">
        ${avatarHtml(p.species)}
        <h2>${escapeHtml(p.nickname)}</h2>
        <p>${escapeHtml(p.species.name)} · ${escapeHtml(xpLine)}</p>
        <p>${escapeHtml(p.species.blurb)}</p>
      </div>
      <div class="gear-grid">
        ${gearSlotsMeta()
          .map((slot) => {
            const piece = p.equippedGear?.[slot.id];
            return `
            <button class="gear-slot ${piece ? "filled rarity-" + escapeHtml(piece.rarity) : "empty"}"
              data-slot="${slot.id}" data-gear="${piece?.id || ""}">
              <span class="gear-slot-glyph">${escapeHtml(piece?.glyph || slot.glyph)}</span>
              <span class="gear-slot-label">${escapeHtml(slot.label)}</span>
              <span class="gear-slot-main">${
                piece
                  ? `+${piece.mainStat.value} ${escapeHtml(piece.mainStat.name)}`
                  : "Empty"
              }</span>
            </button>`;
          })
          .join("")}
      </div>
      <div class="stat-list plain-stats">
        ${p.stats
          .map((s) => {
            const bonus = bonuses[s.code] || 0;
            return `
          <div class="stat-row compact">
            <div class="name" style="color:${s.color}">${s.name}</div>
            <div class="val">${s.value}${bonus ? ` <small class="gear-bonus">+${bonus}</small>` : ""}</div>
          </div>`;
          })
          .join("")}
      </div>
      <div class="action-row">
        <button class="btn btn-secondary" id="btn-set-active">Set Active</button>
        <button class="btn btn-secondary" id="btn-rename">Rename</button>
        <button class="btn btn-primary" id="btn-detail-evolve">Evolve</button>
        <button class="btn btn-secondary wide" id="btn-close-detail">Close</button>
      </div>`;
    body.querySelectorAll("[data-slot]").forEach((btn) => {
      btn.onclick = () => {
        const gearId = Number(btn.dataset.gear);
        if (gearId) openGearPiece(id, gearId);
        else openSlotPicker(id, btn.dataset.slot);
      };
    });
    $("#btn-set-active").onclick = async () => {
      await ctx.dispatch(AppEvents.SET_ACTIVE_CREATURE, { creatureId: id });
      toast(`${p.nickname} leads the party`);
      sheet.classList.remove("open");
      render();
    };
    $("#btn-rename").onclick = async () => {
      const name = prompt("Nickname", p.nickname);
      if (name != null) {
        await ctx.dispatch(AppEvents.RENAME_CREATURE, { creatureId: id, nickname: name });
        openDetail(id);
        render();
      }
    };
    $("#btn-detail-evolve").onclick = () => {
      sheet.classList.remove("open");
      ctx.openEvolve(id);
    };
    $("#btn-close-detail").onclick = () => sheet.classList.remove("open");
    sheet.classList.add("open");
  }

  return { render };
}
