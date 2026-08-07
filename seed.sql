-- Morph content pack — seed catalog (data-driven)
-- Apply after schema.sql

BEGIN TRANSACTION;

INSERT INTO rarities (id, code, display_name, sort_order) VALUES
  (1, 'common',   'Common',   1),
  (2, 'uncommon', 'Uncommon', 2),
  (3, 'rare',     'Rare',     3),
  (4, 'mythic',   'Mythic',   4);

INSERT INTO elements (id, code, display_name, hue, created_at, updated_at) VALUES
  (1, 'ember', 'Ember', 18,  datetime('now'), datetime('now')),
  (2, 'tide',  'Tide',  198, datetime('now'), datetime('now')),
  (3, 'gale',  'Gale',  160, datetime('now'), datetime('now')),
  (4, 'stone', 'Stone', 35,  datetime('now'), datetime('now')),
  (5, 'shade', 'Shade', 265, datetime('now'), datetime('now')),
  (6, 'bloom', 'Bloom', 130, datetime('now'), datetime('now'));

-- Matchup chart (attacker, defender, multiplier) — only non-neutral rows stored
INSERT INTO element_matchups (attacker_element_id, defender_element_id, multiplier) VALUES
  (1, 4, 1.5), (1, 6, 1.5), (1, 2, 0.5),
  (2, 1, 1.5), (2, 4, 1.5), (2, 6, 0.5),
  (3, 6, 1.5), (3, 5, 1.5), (3, 4, 0.5),
  (4, 3, 1.5), (4, 1, 0.5), (4, 5, 1.5),
  (5, 3, 0.5), (5, 6, 1.5), (5, 5, 0.5),
  (6, 2, 1.5), (6, 4, 0.5), (6, 1, 0.5);

INSERT INTO stats (id, code, display_name, description, color, combat_role, created_at, updated_at) VALUES
  (1, 'might',  'Might',  'Raw strike power',      '#E85D4C', 'offense',  datetime('now'), datetime('now')),
  (2, 'vital',  'Vital',  'Health & recovery',     '#3DBE8B', 'sustain',  datetime('now'), datetime('now')),
  (3, 'swift',  'Swift',  'Speed & crit chance',   '#4DB8E8', 'speed',    datetime('now'), datetime('now')),
  (4, 'guard',  'Guard',  'Damage reduction',      '#C4A35A', 'defense',  datetime('now'), datetime('now')),
  (5, 'spirit', 'Spirit', 'Special force',         '#5EC8C0', 'special',  datetime('now'), datetime('now'));

INSERT INTO items (id, code, display_name, description, item_kind, effect_payload, rarity_id, stackable, created_at, updated_at) VALUES
  (1, 'morph_orb',    'Morph Orb',    'Used to catch wild beasts.',           'catch',       '{"catch_bonus":0.15}', 1, 1, datetime('now'), datetime('now')),
  (2, 'greater_orb',  'Greater Orb',  'Higher chance to secure a catch.',     'catch',       '{"catch_bonus":0.35}', 2, 1, datetime('now'), datetime('now')),
  (3, 'ember_stone',  'Ember Stone',  'Catalyzes ember-line evolutions.',     'evolution',   '{"elements":["ember"]}', 3, 1, datetime('now'), datetime('now')),
  (4, 'ration',       'Ration',       'Restores 10 energy.',                  'consumable',  '{"energy":10}', 1, 1, datetime('now'), datetime('now')),
  (5, 'coin_pouch',   'Coin Pouch',   'Grants 50 coins when opened.',         'currency_pack','{"coins":50}', 1, 1, datetime('now'), datetime('now'));

