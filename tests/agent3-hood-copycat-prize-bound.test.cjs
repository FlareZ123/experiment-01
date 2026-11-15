'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { choose, prizeUnavailable, study } =
  require('../scripts/agent3-hood-copycat-prize-bound.cjs');

test('BigInt binomial coefficients are exact', () => {
  assert.equal(choose(60, 6), 50063860n);
  assert.equal(choose(60, 0), 1n);
  assert.equal(choose(5, 6), 0n);
});

test('current one-Mimikyu/one-Dialga line has exact 113/590 prize failure', () => {
  assert.deepEqual(prizeUnavailable(1, 1), {
    numerator: '113',
    denominator: '590',
    probability: 113 / 590,
    percent: 100 * 113 / 590
  });
});

test('adding either second required copy gives the same exact prize bound', () => {
  const expected = {
    numerator: '923',
    denominator: '8555',
    probability: 923 / 8555,
    percent: 100 * 923 / 8555
  };
  assert.deepEqual(prizeUnavailable(2, 1), expected);
  assert.deepEqual(prizeUnavailable(1, 2), expected);
});

test('two copies of each required identity reduce prize failure to 550/32509', () => {
  assert.deepEqual(prizeUnavailable(2, 2), {
    numerator: '550',
    denominator: '32509',
    probability: 550 / 32509,
    percent: 100 * 550 / 32509
  });
});

test('study returns all four documented copy-count scenarios', () => {
  assert.deepEqual(study().map(row => [
    row.mimikyuCopies,
    row.dialgaCopies,
    row.unavailable.numerator,
    row.unavailable.denominator
  ]), [
    [1, 1, '113', '590'],
    [2, 1, '923', '8555'],
    [1, 2, '923', '8555'],
    [2, 2, '550', '32509']
  ]);
});

test('invalid copy counts and prize geometry fail closed', () => {
  assert.throws(() => prizeUnavailable(0, 1), /both required identities/);
  assert.throws(() => prizeUnavailable(1, 1, { deckSize: 5, prizeCount: 6 }),
    /prizeCount cannot exceed deckSize/);
  assert.throws(() => prizeUnavailable(4, 3, { deckSize: 6, prizeCount: 6 }),
    /required copies cannot exceed deckSize/);
});
