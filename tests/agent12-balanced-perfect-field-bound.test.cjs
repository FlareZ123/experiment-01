'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {assessPerfectField} =
  require('../scripts/agent12-balanced-perfect-field-bound.cjs');

const A = 'a'.repeat(64);
const B = 'b'.repeat(64);
const C = 'c'.repeat(64);
const D = 'd'.repeat(64);

/** @param {number} perStratum */
function fixture(perStratum) {
  const originalSources = Array.from({length: 32}, (_, i) => ({
    rank: i + 1, source60Sha: (i + 1).toString(16).padStart(64, '0'),
    authenticatedSource60: true
  }));
  const attempts = [];
  for (const source of originalSources) {
    for (const seat of [0, 1]) {
      for (const firstPlayerSeat of [0, 1]) {
        for (let i = 0; i < perStratum; i++) {
        const id = source.rank + '/' + seat + '/' + firstPlayerSeat + '/' + i;
        attempts.push({
          rank: source.rank, seat, firstPlayerSeat,
          trialId: id, physicalDealId: 'deal/' + id,
          paperReceiptId: 'receipt/' + id, status: 'paper-qualified-win',
          source60Sha: source.source60Sha,
          candidate60Sha: A, candidatePolicySha: B, registrationSha: C
        });
        }
      }
    }
  }
  return {
    originalSources, attempts, registeredAttemptCount: attempts.length,
    registrationSha: C
  };
}

test('five distinct wins per rank-seat-first-player pass conditional 99.5% threshold', () => {
  const result = assessPerfectField(fixture(5));
  assert.equal(result.totalAttempts, 640);
  assert.equal(result.attemptsPerRankSeatAndFirstPlayer, 5);
  assert.equal(result.requiredPerRankSeatAndFirstPlayer, 5);
  assert.deepEqual(result.rejectionReasons, []);
  assert.equal(result.conditionalStatisticalThresholdMet, true);
  assert.ok(Math.abs(result.conditionalLowerBound -
    0.9953301063421702) < 1e-12);
  assert.equal(result.externalPaperAndIndependenceAuditRequired, true);
});

test('four per rank-seat-first-player fail threshold without claiming an invalid ledger', () => {
  const result = assessPerfectField(fixture(4));
  assert.equal(result.conditionalStatisticalThresholdMet, false);
  assert.deepEqual(result.rejectionReasons, []);
  assert.ok(Math.abs(result.conditionalLowerBound -
    0.9941660443994437) < 1e-12);
});

test('missing three original source 60s fail closed', () => {
  const request = fixture(5);
  request.originalSources =
    request.originalSources.filter(source => ![23, 25, 28].includes(source.rank));
  const result = assessPerfectField(request);
  assert.equal(result.conditionalLowerBound, null);
  assert.ok(result.rejectionReasons.includes('field-incomplete'));
  assert.ok(result.rejectionReasons.includes('source-identity-mismatch'));
});

test('a nonwin, an unqualified native terminal, or a censored attempt is vetoed', () => {
  for (const status of ['loss', 'native-win', 'censored', 'error', 'tie']) {
    const request = fixture(5);
    request.attempts[0].status = status;
    const result = assessPerfectField(request);
    assert.equal(result.conditionalLowerBound, null);
    assert.ok(result.rejectionReasons.includes('nonwin-or-unqualified-attempt'));
  }
});

test('same physical opening reused as a paired game is not independent', () => {
  const request = fixture(5);
  request.attempts[1].physicalDealId = request.attempts[0].physicalDealId;
  const result = assessPerfectField(request);
  assert.equal(result.conditionalLowerBound, null);
  assert.ok(result.rejectionReasons.includes('duplicate-or-missing-physical-deal'));
});

test('an unreported preregistered attempt cannot be silently dropped', () => {
  const request = fixture(5);
  request.registeredAttemptCount++;
  const result = assessPerfectField(request);
  assert.ok(result.rejectionReasons.includes(
    'incomplete-preregistered-attempt-ledger'));
});

test('unequal seat exposure, including a missing seat, is rejected', () => {
  const request = fixture(5);
  request.attempts.pop();
  request.registeredAttemptCount--;
  const result = assessPerfectField(request);
  assert.ok(result.rejectionReasons.includes('rank-seat-first-player-exposure-unbalanced'));
});

test('candidate swap or policy mutation invalidates a fixed-treatment panel', () => {
  for (const key of ['candidate60Sha', 'candidatePolicySha']) {
    const request = fixture(5);
    request.attempts[1][key] = D;
    const result = assessPerfectField(request);
    assert.ok(result.rejectionReasons.includes('candidate-or-policy-changed'));
  }
});

test('nonmatching registration and source identities are rejected', () => {
  const request = fixture(5);
  request.attempts[0].registrationSha = D;
  request.attempts[1].source60Sha = D;
  const result = assessPerfectField(request);
  assert.ok(result.rejectionReasons.includes('registration-mismatch'));
  assert.ok(result.rejectionReasons.includes('source-identity-mismatch'));
});

test('duplicate game and paper receipts do not count twice', () => {
  const request = fixture(5);
  request.attempts[1].trialId = request.attempts[0].trialId;
  request.attempts[2].paperReceiptId = request.attempts[0].paperReceiptId;
  const result = assessPerfectField(request);
  assert.ok(result.rejectionReasons.includes('duplicate-or-missing-trial'));
  assert.ok(result.rejectionReasons.includes('duplicate-or-missing-paper-receipt'));
});

test('unverified source manifests and malformed confidence are rejected', () => {
  const request = fixture(5);
  request.originalSources[0].authenticatedSource60 = false;
  assert.ok(assessPerfectField(request).rejectionReasons.includes(
    'source-unverified'));
  assert.throws(() => assessPerfectField({...fixture(5), confidence: 1}),
    RangeError);
  assert.throws(() => assessPerfectField({...fixture(5), target: 0}),
    RangeError);
  assert.throws(() => assessPerfectField(null), TypeError);
});

test('empty or incomplete panel never produces a numeric lower bound', () => {
  const request = fixture(0);
  const result = assessPerfectField(request);
  assert.equal(result.conditionalLowerBound, null);
  assert.ok(result.rejectionReasons.includes('rank-seat-first-player-exposure-unbalanced'));
});