INSERT INTO species (id, code, display_name, blurb, glyph, element_id, stage, rarity_id, is_starter, base_catch_rate, created_at, updated_at) VALUES
  (1,  'emberkit',   'Emberkit',   'A spark-bound cub that sneezes cinders.',           '🔥', 1, 1, 1, 1, 0.45, datetime('now'), datetime('now')),
  (2,  'pyreling',   'Pyreling',   'Flames cling to its mane like living armor.',       '🌋', 1, 2, 2, 0, 0.28, datetime('now'), datetime('now')),
  (3,  'infernox',   'Infernox',   'A walking furnace that answers only to strength.',  '☄️', 1, 3, 3, 0, 0.12, datetime('now'), datetime('now')),
  (4,  'dewlet',     'Dewlet',     'A droplet pup that sings in puddles.',              '💧', 2, 1, 1, 1, 0.45, datetime('now'), datetime('now')),
  (5,  'cascara',    'Cascara',    'Currents coil around its fins mid-battle.',         '🌊', 2, 2, 2, 0, 0.28, datetime('now'), datetime('now')),
  (6,  'tidalking',  'Tidalking',  'Commands the swell with a single roar.',            '🐋', 2, 3, 3, 0, 0.12, datetime('now'), datetime('now')),
  (7,  'gustling',   'Gustling',   'A breezy fluff that never quite lands.',            '🍃', 3, 1, 1, 1, 0.45, datetime('now'), datetime('now')),
  (8,  'zephyrix',   'Zephyrix',   'Cuts the air into ribbons of speed.',               '🌪️', 3, 2, 2, 0, 0.28, datetime('now'), datetime('now')),
  (9,  'stormara',   'Stormara',   'A thunder-winged apex of the skies.',               '⚡', 3, 3, 3, 0, 0.12, datetime('now'), datetime('now')),
  (10, 'pebblet',    'Pebblet',    'A rolling pebble with stubborn eyes.',              '🪨', 4, 1, 1, 1, 0.45, datetime('now'), datetime('now')),
  (11, 'boulderkin', 'Boulderkin', 'Its shell shrugs off all but the fiercest blows.',  '🗿', 4, 2, 2, 0, 0.28, datetime('now'), datetime('now')),
  (12, 'titanox',    'Titanox',    'A living mountain that refuses to fall.',           '🦏', 4, 3, 3, 0, 0.12, datetime('now'), datetime('now')),
  (13, 'shadegrub',  'Shadegrub',  'A shy shadow that feeds on quiet.',                 '🌑', 5, 1, 1, 1, 0.45, datetime('now'), datetime('now')),
  (14, 'umbrawisp',  'Umbrawisp',  'Slips between moments to strike.',                  '👻', 5, 2, 2, 0, 0.28, datetime('now'), datetime('now')),
  (15, 'voidrex',    'Voidrex',    'An abyss given teeth and will.',                    '👁️', 5, 3, 3, 0, 0.12, datetime('now'), datetime('now')),
  (16, 'sproutling', 'Sproutling', 'A seed-beast that sprouts after every nap.',        '🌱', 6, 1, 1, 1, 0.45, datetime('now'), datetime('now')),
  (17, 'bloomara',   'Bloomara',   'Petals shield allies and poison foes.',             '🌸', 6, 2, 2, 0, 0.28, datetime('now'), datetime('now')),
  (18, 'verdantis',  'Verdantis',  'The grove itself, walking.',                        '🌳', 6, 3, 3, 0, 0.12, datetime('now'), datetime('now'));

-- species_base_stats: (species_id, might, vital, swift, guard, spirit)
-- Expanded via pairs
INSERT INTO species_base_stats (species_id, stat_id, value) VALUES
  (1,1,8),(1,2,6),(1,3,5),(1,4,4),(1,5,3),
  (2,1,14),(2,2,10),(2,3,8),(2,4,7),(2,5,5),
  (3,1,22),(3,2,15),(3,3,12),(3,4,11),(3,5,8),
  (4,1,4),(4,2,9),(4,3,5),(4,4,6),(4,5,4),
  (5,1,7),(5,2,15),(5,3,9),(5,4,10),(5,5,7),
  (6,1,11),(6,2,23),(6,3,13),(6,4,15),(6,5,10),
  (7,1,5),(7,2,5),(7,3,9),(7,4,3),(7,5,4),
  (8,1,9),(8,2,8),(8,3,16),(8,4,6),(8,5,7),
  (9,1,13),(9,2,12),(9,3,24),(9,4,9),(9,5,12),
  (10,1,5),(10,2,7),(10,3,3),(10,4,9),(10,5,2),
  (11,1,8),(11,2,12),(11,3,5),(11,4,16),(11,5,4),
  (12,1,13),(12,2,18),(12,3,7),(12,4,24),(12,5,6),
  (13,1,4),(13,2,5),(13,3,6),(13,4,3),(13,5,9),
  (14,1,7),(14,2,8),(14,3,10),(14,4,6),(14,5,15),
  (15,1,11),(15,2,12),(15,3,14),(15,4,9),(15,5,23),
  (16,1,5),(16,2,7),(16,3,5),(16,4,5),(16,5,6),
  (17,1,8),(17,2,12),(17,3,9),(17,4,9),(17,5,10),
  (18,1,12),(18,2,18),(18,3,13),(18,4,14),(18,5,16);

