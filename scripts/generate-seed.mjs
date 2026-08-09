/** Regenerate seed.sql from js/Infrastructure/Catalog/seedData.js */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seed = await import(pathToFileURL(path.join(root, "js/Infrastructure/Catalog/seedData.js")).href);

const q = (v) => (v == null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
const now = "datetime('now')";

const lines = [];
lines.push("-- Auto-generated from js/Infrastructure/Catalog/seedData.js");
lines.push("-- Run: node scripts/generate-seed.mjs");
lines.push("PRAGMA foreign_keys = ON;");
lines.push("");

lines.push("INSERT INTO rarities (id, code, display_name, sort_order) VALUES");
lines.push(
  seed.rarities.map((r) => `  (${r.id}, ${q(r.code)}, ${q(r.display_name)}, ${r.sort_order})`).join(",\n") + ";"
);
lines.push("");

lines.push("INSERT INTO elements (id, code, display_name, hue, created_at, updated_at) VALUES");
lines.push(
  seed.elements.map((e) => `  (${e.id}, ${q(e.code)}, ${q(e.display_name)}, ${e.hue}, ${now}, ${now})`).join(",\n") + ";"
);
lines.push("");

lines.push("INSERT INTO element_matchups (attacker_element_id, defender_element_id, multiplier) VALUES");
lines.push(
  seed.elementMatchups
    .map((m) => `  (${m.attacker_element_id}, ${m.defender_element_id}, ${m.multiplier})`)
    .join(",\n") + ";"
);
lines.push("");

lines.push("INSERT INTO stats (id, code, display_name, description, color, combat_role, created_at, updated_at) VALUES");
lines.push(
  seed.stats
    .map(
      (s) =>
        `  (${s.id}, ${q(s.code)}, ${q(s.display_name)}, ${q(s.description)}, ${q(s.color)}, ${q(s.combat_role)}, ${now}, ${now})`
    )
    .join(",\n") + ";"
);
lines.push("");

lines.push("INSERT INTO items (id, code, display_name, description, item_kind, effect_payload, rarity_id, stackable, created_at, updated_at) VALUES");
lines.push(
  seed.items
    .map(
      (i) =>
        `  (${i.id}, ${q(i.code)}, ${q(i.display_name)}, ${q(i.description)}, ${q(i.item_kind)}, ${q(JSON.stringify(i.effect_payload || {}))}, ${i.rarity_id}, ${i.stackable}, ${now}, ${now})`
    )
    .join(",\n") + ";"
);
lines.push("");

lines.push("INSERT INTO species (id, code, display_name, blurb, glyph, element_id, stage, rarity_id, is_starter, base_scan_gain, created_at, updated_at) VALUES");
lines.push(
  seed.species
    .map(
      (s) =>
        `  (${s.id}, ${q(s.code)}, ${q(s.display_name)}, ${q(s.blurb)}, ${q(s.glyph)}, ${s.element_id}, ${s.stage}, ${s.rarity_id}, ${s.is_starter}, ${s.base_scan_gain}, ${now}, ${now})`
    )
    .join(",\n") + ";"
);
lines.push("");

lines.push("INSERT INTO species_base_stats (id, species_id, stat_id, value) VALUES");
lines.push(
  seed.speciesBaseStats.map((r) => `  (${r.id}, ${r.species_id}, ${r.stat_id}, ${r.value})`).join(",\n") + ";"
);
lines.push("");

lines.push("INSERT INTO moves (id, code, display_name, description, element_id, effect_kind, power, accuracy, energy_cost, effect_payload, created_at, updated_at) VALUES");
lines.push(
  seed.moves
    .map(
      (m) =>
        `  (${m.id}, ${q(m.code)}, ${q(m.display_name)}, ${q(m.description)}, ${m.element_id == null ? "NULL" : m.element_id}, ${q(m.effect_kind)}, ${m.power}, ${m.accuracy}, ${m.energy_cost}, ${q(JSON.stringify(m.effect_payload || {}))}, ${now}, ${now})`
    )
    .join(",\n") + ";"
);
lines.push("");

lines.push("INSERT INTO species_moves (id, species_id, move_id, unlock_stage, slot) VALUES");
lines.push(
  seed.speciesMoves
    .map((r) => `  (${r.id}, ${r.species_id}, ${r.move_id}, ${r.unlock_stage}, ${r.slot})`)
    .join(",\n") + ";"
);
lines.push("");

lines.push("INSERT INTO evolution_paths (id, ancestor_species_id, descendant_species_id, branch_index, label, sort_order) VALUES");
lines.push(
  seed.evolutionPaths
    .map(
      (p) =>
        `  (${p.id}, ${p.ancestor_species_id}, ${p.descendant_species_id}, ${p.branch_index}, ${q(p.label)}, ${p.sort_order})`
    )
    .join(",\n") + ";"
);
lines.push("");

lines.push("INSERT INTO evolution_requirements (id, evolution_path_id, requirement_kind, stat_id, item_id, threshold_value) VALUES");
lines.push(
  seed.evolutionRequirements
    .map(
      (r) =>
        `  (${r.id}, ${r.evolution_path_id}, ${q(r.requirement_kind)}, ${r.stat_id == null ? "NULL" : r.stat_id}, ${r.item_id == null ? "NULL" : r.item_id}, ${r.threshold_value})`
    )
    .join(",\n") + ";"
);
lines.push("");

lines.push("INSERT INTO zones (id, code, display_name, vibe, energy_cost, min_player_level, created_at, updated_at) VALUES");
lines.push(
  seed.zones
    .map(
      (z) =>
        `  (${z.id}, ${q(z.code)}, ${q(z.display_name)}, ${q(z.vibe)}, ${z.energy_cost}, ${z.min_player_level}, ${now}, ${now})`
    )
    .join(",\n") + ";"
);
lines.push("");

lines.push("INSERT INTO zone_encounters (id, zone_id, species_id, weight, min_stage, max_stage, stat_variance_min, stat_variance_max) VALUES");
lines.push(
  seed.zoneEncounters
    .map(
      (e) =>
        `  (${e.id}, ${e.zone_id}, ${e.species_id}, ${e.weight}, ${e.min_stage}, ${e.max_stage}, ${e.stat_variance_min}, ${e.stat_variance_max})`
    )
    .join(",\n") + ";"
);
lines.push("");

lines.push("INSERT INTO training_drills (id, code, display_name, description, stat_id, energy_cost, base_gain, critical_chance, critical_bonus, coin_reward) VALUES");
lines.push(
  seed.trainingDrills
    .map(
      (d) =>
        `  (${d.id}, ${q(d.code)}, ${q(d.display_name)}, ${q(d.description)}, ${d.stat_id}, ${d.energy_cost}, ${d.base_gain}, ${d.critical_chance}, ${d.critical_bonus}, ${d.coin_reward})`
    )
    .join(",\n") + ";"
);
lines.push("");

fs.writeFileSync(path.join(root, "seed.sql"), lines.join("\n"));
console.log(`Wrote seed.sql (${seed.species.length} species, ${seed.zones.length} zones)`);
