'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { exactEarlyAccess } = require('../scripts/agent43-copycat-early-access.cjs');

test('valid opening probability is unchanged by core multiplicity when total Basics stays 14', () => {
  for (const [mimikyuCopies, dialgaCopies, heavyBallCopies] of [
    [1, 1, 1], [1, 1, 2], [2, 1, 1], [1, 2, 1], [2, 2, 1], [2, 2, 2]
  ]) {
    const result = exactEarlyAccess({ mimikyuCopies, dialgaCopies, heavyBallCopies, naturalDraws: 2 });
    assert.ok(Math.abs(result.validOpeningProbability - 0.8614093191287199) < 1e-12);
    assert.equal(result.otherBasics, 14 - mimikyuCopies - dialgaCopies);
  }
});

test('hard Prize-only obstruction reproduces Agent21 1/1/1 and 1/1/2 exact values', () => {
  const one = exactEarlyAccess({ heavyBallCopies: 1, naturalDraws: 0 });
  const two = exactEarlyAccess({ heavyBallCopies: 2, naturalDraws: 0 });
  assert.deepEqual(one.exact.hardPrizeOnlyObstruction, { numerator: '139744719', denominator: '5904101632' });
  assert.deepEqual(two.exact.hardPrizeOnlyObstruction, { numerator: '18690899', denominator: '8515531200' });
});

test('a second copy of either core species improves early recovery more than a second Heavy Ball alone', () => {
  const extraMimikyu = exactEarlyAccess({ mimikyuCopies: 2, dialgaCopies: 1, heavyBallCopies: 1, naturalDraws: 2 });
  const extraDialga = exactEarlyAccess({ mimikyuCopies: 1, dialgaCopies: 2, heavyBallCopies: 1, naturalDraws: 2 });
  const extraHeavy = exactEarlyAccess({ mimikyuCopies: 1, dialgaCopies: 1, heavyBallCopies: 2, naturalDraws: 2 });
  assert.ok(extraMimikyu.earlyCoreRecoveryProbabilityGivenValidOpening > extraHeavy.earlyCoreRecoveryProbabilityGivenValidOpening);
  assert.ok(extraDialga.earlyCoreRecoveryProbabilityGivenValidOpening > extraHeavy.earlyCoreRecoveryProbabilityGivenValidOpening);
  assert.equal(extraMimikyu.earlyCoreRecoveryProbabilityGivenValidOpening, extraDialga.earlyCoreRecoveryProbabilityGivenValidOpening);
});

test('two copies of both core species sharply reduce Prize obstruction while preserving Basic density', () => {
  const result = exactEarlyAccess({ mimikyuCopies: 2, dialgaCopies: 2, heavyBallCopies: 1, naturalDraws: 2 });
  assert.equal(result.otherBasics, 10);
  assert.ok(result.hardPrizeOnlyObstructionGivenValidOpening < 0.0012);
  assert.ok(result.earlyCoreRecoveryProbabilityGivenValidOpening > 0.988);
});

test('a second Heavy Ball has only a small marginal early-access effect after doubling both core species', () => {
  const one = exactEarlyAccess({ mimikyuCopies: 2, dialgaCopies: 2, heavyBallCopies: 1, naturalDraws: 2 });
  const two = exactEarlyAccess({ mimikyuCopies: 2, dialgaCopies: 2, heavyBallCopies: 2, naturalDraws: 2 });
  assert.ok(two.earlyCoreRecoveryProbabilityGivenValidOpening > one.earlyCoreRecoveryProbabilityGivenValidOpening);
  assert.ok(two.earlyCoreRecoveryProbabilityGivenValidOpening - one.earlyCoreRecoveryProbabilityGivenValidOpening < 0.002);
});

test('early recovery increases with draws and Arven helps only when an unprized Heavy Ball remains', () => {
  for (const naturalDraws of [0, 1, 2]) {
    const withArven = exactEarlyAccess({ heavyBallCopies: 1, naturalDraws, includeArven: true });
    const withoutArven = exactEarlyAccess({ heavyBallCopies: 1, naturalDraws, includeArven: false });
    assert.ok(withArven.earlyCoreRecoveryProbabilityGivenValidOpening >= withoutArven.earlyCoreRecoveryProbabilityGivenValidOpening);
    assert.deepEqual(withArven.exact.hardPrizeOnlyObstruction, withoutArven.exact.hardPrizeOnlyObstruction);
  }
});

test('invalid card counts and draw horizons fail closed', () => {
  assert.throws(() => exactEarlyAccess({ mimikyuCopies: 4, dialgaCopies: 4, heavyBallCopies: 1, totalBasics: 7 }), /core Basic copies exceed totalBasics/);
  assert.throws(() => exactEarlyAccess({ heavyBallCopies: 1, naturalDraws: 3 }), /naturalDraws out of range/);
});
