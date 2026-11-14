'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { exactEarlyAccess } = require('../scripts/agent43-copycat-early-access.cjs');

test('valid opening probability is unchanged by Heavy Ball multiplicity and draw horizon', () => {
  for (const heavyBallCopies of [1, 2]) {
    for (const naturalDraws of [0, 1, 2]) {
      const result = exactEarlyAccess({ heavyBallCopies, naturalDraws });
      assert.ok(Math.abs(result.validOpeningProbability - 0.8614093191287199) < 1e-12);
      assert.equal(result.exact.validOpenings.numerator, '252032');
      assert.equal(result.exact.validOpenings.denominator, '292581');
    }
  }
});
test('hard Prize-only obstruction reproduces Agent21 exact 1/1/1 and 1/1/2 values', () => {
  const one = exactEarlyAccess({ heavyBallCopies: 1, naturalDraws: 0 });
  const two = exactEarlyAccess({ heavyBallCopies: 2, naturalDraws: 0 });
  assert.deepEqual(one.exact.hardPrizeOnlyObstruction, { numerator: '139744719', denominator: '5904101632' });
  assert.deepEqual(two.exact.hardPrizeOnlyObstruction, { numerator: '18690899', denominator: '8515531200' });
});
test('early recovery feasibility increases with natural draws and Heavy Ball copies', () => {
  for (const heavyBallCopies of [1, 2]) {
    const values = [0, 1, 2].map(naturalDraws =>
      exactEarlyAccess({ heavyBallCopies, naturalDraws }).earlyCoreRecoveryProbabilityGivenValidOpening);
    assert.ok(values[0] < values[1] && values[1] < values[2]);
  }
  for (const naturalDraws of [0, 1, 2]) {
    const one = exactEarlyAccess({ heavyBallCopies: 1, naturalDraws });
    const two = exactEarlyAccess({ heavyBallCopies: 2, naturalDraws });
    assert.ok(two.earlyCoreRecoveryProbabilityGivenValidOpening > one.earlyCoreRecoveryProbabilityGivenValidOpening);
  }
});
test('Arven access helps only when an unprized Heavy Ball remains outside the seen cards', () => {
  const withArven = exactEarlyAccess({ heavyBallCopies: 1, naturalDraws: 2, includeArven: true });
  const withoutArven = exactEarlyAccess({ heavyBallCopies: 1, naturalDraws: 2, includeArven: false });
  assert.ok(withArven.earlyCoreRecoveryProbabilityGivenValidOpening >
    withoutArven.earlyCoreRecoveryProbabilityGivenValidOpening);
  assert.deepEqual(withArven.exact.hardPrizeOnlyObstruction, withoutArven.exact.hardPrizeOnlyObstruction);
});
test('invalid Heavy Ball multiplicity and draw horizons fail closed', () => {
  assert.throws(() => exactEarlyAccess({ heavyBallCopies: 3, naturalDraws: 0 }), /heavyBallCopies/);
  assert.throws(() => exactEarlyAccess({ heavyBallCopies: 1, naturalDraws: 3 }), /naturalDraws/);
});
