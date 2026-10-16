'use strict';

/**
 * Exact source-locked opening/Prize resource opportunity for the fixed Aichi
 * Shadow Rider reference and two research candidates. No matchup/win inference.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const CATEGORIES = ['radiant', 'lele', 'shadowV', 'shadowVMAX', 'wobbuffet', 'otherBasic', 'other'];
const OTHER_BASICS = new Set([
  "Lillie's Clefairy ex", 'Trevenant & Dusknoir-GX', 'Latias ex',
  'Dialga-GX', 'Mimikyu', 'Girafarig', 'Marshadow',
]);

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0 || k > n) return 0n;
  let a = 1n;
  const m = Math.min(k, n - k);
  for (let i = 1; i <= m; i += 1) a = (a * BigInt(n - m + i)) / BigInt(i);
  return a;
}

/** @param {object} deck @returns {Record<string, number>} */
function sourceProfile(deck) {
  assert.equal(deck.cards.reduce((n, c) => n + c.count, 0), 60, '60-card source inventory');
  const p = Object.fromEntries(CATEGORIES.map(k => [k, 0]));
  for (const c of deck.cards) {
    assert.ok(Number.isInteger(c.count) && c.count >= 1);
    if (c.category !== 'Pokémon') { p.other += c.count; continue; }
    const id = c.printing.set + ' ' + c.printing.number;
    if (c.name === 'Radiant Eternatus') {
      assert.equal(id, 'CRZ 105'); p.radiant += c.count;
    } else if (c.name === 'Tapu Lele-GX') {
      assert.equal(id, 'GRI 60'); p.lele += c.count;
    } else if (c.name === 'Shadow Rider Calyrex V') {
      assert.equal(id, 'CRE 74'); p.shadowV += c.count;
    } else if (c.name === 'Shadow Rider Calyrex VMAX') {
      assert.equal(id, 'CRE 75'); p.shadowVMAX += c.count;
    } else if (c.name === 'Wobbuffet') {
      assert.equal(id, 'PHF 36'); p.wobbuffet += c.count;
    } else if (OTHER_BASICS.has(c.name)) {
      p.otherBasic += c.count;
    } else {
      throw new Error('Unclassified Pokémon: ' + c.name + ' ' + id);
    }
  }
  assert.equal(p.radiant, 1);
  assert.equal(p.otherBasic, 8);
  assert.equal(p.shadowV + p.shadowVMAX + p.lele + p.wobbuffet, 9);
  return p;
}

/**
 * @param {Record<string, number>} profile
 * @param {{handSize?: number, prizeCount?: number}} [options]
 * @returns {{total: bigint, events: Record<string, bigint>, probabilities: Record<string, number>}}
 */
