'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { choose, exactUnderworldDoorEnergyRace } =
  require('../scripts/agent11-underworld-door-energy-race.cjs');

function combinations(items, count) {
  const result = [];
  function visit(start, picked) {
    if (picked.length === count) {
      result.push([...picked]);
      return;
    }
    for (let i = start; i <= items.length - (count - picked.length); i += 1) {
      picked.push(items[i]);
      visit(i + 1, picked);
      picked.pop();
    }
  }
  visit(0, []);
  return result;
}

function permutations(items) {
  if (items.length <= 1) return [items];
  const out = [];
  for (let i = 0; i < items.length; i += 1) {
    const rest = [...items.slice(0, i), ...items.slice(i + 1)];
    for (const tail of permutations(rest)) out.push([items[i], ...tail]);
  }
  return out;
}

function bruteForce(options) {
  const { totalCardsAfterBoard, energyCountAfterBoard, handSize,
    prizeCount, doorCounts, initialAttached, targetAttached } = options;
  const cards = Array.from({ length: totalCardsAfterBoard }, (_, i) =>
    i < energyCountAfterBoard - initialAttached);
  const initialEnergy = initialAttached;
  const all = cards.map((_, i) => i);
  let deals = 0;
  let wins = 0;
  for (const hand of combinations(all, handSize)) {
    const afterHand = all.filter(i => !hand.includes(i));
    for (const prizes of combinations(afterHand, prizeCount)) {
      const deck = afterHand.filter(i => !prizes.includes(i));
      for (const order of permutations(deck)) {
        deals += 1;
        let handEnergy = hand.filter(i => cards[i]).length;
        let attached = initialEnergy;
        let cursor = 0;
        for (const doors of doorCounts) {
          if (cursor < order.length && cards[order[cursor]]) handEnergy += 1;
          cursor += 1;
          for (let use = 0; use < doors; use += 1) {
            if (handEnergy === 0) continue;
            handEnergy -= 1;
            attached += 1;
            for (let draw = 0; draw < 2 && cursor < order.length; draw += 1) {
              if (cards[order[cursor]]) handEnergy += 1;
              cursor += 1;
            }
          }
          if (handEnergy > 0) {
            handEnergy -= 1;
            attached += 1;
          }
        }
        if (attached >= targetAttached) wins += 1;
      }
    }
  }
  return wins / deals;
}

test('choose handles boundaries and symmetry', () => {
  assert.equal(choose(10, 0), 1);
  assert.equal(choose(10, 10), 1);
  assert.equal(choose(10, 3), choose(10, 7));
  assert.equal(choose(10, 11), 0);
});

test('small-deck DP matches exhaustive hand/Prize/deck-order enumeration', () => {
  const options = {
    totalCardsAfterBoard: 10,
    energyCountAfterBoard: 3,
    handSize: 3,
    prizeCount: 2,
    doorCounts: [1, 1],
    initialAttached: 0,
    targetAttached: 2
  };
  const exact = exactUnderworldDoorEnergyRace(options).probabilityAtLeastTarget;
  const brute = bruteForce(options);
  assert.ok(Math.abs(exact - brute) < 1e-12, exact + ' vs ' + brute);
});

test('the registered 11-Energy baseline reproduces the exact conditional result', () => {
  const result = exactUnderworldDoorEnergyRace({ doorCounts: [2, 2] });
  assert.ok(Math.abs(result.probabilityAtLeastTarget - 0.10903918484576391) < 1e-12);
  assert.ok(Math.abs(result.meanAttached - 2.411724781611181) < 1e-12);
  assert.equal(result.config.startingDeckSize, 44);
});

test('a pre-Gate attachment is removed from the hidden population', () => {
  const result = exactUnderworldDoorEnergyRace({
    initialAttached: 1, handSize: 5
  });
  assert.equal(result.config.unknownCards, 56);
  assert.equal(result.config.unknownEnergy, 10);
  assert.equal(result.config.startingDeckSize, 45);
  assert.ok(Math.abs(result.probabilityAtLeastTarget - 0.10663967391775737) < 1e-12);
});

test('more Energy, larger hand, more Door activations, and a starting attachment are monotone', () => {
  const run = options => exactUnderworldDoorEnergyRace(options).probabilityAtLeastTarget;
  const base = run({});
  assert.ok(run({ energyCountAfterBoard: 12 }) > base);
  assert.ok(run({ handSize: 8 }) > base);
  assert.ok(run({ doorCounts: [3, 3] }) > base);
  assert.ok(run({ initialAttached: 1 }) > base);
});

test('the model rejects more than one pre-Gate attachment and non-two-turn schedules', () => {
  assert.throws(() => exactUnderworldDoorEnergyRace({ initialAttached: 2 }));
  assert.throws(() => exactUnderworldDoorEnergyRace({ doorCounts: [2] }));
  assert.throws(() => exactUnderworldDoorEnergyRace({ doorCounts: [2, 5] }));
});
