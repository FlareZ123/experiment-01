'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { choose, exactUnderworldDoorEnergyRace, exactUnderworldDoorEnergyRaceWithFSSAccess } =
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
    prizeCount, doorCounts, initialAttached, targetAttached,
    guaranteedEnergySearchBeforeTurn2 = false } = options;
  const cards = Array.from({ length: totalCardsAfterBoard }, (_, i) =>
    i < energyCountAfterBoard - initialAttached);
  const all = cards.map((_, i) => i);
  let initialDeals = 0;
  let successProbability = 0;
  for (const hand of combinations(all, handSize)) {
    const afterHand = all.filter(i => !hand.includes(i));
    for (const prizes of combinations(afterHand, prizeCount)) {
      let deck = afterHand.filter(i => !prizes.includes(i));
      let startingHandEnergy = hand.filter(i => cards[i]).length;
      if (guaranteedEnergySearchBeforeTurn2) {
        const energyIndex = deck.findIndex(i => cards[i]);
        if (energyIndex >= 0) {
          deck = [...deck.slice(0, energyIndex), ...deck.slice(energyIndex + 1)];
          startingHandEnergy += 1;
        }
      }
      const orders = permutations(deck);
      let winsForDeal = 0;
      for (const order of orders) {
        let handEnergy = startingHandEnergy;
        let attached = initialAttached;
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
        if (attached >= targetAttached) winsForDeal += 1;
      }
      initialDeals += 1;
      successProbability += winsForDeal / orders.length;
    }
  }
  return successProbability / initialDeals;
}


function bruteFssUseProbability(options) {
  const { totalCardsAfterBoard, energyCountAfterBoard, handSize, prizeCount,
    initialAttached = 0 } = options;
  const cards = Array.from({ length: totalCardsAfterBoard }, (_, i) => {
    if (i < energyCountAfterBoard - initialAttached) return 'E';
    if (i === energyCountAfterBoard - initialAttached) return 'F';
    if (i === energyCountAfterBoard - initialAttached + 1) return 'A';
    return 'O';
  });
  const all = cards.map((_, i) => i);
  let initialDeals = 0;
  let useProbability = 0;
  for (const hand of combinations(all, handSize)) {
    const afterHand = all.filter(i => !hand.includes(i));
    for (const prizes of combinations(afterHand, prizeCount)) {
      const deckAfterPrizes = afterHand.filter(i => !prizes.includes(i));
      let localUseProbability = 0;
      for (const firstDraw of deckAfterPrizes) {
        let handF = hand.filter(i => cards[i] === 'F').length + (cards[firstDraw] === 'F' ? 1 : 0);
        let handA = hand.filter(i => cards[i] === 'A').length + (cards[firstDraw] === 'A' ? 1 : 0);
        let deck = deckAfterPrizes.filter(i => i !== firstDraw);
        let used = false;
        function useFss() {
          if (used || !deck.some(i => cards[i] === 'E')) return;
          if (handF > 0) {
            handF -= 1;
            deck.splice(deck.findIndex(i => cards[i] === 'E'), 1);
            used = true;
          } else if (handA > 0 && deck.some(i => cards[i] === 'F')) {
            handA -= 1;
            deck.splice(deck.findIndex(i => cards[i] === 'F'), 1);
            deck.splice(deck.findIndex(i => cards[i] === 'E'), 1);
            used = true;
          }
        }
        useFss();
        let secondDrawUse = 0;
        if (deck.length > 0) {
          for (const secondDraw of deck) {
            let hF = handF + (cards[secondDraw] === 'F' ? 1 : 0);
            let hA = handA + (cards[secondDraw] === 'A' ? 1 : 0);
            let d = deck.filter(i => i !== secondDraw);
            let u = used;
            if (!u && d.some(i => cards[i] === 'E')) {
              if (hF > 0) {
                const e = d.findIndex(i => cards[i] === 'E');
                d.splice(e, 1);
                u = true;
              } else if (hA > 0 && d.some(i => cards[i] === 'F')) {
                hA -= 1;
                d.splice(d.findIndex(i => cards[i] === 'F'), 1);
                d.splice(d.findIndex(i => cards[i] === 'E'), 1);
                u = true;
              }
            }
            secondDrawUse += u ? 1 : 0;
          }
          localUseProbability += secondDrawUse / deck.length;
        } else {
          localUseProbability += used ? 1 : 0;
        }
      }
      initialDeals += 1;
      useProbability += localUseProbability / deckAfterPrizes.length;
    }
  }
  return useProbability / initialDeals;
}

