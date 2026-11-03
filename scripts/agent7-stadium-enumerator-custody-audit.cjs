'use strict';

const assert = require('node:assert/strict');
const VERSION = 'agent7-stadium-enumerator-custody-audit-v1';

/**
 * Audit authentic archived owner-root Stadium omission rows.
 * A prior accepted Stadium is evidence of a prior play only. Live Stadium
 * occupancy and paper validity remain unknown without the public board.
 * @param {{rows:object[]}} archive Agent5 native owner Trainer frontier.
 * @returns {object} Explicitly nonqualified, read-only custody events.
 */
function auditStadiumEnumeratorCustody(archive) {
  assert.ok(Array.isArray(archive?.rows));
  const events = [];
  for (const cohort of archive.rows) {
    assert.ok(Array.isArray(cohort.frontiers?.roots));
    const lastAcceptedOwnStadium = [null, null];
    for (const root of cohort.frontiers.roots) {
      assert.ok(root.seat === 0 || root.seat === 1);
      for (const card of root.trainers ?? []) {
        if (card.type !== 'Stadium' || card.publicBlocker !== null ||
            card.nativeEnumeratorOffered !== false) continue;
        const prior = lastAcceptedOwnStadium[root.seat];
        events.push({
          physicalSlot: cohort.physicalSlot,
          originalRank5Seat: cohort.source5Seat,
          nativeSeed: cohort.seed,
          fullPhysicalDealSha256: cohort.initialFullPhysicalDealDigest,
          ownerSeat: root.seat,
          rootOrdinal: root.ordinal,
          globalTurn: root.turn,
          printing: card.printing,
          selectedRootAction: root.chosen?.action ?? null,
          dispatch: root.dispatch,
          lastAcceptedOwnStadium: prior,
          printedSameNameAsLastAccepted: prior === null ? null :
            prior.name === card.name,
          currentPublicStadiumAtOmission: 'UNKNOWN',
          paperEligibleAtOmission: 'UNKNOWN',
          nativeStorePlayAtOmission: 'NOT_ATTEMPTED'
        });
      }
      const chosen = root.chosen?.trainer;
      if (root.dispatch === 'native-accepted' && chosen?.type === 'Stadium') {
        lastAcceptedOwnStadium[root.seat] = {
          printing: chosen.printing,
          name: (root.trainers ?? []).find(card =>
            card.handIndex === root.chosen.handIndex)?.name ?? null,
          globalTurn: root.turn,
          rootOrdinal: root.ordinal
        };
      }
    }
  }
  return {
    version: VERSION,
    cohorts: archive.rows.length,
    omittedUnblockedStadiumCopies: events.length,
    events,
    independentPaperLegalPlaysCertified: 0,
    sourceLevelEnumeratorSourceInspectedByThisAudit: false,
    archiveContainsContemporaneousStadiumState: false,
    competitiveGamesQualified: 0
  };
}

module.exports = { VERSION, auditStadiumEnumeratorCustody };
