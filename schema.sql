-- Morph — data-driven DDD schema (SQLite)
--
-- Bounded contexts
--   1. Catalog   — designer-owned content (species, moves, zones, rules)
--   2. Player    — traveler aggregate + owned creatures + inventory
--   3. Combat    — encounter / battle aggregates (runtime)
--   4. Ledger    — append-only domain events (audit / projections)
--
-- Catalog rows are the source of truth for behavior. Application code
-- interprets tables; it does not hardcode species stats, matchups,
-- evolution gates, or encounter tables.

PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS domain_events;
DROP TABLE IF EXISTS battle_actions;
DROP TABLE IF EXISTS battle_participants;
DROP TABLE IF EXISTS battles;
DROP TABLE IF EXISTS player_species_scans;
DROP TABLE IF EXISTS player_gear;
DROP TABLE IF EXISTS player_inventory;
DROP TABLE IF EXISTS player_creature_moves;
DROP TABLE IF EXISTS player_creature_stats;
DROP TABLE IF EXISTS player_party_slots;
DROP TABLE IF EXISTS player_creatures;
DROP TABLE IF EXISTS player_resources;
DROP TABLE IF EXISTS players;

DROP TABLE IF EXISTS zone_encounters;
DROP TABLE IF EXISTS zones;
DROP TABLE IF EXISTS evolution_requirements;
DROP TABLE IF EXISTS evolution_paths;
DROP TABLE IF EXISTS species_moves;
DROP TABLE IF EXISTS moves;
DROP TABLE IF EXISTS species_base_stats;
DROP TABLE IF EXISTS species;
DROP TABLE IF EXISTS element_matchups;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS stats;
DROP TABLE IF EXISTS elements;
DROP TABLE IF EXISTS rarities;


-- =============================================================================
-- CATALOG CONTEXT
-- Aggregate roots: Species, Move, Zone, Item, EvolutionPath
-- =============================================================================

