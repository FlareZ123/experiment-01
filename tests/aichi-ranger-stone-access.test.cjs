'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {rangerStoneAccess} = require('../scripts/aichi-ranger-stone-access.cjs');

/** Independent index-based subsets of unique physical cards. */
function subsets(cards, count) {
  if (count === 0) return [[]];
  if (count > cards.length) return [];
  const result = [];
  function walk(i, chosen) {
    if (chosen.length === count) { result.push(chosen.slice()); return; }
    for (let j = i; j <= cards.length - (count - chosen.length); j += 1) {
      chosen.push(cards[j]);
      walk(j + 1, chosen);
      chosen.pop();
    }
  }
  walk(0, []);
  return result;
}

/** Independently enumerate starting hands, then Prize sets, then ordinary draws. */
function brute(profile, opening, draws, prizes) {
  const cards = [
    ...Array(profile.lele).fill('L'),
    ...Array(profile.shadowV).fill('V'),
    ...Array(profile.ranger).fill('R'),
    ...Array(profile.stone).fill('S'),
    ...Array(profile.basics - profile.lele - profile.shadowV).fill('B'),
    ...Array(profile.size - profile.basics - profile.ranger - profile.stone).fill('O')
  ].map((type,i)=>({type,i}));
  const tally = {direct:0,wonderOnly:0,stoneOnly:0,bothSearch:0,either:0,withoutWonder:0};
  let count = 0;
  for (const start of subsets(cards,opening)) {
    if (!start.some(c => ['L','V','B'].includes(c.type))) continue;
    const startIds = new Set(start.map(c=>c.i));
    const available = cards.filter(c=>!startIds.has(c.i));
    for (const prized of subsets(available,prizes)) {
      const prizesIds = new Set(prized.map(c=>c.i));
      const remaining = available.filter(c=>!prizesIds.has(c.i));
      for (const later of subsets(remaining,draws)) {
        count++;
        const seen = [...start,...later];
        const direct = seen.some(c=>c.type==='R');
        const rangerInDeck = remaining.some(c=>c.type==='R' && !later.includes(c));
        const allSeen = type => seen.some(c=>c.type===type);
        const startLele = start.filter(c=>c.type==='L').length;
        const wonder = allSeen('L') && (start.some(c=>['V','B'].includes(c.type)) ||
          startLele >= 2 || startLele === 0);
        const star = allSeen('S') && allSeen('V');
        const accessWonder = !direct && rangerInDeck && wonder;
        const accessStone = !direct && rangerInDeck && star;
        if (direct) tally.direct++;
        else if (accessWonder && accessStone) tally.bothSearch++;
        else if (accessWonder) tally.wonderOnly++;
        else if (accessStone) tally.stoneOnly++;
        if (direct || accessWonder || accessStone) tally.either++;
        if (direct || accessStone) tally.withoutWonder++;
      }
    }
  }
  return Object.fromEntries(Object.entries(tally).map(([k,v])=>[k,v/count]));
}

for (const profile of [
  {size:9,basics:3,lele:1,shadowV:1,ranger:1,stone:1},
  {size:10,basics:4,lele:2,shadowV:1,ranger:1,stone:1},
  {size:10,basics:3,lele:1,shadowV:2,ranger:1,stone:0}
]) {
  test('exact model matches independent physical-deal enumeration '+JSON.stringify(profile), () => {
    const actual = rangerStoneAccess(profile,{opening:3,draws:1,prizes:2}).rates;
    const expected = brute(profile,3,1,2);
    for(const [key,n] of Object.entries(expected)) {
      assert.ok(Math.abs(actual[key]-n)<1e-12, key+': '+actual[key]+' vs '+n);
    }
  });
}

test('source-profile counts: Hood, Temple; old Wonder Tag marginal is preserved', () => {
  const hood = rangerStoneAccess({size:60,basics:14,lele:1,shadowV:4,ranger:1,stone:1});
  const temple = rangerStoneAccess({size:60,basics:15,lele:1,shadowV:4,ranger:1,stone:1});
  assert.ok(Math.abs(hood.rates.either-0.3026935858508917)<1e-12);
  assert.ok(Math.abs(temple.rates.either-0.30315308690192805)<1e-12);
  assert.ok(Math.abs(hood.rates.direct+hood.rates.wonderOnly+
    hood.rates.bothSearch-0.2520744558043543)<1e-10);
  assert.ok(Math.abs(hood.rates.either-hood.rates.withoutWonder-
    hood.rates.wonderOnly)<1e-12);
  assert.ok(Math.abs(hood.rates.direct+hood.rates.wonderOnly+
    hood.rates.stoneOnly+hood.rates.bothSearch-hood.rates.either)<1e-12);
});

test('reject impossible resource composition', () => {
  assert.throws(()=>rangerStoneAccess({size:10,basics:2,lele:2,shadowV:2,ranger:1,stone:1}));
});
