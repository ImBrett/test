import { $, escapeHtml, toast } from "./dom.js";

export function createExploreView(ctx) {
  function levelBand(zone) {
    if (zone.minLevel === zone.maxLevel) return `Lv ${zone.minLevel}`;
    return `Lv ${zone.minLevel}–${zone.maxLevel}`;
  }

  function render() {
    ctx.paint();
    const zones = ctx.state.zones || [];
    const regions = [];
    for (const zone of zones) {
      let region = regions.find((r) => r.code === zone.region);
      if (!region) {
        region = { code: zone.region, name: zone.regionName, zones: [] };
        regions.push(region);
      }
      region.zones.push(zone);
    }

    $("#zone-list").innerHTML = regions
      .map(
        (region) => `
      <section class="region-block">
        <h2>${escapeHtml(region.name)}</h2>
        ${region.zones
          .map((z) => {
            const who = (z.species || []).join(", ");
            const locked = !z.unlocked;
            const status = locked ? "Locked" : z.cleared ? "Clear" : "Open";
            const statusClass = locked ? "hold" : z.cleared ? "stable" : "";
            return `
          <button class="zone-card ${locked ? "locked" : ""} ${z.isBoss ? "boss" : ""} ${
            z.cleared ? "cleared" : ""
          }" data-zone="${escapeHtml(z.code)}" ${locked ? "disabled" : ""}>
            <span class="zone-label">${escapeHtml(z.label)}</span>
            <span class="zone-main">
              <h3>${escapeHtml(z.name)}</h3>
              <p>${escapeHtml(z.vibe)}${locked ? " · Clear the previous area" : ""}</p>
            </span>
            <span class="cost">${escapeHtml(levelBand(z))}</span>
            <span class="zone-who">${escapeHtml(who)}</span>
            <span class="status ${statusClass}${z.isBoss ? " boss" : ""}">${
              z.isBoss ? "Boss" : status
            }</span>
          </button>`;
          })
          .join("")}
      </section>`
      )
      .join("");

    $("#zone-list").querySelectorAll(".zone-card").forEach((btn) => {
      btn.onclick = async () => {
        if (btn.disabled) {
          toast("Clear the previous area first");
          return;
        }
        await ctx.enterZone(btn.dataset.zone);
      };
    });
  }

  return { render };
}
