'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  auditArchiveParity,
  TRIAL_IDS
} = require('../simulation/evaluation/agent31-original-allpass-archive-parity.cjs');

/** @returns {{historical:object, observed:object}} */
function fixture() {
  const oldRows = [];
  const latestRows = [];
  for (let index = 0; index < TRIAL_IDS.length; index++) {
    const id = TRIAL_IDS[index];
    const candidateSeat = id.includes(':B:') ? 1 : 0;
    const sourceSeat = 1 - candidateSeat;
    const root = {
      actionOrdinal: 100 + index, turnBefore: 17 + index,
      playerSlot: candidateSeat, action: 'PassTurnAction'
    };
    const original = {
      trial: {id}, sourceSeat, candidateSeat,
      sourceDealFingerprint: 'original-' + index,
      fullPhysicalDealFingerprint: 'full-' + index,
      rootActionLedgerSha256: 'roots-' + index,
      finished: true, winner: sourceSeat, endReason: 'engine-game-end',
      turns: 18 + index, actionCount: 1, rootActionLedger: [root],
      candidateRepliesAfterSourceAttacks: index === 2 ? [] : [{
        candidateReplyTurnFinalPass: {ordinal: root.actionOrdinal}
      }]
    };
    oldRows.push(original);
    latestRows.push({
      ...original,
      trial: {id},
      rootActionLedger: [{...root}],
      nativeAllOwnerPassFrontier: {
        completeNativePassCoverage: true,
        actualNativePassRoots: 1,
        receipts: [{
          actionOrdinal: root.actionOrdinal, turn: root.turnBefore,
          actorSeat: candidateSeat, role: 'candidate',
          visibleFundedVmax: index === 2 ?
            {trialId: id, passRoot: root.actionOrdinal} : null
        }]
      }
    });
  }
  for (let index = 0; index < 28; index++)
    oldRows.push({trial: {id: 'other-registered-' + index}});
  return {
    historical: {base: {rows: oldRows}},
    observed: {native: {
      rows: latestRows, nativeAllOwnerPassFrontierOptIn: true,
      actorFundedShadowRiderFloatStoneRootOptIn: false
    }}
  };
}

test('four historical actors retain identical physical deals and Store roots', () => {
  const f = fixture();
  const result = auditArchiveParity(f.historical, f.observed);
  assert.equal(result.matchedRetrospectiveTrials, 4);
  assert.equal(result.originalControlTrialsAvailable, 32);
  assert.equal(result.exactNativeRootAndPhysicalParity, true);
  assert.equal(result.totalNativePasses, 4);
  assert.deepEqual(result.newlyRecoveredPassRoots, [{
    id: TRIAL_IDS[2], ordinal: 102
  }]);
  assert.equal(result.competitivelyQualifiedGames, 0);
});

test('a changed accepted root or opening is never called observational parity', () => {
  for (const mutate of [
    f => {f.observed.native.rows[0].rootActionLedger[0].actionOrdinal = 999;},
    f => {f.observed.native.rows[0].fullPhysicalDealFingerprint = 'other';},
    f => {f.observed.native.rows[0].winner = 0;},
    f => {f.observed.native.rows[0].rootActionLedgerSha256 = 'wrong';}
  ]) {
    const f = fixture();
    mutate(f);
    assert.throws(() => auditArchiveParity(f.historical, f.observed));
  }
});

test('wrong or absent owner Pass custody fails closed', () => {
  for (const mutate of [
    f => {f.observed.native.rows[0].nativeAllOwnerPassFrontier.receipts = [];},
    f => {f.observed.native.rows[1].nativeAllOwnerPassFrontier.receipts[0].actorSeat = 1;},
    f => {f.observed.native.rows[2].nativeAllOwnerPassFrontier.completeNativePassCoverage = false;},
    f => {f.observed.native.rows[3].nativeAllOwnerPassFrontier.actualNativePassRoots = 2;}
  ]) {
    const f = fixture();
    mutate(f);
    assert.throws(() => auditArchiveParity(f.historical, f.observed));
  }
});

test('old source-attack-following evidence must still be a real candidate Pass', () => {
  const f = fixture();
  f.historical.base.rows[0].candidateRepliesAfterSourceAttacks[0]
    .candidateReplyTurnFinalPass.ordinal = 1000;
  assert.throws(() => auditArchiveParity(f.historical, f.observed),
    /old conditionally sampled candidate Pass absent/);
});

test('registered group and observer-mode gates reject changed sample design', () => {
  for (const mutate of [
    f => {f.observed.native.rows.pop();},
    f => {f.observed.native.rows.reverse();},
    f => {f.observed.native.nativeAllOwnerPassFrontierOptIn = false;},
    f => {f.observed.native.actorFundedShadowRiderFloatStoneRootOptIn = true;}
  ]) {
    const f = fixture();
    mutate(f);
    assert.throws(() => auditArchiveParity(f.historical, f.observed));
  }
});