INSERT INTO moves (id, code, display_name, description, element_id, effect_kind, power, accuracy, energy_cost, effect_payload, created_at, updated_at) VALUES
  (1,  'strike',      'Strike',      'A solid blow.',                    NULL, 'strike', 100, 1.00, 0, '{"mult":1.0}',  datetime('now'), datetime('now')),
  (2,  'guard',       'Guard',       'Brace and reduce damage taken.',   NULL, 'guard',  40,  1.00, 0, '{"mult":0.55,"guarding":true}', datetime('now'), datetime('now')),
  (3,  'burst',       'Burst',       'Risky all-out assault.',           NULL, 'burst',  155, 0.90, 0, '{"mult":1.55}', datetime('now'), datetime('now')),
  (4,  'cinder_jab',  'Cinder Jab',  'Ember poke that scorches.',        1,    'strike', 110, 1.00, 0, '{"mult":1.1}',  datetime('now'), datetime('now')),
  (5,  'tide_lash',   'Tide Lash',   'A whipping current.',              2,    'strike', 110, 1.00, 0, '{"mult":1.1}',  datetime('now'), datetime('now')),
  (6,  'gust_cut',    'Gust Cut',    'A slicing breeze.',                3,    'strike', 105, 1.00, 0, '{"mult":1.05,"crit_bonus":5}', datetime('now'), datetime('now')),
  (7,  'stone_wall',  'Stone Wall',  'Raise a rocky guard.',             4,    'guard',  30,  1.00, 0, '{"mult":0.4,"guarding":true,"def_buff":2}', datetime('now'), datetime('now')),
  (8,  'umbra_spike', 'Umbra Spike', 'Strike from the blind spot.',      5,    'burst',  140, 0.92, 0, '{"mult":1.4}',  datetime('now'), datetime('now')),
  (9,  'bloom_soothe','Bloom Soothe','Restore a little vitality.',       6,    'heal',   0,   1.00, 0, '{"heal_pct":0.18}', datetime('now'), datetime('now'));

-- Default kit: strike/guard/burst on all stage-1; element move in slot 4
INSERT INTO species_moves (species_id, move_id, unlock_stage, slot)
SELECT s.id, m.id, 1, m.slot FROM species s
JOIN (SELECT 1 AS id, 1 AS slot UNION SELECT 2, 2 UNION SELECT 3, 3) m;

INSERT INTO species_moves (species_id, move_id, unlock_stage, slot) VALUES
  (1,4,1,4),(2,4,1,4),(3,4,1,4),
  (4,5,1,4),(5,5,1,4),(6,5,1,4),
  (7,6,1,4),(8,6,1,4),(9,6,1,4),
  (10,7,1,4),(11,7,1,4),(12,7,1,4),
  (13,8,1,4),(14,8,1,4),(15,8,1,4),
  (16,9,1,4),(17,9,1,4),(18,9,1,4);

INSERT INTO evolution_paths (id, ancestor_species_id, descendant_species_id, sort_order) VALUES
  (1,1,2,1),(2,2,3,2),
  (3,4,5,1),(4,5,6,2),
  (5,7,8,1),(6,8,9,2),
  (7,10,11,1),(8,11,12,2),
  (9,13,14,1),(10,14,15,2),
  (11,16,17,1),(12,17,18,2);

