'use strict';
const assert = require('node:assert/strict');
const {lightningUnits, packetUpperBound, prizeUpperBound, inspectDeck, report} =
  require('../scripts/aichi-raichu-energy-capacity.cjs');
const behind = {ownPrizes: 6, opponentPrizes: 4, temple: false};
const tied = {ownPrizes: 6, opponentPrizes: 6, temple: false};
const temple = {ownPrizes: 6, opponentPrizes: 4, temple: true};
const energies = ['Reversal Energy', 'Counter Energy', 'Unit Energy LPM']
  .map(name => ({name, count: 4}));
assert.equal(lightningUnits('Counter Energy', behind), 2); // Official Japanese FAQ.
assert.equal(lightningUnits('Reversal Energy', behind), 3);
assert.equal(lightningUnits('Unit Energy LPM', tied), 1);
assert.equal(lightningUnits('Counter Energy', tied), 0);
assert.equal(lightningUnits('Reversal Energy', temple), 0);
assert.equal(lightningUnits('Lightning Energy', temple), 1);
assert.equal(packetUpperBound(energies, behind, 5), 14);
assert.equal(packetUpperBound(energies, behind, 10), 22);
assert.equal(packetUpperBound(energies, behind), 24);
assert.equal(packetUpperBound(energies, tied), 4);
assert.equal(packetUpperBound(energies, temple), 0);
// Official Japanese FAQ: 3 target selections plus Choice Band = 120, not 180.
assert.deepEqual(prizeUpperBound(3, [
  {id: 'active GX', hp: 120, damage: 0, prizes: 2, bonusDamage: 30}
]), {prizes: 2, packetsUsed: 3, targetIds: ['active GX']});
// 14 packets = 420 base damage: a four-Prize subset uses 13.
assert.deepEqual(prizeUpperBound(14, [
  {id: 'a', hp: 180, damage: 0, prizes: 2},
  {id: 'b', hp: 200, damage: 0, prizes: 2},
  {id: 'c', hp: 60, damage: 0, prizes: 1}
]), {prizes: 4, packetsUsed: 13, targetIds: ['a', 'b']});
assert.equal(prizeUpperBound(0, []).prizes, 0);
const deck = {rank: 4, player: 'fixture', cards: energies.map(x => ({...x, category: 'Energy'}))};
assert.equal(inspectDeck(deck).allTwelveBehind, 24);
assert.throws(() => inspectDeck({...deck, rank: 17, cards: deck.cards.slice(1)}), /inventory changed/);
const fromSource = report();
assert.deepEqual(fromSource.map(row => row.rank), [4, 17]);
for (const row of fromSource) {
  assert.equal(row.singleBombFive, 14);
  assert.equal(row.doubleBombTen, 22);
  assert.equal(row.allTwelveBehind, 24);
  assert.equal(row.allTwelveTied, 4);
  assert.equal(row.allTwelveTemple, 0);
}
console.log('Electro Rain energy/Prize source checks passed');
