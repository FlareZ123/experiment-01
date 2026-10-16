'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  conditionalRankLossBudget, candidateDonkBudget
} = require('../scripts/aichi_rank26_loss_budget.cjs');

test('32 equal-placement 99.5% target constrains a single opponent loss to 16%', () => {
  const q = conditionalRankLossBudget(0.375068, 0.995, 32);
  assert.ok(Math.abs(q.rankLossBudget - 0.16) < 1e-10);
  assert.ok(Math.abs(q.maximalConditionalEventLoss - 0.4265893118047927) < 1e-10);
  assert.equal(q.binding, true);
  const nonbinding = conditionalRankLossBudget(0.10, 0.995, 32);
  assert.equal(nonbinding.maximalConditionalEventLoss, 1);
  assert.equal(nonbinding.binding, false);
});

test('conditional budget rejects invalid target, zero exposure, or field size', () => {
  assert.throws(() => conditionalRankLossBudget(0, 0.995, 32), /Invalid/);
  assert.throws(() => conditionalRankLossBudget(0.2, 0, 32), /Invalid/);
  assert.throws(() => conditionalRankLossBudget(0.2, 0.995, 0), /Invalid/);
});

/** @param {boolean} withWobbuffet */
function fixedSyntheticDeck(withWobbuffet) {
  const cards = [
    ...['A', 'B', 'C'].map(name => ({
      category: 'Pokémon', name, count: 4
    })),
    {category: 'Pokémon', name: 'D', count: 2},
  ];
  if (withWobbuffet) {
    cards.push({
      category: 'Pokémon', name: 'Wobbuffet', count: 1,
      printing: {set: 'PHF', number: '36'}
    });
  }
  const b = withWobbuffet ? 15 : 14;
  cards.push({category: 'Energy', name: 'Psychic Energy', count: 60 - b});
  return {
    rank: 0, archetype: 'Synthetic Shadow Rider-like composition',
    category_counts: {'Pokémon': b, Energy: 60 - b},
    cards
  };
}

test('source-model anchor: 14 ordinary Basics and optional PHF Wobbuffet', () => {
  const index = new Map(
    ['A', 'B', 'C', 'D', 'Wobbuffet'].map(name => [name, true])
  );
  const champion = candidateDonkBudget(fixedSyntheticDeck(false), index, 12);
  const temple = candidateDonkBudget(fixedSyntheticDeck(true), index, 12);
  assert.equal(champion.basicCount, 14);
  assert.equal(champion.protectedWobbuffetCopies, 0);
  assert.equal(temple.basicCount, 15);
  assert.equal(temple.protectedWobbuffetCopies, 1);
  assert.ok(Math.abs(champion.modeledUnprotectedSoloExposure - 0.3750680) < 1e-7);
  assert.ok(Math.abs(temple.modeledUnprotectedSoloExposure - 0.3168266) < 1e-7);
  assert.ok(Math.abs(champion.maximalConditionalEventLoss - 0.4265893) < 1e-6);
  assert.ok(Math.abs(temple.maximalConditionalEventLoss - 0.5050081) < 1e-6);
});
