'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {assessBalancedFieldKl, lowerKlBound, binaryKl} =
  require('../scripts/agent12-balanced-kl-field-bound.cjs');
const {assessPerfectField} =
  require('../scripts/agent12-balanced-perfect-field-bound.cjs');

const A = 'a'.repeat(64);
const B = 'b'.repeat(64);
const C = 'c'.repeat(64);
const D = 'd'.repeat(64);
const E = 'e'.repeat(64);
const F = 'f'.repeat(64);

/** @param {number} trialsPerStratum */
function fixture(trialsPerStratum) {
  const originalSources = Array.from({length: 32}, (_, n) => ({
    rank: n + 1,
    source60Sha: (n + 1).toString(16).padStart(64, '0'),
    authenticatedSource60: true
  }));
  const attempts = [];
  for (const source of originalSources) {
    for (const seat of [0, 1]) {
      for (const firstPlayerSeat of [0, 1]) {
        for (let i = 0; i < trialsPerStratum; i++) {
          const id = source.rank + '/' + seat + '/' + firstPlayerSeat + '/' + i;
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

test('640 perfect wins reproduce the exact all-win confidence bound', () => {
  const f = fixture(5), a = assessPerfectField(f), b = assessBalancedFieldKl(f);
  assert.equal(b.totalAttempts, 640);
  assert.equal(b.winCount, 640);
  assert.equal(b.attemptsPerRankSeatAndFirstPlayer, 5);
  assert.deepEqual(b.rejectionReasons, []);
  assert.equal(b.conditionalStatisticalThresholdMet, true);
  assert.ok(Math.abs(b.conditionalLowerBound-a.conditionalLowerBound)<1e-14);
  assert.equal(b.externalPaperAndIndependenceAuditRequired, true);
});

test('639 wins and one paper-qualified loss give a numerical FAIL, not a ledger rejection', () => {
  const f = fixture(5);
  f.attempts[0].status = 'paper-qualified-loss';
  const b = assessBalancedFieldKl(f), a = assessPerfectField(f);
  assert.equal(b.winCount, 639);
  assert.deepEqual(b.rejectionReasons, []);
  assert.equal(b.conditionalStatisticalThresholdMet, false);
  assert.ok(Math.abs(b.conditionalLowerBound-0.9910584044581278)<1e-12);
  assert.ok(a.rejectionReasons.includes('nonwin-or-unqualified-attempt'));
});

test('1151 wins from 1152 balanced trials exceed conditional 99.5 lower bound', () => {
  const f = fixture(9);
  f.attempts[17].status = 'paper-qualified-loss';
  const b = assessBalancedFieldKl(f);
  assert.equal(b.totalAttempts, 1152);
  assert.equal(b.winCount, 1151);
  assert.deepEqual(b.rejectionReasons, []);
  assert.ok(Math.abs(b.conditionalLowerBound-0.9950242606460161)<1e-12);
  assert.equal(b.conditionalStatisticalThresholdMet, true);
});

test('1023 of 1024 wins remain insufficient and 1534 of 1536 suffice', () => {
  const f = fixture(8);
  f.attempts[0].status = 'paper-qualified-loss';
  const a = assessBalancedFieldKl(f);
  assert.equal(a.conditionalStatisticalThresholdMet, false);
  assert.ok(Math.abs(a.conditionalLowerBound-0.9944037333431)<1e-12);
  const g = fixture(12);
  g.attempts[0].status = 'paper-qualified-loss';
  g.attempts[1].status = 'paper-qualified-loss';
  const b = assessBalancedFieldKl(g);
  assert.equal(b.winCount, 1534);
  assert.equal(b.conditionalStatisticalThresholdMet, true);
  assert.ok(Math.abs(b.conditionalLowerBound-0.99500338551111)<1e-12);
});

test('paper-qualified tie counts as a complete game and a nonwin', () => {
  const f = fixture(5);
  f.attempts[0].status = 'paper-qualified-tie';
  const b = assessBalancedFieldKl(f);
  assert.deepEqual(b.rejectionReasons, []);
  assert.equal(b.winCount, 639);
  assert.equal(b.observedWinRate, 639/640);
});

test('native, censored, errors and unaudited statuses all fail closed', () => {
  for (const status of ['native-win','censored','engine-error','unqualified',
    undefined,'paper-qualified-both-loss-not-adjudicated']) {
    const f = fixture(5);
    f.attempts[0].status = status;
    const b = assessBalancedFieldKl(f);
    assert.equal(b.conditionalLowerBound, null);
    assert.ok(b.rejectionReasons.includes('noncompleted-or-unqualified-attempt'));
  }
});

test('29 original source rosters cannot support a 32-rank field bound', () => {
  const f = fixture(5);
  f.originalSources = f.originalSources.filter(x => ![23,25,28].includes(x.rank));
  const b = assessBalancedFieldKl(f);
  assert.equal(b.conditionalLowerBound, null);
  assert.ok(b.rejectionReasons.includes('field-incomplete'));
});

test('unbalanced first-player/seat and dropped preregistration fail', () => {
  const f = fixture(5);
  f.attempts.pop();
  const b = assessBalancedFieldKl(f);
  assert.ok(b.rejectionReasons.includes(
    'rank-seat-first-player-exposure-unbalanced'));
  assert.ok(b.rejectionReasons.includes(
    'incomplete-preregistered-attempt-ledger'));
});

test('candidate, policy, vendor, opponent and clock hashes must stay fixed', () => {
  for(const key of ['candidate60Sha','candidatePolicySha',
    'engineAndHooksSha','opponentPolicyBundleSha','adjudicationProtocolSha']){
    const f = fixture(5);
    f.attempts[1][key]='0'.repeat(64);
    const b=assessBalancedFieldKl(f);
    assert.equal(b.conditionalLowerBound,null);
    assert.ok(b.rejectionReasons.some(x=>x.endsWith('-changed')));
  }
});

test('reusing physical deal or paper receipt IDs invalidates pooled results', () => {
  const f = fixture(5);
  f.attempts[1].physicalDealId=f.attempts[0].physicalDealId;
  f.attempts[2].paperReceiptId=f.attempts[0].paperReceiptId;
  const b=assessBalancedFieldKl(f);
  assert.equal(b.conditionalLowerBound,null);
  assert.ok(b.rejectionReasons.includes('duplicate-or-missing-physical-deal'));
  assert.ok(b.rejectionReasons.includes('duplicate-or-missing-paper-receipt'));
});

test('zero-win, all-win, impossible sample and invalid confidence boundaries', () => {
  assert.equal(lowerKlBound(0,640,0.95),0);
  assert.ok(Math.abs(lowerKlBound(640,640,.95)-
    Math.exp(Math.log(.05)/640))<1e-14);
  assert.throws(()=>lowerKlBound(-1,640,.95),RangeError);
  assert.throws(()=>lowerKlBound(641,640,.95),RangeError);
  assert.throws(()=>lowerKlBound(1,0,.95),RangeError);
  assert.throws(()=>lowerKlBound(1,640,1),RangeError);
});

test('conservative upper-tail KL bound dominates exact heterogeneous Bernoulli tails', () => {
  const profiles = [
    [0, 0.1, 0.9, 1],
    [0.01, 0.25, 0.3, 0.99],
    [0.4, 0.4, 0.4, 0.4],
    [0.05, 0.95, 0.05, 0.95],
    [0.001, 0.2, 0.7, 0.999]
  ];
  for (const probabilities of profiles) {
    let distribution = [1];
    for (const p of probabilities) {
      const next = Array(distribution.length + 1).fill(0);
      for (let k = 0; k < distribution.length; k++) {
        next[k] += distribution[k] * (1 - p);
        next[k + 1] += distribution[k] * p;
      }
      distribution = next;
    }
    const n = probabilities.length;
    const mu = probabilities.reduce((sum, p) => sum + p, 0) / n;
    for (let k = 0; k <= n; k++) {
      const q = k / n;
      if (q <= mu) continue;
      const exactTail = distribution.slice(k).reduce((a, b) => a + b, 0);
      const conservativeTail = Math.exp(-n * binaryKl(q, mu));
      assert.ok(exactTail <= conservativeTail + 1e-12,
        'profile=' + probabilities.join(',') + '; wins=' + k +
          '; exact=' + exactTail + '; KL=' + conservativeTail);
    }
  }
});

test('10 games in each of 128 strata and at most two nonwins use the exact field-mean test only under declared iid sampling', () => {
  const f = fixture(10);
  f.stratumSamplingModel = 'iid-bernoulli-v1';
  f.attempts[0].status = 'paper-qualified-loss';
  f.attempts[1].status = 'paper-qualified-tie';
  const result = assessBalancedFieldKl(f);
  assert.equal(result.totalAttempts, 1280);
  assert.equal(result.winCount, 1278);
  assert.equal(result.nonwinCount, 2);
  assert.equal(result.target, 0.995);
  assert.equal(result.confidence, 0.95);
  assert.equal(result.attemptsPerRankSeatAndFirstPlayer, 10);
  assert.equal(result.boundMethod, 'exact-field-mean-two-nonwins-iid');
  assert.equal(result.conditionalLowerBound, null);
  assert.equal(result.conditionalStatisticalThresholdMet, true);
  assert.ok(Math.abs(result.worstCaseNullPValue -
    0.04595004378565184) < 1e-14);
  assert.equal(result.samplingModelDeclaration,
    'iid-bernoulli-v1 (caller assertion; external audit required)');
  assert.equal(result.externalPaperAndIndependenceAuditRequired, true);
});

test('the aggregate exact field-mean branch fails closed to heterogeneous KL without iid declaration', () => {
  const f = fixture(10);
  f.attempts[0].status = 'paper-qualified-loss';
  f.attempts[1].status = 'paper-qualified-tie';
  const result = assessBalancedFieldKl(f);
  assert.equal(result.boundMethod, 'heterogeneous-kl');
  assert.equal(result.worstCaseNullPValue, null);
  assert.ok(result.conditionalLowerBound < 0.995);
  assert.equal(result.conditionalStatisticalThresholdMet, false);
});

test('the aggregate exact field-mean branch is limited to 10 per cell and at most two nonwins', () => {
  const threeNonwins = fixture(10);
  threeNonwins.stratumSamplingModel = 'iid-bernoulli-v1';
  threeNonwins.attempts[0].status = 'paper-qualified-loss';
  threeNonwins.attempts[1].status = 'paper-qualified-tie';
  threeNonwins.attempts[2].status = 'paper-qualified-loss';
  const three = assessBalancedFieldKl(threeNonwins);
  assert.equal(three.boundMethod, 'heterogeneous-kl');
  assert.equal(three.worstCaseNullPValue, null);
  assert.equal(three.conditionalStatisticalThresholdMet, false);

  const ninePerCell = fixture(9);
  ninePerCell.stratumSamplingModel = 'iid-bernoulli-v1';
  ninePerCell.attempts[0].status = 'paper-qualified-loss';
  ninePerCell.attempts[1].status = 'paper-qualified-tie';
  const nine = assessBalancedFieldKl(ninePerCell);
  assert.equal(nine.boundMethod, 'heterogeneous-kl');
  assert.equal(nine.worstCaseNullPValue, null);
  assert.equal(nine.conditionalStatisticalThresholdMet, false);
});

test('an invalid field ledger cannot use the exact aggregate field-mean branch', () => {
  const f = fixture(10);
  f.stratumSamplingModel = 'iid-bernoulli-v1';
  f.attempts[0].status = 'native-win';
  const result = assessBalancedFieldKl(f);
  assert.equal(result.boundMethod, 'not-admissible');
  assert.equal(result.worstCaseNullPValue, null);
  assert.equal(result.conditionalLowerBound, null);
  assert.equal(result.conditionalStatisticalThresholdMet, false);
  assert.ok(result.rejectionReasons.includes('noncompleted-or-unqualified-attempt'));
});

test('the exact aggregate field-mean rule does not transfer to another target or confidence', () => {
  const targetRequest = fixture(10);
  targetRequest.stratumSamplingModel = 'iid-bernoulli-v1';
  targetRequest.target = 0.994;
  targetRequest.attempts[0].status = 'paper-qualified-loss';
  targetRequest.attempts[1].status = 'paper-qualified-tie';
  const targetResult = assessBalancedFieldKl(targetRequest);
  assert.equal(targetResult.boundMethod, 'heterogeneous-kl');
  assert.equal(targetResult.target, 0.994);
  assert.equal(targetResult.worstCaseNullPValue, null);

  const confidenceRequest = fixture(10);
  confidenceRequest.stratumSamplingModel = 'iid-bernoulli-v1';
  confidenceRequest.confidence = 0.9;
  confidenceRequest.attempts[0].status = 'paper-qualified-loss';
  confidenceRequest.attempts[1].status = 'paper-qualified-tie';
  const confidenceResult = assessBalancedFieldKl(confidenceRequest);
  assert.equal(confidenceResult.boundMethod, 'heterogeneous-kl');
  assert.equal(confidenceResult.confidence, 0.9);
  assert.equal(confidenceResult.worstCaseNullPValue, null);
});
