'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { exactSilentLabOpening } =
  require('../scripts/agent3-jellicent-silent-lab-openers.cjs');
const source = require('../results/aichi-2026/full-decklists.json');

/** @param {number} actual @param {number} expected */
function near(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);
}

test('no Supporter access on the first turn going first', () => {
  const first = exactSilentLabOpening({
    boostShake: 4, silentLab: 4, arven: 4, guzmaHala: 4,
    wally: 4, goingSecond: false
  });
  near(first.basicValidProbability, 0.07642609697569731);
  assert.ok(first.numerator > 0n);
  assert.ok(first.validBasicDenominator > first.numerator);
});

test('Arven searches the Item but not Silent Lab; Guzma and Hala searches Stadium', () => {
  const direct = exactSilentLabOpening({
    boostShake: 4, silentLab: 4, goingSecond: true
  });
  const arven = exactSilentLabOpening({
    boostShake: 4, silentLab: 4, arven: 4, goingSecond: true
  });
  const both = exactSilentLabOpening({
    boostShake: 4, silentLab: 4, arven: 4, guzmaHala: 4, goingSecond: true
  });
  near(direct.basicValidProbability, 0.07642609697569731);
  near(arven.basicValidProbability, 0.1272029625313652);
  near(both.basicValidProbability, 0.1779798280870331);
  assert.ok(both.numerator > arven.numerator);
});

test('Wally uses the separate Stage 1 Supporter route and does not end turn', () => {
  near(exactSilentLabOpening({
    boostShake: 0, silentLab: 4, wally: 4, goingSecond: true
  }).basicValidProbability, 0.07642609697569731);
  near(exactSilentLabOpening({
    boostShake: 4, silentLab: 4, wally: 4, goingSecond: true
  }).basicValidProbability, 0.12720577871014802);
  near(exactSilentLabOpening({
    boostShake: 4, silentLab: 4, arven: 4, wally: 4,
    goingSecond: true
  }).basicValidProbability, 0.15974310766761299);
  near(exactSilentLabOpening({
    boostShake: 4, silentLab: 4, arven: 4, guzmaHala: 4,
    wally: 4, goingSecond: true
  }).basicValidProbability, 0.21051997322328088);
});

test('lower-copy Stadium counter path and impossible no-Stadium case', () => {
  near(exactSilentLabOpening({
    boostShake: 4, silentLab: 1, arven: 4, goingSecond: true
  }).basicValidProbability, 0.0367666561);
  assert.equal(exactSilentLabOpening({
    boostShake: 4, silentLab: 0, arven: 4, wally: 4,
    goingSecond: true
  }).numerator, 0n);
  assert.throws(() => exactSilentLabOpening({ silentLab: 5 }), RangeError);
  assert.throws(() => exactSilentLabOpening({ totalBasics: 2 }), RangeError);
});

test('exact three Iron Thorns originals have Stadium replacement paths', () => {
  const expected = new Map([[6, 4], [24, 4], [29, 5]]);
  const stadiums = new Set([
    "Tropical Beach", "Thunder Mountain ♢", "Wondrous Labyrinth ♢",
    "Player's Ceremony"
  ]);
  for (const [rank, stadiumCount] of expected) {
    const d = source.decks.find(x => x.rank === rank);
    assert.ok(d, `missing authenticated original rank ${rank}`);
    const count = name => d.cards.filter(x => x.name === name)
      .reduce((sum, x) => sum + x.count, 0);
    assert.equal(count('Iron Thorns ex'), 4);
    assert.equal(count('Tool Jammer'), 1);
    assert.equal(count('Faba'), 1);
    assert.equal(count('Guzma & Hala'), 2);
    assert.equal(d.cards.filter(x => stadiums.has(x.name))
      .reduce((sum, x) => sum + x.count, 0), stadiumCount);
  }
});
