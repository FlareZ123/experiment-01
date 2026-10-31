'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {exactWallyOrLeleWindow,rank22WithLele}=
  require('../simulation/evaluation/agent48-rank22-wally-lele-access.cjs');

test('source rank22 Wally and bench-playable Lele are a disjoint union',()=>{
  const x=exactWallyOrLeleWindow(rank22WithLele);
  assert.equal(x.deckSize,60);
  assert.ok(Math.abs(x.validOpeningProbability-0.8093533072892635)<1e-12);
  assert.ok(Math.abs(x.directProbability-0.010113585208048078)<1e-12);
  assert.ok(Math.abs(x.leleOnlyAdditionalProbability-0.008089007091259657)<1e-12);
  assert.ok(Math.abs(x.unionProbability-0.018202592299307735)<1e-12);
  assert.ok(Math.abs(x.unionGivenValidOpening-0.022490292107748333)<1e-12);
});

test('independently enumerated nine-card physical toy deck',()=>{
  const c={wally:1,leleGX:1,trubbish:1,floatStone:1,
    garbodor:1,otherBasics:1,other:3};
  const x=exactWallyOrLeleWindow(c,{opening:3,prizes:1});
  assert.ok(Math.abs(x.validOpeningProbability-16/21)<1e-13);
  assert.ok(Math.abs(x.directProbability-17/630)<1e-13);
  assert.ok(Math.abs(x.leleOnlyAdditionalProbability-13/840)<1e-13);
  assert.ok(Math.abs(x.unionProbability-107/2520)<1e-13);
});

test('rejects hypothetical second direct Wally or second Lele copy',()=>{
  assert.throws(()=>exactWallyOrLeleWindow(
    {...rank22WithLele,wally:2}),/Expected values to be strictly equal/);
  assert.throws(()=>exactWallyOrLeleWindow(
    {...rank22WithLele,leleGX:2}),/Expected values to be strictly equal/);
});
