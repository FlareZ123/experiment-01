'use strict';

/**
 * Exact first-turn direct-item Radiant search model with an explicit Active
 * Wobbuffet category. Extends the existing six-category Aichi model without
 * changing its resource-route priority or granting free switches/discards.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { sourceCandidates } = require('./aichi-radiant-start-tradeoff.cjs');

const NAMES = ['radiant', 'search', 'heavy', 'vmax', 'wobbuffet', 'otherBasic', 'other'];
const ROUTES = ['opening-radiant', 'topdeck-radiant', 'search-item', 'heavy-ball'];
const CHOOSE = Array.from({ length: 61 }, () => Array(61).fill(0n));
for (let n = 0; n <= 60; n += 1) {
  CHOOSE[n][0] = CHOOSE[n][n] = 1n;
  for (let k = 1; k < n; k += 1) CHOOSE[n][k] = CHOOSE[n - 1][k - 1] + CHOOSE[n - 1][k];
}

/** @param {number[]} available @param {number} count @param {(x:number[], n:bigint)=>void} emit */
function select(available, count, emit) {
  const current = Array(available.length).fill(0);
  function walk(i, left, weight) {
    if (i === available.length) {
      if (left === 0) emit(current.slice(), weight);
      return;
    }
    for (let n = 0; n <= Math.min(left, available[i]); n += 1) {
      current[i] = n;
      walk(i + 1, left - n, weight * CHOOSE[available[i]][n]);
    }
  }
  walk(0, count, 1n);
}

/**
 * @param {Record<string,number>} profile
 * @param {number} [search]
 * @param {number} [heavy]
 * @returns {number[]}
 */
function profileFromShadow(profile, search = 5, heavy = 1) {
  const p = [profile.radiant, search, heavy, profile.shadowVMAX,
    profile.wobbuffet, profile.shadowV + profile.lele + profile.otherBasic];
  p.push(60 - p.reduce((a, b) => a + b, 0));
  return p;
}

/** @param {string} [root] @returns {Record<string, number[]>} */
function sourceTurnProfiles(root = path.resolve(__dirname, '..')) {
  const p = sourceCandidates(root);
  const base = path.join(root, 'results', 'aichi-2026');
  const field = JSON.parse(fs.readFileSync(path.join(base, 'full-decklists.json'), 'utf8'));
  const decks = {
    champion: field.decks.find(d => d.rank === 1),
    hood: JSON.parse(fs.readFileSync(path.join(base, 'candidate-hood-shadow-rider.json'), 'utf8')),
    temple: JSON.parse(fs.readFileSync(path.join(base, 'candidate-temple-shadow-rider.json'), 'utf8')),
  };
  const profiles = {};
  for (const label of Object.keys(decks)) {
    const count = name => decks[label].cards.reduce((s, c) => s + (c.name === name ? c.count : 0), 0);
    const search = count('Mysterious Treasure') + count('Quick Ball');
    const heavy = count('Hisuian Heavy Ball');
    assert.equal(search, 5, label + ' direct search-item count drift');
    assert.equal(heavy, 1, label + ' Heavy Ball count drift');
    profiles[label] = profileFromShadow(p[label], search, heavy);
  }
  assert.deepEqual(profiles.champion, [1, 5, 1, 4, 0, 13, 36]);
  assert.deepEqual(profiles.hood, [1, 5, 1, 4, 0, 13, 36]);
  assert.deepEqual(profiles.temple, [1, 5, 1, 3, 1, 13, 36]);
  return profiles;
}

/**
 * @param {number[]} groups Counts in NAMES order; total <= 60.
 * @param {{handSize?:number,prizeCount?:number}} [options]
 */
function exactFirstDraw(groups, options = {}) {
  const handSize = options.handSize ?? 7;
  const prizeCount = options.prizeCount ?? 6;
  const deckSize = groups.reduce((a, b) => a + b, 0);
  assert.equal(groups.length, NAMES.length);
  assert.ok(groups.every(n => Number.isInteger(n) && n >= 0));
  assert.ok(deckSize <= 60 && groups[0] === 1 && groups[3] >= 2);
  assert.ok(handSize >= 1 && prizeCount >= 0 && deckSize - handSize - prizeCount >= 1);

  const counts = Object.create(null);
  const add = (key, amount) => { counts[key] = (counts[key] || 0n) + amount; };
  select(groups, handSize, (opening, hWeight) => {
    if (opening[0] + opening[4] + opening[5] === 0) return;
    const afterHand = groups.map((n, i) => n - opening[i]);
    select(afterHand, prizeCount, (prizes, pWeight) => {
      const remain = afterHand.map((n, i) => n - prizes[i]);
      for (let drawn = 0; drawn < remain.length; drawn += 1) {
        if (remain[drawn] === 0) continue;
        const weight = hWeight * pWeight * BigInt(remain[drawn]);
        add('valid', weight);
        const hand = opening.map((n, i) => n + Number(i === drawn));
        const inDeck = groups.map((n, i) => n - hand[i] - prizes[i]);
        const hasAlternate = opening[4] + opening[5] > 0;
        let route = null;
        if (opening[0] && hasAlternate) route = ROUTES[0];
        else if (drawn === 0 && hasAlternate) route = ROUTES[1];
        else if (inDeck[0] && hasAlternate && hand[1]) route = ROUTES[2];
        else if (prizes[0] && hasAlternate && hand[2]) route = ROUTES[3];
        if (!route) continue;
        add('access', weight);
        add('route.' + route, weight);
        const twoVMAX = inDeck[3] >= 2;
        if (twoVMAX) {
          add('two', weight);
          add('two.' + route, weight);
        }
        // Before any switch, Wobbuffet is forced Active if it is the only
        // initially available Basic other than potential hand Radiant.
        if (opening[5] === 0 && opening[4] > 0) {
          add('selflock', weight);
          add('selflock.' + route, weight);
          if (twoVMAX) {
            add('selflockTwo', weight);
            add('selflockTwo.' + route, weight);
          }
        }
      }
    });
  });
  const valid = counts.valid;
  assert.ok(valid > 0n);
  const basics = groups[0] + groups[4] + groups[5];
  const rejected = CHOOSE[deckSize - basics][handSize];
  assert.equal(valid,
    (CHOOSE[deckSize][handSize] - rejected)
      * CHOOSE[deckSize - handSize][prizeCount]
      * BigInt(deckSize - handSize - prizeCount));
  const probability = k => Number(counts[k] || 0n) / Number(valid);
  return {
    groups,
    access: probability('access'),
    twoVmax: probability('two'),
    selflockedDirect: probability('selflock'),
    selflockedTwoVmax: probability('selflockTwo'),
    unblockedDirect: probability('access') - probability('selflock'),
    unblockedTwoVmax: probability('two') - probability('selflockTwo'),
    routes: Object.fromEntries(ROUTES.map(r => [r, {
      resource: probability('route.' + r),
      twoVmax: probability('two.' + r),
      selflockedTwoVmax: probability('selflockTwo.' + r),
    }])),
    numerators: Object.fromEntries(Object.entries(counts).map(([k, v]) => [k, v.toString()])),
    denominator: valid.toString(),
  };
}

module.exports = { exactFirstDraw, sourceTurnProfiles, profileFromShadow, NAMES, ROUTES };
if (require.main === module) {
  for (const [name, groups] of Object.entries(sourceTurnProfiles())) {
    console.log(JSON.stringify({ name, ...exactFirstDraw(groups) }, null, 2));
  }
}
