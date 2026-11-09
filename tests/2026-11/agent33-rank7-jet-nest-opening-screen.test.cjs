'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const {COUNTS, choose, allocation, calculate} =
  require('../../scripts/2026-11/agent33-rank7-jet-nest-opening-screen.cjs');

test('binomial arithmetic and class allocation have exact integer results', () => {
  assert.equal(choose(60, 7), 386206920n);
  assert.equal(choose(53, 6), 22957480n);
  assert.equal(choose(47, 2), 1081n);
  assert.equal(choose(8, 9), 0n);
  assert.equal(allocation(3, 1, 1, 1), 6n);
});

test('original rank7 printed card counts agree with opening-screen categories', () => {
  const pathName = path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json');
  const source = JSON.parse(fs.readFileSync(pathName, 'utf8'));
  const rank7 = source.decks.find(deck => deck.rank === 7);
  assert.ok(rank7);
  const countName = name => rank7.cards
    .filter(row => row.name === name).reduce((n, row) => n + row.count, 0);
  const pokemonCount = rank7.cards.filter(row => row.category === 'Pokémon')
    .reduce((n, row) => n + row.count, 0);
  const allCount = rank7.cards.reduce((n, row) => n + row.count, 0);
  assert.equal(allCount, 60);
  assert.equal(countName('Jet Energy'), COUNTS.jet);
  assert.equal(countName('Nest Ball'), COUNTS.nest);
  assert.equal(countName('Wobbuffet'), COUNTS.wobbuffet);
  assert.equal(pokemonCount - countName('Wobbuffet'), COUNTS.otherBasics);
  assert.equal(allCount - pokemonCount - COUNTS.jet - COUNTS.nest,
    COUNTS.remaining);
});

test('joint Jet plus Nest early resource screen is combinatorially exact', () => {
  const r = calculate();
  assert.equal(r.denominator, 7757255669109186240n);
  assert.equal(r.numerator, 140716470206610936n);
  assert.equal(r.strictOtherBasicNumerator, 118915272556537248n);
  assert.equal(r.sourceBasicCount, 12);
  assert.ok(r.strictOtherBasicNumerator < r.numerator);
  assert.ok(r.numerator < r.denominator);
  console.log('AGENT33_RANK7_EARLY_SCREEN', JSON.stringify({
    denominator: r.denominator.toString(),
    jetNestAndWobbRemainingNumerator: r.numerator.toString(),
    extraOtherBasicStarterNumerator:
      r.strictOtherBasicNumerator.toString(),
    qualifiedGames: 0
  }));
});
