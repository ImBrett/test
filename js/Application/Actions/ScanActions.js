import { ok, fail } from "../../Domain/DTOs/Result.js";
import { appendEvent } from "../../Domain/Rules/CreatureEnricher.js";
import { DomainEventTypes } from "../../Domain/Events/DomainEvents.js";

/** Fixed scan fill % by species stage (Hatchling→Apex). */
export const STAGE_SCAN_GAIN = Object.freeze({
  1: 30,
  2: 20,
  3: 10,
  4: 5,
  5: 1,
});

/**
 * Apply scan progress for a defeated wild species.
 * Returns { speciesId, previousLevel, gain, scanLevel, canClaim }.
 */
export function applyScanProgress({ catalog, uow, speciesId }) {
  const player = uow.getPlayer();
  const species = catalog.speciesById(speciesId);
  if (!player || !species) return null;

  const previousLevel = uow.getScan(speciesId)?.scan_level ?? 0;
  const gain = STAGE_SCAN_GAIN[species.stage] ?? 10;
  const row = uow.upsertScan(speciesId, gain);
  const applied = row.scan_level - previousLevel;

  appendEvent(uow, player.id, "Player", player.id, DomainEventTypes.SCAN_PROGRESS, {
    species_id: speciesId,
    gain: applied,
    previous_level: previousLevel,
    scan_level: row.scan_level,
  });

  return {
    speciesId,
    speciesName: species.display_name,
    previousLevel,
    gain: applied,
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
