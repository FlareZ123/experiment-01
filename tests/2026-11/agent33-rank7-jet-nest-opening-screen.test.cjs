'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const {COUNTS, choose, allocation, calculate, calculateUnion, calculateAllItems} =
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
  assert.equal(countName('VS Seeker'), 3);
  assert.equal(countName('Robo Substitute'), 2);
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

test('one Nest or three VS Seeker copies expands Jet resource-screen ceiling', () => {
  const singleton = calculate();
  const union = calculateUnion();
  assert.equal(union.denominator, singleton.denominator);
  assert.equal(union.earlyItemCopies, 4);
  assert.equal(union.numerator, 474015258692331444n);
  assert.equal(union.strictOtherBasicNumerator, 401658682781505888n);
  assert.ok(union.numerator > singleton.numerator);
  assert.ok(union.strictOtherBasicNumerator >
    singleton.strictOtherBasicNumerator);
  console.log('AGENT33_RANK7_NEST_OR_VS_SCREEN', JSON.stringify({
    numerator:union.numerator.toString(),
    strictNumerator:union.strictOtherBasicNumerator.toString(),
    denominator:union.denominator.toString(),
    qualification:'unverified-Item-payability-and-Faba-discard-excluded'
  }));
});

test('six-Item Jet resource screen includes two original Robo Substitute copies', () => {
  const prior = calculateUnion();
  const all = calculateAllItems();
  assert.equal(all.denominator, 7757255669109186240n);
  assert.equal(all.earlyItemCopies, 6);
  assert.equal(all.numerator, 635830741862240364n);
  assert.equal(all.strictOtherBasicNumerator, 539678102946586848n);
  assert.ok(all.numerator > prior.numerator);
  assert.ok(all.strictOtherBasicNumerator > prior.strictOtherBasicNumerator);
  console.log('AGENT33_RANK7_SIX_ITEM_SCREEN',JSON.stringify({
    numerator:all.numerator.toString(),
    strictNumerator:all.strictOtherBasicNumerator.toString(),
    denominator:all.denominator.toString(),
    caveat:'pure-card-location-screen-no-Item-payability'
  }));
});