function exactOpportunities(profile, options = {}) {
  const handSize = options.handSize ?? 7;
  const prizeCount = options.prizeCount ?? 6;
  const pool = CATEGORIES.map(k => profile[k]);
  assert.ok(pool.every(n => Number.isInteger(n) && n >= 0));
  const N = pool.reduce((a, b) => a + b, 0);
  assert.ok(handSize > 0 && prizeCount >= 0 && handSize + prizeCount <= N);
  const prizeChoices = choose(N - handSize, prizeCount);
  const names = [
    'shadowVInSeven', 'twoShadowVInSeven', 'radiantBenchable',
    'radiantTwoVMAXInDeck', 'radiantTwoVMAXWithoutActiveSelfLock',
    'radiantTwoVMAXSelfLockedStarter', 'leleBenchable',
    'onlyBenchEntryBasics', 'radiantForcedActive', 'loneBasic',
    'loneBasicExceptWobbuffet', 'wobbuffetStarterOption',
  ];
  const events = Object.fromEntries(names.map(k => [k, 0n]));
  let total = 0n;
  const hand = Array(pool.length).fill(0);

  /** @param {number} category @param {number} left @param {bigint} weight */
  function walk(category, left, weight) {
    if (category === pool.length) {
      if (left !== 0) return;
      const [r, l, v, m, w, o] = hand;
      const basics = r + l + v + w + o;
      if (basics === 0) return;
      const fullWeight = weight * prizeChoices;
      total += fullWeight;
      if (v >= 1) events.shadowVInSeven += fullWeight;
      if (v >= 2) events.twoShadowVInSeven += fullWeight;
      if (l >= 1 && basics >= 2) events.leleBenchable += fullWeight;
      if (r + l === basics) events.onlyBenchEntryBasics += fullWeight;
      if (r === 1 && basics === 1) events.radiantForcedActive += fullWeight;
      if (basics === 1) events.loneBasic += fullWeight;
      if (basics === 1 && w === 0) events.loneBasicExceptWobbuffet += fullWeight;
      if (w >= 1) events.wobbuffetStarterOption += fullWeight;
      if (r !== 1 || basics < 2) return;
      events.radiantBenchable += fullWeight;

      // Count Prizes separately: two VMAX must remain in deck after hand/Prizes.
      const vmaxLeft = profile.shadowVMAX - m;
      let twoVMAXChoices = 0n;
      for (let prized = 0; prized <= Math.min(vmaxLeft, prizeCount); prized += 1) {
        if (vmaxLeft - prized < 2) continue;
        twoVMAXChoices += choose(vmaxLeft, prized)
          * choose(N - handSize - vmaxLeft, prizeCount - prized);
      }
      const gateWeight = weight * twoVMAXChoices;
      events.radiantTwoVMAXInDeck += gateWeight;
      // If Wobbuffet is the sole alternative starter, its Active Bide
      // Barricade suppresses Radiant Eternatus's non-Psychic Ability.
      // Switching Wobbuffet out before playing Radiant is outside this model.
      if (l + v + o >= 1) {
        events.radiantTwoVMAXWithoutActiveSelfLock += gateWeight;
      } else {
        events.radiantTwoVMAXSelfLockedStarter += gateWeight;
      }
      return;
    }
    for (let n = 0; n <= Math.min(pool[category], left); n += 1) {
      hand[category] = n;
      walk(category + 1, left - n, weight * choose(pool[category], n));
    }
  }
  walk(0, handSize, 1n);
  assert.ok(total > 0n, 'at least one accepted opening');
  assert.equal(events.radiantTwoVMAXInDeck,
    events.radiantTwoVMAXWithoutActiveSelfLock + events.radiantTwoVMAXSelfLockedStarter);
  return {
    total, events,
    probabilities: Object.fromEntries(names.map(k => [k, Number(events[k]) / Number(total)])),
  };
}

/** @param {string} [root] */
function sourceCandidates(root = path.resolve(__dirname, '..')) {
  const base = path.join(root, 'results', 'aichi-2026');
  const field = JSON.parse(fs.readFileSync(path.join(base, 'full-decklists.json'), 'utf8'));
  assert.equal(field.decks.length, 29);
  const champion = field.decks.find(d => d.rank === 1);
  const hood = JSON.parse(fs.readFileSync(path.join(base, 'candidate-hood-shadow-rider.json'), 'utf8'));
  const temple = JSON.parse(fs.readFileSync(path.join(base, 'candidate-temple-shadow-rider.json'), 'utf8'));
  const p = {
    champion: sourceProfile(champion),
    hood: sourceProfile(hood),
    temple: sourceProfile(temple),
  };
  assert.deepEqual(p.champion, {
    radiant: 1, lele: 2, shadowV: 3, shadowVMAX: 4,
    wobbuffet: 0, otherBasic: 8, other: 42,
  });
  assert.deepEqual(p.hood, {
    radiant: 1, lele: 1, shadowV: 4, shadowVMAX: 4,
    wobbuffet: 0, otherBasic: 8, other: 42,
  });
  assert.deepEqual(p.temple, {
    radiant: 1, lele: 1, shadowV: 4, shadowVMAX: 3,
    wobbuffet: 1, otherBasic: 8, other: 42,
  });
  return p;
}

module.exports = { choose, sourceProfile, sourceCandidates, exactOpportunities, CATEGORIES };

if (require.main === module) {
  for (const [label, profile] of Object.entries(sourceCandidates())) {
    const x = exactOpportunities(profile);
    console.log(JSON.stringify({ label, profile, probabilities: x.probabilities }, null, 2));
  }
}