INSERT INTO evolution_requirements (evolution_path_id, requirement_kind, stat_id, item_id, threshold_value) VALUES
  (1, 'stat', 1, NULL, 14),
  (2, 'stat', 1, NULL, 24),
  (2, 'stat', 2, NULL, 16),
  (3, 'stat', 2, NULL, 14),
  (4, 'stat', 2, NULL, 24),
  (4, 'stat', 4, NULL, 14),
  (5, 'stat', 3, NULL, 14),
  (6, 'stat', 3, NULL, 24),
  (6, 'stat', 5, NULL, 12),
  (7, 'stat', 4, NULL, 14),
  (8, 'stat', 4, NULL, 24),
  (8, 'stat', 2, NULL, 16),
  (9, 'stat', 5, NULL, 14),
  (10,'stat', 5, NULL, 24),
  (10,'stat', 3, NULL, 14),
  (11,'stat', 2, NULL, 12),
  (11,'stat', 5, NULL, 10),
  (12,'stat', 2, NULL, 20),
  (12,'stat', 4, NULL, 14),
  (12,'stat', 5, NULL, 16),
  -- Example item gate on final ember evolution (optional extra — Infernox also wants Ember Stone)
  (2, 'item', NULL, 3, 1);

INSERT INTO zones (id, code, display_name, vibe, energy_cost, min_player_level, created_at, updated_at) VALUES
  (1, 'emberfield',  'Emberfield',  'Ash drifts over cracked earth.',   2, 1, datetime('now'), datetime('now')),
  (2, 'mistshore',   'Mistshore',   'Fog curls between tidepools.',     2, 1, datetime('now'), datetime('now')),
  (3, 'shadehollow', 'Shadehollow', 'Roots whisper under dim light.',   2, 1, datetime('now'), datetime('now')),
  (4, 'highridge',   'Highridge',   'Wind shears the cliff edge.',      2, 1, datetime('now'), datetime('now'));

INSERT INTO zone_encounters (zone_id, species_id, weight, min_stage, max_stage, stat_variance_min, stat_variance_max) VALUES
  (1, 1, 40, 1, 1, 0.72, 1.00),
  (1, 2, 15, 2, 2, 0.80, 1.05),
  (1, 10, 30, 1, 1, 0.72, 1.00),
  (1, 11, 10, 2, 2, 0.80, 1.05),
  (2, 4, 40, 1, 1, 0.72, 1.00),
  (2, 5, 15, 2, 2, 0.80, 1.05),
  (2, 7, 30, 1, 1, 0.72, 1.00),
  (2, 8, 10, 2, 2, 0.80, 1.05),
  (3, 13, 35, 1, 1, 0.72, 1.00),
  (3, 14, 15, 2, 2, 0.80, 1.05),
  (3, 16, 35, 1, 1, 0.72, 1.00),
  (3, 17, 15, 2, 2, 0.80, 1.05),
  (4, 7, 30, 1, 1, 0.72, 1.00),
  (4, 8, 15, 2, 2, 0.80, 1.05),
  (4, 10, 30, 1, 1, 0.72, 1.00),
  (4, 11, 15, 2, 2, 0.80, 1.05);

INSERT INTO training_drills (id, code, display_name, description, stat_id, energy_cost, base_gain, critical_chance, critical_bonus, coin_reward) VALUES
  (1, 'might_drill',  'Might Drill',  'Heavy strikes against a post.',     1, 1, 1, 0.18, 1, 1),
  (2, 'vital_drill',  'Vital Drill',  'Breathwork and endurance laps.',    2, 1, 1, 0.18, 1, 1),
  (3, 'swift_drill',  'Swift Drill',  'Sprint intervals through markers.', 3, 1, 1, 0.18, 1, 1),
  (4, 'guard_drill',  'Guard Drill',  'Brace drills under falling sand.',  4, 1, 1, 0.18, 1, 1),
  (5, 'spirit_drill', 'Spirit Drill', 'Focus meditations at dusk.',        5, 1, 1, 0.18, 1, 1);

COMMIT;
