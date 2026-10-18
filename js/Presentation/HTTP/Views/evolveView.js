import { AppEvents } from "../../../Application/Events/AppEvents.js";
import { $, escapeHtml, avatarHtml, toast } from "./dom.js";

export function createEvolveView(ctx) {
  let evolveTargetId = null;

  function renderTreeNode(node, depth = 0) {
    if (!node) return "";
    const cls = [
      "evo-node",
      node.isCurrent ? "current" : "",
      node.onLineage ? "on-lineage" : "",
    ]
      .filter(Boolean)
      .join(" ");
    const kids = (node.branches || [])
      .map(
        (b) => `
        <div class="evo-branch">
          <div class="evo-branch-label">${escapeHtml(b.label || "")}</div>
          ${renderTreeNode(b.node, depth + 1)}
        </div>`
      )
      .join("");
    return `
      <div class="${cls}" style="--depth:${depth}">
        <div class="evo-node-card">
          ${avatarHtml(node)}
          <strong>${escapeHtml(node.name)}</strong>
          <small>${escapeHtml(node.stageName)}</small>
        </div>
        ${kids ? `<div class="evo-children">${kids}</div>` : ""}
      </div>`;
  }

  function render() {
    ctx.paint();
    const list = $("#evo-list");
    const p = ctx.state.party.find((c) => c.id === evolveTargetId) || ctx.state.party[0];
    if (!p) {
      list.innerHTML = `<div class="empty">No beasts to evolve yet.</div>`;
      return;
    }
    evolveTargetId = p.id;
    const evo = p.evolution;
    const lineageTrail = (evo.lineageSpecies || [])
      .map((s) => `${s.glyph} ${s.name}`)
      .join(" → ");
    const branchesHtml = (evo.branches || [])
      .map((b) => {
        const reqs = (b.requirements || [])
          .map(
            (r) => `
            <div class="req ${r.met ? "met" : ""}">
              <span>${escapeHtml(r.label)}</span>
              <span>${r.have} / ${r.needed}</span>
            </div>`
          )
          .join("");
        return `
          <div class="branch-card ${b.ready ? "ready" : ""}">
            <div class="branch-head">
              ${avatarHtml(b.next)}
              <div>
                <strong>${escapeHtml(b.next.name)}</strong>
                <small>${escapeHtml(b.label || "")} · ${escapeHtml(b.next.stageName)}</small>
              </div>
            </div>
            <div class="req-list">${reqs}</div>
            <button class="btn ${b.ready ? "btn-primary" : "btn-secondary"} wide"
              data-evolve="${p.id}" data-path="${b.pathId}" ${b.ready ? "" : "disabled"}>
              ${b.ready ? `Evolve → ${escapeHtml(b.next.name)}` : "Requirements unmet"}
            </button>
          </div>`;
      })
      .join("");

    list.innerHTML = `
      <div class="evo-card ${evo.ready ? "ready" : ""}">
        <div class="evo-card-head">
          ${avatarHtml(p.species)}
          <div>
            <strong>${escapeHtml(p.nickname)}</strong>
            <small>Lv.${p.level} · ${escapeHtml(p.species.stageName)} · ${escapeHtml(p.species.name)}</small>
          </div>
        </div>
        <div class="lineage-trail">${escapeHtml(lineageTrail || p.species.name)}</div>
        ${
          evo.branches?.length
            ? `<h3 class="evo-subhead">Branches</h3><div class="branch-grid">${branchesHtml}</div>`
            : `<p class="empty" style="padding:12px 0">Apex form — no further evolutions.</p>`
        }
        ${
          evo.canDevolve
            ? `<button class="btn btn-danger wide" data-devolve="${p.id}" style="margin-top:12px">
                Devolve → ${escapeHtml(evo.ancestor.name)}
                <small style="display:block;font-weight:500;opacity:.8">Resets stats to ${escapeHtml(evo.ancestor.name)} base</small>
              </button>`
            : ""
        }
        <h3 class="evo-subhead">Evolution tree</h3>
        <div class="evo-tree" aria-label="Evolution chain">
          ${renderTreeNode(evo.tree)}
        </div>
      </div>`;

    list.querySelectorAll("[data-evolve]").forEach((btn) => {
      btn.onclick = async () => {
        const res = await ctx.dispatch(AppEvents.EVOLVE_CREATURE, {
          creatureId: Number(btn.dataset.evolve),
          pathId: Number(btn.dataset.path),
        });
        if (res?.ok) {
          toast(`${res.data.evolution.from} → ${res.data.evolution.to}!`);
          render();
        }
      };
    });
    list.querySelectorAll("[data-devolve]").forEach((btn) => {
      btn.onclick = async () => {
        const pet = ctx.state.party.find((x) => x.id === Number(btn.dataset.devolve));
        const okConfirm = confirm(
          `Devolve ${pet?.nickname} to ${pet?.evolution.ancestor.name}? Stats reset to base.`
        );
        if (!okConfirm) return;
        const res = await ctx.dispatch(AppEvents.DEVOLVE_CREATURE, {
          creatureId: Number(btn.dataset.devolve),
        });
        if (res?.ok) {
          toast(`${res.data.devolution.from} → ${res.data.devolution.to} (stats reset)`);
          render();
        }
      };
    });
  }

  function open(creatureId) {
    evolveTargetId = creatureId;
    render();
    ctx.showScreen("screen-evolve");
  }

  return { render, open };
}