CREATE TABLE rarities (
  id INTEGER PRIMARY KEY NOT NULL,
  code VARCHAR(16) NOT NULL UNIQUE,          -- common | uncommon | rare | mythic
  display_name VARCHAR(32) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE elements (
  id INTEGER PRIMARY KEY NOT NULL,
  code VARCHAR(16) NOT NULL UNIQUE,          -- ignis | veil | aether | terra | umbral | radiance
  display_name VARCHAR(32) NOT NULL,
  hue INTEGER NOT NULL DEFAULT 140,          -- UI tint (data-driven presentation)
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- Type chart is fully data-driven (attacker vs defender multiplier).
CREATE TABLE element_matchups (
  id INTEGER PRIMARY KEY NOT NULL,
  attacker_element_id INTEGER NOT NULL,
  defender_element_id INTEGER NOT NULL,
  multiplier REAL NOT NULL DEFAULT 1.0,     -- 0.5 weak, 1.0 neutral, 1.5 / 2.0 strong
  FOREIGN KEY (attacker_element_id) REFERENCES elements(id),
  FOREIGN KEY (defender_element_id) REFERENCES elements(id),
  UNIQUE (attacker_element_id, defender_element_id)
);

CREATE TABLE stats (
  id INTEGER PRIMARY KEY NOT NULL,
  code VARCHAR(16) NOT NULL UNIQUE,          -- attack | health | speed | defense | mana | crit_chance | crit_damage | effectiveness | resilience
  display_name VARCHAR(32) NOT NULL,
  description VARCHAR(128) NOT NULL,
  color VARCHAR(16) NOT NULL,               -- UI token
  combat_role VARCHAR(16) NOT NULL,         -- offense | defense | speed | special | sustain | crit | status
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE items (
  id INTEGER PRIMARY KEY NOT NULL,
  code VARCHAR(32) NOT NULL UNIQUE,
  display_name VARCHAR(48) NOT NULL,
  description VARCHAR(160) NOT NULL,
  item_kind VARCHAR(24) NOT NULL,           -- consumable | evolution | currency_pack | equipment | gear_tool | stat_boost
  effect_payload TEXT NOT NULL DEFAULT '{}', -- JSON payload for item effects
  rarity_id INTEGER,
  stackable INTEGER NOT NULL DEFAULT 1 CHECK (stackable IN (0, 1)),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (rarity_id) REFERENCES rarities(id)
);

-- Species = catalog identity for a morphable beast (not a player's instance).
CREATE TABLE species (
  id INTEGER PRIMARY KEY NOT NULL,
  code VARCHAR(32) NOT NULL UNIQUE,
  display_name VARCHAR(32) NOT NULL UNIQUE,
  blurb VARCHAR(160) NOT NULL,
  glyph VARCHAR(8) NOT NULL,               -- presentation seed (emoji / icon key)
  element_id INTEGER NOT NULL,
  stage INTEGER NOT NULL CHECK (stage BETWEEN 1 AND 5), -- Hatchling→Fledgling→Mature→Ascendant→Apex
  rarity_id INTEGER NOT NULL,
  is_starter INTEGER NOT NULL DEFAULT 0 CHECK (is_starter IN (0, 1)),
  base_scan_gain REAL NOT NULL DEFAULT 20,  -- approx % filled per defeat (before variance)
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (element_id) REFERENCES elements(id),
  FOREIGN KEY (rarity_id) REFERENCES rarities(id)
);

CREATE TABLE species_base_stats (
  id INTEGER PRIMARY KEY NOT NULL,
  species_id INTEGER NOT NULL,
  stat_id INTEGER NOT NULL,
  value INTEGER NOT NULL CHECK (value >= 0),
  FOREIGN KEY (species_id) REFERENCES species(id),
  FOREIGN KEY (stat_id) REFERENCES stats(id),
  UNIQUE (species_id, stat_id)
);

-- Moves are catalog abilities; effect_kind + payload drive combat resolution.
CREATE TABLE moves (
  id INTEGER PRIMARY KEY NOT NULL,
  code VARCHAR(32) NOT NULL UNIQUE,
  display_name VARCHAR(48) NOT NULL,
  description VARCHAR(160) NOT NULL,
  element_id INTEGER,                       -- NULL = typeless
  effect_kind VARCHAR(24) NOT NULL,         -- strike | guard | burst | heal | buff | debuff
  power INTEGER NOT NULL DEFAULT 0,
  accuracy REAL NOT NULL DEFAULT 1.0 CHECK (accuracy > 0 AND accuracy <= 1),
  effect_payload TEXT NOT NULL DEFAULT '{}', -- JSON for multipliers, buff targets, etc.
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (element_id) REFERENCES elements(id)
);

CREATE TABLE species_moves (
  id INTEGER PRIMARY KEY NOT NULL,
  species_id INTEGER NOT NULL,
  move_id INTEGER NOT NULL,
  unlock_stage INTEGER NOT NULL DEFAULT 1 CHECK (unlock_stage BETWEEN 1 AND 5),
  slot INTEGER NOT NULL DEFAULT 1 CHECK (slot BETWEEN 1 AND 4),
  FOREIGN KEY (species_id) REFERENCES species(id),
  FOREIGN KEY (move_id) REFERENCES moves(id),
  UNIQUE (species_id, move_id),
  UNIQUE (species_id, slot)
);

-- Evolution path: ancestor → descendant (branching tree, Digimon-style).
-- Max 3 branches from any ancestor (enforced by branch_index + app checks).
CREATE TABLE evolution_paths (
  id INTEGER PRIMARY KEY NOT NULL,
  ancestor_species_id INTEGER NOT NULL,
  descendant_species_id INTEGER NOT NULL,
  branch_index INTEGER NOT NULL DEFAULT 1 CHECK (branch_index BETWEEN 1 AND 3),
  label VARCHAR(32),                         -- optional branch label (e.g. "Might path")
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (ancestor_species_id) REFERENCES species(id),
  FOREIGN KEY (descendant_species_id) REFERENCES species(id),
  UNIQUE (ancestor_species_id, descendant_species_id),
  UNIQUE (ancestor_species_id, branch_index)
);

-- Polymorphic, data-driven gates. Interpreter matches requirement_kind.
-- Examples:
--   kind=stat   → stat_id + threshold_value
--   kind=item   → item_id + quantity (threshold_value)
--   kind=level  → threshold_value only
--   kind=battles_won → threshold_value only
CREATE TABLE evolution_requirements (
  id INTEGER PRIMARY KEY NOT NULL,
  evolution_path_id INTEGER NOT NULL,
  requirement_kind VARCHAR(24) NOT NULL,    -- stat | item | level | battles_won
  stat_id INTEGER,
  item_id INTEGER,
  threshold_value INTEGER NOT NULL,
  FOREIGN KEY (evolution_path_id) REFERENCES evolution_paths(id),
  FOREIGN KEY (stat_id) REFERENCES stats(id),
  FOREIGN KEY (item_id) REFERENCES items(id),
  CHECK (
    (requirement_kind = 'stat' AND stat_id IS NOT NULL AND item_id IS NULL)
    OR (requirement_kind = 'item' AND item_id IS NOT NULL AND stat_id IS NULL)
    OR (requirement_kind IN ('level', 'battles_won') AND stat_id IS NULL AND item_id IS NULL)
  )
);

CREATE TABLE zones (
  id INTEGER PRIMARY KEY NOT NULL,
  code VARCHAR(32) NOT NULL UNIQUE,
  display_name VARCHAR(48) NOT NULL,
  vibe VARCHAR(160) NOT NULL,
  min_player_level INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- Weighted encounter table per zone (data-driven wild spawns).
CREATE TABLE zone_encounters (
  id INTEGER PRIMARY KEY NOT NULL,
  zone_id INTEGER NOT NULL,
  species_id INTEGER NOT NULL,
  weight INTEGER NOT NULL DEFAULT 10 CHECK (weight > 0),
  min_stage INTEGER NOT NULL DEFAULT 1,
  max_stage INTEGER NOT NULL DEFAULT 2,
  stat_variance_min REAL NOT NULL DEFAULT 0.75,
  stat_variance_max REAL NOT NULL DEFAULT 1.05,
  FOREIGN KEY (zone_id) REFERENCES zones(id),
  FOREIGN KEY (species_id) REFERENCES species(id),
  UNIQUE (zone_id, species_id),
  CHECK (min_stage <= max_stage)
);


-- =============================================================================
-- PLAYER CONTEXT
-- Aggregate root: Player
--   entities: PlayerCreature, inventory lines, party slots, resources
-- =============================================================================

CREATE TABLE players (
  id INTEGER PRIMARY KEY NOT NULL,
  name VARCHAR(32) NOT NULL UNIQUE,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  experience INTEGER NOT NULL DEFAULT 0 CHECK (experience >= 0),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- Wallet (coins).
CREATE TABLE player_resources (
  player_id INTEGER PRIMARY KEY NOT NULL,
  coins INTEGER NOT NULL DEFAULT 0 CHECK (coins >= 0),
  FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Owned creature instance (aggregate entity under Player).
CREATE TABLE player_creatures (
  id INTEGER PRIMARY KEY NOT NULL,
  player_id INTEGER NOT NULL,
  species_id INTEGER NOT NULL,
  nickname VARCHAR(32) NOT NULL,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 100),
  experience INTEGER NOT NULL DEFAULT 0 CHECK (experience >= 0),
  battles_won INTEGER NOT NULL DEFAULT 0 CHECK (battles_won >= 0),
  -- Ordered species ids from Hatchling root → current (JSON array). Used for chain UI + devolve.
  lineage_json TEXT NOT NULL DEFAULT '[]',
  obtained_at DATETIME NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 0 CHECK (is_active IN (0, 1)),
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (species_id) REFERENCES species(id)
);

-- Digimon-style scan data: defeat wilds to fill 0–100%, then claim from Scan UI (no catch items).
CREATE TABLE player_species_scans (
  id INTEGER PRIMARY KEY NOT NULL,
  player_id INTEGER NOT NULL,
  species_id INTEGER NOT NULL,
  scan_level INTEGER NOT NULL DEFAULT 0 CHECK (scan_level BETWEEN 0 AND 100),
  claimed INTEGER NOT NULL DEFAULT 0 CHECK (claimed IN (0, 1)),
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (species_id) REFERENCES species(id),
  UNIQUE (player_id, species_id)
);

CREATE INDEX idx_player_creatures_player ON player_creatures(player_id);
CREATE INDEX idx_player_creatures_active ON player_creatures(player_id, is_active);

CREATE TABLE player_creature_stats (
  id INTEGER PRIMARY KEY NOT NULL,
  player_creature_id INTEGER NOT NULL,
  stat_id INTEGER NOT NULL,
  value INTEGER NOT NULL CHECK (value >= 0),
  FOREIGN KEY (player_creature_id) REFERENCES player_creatures(id) ON DELETE CASCADE,
  FOREIGN KEY (stat_id) REFERENCES stats(id),
  UNIQUE (player_creature_id, stat_id)
);

CREATE TABLE player_creature_moves (
  id INTEGER PRIMARY KEY NOT NULL,
  player_creature_id INTEGER NOT NULL,
  move_id INTEGER NOT NULL,
  slot INTEGER NOT NULL CHECK (slot BETWEEN 1 AND 4),
  FOREIGN KEY (player_creature_id) REFERENCES player_creatures(id) ON DELETE CASCADE,
  FOREIGN KEY (move_id) REFERENCES moves(id),
  UNIQUE (player_creature_id, slot),
  UNIQUE (player_creature_id, move_id)
);

CREATE TABLE player_party_slots (
  id INTEGER PRIMARY KEY NOT NULL,
  player_id INTEGER NOT NULL,
  slot INTEGER NOT NULL CHECK (slot BETWEEN 1 AND 6),
  player_creature_id INTEGER,
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (player_creature_id) REFERENCES player_creatures(id),
  UNIQUE (player_id, slot)
);

CREATE TABLE player_inventory (
  id INTEGER PRIMARY KEY NOT NULL,
  player_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (item_id) REFERENCES items(id),
  UNIQUE (player_id, item_id)
);

-- Gear stash (Outerplane-style). Main/fixed values by rarity; up to 4 random subs.
CREATE TABLE player_gear (
  id INTEGER PRIMARY KEY NOT NULL,
  player_id INTEGER NOT NULL,
  slot VARCHAR(16) NOT NULL,                 -- weapon | accessory | helmet | chestplate | gloves | boots
  rarity VARCHAR(16) NOT NULL,               -- common | uncommon | rare | epic | legendary
  main_stat_code VARCHAR(16) NOT NULL,
  main_stat_value INTEGER NOT NULL CHECK (main_stat_value >= 0),
  fixed_sub_code VARCHAR(16),               -- gloves: defense; boots: health
  fixed_sub_value INTEGER,
  sub_stats_json TEXT NOT NULL DEFAULT '[]', -- [{code, value, level}] max 4
  reforge_count INTEGER NOT NULL DEFAULT 0,
  equipped_creature_id INTEGER,
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (equipped_creature_id) REFERENCES player_creatures(id)
);

CREATE INDEX idx_player_gear_player ON player_gear(player_id);
CREATE INDEX idx_player_gear_equipped ON player_gear(equipped_creature_id);


-- =============================================================================
-- COMBAT CONTEXT
-- Aggregate root: Battle
-- =============================================================================

CREATE TABLE battles (
  id INTEGER PRIMARY KEY NOT NULL,
  player_id INTEGER NOT NULL,
  zone_id INTEGER,
  status VARCHAR(16) NOT NULL DEFAULT 'active', -- active | won | lost | fled | caught
  seed INTEGER,                                  -- optional determinism
  started_at DATETIME NOT NULL,
  ended_at DATETIME,
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (zone_id) REFERENCES zones(id)
);

CREATE TABLE battle_participants (
  id INTEGER PRIMARY KEY NOT NULL,
  battle_id INTEGER NOT NULL,
  side VARCHAR(8) NOT NULL CHECK (side IN ('player', 'wild')),
  player_creature_id INTEGER,                    -- NULL for wild
  species_id INTEGER NOT NULL,
  nickname VARCHAR(32) NOT NULL,
  current_hp INTEGER NOT NULL,
  max_hp INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  snapshot_stats TEXT NOT NULL DEFAULT '{}',      -- JSON freeze of combat stats at start
  FOREIGN KEY (battle_id) REFERENCES battles(id) ON DELETE CASCADE,
  FOREIGN KEY (player_creature_id) REFERENCES player_creatures(id),
  FOREIGN KEY (species_id) REFERENCES species(id)
);

CREATE TABLE battle_actions (
  id INTEGER PRIMARY KEY NOT NULL,
  battle_id INTEGER NOT NULL,
  turn_number INTEGER NOT NULL,
  actor_participant_id INTEGER NOT NULL,
  target_participant_id INTEGER NOT NULL,
  move_id INTEGER,
  action_kind VARCHAR(24) NOT NULL,              -- move | flee | catch | item
  damage INTEGER NOT NULL DEFAULT 0,
  was_critical INTEGER NOT NULL DEFAULT 0 CHECK (was_critical IN (0, 1)),
  payload TEXT NOT NULL DEFAULT '{}',
  created_at DATETIME NOT NULL,
  FOREIGN KEY (battle_id) REFERENCES battles(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_participant_id) REFERENCES battle_participants(id),
  FOREIGN KEY (target_participant_id) REFERENCES battle_participants(id),
  FOREIGN KEY (move_id) REFERENCES moves(id)
);

CREATE INDEX idx_battles_player ON battles(player_id);
CREATE INDEX idx_battle_actions_battle ON battle_actions(battle_id, turn_number);


-- =============================================================================
-- LEDGER CONTEXT — domain events (append-only)
-- Lets projections / analytics stay decoupled from write models.
-- =============================================================================

CREATE TABLE domain_events (
  id INTEGER PRIMARY KEY NOT NULL,
  player_id INTEGER,
  aggregate_type VARCHAR(32) NOT NULL,           -- Player | PlayerCreature | Battle
  aggregate_id INTEGER NOT NULL,
  event_type VARCHAR(64) NOT NULL,               -- CreatureTrained | CreatureEvolved | BattleWon …
  event_version INTEGER NOT NULL DEFAULT 1,
  payload TEXT NOT NULL DEFAULT '{}',
  occurred_at DATETIME NOT NULL,
  FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE INDEX idx_domain_events_aggregate ON domain_events(aggregate_type, aggregate_id);
CREATE INDEX idx_domain_events_player ON domain_events(player_id, occurred_at);
