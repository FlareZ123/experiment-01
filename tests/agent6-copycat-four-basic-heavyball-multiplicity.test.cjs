'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  enumerateCopycatPrizeCut,
  runCopycatHeavyBallSensitivity
} = require('../simulation/evaluation/agent6-copycat-four-basic-heavyball-multiplicity.cjs');

const base = {
  mimikyuCopies: 1,
  dialgaGxCopies: 1,
  radiantEternatusCopies: 1,
  lilliesClefairyExCopies: 2,
  otherBasicCopies: 9,
  totalCards: 60,
  handSize: 7,
  prizeCount: 6,
  fieldCopies: 11,
  fieldSize: 32
};

test('one Heavy Ball exactly reproduces the published four-Basic obstruction', () => {
  const result = enumerateCopycatPrizeCut({...base, heavyBallCopies: 1});
  assert.equal(result.otherNonBasicCopies, 45);
  assert.equal(result.totalWeight, '7637545871155200');
  assert.equal(result.blockedWeight, '357524646942720');
  assert.deepEqual(result.prizeOnlyObstruction, {
    numerator: '11638172101',
    denominator: '248618029660'
  });
  assert.ok(Math.abs(result.prizeOnlyObstructionPercent -
    4.681145658227561) < 1e-12);
});

test('two Heavy Balls reduce the four-Basic Prize-only cut below the 0.5% field budget', () => {
  const result = enumerateCopycatPrizeCut({...base, heavyBallCopies: 2});
  assert.equal(result.otherNonBasicCopies, 44);
  assert.equal(result.totalWeight, '7637545871155200');
  assert.equal(result.blockedWeight, '41811397597632');
  assert.deepEqual(result.prizeOnlyObstruction, {
    numerator: '16751361217',
    denominator: '3059914211200'
  });
  assert.deepEqual(result.fieldWeightedContribution, {
    numerator: '16751361217',
    denominator: '8901568614400'
  });
  assert.ok(result.fieldWeightedContributionPercentagePoints < 0.5);
});

test('three Heavy Balls further reduce the Prize-only cut with diminishing returns', () => {
  const result = enumerateCopycatPrizeCut({...base, heavyBallCopies: 3});
  assert.equal(result.otherNonBasicCopies, 43);
  assert.equal(result.totalWeight, '7637545871155200');
  assert.equal(result.blockedWeight, '3366182777156');
  assert.deepEqual(result.prizeOnlyObstruction, {
    numerator: '841545694289',
    denominator: '1909386467788800'
  });
  assert.deepEqual(result.fieldWeightedContribution, {
    numerator: '841545694289',
    denominator: '5554578815385600'
  });
});

test('sensitivity output is monotone and preserves the same legal-opening denominator', () => {
  const result = runCopycatHeavyBallSensitivity();
  const [one, two, three] = result.variants;
  assert.equal(result.schema, 'agent6-copycat-four-basic-heavyball-prize-cut-v1');
  assert.equal(one.totalWeight, two.totalWeight);
  assert.equal(two.totalWeight, three.totalWeight);
  assert.ok(one.prizeOnlyObstructionPercent >
    two.prizeOnlyObstructionPercent);
  assert.ok(two.prizeOnlyObstructionPercent >
    three.prizeOnlyObstructionPercent);
  assert.ok(Math.abs(two.reductionVsOneCopy - 8.550889649356483) < 1e-12);
  assert.ok(Math.abs(three.reductionVsOneCopy - 106.21070530364463) < 1e-10);
});

test('invalid fixed-deck configurations are rejected', () => {
  assert.throws(() => enumerateCopycatPrizeCut({
    ...base, heavyBallCopies: 100
  }), /Card counts exceed the fixed deck size/);
});

test('one extra Heavy Ball outperforms one extra copy of any single Basic role on Prize obstruction', () => {
  const result = runCopycatHeavyBallSensitivity();
  const [mimikyu, dialga, radiant, clefairy] =
    result.singleSlotRoleVariants;
  for (const variant of [mimikyu, dialga, radiant]) {
    assert.deepEqual(variant.prizeOnlyObstruction, {
      numerator: '89579309009',
      denominator: '3343818770600'
    });
  }
  assert.deepEqual(clefairy.prizeOnlyObstruction, {
    numerator: '151447874219',
    denominator: '3343818770600'
  });
  assert.ok(result.variants[1].prizeOnlyObstructionPercent <
    mimikyu.prizeOnlyObstructionPercent);
  assert.ok(result.variants[1].prizeOnlyObstructionPercent <
    dialga.prizeOnlyObstructionPercent);
  assert.ok(result.variants[1].prizeOnlyObstructionPercent <
    radiant.prizeOnlyObstructionPercent);
  assert.ok(result.variants[1].prizeOnlyObstructionPercent <
    clefairy.prizeOnlyObstructionPercent);
});