test('choose handles boundaries and symmetry', () => {
  assert.equal(choose(10, 0), 1);
  assert.equal(choose(10, 10), 1);
  assert.equal(choose(10, 3), choose(10, 7));
  assert.equal(choose(10, 11), 0);
});

test('small-deck DP matches exhaustive hand/Prize/deck-order enumeration, with and without tutor', () => {
  const options = {
    totalCardsAfterBoard: 10,
    energyCountAfterBoard: 3,
    handSize: 3,
    prizeCount: 2,
    doorCounts: [1, 1],
    initialAttached: 0,
    targetAttached: 2
  };
  for (const tutor of [false, true]) {
    const exact = exactUnderworldDoorEnergyRace({
      ...options, guaranteedEnergySearchBeforeTurn2: tutor
    }).probabilityAtLeastTarget;
    const brute = bruteForce({
      ...options, guaranteedEnergySearchBeforeTurn2: tutor
    });
    assert.ok(Math.abs(exact - brute) < 1e-12, exact + ' vs ' + brute);
  }
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

test('conditional Forest Seal Stone Energy search moves one Energy from deck to hand', () => {
  const options = {
    totalCardsAfterBoard: 56,
    energyCountAfterBoard: 11,
    handSize: 5,
    prizeCount: 6,
    doorCounts: [2, 2],
    initialAttached: 0
  };
  const withoutTutor = exactUnderworldDoorEnergyRace(options).probabilityAtLeastTarget;
  const withTutor = exactUnderworldDoorEnergyRace({
    ...options, guaranteedEnergySearchBeforeTurn2: true
  }).probabilityAtLeastTarget;
  assert.ok(Math.abs(withoutTutor - 0.06217622763093656) < 1e-12);
  assert.ok(Math.abs(withTutor - 0.17864167090989147) < 1e-12);
  assert.ok(withTutor > withoutTutor);
});

test('conditional Energy search still respects a pre-Gate attachment', () => {
  const result = exactUnderworldDoorEnergyRace({
    totalCardsAfterBoard: 56,
    energyCountAfterBoard: 11,
    handSize: 4,
    initialAttached: 1,
    guaranteedEnergySearchBeforeTurn2: true
  });
  assert.equal(result.config.unknownCards, 55);
  assert.equal(result.config.unknownEnergy, 10);
  assert.ok(Math.abs(result.probabilityAtLeastTarget - 0.239226411034665) < 1e-12);
});


test('natural FSS/Arven access model matches exhaustive small-deck tutor-use enumeration', () => {
  const options = {
    totalCardsAfterBoard: 10,
    energyCountAfterBoard: 3,
    handSize: 3,
    prizeCount: 2,
    doorCounts: [0, 0],
    initialAttached: 0,
    targetAttached: 0
  };
  const exact = exactUnderworldDoorEnergyRaceWithFSSAccess(options).probabilityFssUsed;
  const brute = bruteFssUseProbability(options);
  assert.ok(Math.abs(exact - brute) < 1e-12, exact + ' vs ' + brute);
});

test('candidate FSS/Arven access gives the reproducible two-Door conditional results', () => {
  const noPreAttach = exactUnderworldDoorEnergyRaceWithFSSAccess({
    handSize: 6, initialAttached: 0
  });
  const preAttach = exactUnderworldDoorEnergyRaceWithFSSAccess({
    handSize: 5, initialAttached: 1
  });
  assert.ok(Math.abs(noPreAttach.probabilityAtLeastTarget - 0.1340115852270688) < 1e-12);
  assert.ok(Math.abs(preAttach.probabilityAtLeastTarget - 0.16795352664649477) < 1e-12);
  assert.ok(Math.abs(noPreAttach.probabilityFssUsed - 0.34703160611807593) < 1e-12);
  assert.ok(Math.abs(preAttach.probabilityFssUsed - 0.3078569002984191) < 1e-12);
});

test('the model rejects more than one pre-Gate attachment and non-two-turn schedules', () => {
  assert.throws(() => exactUnderworldDoorEnergyRace({ initialAttached: 2 }));
  assert.throws(() => exactUnderworldDoorEnergyRace({ doorCounts: [2] }));
  assert.throws(() => exactUnderworldDoorEnergyRace({ doorCounts: [2, 5] }));
});
