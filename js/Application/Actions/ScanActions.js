import { ok, fail } from "../../Domain/DTOs/Result.js";
import { appendEvent } from "../../Domain/Rules/CreatureEnricher.js";
import { DomainEventTypes } from "../../Domain/Events/DomainEvents.js";

/**
 * Apply scan progress for a defeated wild species.
 * Returns { speciesId, gain, scanLevel, canClaim }.
 */
export function applyScanProgress({ catalog, uow, random, speciesId }) {
  const player = uow.getPlayer();
  const species = catalog.speciesById(speciesId);
  if (!player || !species) return null;

  const base = species.base_scan_gain ?? 20;
  const variance = 0.85 + random.next() * 0.3;
  const gain = Math.max(1, Math.min(40, Math.round(base * variance)));
  const row = uow.upsertScan(speciesId, gain);
  appendEvent(uow, player.id, "Player", player.id, DomainEventTypes.SCAN_PROGRESS, {
    species_id: speciesId,
    gain,
    scan_level: row.scan_level,
  });
  return {
    speciesId,
    speciesName: species.display_name,
    gain,
    scanLevel: row.scan_level,
    canClaim: row.scan_level >= 100 && !row.claimed,
  };
}

/** Action: ClaimScannedSpecies — obtain a creature once scan reaches 100%. */
export function createClaimScannedSpeciesAction({ catalog, uow, obtainCreature }) {
  return {
    name: "ClaimScannedSpecies",
    execute({ speciesId }) {
      const player = uow.getPlayer();
      if (!player) return fail("NO_PLAYER", "Create a player first");
      const species = catalog.speciesById(speciesId);
      if (!species) return fail("UNKNOWN_SPECIES", "Species not found");

      const scan = uow.getScan(speciesId);
      if (!scan || scan.scan_level < 100) {
        return fail("SCAN_INCOMPLETE", "Scan data is not complete yet");
      }
      if (scan.claimed) {
        return fail("ALREADY_CLAIMED", "You already obtained this scan");
      }

      const openSlots = uow.listPartySlots().filter((s) => !s.player_creature_id);
      if (!openSlots.length) {
        return fail("PARTY_FULL", "No free party slots");
      }

      const obtained = obtainCreature.execute({ speciesId });
      if (!obtained.ok) return obtained;

      uow.markScanClaimed(speciesId);
      appendEvent(
        uow,
        player.id,
        "PlayerCreature",
        obtained.data.creatureId,
        DomainEventTypes.SPECIES_CLAIMED,
        { species_id: speciesId }
      );
      uow.commit();
      return ok({
        creatureId: obtained.data.creatureId,
        nickname: obtained.data.nickname,
        speciesId,
      });
    },
  };
}
