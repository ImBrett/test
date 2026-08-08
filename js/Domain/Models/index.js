import { Nickname } from "../ValueObjects/index.js";

/** Player aggregate root (identity + progression). */
export function createPlayerModel({ id, name, level = 1, experience = 0, createdAt, updatedAt }) {
  return {
    id,
    name,
    level,
    experience,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

/** Owned creature entity under Player. */
export function createCreatureModel({
  id,
  playerId,
  speciesId,
  nickname,
  speciesDisplayName,
  level = 1,
  experience = 0,
  battlesWon = 0,
  obtainedAt,
  isActive = false,
}) {
  const nick =
    nickname != null && String(nickname).trim()
      ? new Nickname(nickname).value
      : Nickname.fromSpeciesDefault(speciesDisplayName).value;

  return {
    id,
    player_id: playerId,
    species_id: speciesId,
    nickname: nick,
    level,
    experience,
    battles_won: battlesWon,
    obtained_at: obtainedAt,
    is_active: isActive ? 1 : 0,
  };
}

/** Battle aggregate snapshot. */
export function createBattleModel({
  id,
  playerId,
  zoneId,
  status = "active",
  seed = null,
  startedAt,
  endedAt = null,
}) {
  return {
    id,
    player_id: playerId,
    zone_id: zoneId,
    status,
    seed,
    started_at: startedAt,
    ended_at: endedAt,
  };
}
