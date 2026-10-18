'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const {choose, exactPairAccess, rank31Counts} =
  require('../scripts/rank31-roxie-pair.cjs');

/**
 * Independent physical-deal enumeration for a small distinguishable deck.
 * @param {number} h Opening size.
 * @param {number} d Further ordinary draws.
 */
function miniatureOracle(h, d) {
  const deck = ['K', 'K', 'R', 'R', 'B', 'X', 'X', 'X'];
  let valid = 0;
  let paired = 0;
  function visit(i) {
    if (i === deck.length) {
      if (!deck.slice(0, h).some(c => c === 'K' || c === 'B')) return;
      valid++;
      const seen = deck.slice(0, h + d);
      if (seen.includes('K') && seen.includes('R')) paired++;
      return;
    }
    for (let j = i; j < deck.length; j++) {
      [deck[i], deck[j]] = [deck[j], deck[i]];
      visit(i + 1);
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }
  visit(0);
  return {valid, paired};
}

test('BigInt combinations preserve physical sample counts', () => {
  assert.equal(choose(60, 7), 386206920n);
  assert.equal(choose(60, 8), 2558620845n);
  assert.equal(choose(6, 7), 0n);
});

test('independent exhaustive eight-card deal oracle, one further draw', () => {
  const model = exactPairAccess({n:8, b:3, k:2, r:2, h:3, d:1});
  const oracle = miniatureOracle(3, 1);
  assert.equal(model.numerator * BigInt(oracle.valid),
    model.denominator * BigInt(oracle.paired));
});

test('independent exhaustive eight-card deal oracle, two further draws', () => {
  const model = exactPairAccess({n:8, b:3, k:2, r:2, h:3, d:2});
  const oracle = miniatureOracle(3, 2);
  assert.equal(model.numerator * BigInt(oracle.valid),
    model.denominator * BigInt(oracle.paired));
});

test('published rank31 source directly confirms counts and exact fractions', () => {
  const source = rank31Counts();
  assert.deepEqual(source, {n:60, b:15, k:3, r:4, h:7});
  assert.deepEqual(exactPairAccess({...source, d:1}),
    {numerator:168070n, denominator:1044153n});
  assert.deepEqual(exactPairAccess({...source, d:2}),
    {numerator:39038711n, denominator:200709410n});
});
