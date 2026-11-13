'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { reconstructFixture } =
  require('../../simulation/evaluation/2026-11/agent49-v3-fixture-opening-hand-reconstruction.cjs');

test('reconstructs the exact V3 candidate opening hand from frozen source blobs and seed', () => {
  const result = reconstructFixture();
  assert.equal(result.seed32, 4065045654);
  assert.equal(result.physicalRandomCalls, 119);
  assert.equal(result.coinFlipResult, true);
  assert.equal(result.coinFlipWinnerSeat, 0);
  assert.equal(result.actualFirstPlayerSeat, 1);
  assert.equal(result.candidateOpeningBasicCount, 1);
  assert.equal(result.opponentOpeningHadBasic, true);
  assert.equal(result.noMulliganRequired, true);

  assert.deepEqual(result.candidateOpeningHand.map(card => card.fullName), [
    'Psychic Energy SVE',
    'Psychic Energy SVE',
    'Arven SVI',
    'Quick Ball FST',
    'Shadow Rider Calyrex V CRE',
    'Float Stone BKT',
    'Psychic Energy SVE'
  ]);
  assert.deepEqual(result.candidatePostSetupHand.map(card => card.fullName), [
    'Psychic Energy SVE',
    'Psychic Energy SVE',
    'Arven SVI',
    'Quick Ball FST',
    'Float Stone BKT',
    'Psychic Energy SVE'
  ]);
  assert.deepEqual(result.candidateDeckTopAfterOpening.map(card => card.fullName), [
    'Acerola BUS',
    'Mysterious Treasure FLI',
    'Shadow Rider Calyrex V CRE'
  ]);
});

test('existing Quick Ball root frontier is eligible but remains opt-in', () => {
  const result = reconstructFixture();
  assert.equal(result.quickBallRoot.fixtureEnabled, false);
  assert.equal(result.quickBallRoot.enablingOption, 'quickBallRoot');
  assert.deepEqual(result.quickBallRoot.existingFrontierIntent, {
    kind: 'play-quick-ball',
    handIndex: 3,
    printing: 'Quick Ball FST'
  });
  assert.equal(result.quickBallRoot.duplicatePsychicEnergyPaymentCandidates, 3);
  assert.equal(result.quickBallRoot.requiresOwnerBoundNativePaymentAndSearchContinuation, true);
});

test('reconstruction does not publish the opponent opening hand identities', () => {
  const result = reconstructFixture();
  assert.equal(result.opponentOpeningHadBasic, true);
  assert.equal(Object.hasOwn(result, 'opponentOpeningHand'), false);
  assert.equal(Object.hasOwn(result, 'opponentDeckTopAfterOpening'), false);
});
