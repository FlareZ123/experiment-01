'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {addAnyToolRoutes, main} =
  require('../scripts/aichi-absol-any-tool-first-turn.cjs');
const {directGarbotoxinProbability} =
  require('../scripts/absol-garbotoxin-direct-lock.cjs');

/** @param {number} actual @param {number} expected */
function near(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} versus ${expected}`);
}

test('the source Tool substitute is unrestricted Muscle Band XY121', () => {
  const card = require('../resources/cards/en/xy1.json')
    .find(x => x.id === 'xy1-121');
  assert.equal(card.name, 'Muscle Band');
  assert.ok(card.subtypes.includes('Pokémon Tool'));
  assert.match(card.rules[0], /1 of your Pokémon/);
  assert.doesNotMatch(card.rules[0], /Pokémon V|Evolution/);
});

test('all four source 60s contain one more compatible Tool', () => {
  const rows = main().rows;
  assert.deepEqual(rows.map(row => row.rank), [8, 11, 16, 22]);
  assert.deepEqual(rows.map(row => row.muscleBand), [1, 1, 1, 1]);
  assert.deepEqual(rows.map(row => row.floatStone), [4, 3, 4, 4]);
  const first = [0.016128976095785136, 0.024706138359867406,
    0.030438616188640084, 0];
  const second = [0.03078939540863697, 0.024706138359867406,
    0.030438616188640084, 0.01494118601245424];
  for (let i = 0; i < rows.length; ++i) {
    near(rows[i].firstTurnGoingFirstAnyTool, first[i]);
    near(rows[i].firstTurnGoingSecondAnyTool, second[i]);
    assert.ok(rows[i].firstTurnGoingFirstAnyTool >=
      rows[i].firstTurnGoingFirstFloatOnly);
    assert.ok(rows[i].firstTurnGoingSecondAnyTool >=
      rows[i].firstTurnGoingSecondFloatOnly);
  }
});

test('substitute probability exactly reduces to historical Float Stone scope when absent', () => {
  const sourceRows = [{
    rank: 8, basics: 10, trubbish: 2, garbodor: 2,
    boostShake: 1, wally: 1, floatStone: 4,
    firstTurnGoingFirst: directGarbotoxinProbability({
      basics: 10, trubbish: 2, garbodor: 2, floatStone: 4, enablers: 1
    }),
    firstTurnGoingSecond: directGarbotoxinProbability({
      basics: 10, trubbish: 2, garbodor: 2, floatStone: 4, enablers: 2
    })
  }];
  const manifest = {decks: [{rank: 8, cards: []}]};
  const [row] = addAnyToolRoutes(sourceRows, manifest);
  near(row.firstTurnGoingFirstAnyTool, row.firstTurnGoingFirstFloatOnly);
  near(row.firstTurnGoingSecondAnyTool, row.firstTurnGoingSecondFloatOnly);
});
