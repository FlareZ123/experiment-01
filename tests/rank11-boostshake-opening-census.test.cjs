'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  C, loadCounts, goodPrizeChoices, goodPrizeGroups,
  heldSealOpportunity, heldSealRequiredGroups, census, censusAfterFirstDraw
} = require('../scripts/rank11-boostshake-opening-census.cjs');

test('published rank11 source buckets and exact combinatorial counts', () => {
  assert.deepEqual(loadCounts(), [2,4,3,2,2,2,2,1,6,36]);
  assert.equal(C(60,7), 386206920n);
  assert.equal(C(53,6), 22957480n);
  assert.equal(C(60,8), 2558620845n);
  assert.equal(C(52,6), 20358520n);
});

test('Prize target selection fails closed if every copy is held', () => {
  const total = loadCounts();
  const hand = [2,1,1,0,1,0,2,0,0,0];
  assert.equal(goodPrizeChoices(total, hand, [6]), 0n);
  const afterDraw=[...hand];
  afterDraw[8]+=1;
  assert.equal(goodPrizeChoices(total, afterDraw, [6],52), 0n);
  assert.equal(goodPrizeChoices(total, hand, [5]), C(53,6) - C(51,4));
});

test('initial seven-plus-Prizes exact structural census', () => {
  const r=census();
  assert.equal(r.total, 8866337641761600n);
  assert.equal(r.valid, 6894276702593280n);
  assert.equal(r.direct, 169890696085236n);
  assert.equal(r.heldSeal, 102325528271124n);
  assert.equal(r.v1Targets, 117097385243124n);
  assert.ok(r.direct>r.v1Targets);
});

test('normal first draw is counted after a legal initial seven', () => {
  const seven=census();
  const r=censusAfterFirstDraw();
  assert.equal(r.total, seven.total*47n);
  assert.equal(r.valid, seven.valid*47n);
  assert.equal(r.direct,11911482095606528n);
  assert.equal(r.heldSeal,7376246746128421n);
  assert.equal(r.v1Targets,7228094214428032n);
  assert.ok(r.direct*seven.valid>seven.direct*r.valid,
    'Extra natural draw should increase direct structural access rate');
  assert.ok(r.direct>r.v1Targets);
});


test('held Seal route depends only on own hand and actual deck target groups', () => {
  const held=[0,1,1,1,0,0,0,0,0,4];
  assert.equal(heldSealOpportunity(held), true);
  assert.deepEqual(heldSealRequiredGroups(held), [[4],[6],[5],[0,7]]);
  const heldV=[1,1,1,1,0,1,0,0,0,3];
  assert.deepEqual(heldSealRequiredGroups(heldV), [[4],[6]]);
  const withShake=[...held];
  withShake[4]=1;
  assert.equal(heldSealOpportunity(withShake), false);
  const count=loadCounts();
  assert.equal(goodPrizeGroups(count, held, [[0,7]]),
    C(53,6)-C(50,3));
  assert.equal(goodPrizeGroups(count, held, [[4],[6]]),
    goodPrizeChoices(count,held,[4,6]));
});

test('distinct first-turn held Seal route is disjoint from Shake-in-hand direct route', () => {
  const seven=census();
  const first=censusAfterFirstDraw();
  assert.equal(seven.heldSeal,102325528271124n);
  assert.equal(first.heldSeal,7376246746128421n);
  assert.ok(first.direct+first.heldSeal>first.direct);
  assert.ok(first.direct+first.heldSeal<first.valid);
  assert.ok(first.heldSeal*seven.valid>seven.heldSeal*first.valid);
});
