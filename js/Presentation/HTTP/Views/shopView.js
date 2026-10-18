import { AppEvents } from "../../../Application/Events/AppEvents.js";
import { $, escapeHtml, avatarHtml, toast } from "./dom.js";

export function createShopView(ctx) {
  let shopTargetId = null;
  let shopCategory = "training";

  function render() {
    ctx.paint();
    const tabs = $("#shop-tabs");
    const pick = $("#shop-pick");
    const list = $("#shop-list");
    const categories = ctx.state.shopCategories?.length
      ? ctx.state.shopCategories
      : [
          { id: "training", label: "Training" },
          { id: "items", label: "Items" },
          { id: "equipment", label: "Equipment" },
        ];
    if (!categories.some((c) => c.id === shopCategory)) shopCategory = categories[0].id;

    tabs.innerHTML = categories
      .map(
        (c) => `
      <button class="shop-tab ${c.id === shopCategory ? "active" : ""}" data-cat="${c.id}">
        ${escapeHtml(c.label)}
      </button>`
      )
      .join("");
    tabs.querySelectorAll("[data-cat]").forEach((btn) => {
      btn.onclick = () => {
        shopCategory = btn.dataset.cat;
        render();
      };
    });

    const needsTarget = shopCategory === "training";
    if (needsTarget) {
      if (!ctx.state.party.length) {
        pick.innerHTML = "";
        list.innerHTML = `<div class="empty">Claim a beast from Scan before buying training boosts.</div>`;
        return;
      }
      if (!shopTargetId || !ctx.state.party.find((p) => p.id === shopTargetId)) {
        shopTargetId = ctx.state.activeCreatureId || ctx.state.party[0].id;
      }
      pick.innerHTML = ctx.state.party
        .map(
          (p) => `
        <button class="train-chip ${p.id === shopTargetId ? "selected" : ""}" data-id="${p.id}">
          ${avatarHtml(p.species)}
          <span>${escapeHtml(p.nickname)} · Lv.${p.level}</span>
        </button>`
        )
        .join("");
      pick.querySelectorAll(".train-chip").forEach((btn) => {
        btn.onclick = () => {
          shopTargetId = Number(btn.dataset.id);
          render();
        };
      });
    } else {
      pick.innerHTML = "";
    }

    const pet = ctx.state.party.find((p) => p.id === shopTargetId);
    const coins = ctx.state.player?.resources?.coins ?? 0;
    const listings = (ctx.state.shop || []).filter((i) => i.category === shopCategory);
    if (!listings.length) {
      list.innerHTML = `<div class="empty">Nothing in this aisle yet.</div>`;
      return;
    }
    list.innerHTML = listings
      .map((item) => {
        const stat = pet?.stats?.find((s) => s.statId === item.statId);
        const locked = item.available === false;
        const afford = !locked && coins >= item.price;
        return `
        <button class="shop-item ${afford ? "" : "disabled"}" data-item="${item.itemId}"
          ${afford ? "" : "disabled"}>
          <div>
            <strong>${escapeHtml(item.name)}</strong>
            <small>${escapeHtml(item.description)}${
              shopCategory === "training" && stat ? ` · now ${stat.value}` : ""
            }${locked ? " · Coming soon" : ""}</small>
          </div>
          <div class="shop-price">${locked ? "—" : item.price}</div>
        </button>`;
      })
      .join("");
    list.querySelectorAll("[data-item]").forEach((btn) => {
      btn.onclick = async () => {
        const res = await ctx.dispatch(AppEvents.BUY_SHOP_ITEM, {
          itemId: Number(btn.dataset.item),
          creatureId: shopCategory === "training" ? shopTargetId : null,
        });
        if (!res?.ok) return;
        const p = res.data.purchase;
        if (p.kind === "training") {
          toast(`+${p.gain} ${p.stat?.display_name || p.stat?.name || "stat"}`);
        } else if (p.kind === "gear_chest" && p.gear) {
          toast(`Opened ${p.gear.displayName}`);
        } else if (p.kind === "gear_tool") {
          toast(`Bought ${p.name}`);
        } else if (p.kind === "items") {
          toast(`Bought ${p.name}`);
        }
        render();
      };
    });
  }

  return { render };
}
