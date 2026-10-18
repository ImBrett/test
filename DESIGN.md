# Design System: Morph Command

Enterprise field-operations console for Morph, a creature campaign RPG. The interface is a machined slate chassis with an inset campaign ledger — a guild operations desk, not a mobile toy and not a generic analytics dashboard.

## 1. Visual Theme & Atmosphere

Dark, cool, and dense. The canvas is a near-black chassis. Work happens in inset instrument plates and hairline-ruled ledgers. Depth comes from recessed wells and 1px structural rules, never from drop shadows, glassmorphism, floating pills, or status dots.

The operator’s mental model is a campaign desk: a fixed station rail on the left, a command identity strip across the content column, and a ledger or split instrument pane for the work. Selection is a violet leading rule. Engagement — strike, boss, critical health, irreversible confirm — is crimson.

Desktop-first. 1280px canvas. Information is hierarchical and scannable: uppercase station labels, monospace numeric readouts, short status words instead of badges.

## 2. Color Palette & Roles

Brand colors are fixed. Command Violet is the only primary. Signal Crimson is the only accent. Do not introduce a second purple or a second red.

### Primary Foundation
- **Chassis (`#0c0a10`)**: Application canvas. Cool near-black with a violet undertone.
- **Bay (`#14111a`)**: Left station rail and page ground behind plates.
- **Plate (`#1c1824`)**: Primary panels, roster rows, and dialog surfaces.
- **Well (`#262030`)**: Inset stat readouts, inputs, progress tracks, and combat log.
- **Rule (`#3a3348`)**: 1px structural hairlines on plates, rails, and row dividers.

### Accent & Interactive
- **Command Violet (`#7235ff`)**: Primary buttons, active station, focus ring, selected-row leading rule, links, and progress fill for scans and ally readiness.
- **Violet Inset (`#2a2040`)**: Selected row and active station fill. A darker plate tinted by Command Violet, never a bright wash.
- **Signal Crimson (`#d62945`)**: Accent. Strike and other engagement actions, boss designation, critical health fill, and irreversible confirms.
- **Crimson Inset (`#3a1822`)**: Alert and critical row surface behind Signal Crimson text.

### Typography & Text Hierarchy
- **Ledger White (`#f3f0f7`)**: Primary text and numeric readouts on dark plates.
- **Brief (`#b6adc4`)**: Secondary labels, zone descriptions, and supporting metadata.
- **Caption (`#857d93`)**: Footnotes, timestamps, disabled labels, and placeholder text.

### Functional States
- **Stable (`#3dbe8b`)**: Cleared zones, healthy HP, successful claim. Text or bar fill on a Well, paired with the word “Clear” or “Stable”.
- **Hold (`#e0a04a`)**: Locked routes, unmet evolution gates, and insufficient coins. Paired with the word “Locked” or “Hold”.
- **Critical**: Signal Crimson (`#d62945`) on Crimson Inset (`#3a1822`) for low HP, failed actions, and boss threat. Always with a word, never a dot.

Element affinities (Ignis, Veil, Aether, Terra, Umbral, Radiance) are named in text. They do not override Command Violet or Signal Crimson.

## 3. Typography Rules

- **IBM Plex Sans**: All interface text. Clean grotesk, enterprise, neutral.
  - Display: `600` at `40px/48px`, `-0.02em` tracking. Screen titles only (“Party”, “Explore”).
  - Heading: `600` at `24px/32px`, `-0.01em` tracking. Panel titles and creature names in the detail pane.
  - Subheading: `600` at `16px/24px`. Region names and section labels inside a plate.
  - Body: `400` at `15px/22px`. Descriptions and combat log prose.
  - Label: `600` at `11px/16px`, `0.08em` tracking, uppercase. Station names, column headers, stat names.
  - Footnote: `400` at `12px/16px`. Requirements, lock reasons, timestamps.
- **IBM Plex Mono**: Tabular numeric readouts only. Levels, HP, coins, scan percent, prices, stat values.
  - Readout: `500` at `20px/24px`, `tabular-nums`.
  - Inline figure: `500` at `13px/16px`, `tabular-nums`, used in ledger columns.

Do not use a display serif, a rounded geometric, or the previous Syne / DM Sans pairing.

## 4. Component Stylings

