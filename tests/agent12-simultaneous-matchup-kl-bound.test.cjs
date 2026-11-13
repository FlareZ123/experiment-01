'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {assessSimultaneousMatchups} =
  require('../scripts/agent12-simultaneous-matchup-kl-bound.cjs');

const A = 'a'.repeat(64);
const B = 'b'.repeat(64);
const C = 'c'.repeat(64);
const D = 'd'.repeat(64);
const E = 'e'.repeat(64);
const F = 'f'.repeat(64);

/** @param {number} perStratum */
function fixture(perStratum) {
  const originalSources = Array.from({length: 32}, (_, n) => ({
    rank: n + 1,
    source60Sha: (n + 1).toString(16).padStart(64, '0'),
    authenticatedSource60: true
  }));
  const attempts = [];
  for (const source of originalSources) {
    for (const seat of [0, 1]) {
      for (const firstPlayerSeat of [0, 1]) {
        for (let i = 0; i < perStratum; i++) {
          const id = source.rank + '/' + seat + '/' +
            firstPlayerSeat + '/' + i;
          attempts.push({
            rank: source.rank, seat, firstPlayerSeat,
            trialId: id,
            physicalDealId: 'deal/' + id,
            paperReceiptId: 'receipt/' + id,
            status: 'paper-qualified-win',
            source60Sha: source.source60Sha,
            candidate60Sha: A,
            candidatePolicySha: B,
            engineAndHooksSha: C,
            opponentPolicyBundleSha: D,
            adjudicationProtocolSha: E,
            registrationSha: F
          });
        }
      }
    }
  }
  return {
    originalSources, attempts,
    registeredAttemptCount: attempts.length,
    registrationSha: F
  };
}

test('323 wins per 128-stratum cell give simultaneous 99.5% per-rank bounds', () => {
  const result = assessSimultaneousMatchups(fixture(323));
  assert.equal(result.totalAttempts, 41344);
  assert.equal(result.winCount, 41344);
  assert.equal(result.attemptsPerRankSeatAndFirstPlayer, 323);
  assert.equal(result.requiredPerStratumForAllWinTarget, 323);
  assert.equal(result.requiredPerOpponentForAllWinTarget, 1292);
  assert.equal(result.requiredTotalForAllWinTarget, 41344);
  assert.equal(result.perRank.length, 32);
  assert.ok(result.perRank.every(row => row.totalAttempts === 1292));
  assert.ok(result.perRank.every(row => row.reachesTarget));
  assert.ok(result.perRank.every(row => row.boundMethod === 'all-win-exact'));
  assert.equal(result.conditionalSimultaneousThresholdMet, true);
  assert.ok(Math.abs(result.minMatchupLowerBound -
    0.995011348501534) < 1e-12);
  assert.deepEqual(result.rejectionReasons, []);
  assert.equal(result.externalPaperAndIndependenceAuditRequired, true);
});

test('322 wins per cell miss the first-player-balanced simultaneous threshold', () => {
  const result = assessSimultaneousMatchups(fixture(322));
  assert.equal(result.totalAttempts, 41216);
  assert.equal(result.requiredPerStratumForAllWinTarget, 323);
  assert.ok(Math.abs(result.minMatchupLowerBound -
    0.994995894623306) < 1e-12);
  assert.equal(result.conditionalSimultaneousThresholdMet, false);
  assert.ok(result.perRank.every(row => !row.reachesTarget));
});

test('a single loss in one rank fails its simultaneous matchup bound under generic KL', () => {
  const request = fixture(323);
  request.attempts[0].status = 'paper-qualified-loss';
  const result = assessSimultaneousMatchups(request);
  assert.equal(result.perRank[0].winCount, 1291);
  assert.equal(result.perRank[0].nonwinCount, 1);
  assert.equal(result.perRank[0].totalAttempts, 1292);
  assert.equal(result.perRank[0].boundMethod, 'heterogeneous-kl');
  assert.ok(Math.abs(result.perRank[0].conditionalLowerBound -
    0.9924887081649534) < 1e-12);
  assert.equal(result.conditionalSimultaneousThresholdMet, false);
  assert.ok(result.perRank.slice(1).every(row => row.reachesTarget));
});

test('exact one-loss iid branch passes at 436, not 435 games per stratum', () => {
  const tooSmall = fixture(435);
  tooSmall.stratumSamplingModel = 'iid-bernoulli-v1';
  tooSmall.attempts[0].status = 'paper-qualified-loss';
  const failed = assessSimultaneousMatchups(tooSmall);
  assert.equal(failed.perRank[0].boundMethod, 'exact-one-loss-iid');
  assert.ok(Math.abs(failed.perRank[0].conditionalLowerBound -
    0.9949896284466906) < 1e-12);
  assert.equal(failed.conditionalSimultaneousThresholdMet, false);

  const request = fixture(436);
  request.stratumSamplingModel = 'iid-bernoulli-v1';
  request.attempts[0].status = 'paper-qualified-loss';
  const result = assessSimultaneousMatchups(request);
  assert.equal(result.totalAttempts, 55808);
  assert.equal(result.perRank[0].totalAttempts, 1744);
  assert.equal(result.perRank[0].winCount, 1743);
  assert.equal(result.perRank[0].nonwinCount, 1);
  assert.equal(result.perRank[0].boundMethod, 'exact-one-loss-iid');
  assert.ok(Math.abs(result.perRank[0].conditionalLowerBound -
    0.9950010946446439) < 1e-12);
  assert.equal(result.conditionalSimultaneousThresholdMet, true);
});

