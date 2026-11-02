'use strict';

const {test} = require('node:test');
const assert = require('node:assert/strict');
const fixture = require('./fixtures/agent47-lillie-native-real-hand-counts-16.json');
const {auditNativeLillieHandExchange} =
  require('../scripts/agent47-prospective-lillie-hand-balance.cjs');

test('read-only original prospective 16-run native hand-exchange count receipts', () => {
  assert.equal(fixture.originalUncompressedSha256,
    '93f1730901a41bace7729466ee59d21d78f4e012a776684a58bfcdf22485a92f');
  const out = auditNativeLillieHandExchange(fixture);
  assert.equal(out.pairedNativeGames, 16);
  assert.equal(out.nativeInterventions, 6);
  assert.equal(out.expandingHand, 3);
  assert.equal(out.contractingHand, 3);
  assert.equal(out.unchangedHand, 0);
  assert.equal(out.totalSignedHandDeltaAcrossEvents, -29);
  assert.deepEqual(out.events.map(e=>e.handDelta),[-3,-19,3,3,-16,3]);
  assert.deepEqual(out.events.map(e=>e.printedDrawCount),[8,8,8,8,6,8]);
  assert.equal(out.competitiveQualifiedGames, 0);
});

test('paper printing draw is eight only while exactly six Prizes remain', () => {
  const out = auditNativeLillieHandExchange(fixture);
  const late = out.events.find(e => e.turn === 49);
  assert.equal(late.prizesBefore, 4);
  assert.equal(late.printedDrawCount, 6);
  assert.equal(late.handBefore, 22);
  assert.equal(late.handAfter, 6);
  assert.equal(late.deckBefore, 17);
  assert.equal(late.deckAfter, 32);
});

test('native hand and deck conservation detects falsely claimed settlement', () => {
  const bad=structuredClone(fixture);
  bad.pairs[0].nativePolicyIntervention.candidateLillieNativeDraws
    .events[0].lastObserved.deck += 1;
  assert.throws(()=>auditNativeLillieHandExchange(bad),
    /card conservation mismatch/);
});

test('incomplete physical parity and mismatched intervention event fail closed', () => {
  const unpaired=structuredClone(fixture);
  unpaired.pairs[0].exactFullInitialPhysicalDealMatched=false;
  assert.throws(()=>auditNativeLillieHandExchange(unpaired),/physical pairing differ/);
  const missing=structuredClone(fixture);
  missing.pairs[0].nativePolicyIntervention.candidateLillieNativeDraws.events.pop();
  assert.throws(()=>auditNativeLillieHandExchange(missing),/settled effects/);
  const miscount=structuredClone(fixture);
  miscount.totalNativeAcceptedLillieRoots=5;
  assert.throws(()=>auditNativeLillieHandExchange(miscount),/denominator changed/);
});
