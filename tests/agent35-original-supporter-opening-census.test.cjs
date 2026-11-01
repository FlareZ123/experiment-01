'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  normalizeName, missProbability, openingEnvelope, census, run
} = require('../scripts/agent35-original-supporter-opening-census.cjs');

function near(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-11,
    'expected ' + expected + ' got ' + actual);
}

test('seven-draw zero-hit probability respects disjoint bins', () => {
  near(missProbability(60, 0, 7), 1);
  near(missProbability(60, 60, 7), 0);
  near(missProbability(60, 4, 7), 0.6005003742553344);
});

test('actual Iron Thorns original printed Basic and Supporter counts', () => {
  const e = openingEnvelope(4, 21);
  near(e.basicValid, 0.3994996257446656);
  near(e.supporterUnconditional, 0.9601743619715566);
  near(e.supporterGivenBasic, 0.9438949774424082);
  assert.ok(e.supporterGivenBasic < e.supporterUnconditional);
});

test('no Supporters and high Supporter saturation bound exactly', () => {
  near(openingEnvelope(12, 0).supporterGivenBasic, 0);
  near(openingEnvelope(4, 24).supporterGivenBasic, 0.9677111964571541);
  near(openingEnvelope(12, 2).supporterGivenBasic, 0.20931886382428466);
});

test('two printed Prism Star symbols normalize to the same catalog name', () => {
  assert.equal(normalizeName('Tapu Koko ♢'), normalizeName('Tapu Koko ◇'));
  assert.equal(normalizeName('Ditto ♢'), normalizeName('Ditto ◇'));
});

test('source census counts only certified Basic and Supporter cards', () => {
  const cards = [
    {category: 'Pokémon', name: 'Iron Thorns ex', count: 4, printing: {set: 'TWM', number: '77'}},
    {category: 'Trainer', name: 'Marnie', count: 21, printing: {set: 'SSH', number: '169'}},
    {category: 'Energy', name: 'Lightning Energy', count: 35, printing: {set: 'SVE', number: '4'}}
  ];
  const roster = {published_deck_count: 29, decks: Array.from({length: 29},
    (_, i) => ({rank: i + 1, archetype: 'synthetic-test', cards}))};
  const index = new Map([
    ['Pokémon:Iron Thorns ex', {basic: true, supporter: false}],
    ['Trainer:Marnie', {basic: false, supporter: true}]
  ]);
  const rows = census(roster, index);
  assert.equal(rows.length, 29);
  rows.forEach(row => {
    assert.equal(row.basic, 4);
    assert.equal(row.supporter, 21);
    assert.equal(row.conservativeRefill, 21);
    near(row.conservativeRefillGivenBasic, 0.9438949774424082);
    near(row.supporterGivenBasic, 0.9438949774424082);
  });
  index.set('Trainer:Marnie', {basic: false, supporter: true, ambiguous: true});
  assert.throws(() => census(roster, index), /Missing or ambiguous printed classification/);
});

test('all 29 authentic source 60s classify with exact promo and PHF aliases', () => {
  const data = run();
  assert.equal(data.exactOriginals, 29);
  assert.deepEqual(data.missingRanks, [23, 25, 28]);
  assert.equal(data.rows.reduce((sum, row) => sum + row.supporter, 0), 297);
  assert.equal(data.rows.filter(row => row.guzma > 0).length, 25);
  near(data.meanValid, 0.6654817485365387);
  const rank11 = data.rows.find(row => row.rank === 11);
  assert.deepEqual([rank11.basic, rank11.supporter, rank11.guzma], [11, 8, 2]);
  near(rank11.supporterGivenBasic, 0.6293697246534287);
  assert.equal(rank11.conservativeRefill, 3);
  near(rank11.conservativeRefillGivenBasic, 0.297846463016);
  const rank24 = data.rows.find(row => row.rank === 24);
  assert.deepEqual([rank24.basic, rank24.supporter], [4, 24]);
  near(rank24.supporterGivenBasic, 0.9677111964571541);
  assert.equal(rank24.conservativeRefill, 1);
  near(rank24.conservativeRefillGivenBasic, 0.104140572867);
  const rank6 = data.rows.find(row => row.rank === 6);
  assert.equal(rank6.conservativeRefill, 1);
  near(rank6.conservativeRefillGivenBasic, 0.104140572867);
  near(rank6.otherSupporterButNoConservativeRefillGivenBasic,
    0.839754404575);
});