test('one loss remains on heterogeneous KL unless the iid model is explicitly declared', () => {
  const request = fixture(436);
  request.attempts[0].status = 'paper-qualified-loss';
  const result = assessSimultaneousMatchups(request);
  assert.equal(result.perRank[0].boundMethod, 'heterogeneous-kl');
  assert.ok(result.perRank[0].conditionalLowerBound < 0.995);
  assert.equal(result.conditionalSimultaneousThresholdMet, false);
});

test('generic heterogeneous-KL one-loss bound first passes at 486 games per stratum', () => {
  const tooSmall = fixture(485);
  tooSmall.attempts[0].status = 'paper-qualified-loss';
  const failed = assessSimultaneousMatchups(tooSmall);
  assert.equal(failed.perRank[0].boundMethod, 'heterogeneous-kl');
  assert.ok(Math.abs(failed.perRank[0].conditionalLowerBound -
    0.9949919849070881) < 1e-12);
  assert.equal(failed.conditionalSimultaneousThresholdMet, false);

  const request = fixture(486);
  request.attempts[0].status = 'paper-qualified-loss';
  const result = assessSimultaneousMatchups(request);
  assert.equal(result.totalAttempts, 62208);
  assert.equal(result.perRank[0].totalAttempts, 1944);
  assert.equal(result.perRank[0].winCount, 1943);
  assert.equal(result.perRank[0].boundMethod, 'heterogeneous-kl');
  assert.ok(Math.abs(result.perRank[0].conditionalLowerBound -
    0.9950022663189595) < 1e-12);
  assert.equal(result.conditionalSimultaneousThresholdMet, true);
});

test('two nonwins retain heterogeneous KL even when iid model is declared', () => {
  const tooSmall = fixture(601);
  tooSmall.stratumSamplingModel = 'iid-bernoulli-v1';
  tooSmall.attempts[0].status = 'paper-qualified-loss';
  tooSmall.attempts[1].status = 'paper-qualified-tie';
  const failed = assessSimultaneousMatchups(tooSmall);
  assert.equal(failed.perRank[0].boundMethod, 'heterogeneous-kl');
  assert.ok(Math.abs(failed.perRank[0].conditionalLowerBound -
    0.994996345963929) < 1e-12);
  assert.equal(failed.conditionalSimultaneousThresholdMet, false);

  const request = fixture(602);
  request.stratumSamplingModel = 'iid-bernoulli-v1';
  request.attempts[0].status = 'paper-qualified-loss';
  request.attempts[1].status = 'paper-qualified-tie';
  const result = assessSimultaneousMatchups(request);
  assert.equal(result.totalAttempts, 77056);
  assert.equal(result.perRank[0].totalAttempts, 2408);
  assert.equal(result.perRank[0].winCount, 2406);
  assert.equal(result.perRank[0].nonwinCount, 2);
  assert.equal(result.perRank[0].boundMethod, 'heterogeneous-kl');
  assert.ok(Math.abs(result.perRank[0].conditionalLowerBound -
    0.9950046403347648) < 1e-12);
  assert.equal(result.conditionalSimultaneousThresholdMet, true);
});

test('native errors, censored attempts and missing original opponents fail closed', () => {
  for (const status of ['native-win', 'censored', 'engine-error', 'unqualified']) {
    const request = fixture(323);
    request.attempts[0].status = status;
    const result = assessSimultaneousMatchups(request);
    assert.equal(result.minMatchupLowerBound, null);
    assert.equal(result.perRank.length, 0);
    assert.ok(result.rejectionReasons.includes(
      'noncompleted-or-unqualified-attempt'));
  }
  const missing = fixture(323);
  missing.originalSources = missing.originalSources.filter(x => x.rank !== 28);
  const result = assessSimultaneousMatchups(missing);
  assert.equal(result.minMatchupLowerBound, null);
  assert.ok(result.rejectionReasons.includes('field-incomplete'));
});

test('imbalanced first-player or candidate-seat exposure has no simultaneous bound', () => {
  const request = fixture(323);
  request.attempts.pop();
  request.registeredAttemptCount--;
  const result = assessSimultaneousMatchups(request);
  assert.equal(result.minMatchupLowerBound, null);
  assert.ok(result.rejectionReasons.includes(
    'rank-seat-first-player-exposure-unbalanced'));
});

test('changing candidate, policy or adjudication invalidates all matchup bounds', () => {
  for (const key of ['candidate60Sha', 'candidatePolicySha',
    'engineAndHooksSha', 'opponentPolicyBundleSha',
    'adjudicationProtocolSha']) {
    const request = fixture(323);
    request.attempts[1][key] = '0'.repeat(64);
    const result = assessSimultaneousMatchups(request);
    assert.equal(result.minMatchupLowerBound, null);
    assert.ok(result.rejectionReasons.some(x => x.endsWith('-changed')));
  }
});

test('a repeated physical deal or paper receipt cannot inflate per-rank confidence', () => {
  const request = fixture(323);
  request.attempts[1].physicalDealId = request.attempts[0].physicalDealId;
  request.attempts[2].paperReceiptId = request.attempts[0].paperReceiptId;
  const result = assessSimultaneousMatchups(request);
  assert.equal(result.minMatchupLowerBound, null);
  assert.ok(result.rejectionReasons.includes(
    'duplicate-or-missing-physical-deal'));
  assert.ok(result.rejectionReasons.includes(
    'duplicate-or-missing-paper-receipt'));
});
