'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { exactFirstDraw, sourceTurnProfiles, NAMES, ROUTES } = require('../scripts/aichi-radiant-wobbuffet-turnone.cjs');
const { exactOpening } = require('../scripts/radiant-eternatus-opening.cjs');
const { choose } = require('../scripts/aichi-radiant-start-tradeoff.cjs');

/** Enumerate combinations of physical slot indices. */
function chooseSlots(ids, count) {
  if (!count) return [[]];
  if (ids.length < count) return [];
  const out = [];
  for (let k = 0; k <= ids.length - count; k++) {
    for (const tail of chooseSlots(ids.slice(k + 1), count - 1)) {
      out.push([ids[k], ...tail]);
    }
  }
  return out;
}

/** Exhaustive physical hand, Prize set and ordinary draw, independently counted. */
function brute(groups, handSize, prizeCount) {
  const cards = groups.flatMap((n, category) => Array(n).fill(category));
  const indices = cards.map((_, i) => i);
  const tally = {};
  const add = key => { tally[key] = (tally[key] || 0n) + 1n; };
  for (const hs of chooseSlots(indices, handSize)) {
    const h = hs.map(i => cards[i]);
    const basic = h.filter(i => i === 0 || i === 4 || i === 5);
    if (!basic.length) continue;
    const afterH = indices.filter(i => !hs.includes(i));
    for (const ps of chooseSlots(afterH, prizeCount)) {
      const prized = ps.map(i => cards[i]);
      for (const drawIndex of afterH.filter(i => !ps.includes(i))) {
        const d = cards[drawIndex];
        add('valid');
        const inHand = category => h.filter(i => i === category).length + Number(d === category);
        const inDeck = category => groups[category] - inHand(category) - prized.filter(i => i === category).length;
        const alternate = h.includes(4) || h.includes(5);
        let route = null;
        if (h.includes(0) && alternate) route = ROUTES[0];
        else if (d === 0 && alternate) route = ROUTES[1];
        else if (inDeck(0) && alternate && inHand(1)) route = ROUTES[2];
        else if (prized.includes(0) && alternate && inHand(2)) route = ROUTES[3];
        if (!route) continue;
        add('access');
        add('route.' + route);
        const two = inDeck(3) >= 2;
        if (two) { add('two'); add('two.' + route); }
        if (!h.includes(5) && h.includes(4)) {
          add('selflock'); add('selflock.' + route);
          if (two) { add('selflockTwo'); add('selflockTwo.' + route); }
        }
      }
    }
  }
  return Object.fromEntries(Object.entries(tally).map(([k, v]) => [k, v.toString()]));
}

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-12, String(a) + ' != ' + String(b));

test('source-locked profiles reproduce independently maintained legacy six-category enumerator', () => {
  const ps = sourceTurnProfiles();
  assert.deepEqual(Object.keys(ps), ['champion', 'hood', 'temple']);
  for (const [name, groups] of Object.entries(ps)) {
    const collapsed = [groups[0], groups[1], groups[2], groups[3], groups[4] + groups[5], groups[6]];
    const previous = exactOpening(true, collapsed);
    const extended = exactFirstDraw(groups);
    near(previous.access, extended.access);
    near(previous.twoVmax, extended.twoVmax);
    near(previous.validProbability, 1 - Number(choose(60 - 1 - groups[4] - groups[5], 7)) / Number(choose(60, 7)));
    if (name !== 'temple') assert.equal(extended.selflockedTwoVmax, 0);
  }
  const temple = exactFirstDraw(ps.temple);
  near(temple.access, 0.5259209022636258);
  near(temple.twoVmax, 0.4638691371648606);
  near(temple.selflockedTwoVmax, 0.01415316110386228);
  near(temple.unblockedTwoVmax, 0.44971597606099833);
});

test('exact 7-category paths match every physical-card opening, Prize set, first draw', () => {
  const groups = [1, 1, 1, 3, 1, 1, 3];
  assert.equal(groups.length, NAMES.length);
  const actual = exactFirstDraw(groups, { handSize: 3, prizeCount: 2 });
  const expected = brute(groups, 3, 2);
  assert.equal(actual.denominator, expected.valid);
  for (const [k, v] of Object.entries(actual.numerators)) {
    assert.equal(v, expected[k], 'physical mismatch for ' + k);
  }
  console.log('Independent physical hand/Prize/draw records:', expected.valid);
});

test('excluded Wobbuffet starter event partitions supported two-VMAX resource opportunity', () => {
  for (const p of Object.values(sourceTurnProfiles())) {
    const r = exactFirstDraw(p);
    near(r.twoVmax, r.unblockedTwoVmax + r.selflockedTwoVmax);
    near(r.access, r.unblockedDirect + r.selflockedDirect);
    near(Object.values(r.routes).reduce((sum, v) => sum + v.twoVmax, 0), r.twoVmax);
    near(Object.values(r.routes).reduce((sum, v) => sum + v.selflockedTwoVmax, 0), r.selflockedTwoVmax);
  }
});
