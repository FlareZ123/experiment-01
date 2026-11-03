'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { choose, exactAccess, bonusProbability, withMaxMulliganBonuses } = require('../scripts/agent11-thorns-first-volt-access.cjs');
const field = require('../results/aichi-2026/full-decklists.json');

test('integer combinatorics boundaries', () => {
  assert.equal(choose(60, 0), 1n);
  assert.equal(choose(5, 2), 10n);
  assert.equal(choose(2, 3), 0n);
});

const sourceCounts = new Map([
  [6, { d: 1, numerator: 56238988836673440n, direct: 2128188148894080n }],
  [24, { d: 3, numerator: 65106215030784032n, direct: 5826332118166560n }],
  [29, { d: 1, numerator: 56238988836673440n, direct: 2128188148894080n }]
]);

for (const [rank, data] of sourceCounts) {
  test(`original Aichi rank ${rank} source printing and exact access`, () => {
    const deck = field.decks.find(d => d.rank === rank);
    assert.ok(deck);
    assert.equal(deck.cards.reduce((s, c) => s + c.count, 0), 60);
    assert.deepEqual(deck.cards.filter(c => c.category === 'Pokémon')
      .map(c => [c.count, c.name, c.printing.set, c.printing.number]),
      [[4, 'Iron Thorns ex', 'TWM', '77']]);
    const count = (name, set, number) => {
      const entries = deck.cards.filter(c => c.name === name);
      assert.equal(entries.length, 1, name);
      assert.equal(entries[0].printing.set, set);
      assert.equal(entries[0].printing.number, number);
      return entries[0].count;
    };
    assert.equal(count('Tag Call', 'CEC', '206'), 2);
    assert.equal(count('Guzma & Hala', 'CEC', '193'), 2);
    assert.equal(count('Thunder Mountain ♢', 'LOT', '191'), 1);
    assert.equal(count('Double Colorless Energy', 'SUM', '136'), data.d);

    const a = exactAccess(data.d);
    assert.equal(a.denominator, 166478632771651200n);
    assert.equal(a.available, data.numerator);
    assert.equal(a.direct, data.direct);
    assert.equal(a.supporter, data.numerator - data.direct);
    assert.equal(a.direct + a.supporter, a.available);
  });
}

test('bonus-zero extension equals original eight-card hand model', () => {
  const original = exactAccess(1);
  const extended = exactAccess(1, 0);
  assert.deepEqual(extended, original);
});

test('source/opponent independent geometric mulligan differences sum to one', () => {
  for (const basics of [14, 17]) {
    const got = Array.from({ length: 21 }, (_, k) => bonusProbability(basics, k))
      .reduce((a, b) => a + b, 0);
    const omitted = withMaxMulliganBonuses(1, basics).omittedMass;
    assert.ok(Math.abs(got + omitted - 1) < 1e-12);
  }
});

test('reference fourteen-Basic and New Moon seventeen-Basic all-bonus openings', () => {
  const expected = [
    [1, 14, 0.34046174878125296],
    [1, 17, 0.3392661197149487],
    [3, 14, 0.39420814792619385],
    [3, 17, 0.39279466460237933]
  ];
  for (const [d, opposingBasics, target] of expected) {
    const got = withMaxMulliganBonuses(d, opposingBasics);
    assert.ok(Math.abs(got.probability - target) < 1e-12);
    assert.ok(got.omittedMass < 1e-15);
  }
});
