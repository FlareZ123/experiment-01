'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {calculate, main} = require('../scripts/new-moon-secret-box-blower-access.cjs');
const {directByFirstDraw} = require('../scripts/new-moon-lockbreak-access.cjs');

test('source-locked first-response opportunity has exact disjoint fractions', () => {
  const report = main();
  assert.equal(report.candidateHash,
    'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  assert.equal(report.basics, 17);
  assert.deepEqual(report.result.direct, {
    numerator: '416435', denominator: '1708349',
    probability: 416435 / 1708349
  });
  assert.deepEqual(report.result.secretBoxOnly, {
    numerator: '49452231', denominator: '493712861',
    probability: 49452231 / 493712861
  });
  assert.deepEqual(report.result.directOrSecretBox, {
    numerator: '169801946', denominator: '493712861',
    probability: 169801946 / 493712861
  });
  assert.deepEqual(report.result.blowerUnprizedAfterBox, {
    numerator: '437', denominator: '442', probability: 437 / 442
  });
});

test('direct component agrees with independent direct-card calculation', () => {
  const direct = directByFirstDraw(17, 2);
  const combined = calculate(17, 2, 1);
  assert.deepEqual(combined.direct, direct);
  assert.ok(Math.abs(
    combined.direct.probability + combined.secretBoxOnly.probability -
    combined.directOrSecretBox.probability
  ) < 1e-15);
});

test('Secret Box adds no Blower search without a Blower to search', () => {
  const noBlowers = calculate(17, 0, 1);
  assert.equal(noBlowers.directOrSecretBox.numerator, '0');
  const noBox = calculate(17, 2, 0);
  assert.equal(noBox.secretBoxOnly.numerator, '0');
  assert.deepEqual(noBox.direct, directByFirstDraw(17, 2));
});

test('invalid source inventory conditions are rejected', () => {
  assert.throws(() => calculate(0, 2, 1));
  assert.throws(() => calculate(17, 7, 1));
  assert.throws(() => calculate(59, 2, 1));
  assert.throws(() => calculate(17, -1, 1));
});
