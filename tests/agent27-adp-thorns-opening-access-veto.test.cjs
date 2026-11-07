'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {choose} = require('../simulation/evaluation/agent5-adp-paid-opening.cjs');
const {forcedOpeningIronThorns, noWonderTagOpeningBounds, main} =
  require('../simulation/evaluation/agent27-adp-thorns-opening-access-veto.cjs');

const close = (actual, expected) =>
  assert.ok(Math.abs(actual - expected) < 1e-10,
    `expected ${expected}, observed ${actual}`);

test('original source identity is 6/24/29 only', () => {
  const output = main();
  assert.deepEqual(output.sourceRanks, [6, 24, 29]);
  assert.equal(output.opponentBasics, 4);
  assert.equal(output.competitiveGamesQualified, 0);
});

test('source predicate rejects an extra Basic or a different printing', () => {
  const fixed = {cards: [{category: 'Pokémon', name: 'Iron Thorns ex',
    count: 4, printing: {set: 'TWM', number: '77'}}]};
  assert.equal(forcedOpeningIronThorns(fixed), true);
  assert.equal(forcedOpeningIronThorns({cards: [
    ...fixed.cards, {category: 'Pokémon', name: 'Mew', count: 1}]}), false);
  assert.equal(forcedOpeningIronThorns({cards: [
    {...fixed.cards[0], printing: {set: 'TWM', number: '78'}}]}), false);
});

test('four-Basic opponent offered-bonus masses match independent combinatorics', () => {
  const x = noWonderTagOpeningBounds(4);
  const pa = Number(choose(53, 7)) / Number(choose(60, 7));
  const pb = Number(choose(56, 7)) / Number(choose(60, 7));
  const base = (1-pa)*(1-pb)/(1-pa*pb);
  for (let j = 1; j <= 4; j++)
    close(x.exactBonusMasses[j], base * pb**j);
  close(x.tailFivePlus, base * pb**5 / (1-pb));
  close(x.exactBonusMasses[0], 0.5254306237137515);
  close(x.exactBonusMasses.reduce((s,v)=>s+v,0)+x.tailFivePlus,1);
});

test('four source DCI-axis intervals reuse exact 0-4 bonus BigInts', () => {
  const a = noWonderTagOpeningBounds(4).axes;
  const expected = {
    mechanical: [0.4194330000, 0.44867856545],
    dragons: [0.24273826061, 0.28175067891],
    dragonsEnergy: [0.32069613000, 0.35331534202],
    dragonsEnergyCompressor: [0.35584946701, 0.38658846122]
  };
  for (const [profile, [lower, upper]] of Object.entries(expected)) {
    close(a[profile].lower, lower);
    close(a[profile].upper, upper);
    assert.ok(a[profile].upper > a[profile].lower);
  }
});

test('tail interval shrinks when no five-plus bonus is possible', () => {
  const x = noWonderTagOpeningBounds(60);
  close(x.tailFivePlus,0);
  for (const [key, axis] of Object.entries(x.axes)) {
    assert.ok(key);
    close(axis.lower,axis.upper);
  }
});
