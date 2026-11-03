'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const {classifyNativeRow, samePhysicalSetup, firstChangedRoot,
  auditPairedNativeOutcomes} =
  require('../simulation/evaluation/agent4-native-paired-outcome-audit.cjs');

/** @param {string} trialId @param {object} rest */
function row(trialId, rest = {}) {
  return {
    trial: {id: trialId}, sourceSeat: 1, candidateSeat: 0,
    sourceDealFingerprint: 'same-source', fullPhysicalDealFingerprint: 'same-whole',
    sourceDeckFingerprint: 'deck-source', candidateDeckFingerprint: 'deck-candidate',
    actualStarterSeat: 1, winner: 0, endReason: 'engine-game-end',
    rootActionLedger: [{action: 'PassTurnAction', playerSlot: 0}],
    ...rest
  };
}

/** @param {object[]} baseline @param {object[]} selected */
function archive(baseline, selected) {
  return {modes: [
    {id: 'joint-v1-control', native: {rows: baseline}},
    {id: 'selected-v2-symmetric-vip', native: {rows: selected}}
  ]};
}

test('a matched same-deal native candidate winner reversal is explicitly adverse', () => {
  const a = row('5:300:A:new-moon-lockbreaker-v1');
  const b = row(a.trial.id, {
    winner: 1, rootActionLedger: [{
      action: 'PlayCardAction', card: 'Battle VIP Pass', playerSlot: 0
    }]
  });
  const result = auditPairedNativeOutcomes(archive([a], [b]));
  assert.equal(result.totalNativeAttempts, 2);
  assert.equal(result.physicalMatchedPairs, 1);
  assert.equal(result.adverseCandidateReversals.length, 1);
  assert.equal(result.transitions['candidate-win->source-win'], 1);
  assert.equal(result.paired[0].firstChangedRoot.selected.card, 'Battle VIP Pass');
  assert.deepEqual(result.nativeDispositions.map(x => ({...x})),
    [{'candidate-win': 1}, {'source-win': 1}]);
  assert.equal(result.certifiedWinRate, null);
});

test('unknown physical setup is excluded from all paired winner contrasts', () => {
  const a = row('missing-setup', {sourceDealFingerprint: undefined,
    fullPhysicalDealFingerprint: undefined, status: 'engine-error',
    endReason: null, winner: null});
  const b = {...a};
  const result = auditPairedNativeOutcomes(archive([a], [b]));
  assert.equal(result.physicalMatchedPairs, 0);
  assert.equal(result.unmatchedPairs.length, 1);
  assert.equal(result.paired.length, 0);
  assert.equal(result.nativeDispositions[0].error, 1);
});

test('different complete decks prevent false original-deal pairing', () => {
  const a = row('different-decks');
  const b = row('different-decks', {sourceDeckFingerprint: 'other-deck',
    winner: 1});
  assert.equal(samePhysicalSetup(a, b), false);
  const result = auditPairedNativeOutcomes(archive([a], [b]));
  assert.equal(result.adverseCandidateReversals.length, 0);
  assert.equal(result.unmatchedPairs.length, 1);
});

test('native winner and ledger classifications preserve caps and exact first choice', () => {
  const a = row('a', {winner: null, endReason: 'action-limit'});
  assert.equal(classifyNativeRow(a), 'capped');
  assert.deepEqual(firstChangedRoot([{action: 'PassTurnAction'}],
    [{action: 'PlayCardAction', card: 'Battle VIP Pass'}]), {
    index: 0, baseline: {action: 'PassTurnAction'},
    selected: {action: 'PlayCardAction', card: 'Battle VIP Pass'}
  });
  assert.equal(firstChangedRoot([], []), null);
  assert.throws(() => classifyNativeRow(row('invalid', {winner: 7})),
    /Finished native game must have a classified winner/);
});
