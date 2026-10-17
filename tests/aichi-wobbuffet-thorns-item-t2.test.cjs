'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { wobbuffetNaturalTurnTwo, sourceTempleProfile } =
  require('../scripts/aichi-temple-wobbuffet-thorns-t2.cjs');
const {
  INDEX, sourceGroups, allocations, prizeWeightedDrawMass, searchChoiceScore,
  optimalSourceRestrictedTurnTwo, weightedAgainstOpponent,
} = require('../scripts/aichi-wobbuffet-thorns-item-t2.cjs');

/**
 * Independent physical-Prize enumeration with actual T1 V removal and T2
 * shuffled-deck draw, using no conditional-moment or inclusion-exclusion
 * formula. Returns a multiplicity for a fixed first-turn observed hand.
 * @param {number[]} groups
 * @param {number[]} hand
 * @param {number|null} choice
 * @returns {bigint}
 */
function brutePrizeAndDrawScore(groups, hand, choice) {
  const unseen = groups.map((n, i) => n - hand[i]);
  let success = 0n;
  allocations(unseen, 6, (prizes, prizeWays) => {
    const deck = unseen.map((n, i) => n - prizes[i]);
    if (hand[INDEX.v] === 0) {
      if (choice === null || hand[choice] === 0 || deck[INDEX.v] === 0) return;
      deck[INDEX.v]--;
    }
    for (let drawType = 0; drawType < deck.length; drawType++) {
      const drawCopies = deck[drawType];
      if (drawCopies === 0) continue;
      const nextHand = hand.slice();
      const nextDeck = deck.slice();
      if (choice !== null) nextHand[choice]--;
      nextHand[drawType]++;
      nextDeck[drawType]--;
      const vmax = nextHand[INDEX.vmax] > 0
        || (nextHand[INDEX.treasure] > 0 && nextDeck[INDEX.vmax] > 0);
      const energy = nextHand[INDEX.energy] > 0
        || (nextHand[INDEX.fog] > 0 && nextDeck[INDEX.energy] > 0);
      if (vmax && energy) success += prizeWays * BigInt(drawCopies);
    }
  });
  return success;
}

test('source-locked exact K0 Item search and full Thorns mulligan weighting', () => {
  const groups = sourceGroups();
  assert.deepEqual(groups, [4, 3, 11, 4, 4, 1, 32]);
  const references = [
    ['1530898505467361/25150294038870000', 6.087000426720037],
    ['2984558024545481/41278419105066000', 7.230310872489769],
    ['6529990604999489/79301391792755000', 8.234395963774334],
    ['1154103676036702843/12687484999475286000', 9.096394408225372],
  ];
  for (let d = 0; d < references.length; d++) {
    const x = optimalSourceRestrictedTurnTwo(groups, d);
    assert.equal(x.fraction, references[d][0]);
    assert.ok(Math.abs(x.percent - references[d][1]) < 1e-11);
    assert.ok(x.percent >= wobbuffetNaturalTurnTwo(sourceTempleProfile(), d).percent);
    const contribution = Object.values(x.contributionPercent).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(x.percent - contribution) < 1e-10);
  }
  const weighted = weightedAgainstOpponent(4, groups);
  assert.ok(Math.abs(weighted.percent - 7.439476550128717) < 1e-10);
  assert.equal(weighted.tailCap, 45);
  assert.equal(optimalSourceRestrictedTurnTwo(groups, 45).fraction,
    wobbuffetNaturalTurnTwo(sourceTempleProfile(), 45).fraction);
});

test('directly enumerated Prize subsets and shuffled next-card outcomes match exact moments', () => {
  const groups = sourceGroups();
  const hands = [
    [0, 0, 0, 1, 1, 0, 5],
    [1, 0, 0, 1, 1, 0, 4],
    [0, 0, 1, 2, 1, 1, 2],
    [0, 1, 0, 1, 0, 1, 4],
    [1, 1, 1, 0, 0, 0, 4],
  ];
  for (const hand of hands) {
    assert.equal(hand.reduce((a, b) => a + b, 0), 7);
    const actions = hand[INDEX.v] > 0
      ? [null]
      : [INDEX.quick, INDEX.fog, INDEX.treasure].filter(a => hand[a] > 0);
    for (const action of actions) {
      const analytic = searchChoiceScore(groups, hand, action);
      const physical = brutePrizeAndDrawScore(groups, hand, action);
      assert.equal(analytic, physical,
        'Hand=' + hand.join(',') + ', item=' + action);
    }
  }
});

test('source six-Prize moment is nonnegative and Item search constraints are explicit', () => {
  const groups = sourceGroups();
  const hand = [0, 0, 0, 1, 1, 0, 5];
  const unseen = groups.map((n, i) => n - hand[i]);
  for (let category = 0; category < groups.length; category++) {
    assert.ok(prizeWeightedDrawMass(unseen, category, true, true) >= 0n);
  }
  assert.equal(searchChoiceScore(groups, hand, null), 0n);
  assert.throws(() => optimalSourceRestrictedTurnTwo(groups, -1), assert.AssertionError);
  assert.throws(() => optimalSourceRestrictedTurnTwo(groups, 46), assert.AssertionError);
});
