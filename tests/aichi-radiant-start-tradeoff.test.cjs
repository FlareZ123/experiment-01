'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const { choose, exactOpportunities, sourceCandidates, CATEGORIES } =
  require('../scripts/aichi-radiant-start-tradeoff.cjs');

/** @param {number[]} indices @param {number} count @returns {number[][]} */
function subsets(indices, count) {
  if (count === 0) return [[]];
  if (indices.length < count) return [];
  const out = [];
  for (let i = 0; i <= indices.length - count; i += 1) {
    for (const rest of subsets(indices.slice(i + 1), count - 1)) out.push([indices[i], ...rest]);
  }
  return out;
}

/** Independent physical-card combinations, with hand and Prize zones distinct. */
function physicalDealCounts(profile, handSize, prizeCount) {
  const cards = CATEGORIES.flatMap(name => Array(profile[name]).fill(name));
  const ids = Array.from({ length: cards.length }, (_, i) => i);
  const names = Object.keys(exactOpportunities(profile, { handSize, prizeCount }).events);
  const events = Object.fromEntries(names.map(k => [k, 0n]));
  let total = 0n;
  for (const handIds of subsets(ids, handSize)) {
    const hand = handIds.map(i => cards[i]);
    const h = Object.fromEntries(CATEGORIES.map(k => [k, hand.filter(c => c === k).length]));
    const basics = h.radiant + h.lele + h.shadowV + h.wobbuffet + h.otherBasic;
    if (!basics) continue;
    const remaining = ids.filter(i => !handIds.includes(i));
    for (const prizeIds of subsets(remaining, prizeCount)) {
      total += 1n;
      const prizedM = prizeIds.filter(i => cards[i] === 'shadowVMAX').length;
      const two = profile.shadowVMAX - h.shadowVMAX - prizedM >= 2;
      const bench = h.radiant > 0 && basics >= 2;
      const noSelfLock = h.lele + h.shadowV + h.otherBasic > 0;
      const values = {
        shadowVInSeven: h.shadowV >= 1,
        twoShadowVInSeven: h.shadowV >= 2,
        radiantBenchable: bench,
        radiantTwoVMAXInDeck: bench && two,
        radiantTwoVMAXWithoutActiveSelfLock: bench && two && noSelfLock,
        radiantTwoVMAXSelfLockedStarter: bench && two && !noSelfLock,
        leleBenchable: h.lele >= 1 && basics >= 2,
        onlyBenchEntryBasics: h.radiant + h.lele === basics,
        radiantForcedActive: h.radiant === 1 && basics === 1,
        loneBasic: basics === 1,
        loneBasicExceptWobbuffet: basics === 1 && h.wobbuffet === 0,
        wobbuffetStarterOption: h.wobbuffet > 0,
      };
      for (const name of names) if (values[name]) events[name] += 1n;
    }
  }
  return { total, events };
}

/** @param {number} actual @param {number} expected */
function near(actual, expected) {
  assert.ok(Math.abs(actual - expected) < 1e-7,
    'expected ' + expected + ' got ' + actual);
}

test('BigInt combination identities', () => {
  assert.equal(choose(60, 7), 386206920n);
  assert.equal(choose(0, 0), 1n);
  assert.equal(choose(4, 5), 0n);
  for (let n = 2; n < 15; n += 1) {
    for (let k = 1; k < n; k += 1) {
      assert.equal(choose(n, k), choose(n - 1, k - 1) + choose(n - 1, k));
    }
  }
});

test('Every physical toy-deck opening and Prize combination agrees', () => {
  const p = {
    radiant: 1, lele: 0, shadowV: 1, shadowVMAX: 3,
    wobbuffet: 1, otherBasic: 1, other: 4,
  };
  const computed = exactOpportunities(p, { handSize: 3, prizeCount: 2 });
  const physical = physicalDealCounts(p, 3, 2);
  assert.equal(computed.total, physical.total);
  assert.deepEqual(computed.events, physical.events);
  console.log('Independent toy physical deals:', String(computed.total));
});

test('All three frozen source inventories and exact percentage anchors', () => {
  const profiles = sourceCandidates();
  const champion = exactOpportunities(profiles.champion);
  const hood = exactOpportunities(profiles.hood);
  const temple = exactOpportunities(profiles.temple);
  near(champion.probabilities.shadowVInSeven, 0.3661785);
  near(hood.probabilities.shadowVInSeven, 0.4637744);
  near(temple.probabilities.shadowVInSeven, 0.4526912);
  near(champion.probabilities.radiantTwoVMAXInDeck, 0.105000893);
  near(hood.probabilities.radiantTwoVMAXInDeck, 0.105000893);
  near(temple.probabilities.radiantTwoVMAXInDeck, 0.097902293);
  near(temple.probabilities.radiantTwoVMAXWithoutActiveSelfLock, 0.094710769);
  near(temple.probabilities.radiantTwoVMAXSelfLockedStarter, 0.003191524);
  assert.equal(hood.events.radiantTwoVMAXSelfLockedStarter, 0n);
  assert.equal(champion.events.radiantTwoVMAXSelfLockedStarter, 0n);
  console.log('Shadow Rider V initial access:',
    [champion, hood, temple].map(x => (100 * x.probabilities.shadowVInSeven).toFixed(5)));
  console.log('Temple sole Wobbuffet starter gate lock:',
    (100 * temple.probabilities.radiantTwoVMAXSelfLockedStarter).toFixed(6), '%');
});
