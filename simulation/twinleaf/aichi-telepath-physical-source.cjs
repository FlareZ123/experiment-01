'use strict';

const path = require('node:path');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {runMatch} = require('./headless.cjs');
const {installHeadlessTelepathRootAudit} = require('./telepath-headless-root-audit.cjs');

/**
 * Observe the root Store only while running one genuine engine match.
 * Simulated Stores have prototype onStateChange instead of an own callback
 * in the pinned engine. Restore upstream method descriptors after the run.
 *
 * @param {object} request Exact headless match request.
 * @returns {object} Match summary plus reducer-origin evidence.
 */
function runObservedMatch(request) {
  const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const {Store} = require(path.join(output, 'game/store/store'));
  const {AttachEnergyEffect} = require(path.join(output, 'game/store/effects/play-card-effects'));
  const audit = installHeadlessTelepathRootAudit({Store, AttachEnergyEffect});
  try {
    return {...runMatch(request), telepathRootAttachEvents: audit.events.slice()};
  } finally {
    audit.restore();
  }
}

/**
 * Bounded, source-dealt card-zone integrity audit against all three published
 * Telepathic Psychic Energy lists. This measures engine state integrity only.
 * It does not measure competitive strength, attack fidelity or win rate.
 */
function audit() {
  const filename = path.resolve(__dirname, '../../results/aichi-2026/full-decklists.json');
  const resolved = resolveManifestFile(filename, {
    allowEquivalentBasicEnergies: true, allowJapanesePromoHooks: true
  });
  const decks = new Map(resolved.decks.map(row => [row.rank, row]));
  const champion = decks.get(1);
  if (!champion?.playableUnderEngine) {
    throw new Error('Published rank-one 60 is not playable under pinned engine');
  }
  const rows = [];
  for (const rank of [9, 30, 31]) {
    const deck = decks.get(rank);
    if (!deck?.playableUnderEngine) {
      rows.push({rank, playableUnderEngine: false, missing: deck?.unresolved});
      continue;
    }
    for (const candidateSeat of [0, 1]) {
      const seed = 2026101800 + rank * 2 + candidateSeat;
      try {
        const result = runMatch({
          deckA: candidateSeat === 0 ? champion.cardIds : deck.cardIds,
          deckB: candidateSeat === 1 ? champion.cardIds : deck.cardIds,
          seed,
          maxActions: 120,
          capturePhysicalZoneIntegrity: true,
          captureDecisionTrace: true,
          label: 'Aichi source rank1 vs rank' + rank
        });
        rows.push({
          rank,
          candidateSeat,
          seed,
          actions: result.actions,
          finished: result.finished,
          endReason: result.endReason,
          physicalZoneIntegrity: result.physicalZoneIntegrity,
          firstAnomalyDecisionContext: result.physicalZoneIntegrity.firstAnomaly ?
            result.decisionTrace.filter(event =>
              event.actionOrdinal <= result.physicalZoneIntegrity.firstAnomaly.actionOrdinal)
              .slice(-5).map(({actionOrdinal, turnBefore, playerSlot, action, card}) =>
                ({actionOrdinal, turnBefore, playerSlot, action, ...(card ? {card} : {})})) : [],
          qualifiedForCompetitiveInference: false
        });
      } catch (error) {
        rows.push({
          rank, candidateSeat, seed,
          aborted: true, error: String(error.message),
          qualifiedForCompetitiveInference: false
        });
      }
    }
  }
  return {
    schema: 'aichi-published-telepath-physical-zone-early-source-v1',
    pinnedEngine: resolved.engineRevision,
    source: resolved.source,
    method: 'Six bounded authentic-deal engine-policy trajectories, up to 120 root actions per game, two physical seats, no opt-in card corrections',
    rows,
    qualifiedForCompetitiveInference: false
  };
}

if (require.main === module) process.stdout.write(JSON.stringify(audit(), null, 2) + '\n');
module.exports = {audit};
