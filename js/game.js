/* Morph — game engine + localStorage DB mirroring the SQL schema */

window.MorphGame = (() => {
  const SAVE_KEY = "morph_rpg_v1";
  const D = () => window.MORPH_DATA;

  const defaults = () => ({
    players: [],
    player_pets: [],
    player_pet_stats: [],
    meta: {
      energy: 20,
      energyMax: 20,
      coins: 0,
      battlesWon: 0,
      petsCaught: 0,
      lastEnergyAt: Date.now(),
      activePetId: null,
      tutorialDone: false,
    },
    nextIds: {
      players: 1,
      player_pets: 1,
      player_pet_stats: 1,
    },
  });

  let state = defaults();

  function save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      state = { ...defaults(), ...JSON.parse(raw) };
      regenEnergy();
      return true;
    } catch {
      state = defaults();
      return false;
    }
  }

  function reset() {
    localStorage.removeItem(SAVE_KEY);
    state = defaults();
  }

  function player() {
    return state.players[0] || null;
  }

  function hasSave() {
    return !!player();
  }

  function regenEnergy() {
    const m = state.meta;
    const now = Date.now();
    const elapsed = now - (m.lastEnergyAt || now);
    const gained = Math.floor(elapsed / 45000); // 1 energy / 45s
    if (gained > 0) {
      m.energy = Math.min(m.energyMax, m.energy + gained);
      m.lastEnergyAt = now - (elapsed % 45000);
      save();
    }
  }

  function spendEnergy(n = 1) {
    regenEnergy();
    if (state.meta.energy < n) return false;
    state.meta.energy -= n;
    save();
    return true;
  }

  function createPlayer(name) {
    const trimmed = String(name || "").trim().slice(0, 32);
    if (!trimmed) throw new Error("Name required");
    const ts = D().now();
    state = defaults();
    state.players.push({
      id: state.nextIds.players++,
      name: trimmed,
      created_at: ts,
      updated_at: ts,
    });
    save();
    return player();
  }

  function petById(id) {
    return D().pets.find((p) => p.id === id);
  }

  function statById(id) {
    return D().stats.find((s) => s.id === id);
  }

  function baseStatsForPet(petId) {
    return D().pet_stats.filter((ps) => ps.pet_id === petId);
  }

  function addPlayerPet(petId, nickname) {
    const pet = petById(petId);
    if (!pet) throw new Error("Unknown pet");
    const p = player();
    if (!p) throw new Error("No player");

    const id = state.nextIds.player_pets++;
    const obtained = D().now();
    const row = {
      id,
      player_id: p.id,
      pet_id: petId,
      nickname: (nickname && nickname.trim()) || pet.name,
      obtained_at: obtained,
    };
    state.player_pets.push(row);

    for (const ps of baseStatsForPet(petId)) {
      state.player_pet_stats.push({
        id: state.nextIds.player_pet_stats++,
        player_pet_id: id,
        stat_id: ps.stat_id,
        value: ps.value,
      });
    }

    if (!state.meta.activePetId) state.meta.activePetId = id;
    state.meta.petsCaught += 1;
    save();
    return row;
  }

  function playerPets() {
    return state.player_pets.map(enrichPlayerPet);
  }

  function enrichPlayerPet(pp) {
    const pet = petById(pp.pet_id);
    const stats = state.player_pet_stats
      .filter((s) => s.player_pet_id === pp.id)
      .map((s) => ({
        ...s,
        stat: statById(s.stat_id),
      }));
    const power = stats.reduce((a, s) => a + s.value, 0);
    const evo = getEvolutionInfo(pp);
    return { ...pp, pet, stats, power, evo };
  }

  function getPlayerPet(id) {
    const pp = state.player_pets.find((p) => p.id === id);
    return pp ? enrichPlayerPet(pp) : null;
  }

  function activePet() {
    const id = state.meta.activePetId;
    if (!id) return playerPets()[0] || null;
    return getPlayerPet(id) || playerPets()[0] || null;
  }

  function setActivePet(id) {
    if (!state.player_pets.find((p) => p.id === id)) return false;
    state.meta.activePetId = id;
    save();
    return true;
  }

  function renamePet(id, nickname) {
    const pp = state.player_pets.find((p) => p.id === id);
    if (!pp) return false;
    pp.nickname = String(nickname || "").trim().slice(0, 32) || petById(pp.pet_id).name;
    save();
    return true;
  }

  function train(playerPetId, statId) {
    if (!spendEnergy(1)) return { ok: false, reason: "energy" };
    const row = state.player_pet_stats.find(
      (s) => s.player_pet_id === playerPetId && s.stat_id === statId
    );
    if (!row) return { ok: false, reason: "missing" };

    const gain = 1 + (Math.random() < 0.18 ? 1 : 0); // occasional +2
    row.value += gain;
    state.meta.coins += 1;
    save();
    return { ok: true, gain, value: row.value, stat: statById(statId) };
  }

  function getEvolutionInfo(pp) {
    const evo = D().pet_evolutions.find((e) => e.ancestor_id === pp.pet_id);
    if (!evo) return { canEvolve: false, ready: false, next: null, reqs: [] };

    const next = petById(evo.descendant_id);
    const reqs = D().pet_evolution_stat_requirements
      .filter((r) => r.pet_evolution_id === evo.id)
      .map((r) => {
        const petStat = D().pet_stats.find((ps) => ps.id === r.pet_stat_id);
        const current = state.player_pet_stats.find(
          (s) => s.player_pet_id === pp.id && s.stat_id === petStat.stat_id
        );
        const needed = r.value;
        const have = current ? current.value : 0;
        return {
          stat: statById(petStat.stat_id),
          needed,
          have,
          met: have >= needed,
        };
      });

    return {
      canEvolve: true,
      ready: reqs.every((r) => r.met),
      next,
      evo,
      reqs,
    };
  }

  function evolve(playerPetId) {
    const pp = state.player_pets.find((p) => p.id === playerPetId);
    if (!pp) return { ok: false, reason: "missing" };
    const info = getEvolutionInfo(pp);
    if (!info.canEvolve) return { ok: false, reason: "max" };
    if (!info.ready) return { ok: false, reason: "stats" };

    const oldName = petById(pp.pet_id).name;
    const wasDefaultNick = pp.nickname === oldName;
    pp.pet_id = info.next.id;
    if (wasDefaultNick) pp.nickname = info.next.name;

    // Soft bump: carry over trained surplus by remapping from new base + delta
    const oldBases = Object.fromEntries(
      baseStatsForPet(info.evo.ancestor_id).map((ps) => [ps.stat_id, ps.value])
    );
    const newBases = Object.fromEntries(
      baseStatsForPet(info.next.id).map((ps) => [ps.stat_id, ps.value])
    );

    for (const row of state.player_pet_stats.filter((s) => s.player_pet_id === pp.id)) {
      const trained = Math.max(0, row.value - (oldBases[row.stat_id] || 0));
      row.value = (newBases[row.stat_id] || row.value) + trained;
    }

    state.meta.coins += 25;
    save();
    return { ok: true, pet: enrichPlayerPet(pp), from: oldName, to: info.next.name };
  }

  function combatPower(enriched) {
    const map = Object.fromEntries(enriched.stats.map((s) => [s.stat_id, s.value]));
    const might = map[1] || 0;
    const vital = map[2] || 0;
    const swift = map[3] || 0;
    const guard = map[4] || 0;
    const spirit = map[5] || 0;
    return {
      hp: 40 + vital * 4 + guard * 2,
      atk: 6 + might * 2 + Math.floor(spirit * 0.5),
      spd: 5 + swift,
      def: 2 + Math.floor(guard * 1.2),
      crit: Math.min(35, 5 + Math.floor(swift * 0.8) + Math.floor(spirit * 0.4)),
      map,
    };
  }

  function makeWildEncounter(zoneId) {
    const zone = D().zones.find((z) => z.id === zoneId) || D().zones[0];
    const candidates = D().pets.filter(
      (p) => zone.elements.includes(p.element) && p.stage <= 2
    );
    const pick = candidates[Math.floor(Math.random() * candidates.length)] || petById(1);
    const variance = 0.85 + Math.random() * 0.35;
    const stats = baseStatsForPet(pick.id).map((ps) => ({
      stat_id: ps.stat_id,
      value: Math.max(1, Math.round(ps.value * variance)),
      stat: statById(ps.stat_id),
    }));
    const enriched = {
      id: -1,
      pet_id: pick.id,
      nickname: `Wild ${pick.name}`,
      pet: pick,
      stats,
      power: stats.reduce((a, s) => a + s.value, 0),
    };
    return { zone, wild: enriched, combat: combatPower(enriched) };
  }

  function startBattle(zoneId) {
    if (!spendEnergy(2)) return { ok: false, reason: "energy" };
    const you = activePet();
    if (!you) return { ok: false, reason: "no_pet" };
    const encounter = makeWildEncounter(zoneId);
    return {
      ok: true,
      you,
      youCombat: combatPower(you),
      ...encounter,
    };
  }

  function resolveTurn(battle, action) {
    // action: 'strike' | 'guard' | 'burst'
    const log = [];
    const you = { ...battle.youCombat, hp: battle.youHp };
    const foe = { ...battle.wildCombat, hp: battle.wildHp };

    const youFirst = you.spd + Math.random() * 3 >= foe.spd + Math.random() * 3;

    function attack(attacker, defender, kind, label) {
      let mult = kind === "burst" ? 1.55 : kind === "guard" ? 0.55 : 1;
      if (kind === "guard") defender._guarding = true;
      const crit = Math.random() * 100 < attacker.crit;
      if (crit) mult *= 1.6;
      const raw = attacker.atk * mult;
      const mitigated = Math.max(1, Math.round(raw - defender.def * (defender._guarding ? 1.8 : 1)));
      defender.hp = Math.max(0, defender.hp - mitigated);
      defender._guarding = false;
      log.push({
        text: `${label} hits for ${mitigated}${crit ? "!" : "."}`,
        crit,
        dmg: mitigated,
      });
    }

    const playerKind = action;
    const foeRoll = Math.random();
    const foeKind = foeRoll < 0.15 ? "burst" : foeRoll < 0.4 ? "guard" : "strike";

    const steps = youFirst
      ? [
          () => attack(you, foe, playerKind, battle.you.nickname),
          () => {
            if (foe.hp > 0) attack(foe, you, foeKind, battle.wild.nickname);
          },
        ]
      : [
          () => attack(foe, you, foeKind, battle.wild.nickname),
          () => {
            if (you.hp > 0) attack(you, foe, playerKind, battle.you.nickname);
          },
        ];

    for (const step of steps) step();

    let result = null;
    if (foe.hp <= 0) {
      result = "win";
      const coinGain = 8 + Math.floor(battle.wild.power / 4);
      const trainBoost = applyBattleRewards(battle.you.id, coinGain);
      log.push({ text: `Victory! +${coinGain} coins. Stats warmed up.`, reward: true });
      state.meta.battlesWon += 1;
      save();
      result = { outcome: "win", coinGain, trainBoost, canCatch: Math.random() < catchChance(battle) };
    } else if (you.hp <= 0) {
      log.push({ text: `${battle.you.nickname} was overwhelmed…`, reward: false });
      result = { outcome: "lose" };
      save();
    }

    return {
      youHp: you.hp,
      wildHp: foe.hp,
      log,
      result,
    };
  }

  function catchChance(battle) {
    // Easier to catch weaker / lower-stage wilds
    const stage = battle.wild.pet.stage;
    const ratio = battle.you.power / Math.max(1, battle.wild.power);
    return Math.min(0.72, 0.25 + (3 - stage) * 0.12 + Math.max(0, ratio - 1) * 0.15);
  }

  function applyBattleRewards(playerPetId, coins) {
    state.meta.coins += coins;
    // Small random stat bump on victory
    const rows = state.player_pet_stats.filter((s) => s.player_pet_id === playerPetId);
    if (!rows.length) return null;
    const pick = rows[Math.floor(Math.random() * rows.length)];
    pick.value += 1;
    return { stat: statById(pick.stat_id), value: pick.value };
  }

  function tryCatch(battle) {
    if (Math.random() >= catchChance(battle) + 0.15) {
      return { ok: false };
    }
    // Don't duplicate? Allow multiples — collector fun
    const caught = addPlayerPet(battle.wild.pet_id);
    return { ok: true, pet: enrichPlayerPet(caught) };
  }

  function rest() {
    // Spend coins to refill energy
    const cost = 15;
    if (state.meta.coins < cost) return { ok: false, reason: "coins" };
    state.meta.coins -= cost;
    state.meta.energy = state.meta.energyMax;
    state.meta.lastEnergyAt = Date.now();
    save();
    return { ok: true };
  }

  function getState() {
    regenEnergy();
    return {
      player: player(),
      meta: { ...state.meta },
      pets: playerPets(),
      active: activePet(),
      catalog: D(),
    };
  }

  return {
    load,
    save,
    reset,
    hasSave,
    createPlayer,
    addPlayerPet,
    playerPets,
    getPlayerPet,
    activePet,
    setActivePet,
    renamePet,
    train,
    evolve,
    getEvolutionInfo,
    startBattle,
    resolveTurn,
    tryCatch,
    combatPower,
    rest,
    getState,
    spendEnergy,
    regenEnergy,
  };
})();