- **Station rail**: Fixed left rail, `232px`, Bay surface, 1px Rule on the right edge. Five stations with a 16px icon slot and an uppercase label: Party, Explore, Scan, Shop, Bag. Active station uses Violet Inset, a `3px` Command Violet leading rule, and Ledger White label. Inactive labels are Brief. No pills, no notification dots.
- **Identity strip**: `56px` bar at the top of the content column. Operator name at left (example: Nova). At right, a mono coin readout labeled “Coins” and a text button “Bag”. 1px Rule along the bottom. No avatar bubble.
- **Buttons**: `40px` height, `4px` radius, `16px` horizontal padding. Primary is solid Command Violet with Ledger White text. Accent is solid Signal Crimson with Ledger White text, reserved for Strike and irreversible confirms. Secondary is transparent with a 1px Rule border and Brief text. Ghost is text-only Command Violet. Disabled buttons drop to 40% opacity and do not change color.
- **Plates**: Plate fill, 1px Rule border, `4px` radius, `24px` padding. No shadow. Separate stacked plates with `16px` gaps.
- **Ledger rows**: Full-width rows inside a plate, `56px` min height, 1px Rule dividers, no card gap and no elevation. Hover uses Well. Selected uses Violet Inset plus a `3px` Command Violet leading rule. Columns align on an 8px grid. Numeric columns are right-aligned IBM Plex Mono.
- **Stat wells**: Well fill, 1px Rule, `4px` radius, `12px` padding. Stat name as an uppercase label in Caption. Value as a mono readout in Ledger White.
- **Progress tracks**: `8px` height, Well track, `2px` radius. Fill is Command Violet for scan progress and ally HP, Stable for healthy cleared state, Signal Crimson for foe HP and critical ally HP. Percent sits beside the track in mono, not inside it.
- **Status words**: Uppercase label plus a `8px` square of the status color. Words: Active, Locked, Clear, Boss, Critical, Ready. Never a circular badge dot.
- **Inputs**: Well fill, 1px Rule, `4px` radius, `40px` height, label above the field in the label style. Focus replaces the border with `2px` Command Violet. No floating labels.
- **Tabs**: A single row of text labels with a `2px` Command Violet underline on the active tab (Training, Items, Equipment). Inactive labels are Brief. Not a segmented pill control.
- **Dialogs**: Plate centered over a `60%` Chassis scrim. Title, one paragraph, primary and secondary actions right-aligned. `4px` radius. Used for New Journey, evolve confirm, and purchase confirm.

## 5. Layout Principles

- **Canvas**: `1280px` desktop viewport. The app fills the viewport; it does not sit in a `480px` phone column.
- **Grid**: `4px` base unit, `8px` spatial rhythm. Rail `232px`. Content padding `32px`. Plate padding `24px`. Gutters `16px`. Section gap `24px`.
- **Regions**: Left rail (stations) + content column. Content column is identity strip, then a display title with one footnote, then either a ledger or a two-pane split (`3fr` list / `2fr` detail).
- **Battle**: No station rail. Full-bleed content column with a back control. Foe plate above, ally plate below, four action buttons in a single row, combat log in a Well beneath.
- **Touch and pointer**: `40px` minimum control height. Rows are pointer-first. Keyboard focus uses the same `2px` Command Violet ring as inputs.
- **Responsive**: Below `960px` the rail collapses to icons only (`72px`) and the detail pane stacks under the ledger. Do not switch to a bottom tab bar.

## 6. Design System Notes for Stitch Generation

- **Atmosphere keywords**: Enterprise campaign desk, machined slate chassis, inset instrument wells, hairline ledger rows, command console, sharp `4px` corners, no pills, no badge dots, no drop shadows.
- **Canonical colors**: Chassis `#0c0a10`, Bay `#14111a`, Plate `#1c1824`, Well `#262030`, Rule `#3a3348`, Command Violet `#7235ff`, Violet Inset `#2a2040`, Signal Crimson `#d62945`, Crimson Inset `#3a1822`, Ledger White `#f3f0f7`, Brief `#b6adc4`, Caption `#857d93`, Stable `#3dbe8b`, Hold `#e0a04a`.
- **Type**: IBM Plex Sans for all interface text. IBM Plex Mono for levels, HP, coins, prices, scan percent, and stats.
- **Component prompts**: `232px` station rail with a `3px` violet leading rule on the active station. Ledger rows at `56px` with right-aligned mono figures. Inset stat wells and `8px` progress tracks. Primary buttons in Command Violet; Signal Crimson only for Strike, bosses, and critical confirms.
