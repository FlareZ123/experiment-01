'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {decks} = require('../results/aichi-2026/full-decklists.json');
const {choose, rank6PrizeEnergyFeasibility} =
  require('../scripts/aichi-rank6-energy-prize-frontier.cjs');

test('binomial identity and impossible group counts', () => {
  assert.equal(choose(60, 6), 50063860n);
  assert.equal(choose(4, 5), 0n);
  assert.equal(choose(4, -1), 0n);
});

test('the exact rank6 source profile and opening-conditioned proof', () => {
  const result = rank6PrizeEnergyFeasibility(decks.find(row => row.rank === 6));
  assert.equal(result.totalPrizeSets, '50063860');
  assert.deepEqual(result.nonrecoverableEnergyCostUnconditional, {
    numerator: '1', denominator: '910252',
    probability: 1 / 910252
  });
  assert.deepEqual(result.nonrecoverableEnergyCostGivenValidOpening, {
    numerator: '1395', denominator: '1181171992',
    probability: 1395 / 1181171992
  });
  assert.equal(result.dcePrizedGivenValidOpening.numerator, '79029');
  assert.equal(result.dcePrizedGivenValidOpening.denominator, '779240');
});

test('the model is bound to the published rank6 source inventory', () => {
  const source = structuredClone(decks.find(row => row.rank === 6));
  source.cards.find(card => card.name === 'Speed Lightning Energy').count = 3;
  assert.throws(() => rank6PrizeEnergyFeasibility(source), assert.AssertionError);
});
