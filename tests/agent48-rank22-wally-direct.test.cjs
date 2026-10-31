'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {rank22,exactWallyWindow}=
  require('../simulation/evaluation/agent48-rank22-wally-direct.cjs');

test('rank22 direct 8-card window has an unprized search target',()=>{
  const x=exactWallyWindow(rank22);
  assert.equal(x.deckSize,60);
  assert.ok(Math.abs(x.validOpeningProbability-0.8093533072892635)<1e-12);
  assert.ok(Math.abs(x.directEventProbability-0.010113585208048078)<1e-12);
  assert.ok(Math.abs(x.eventGivenValidOpening-0.01249588420404573)<1e-12);
});

test('tiny 8-card deck agrees with independently exhaustive enumeration',()=>{
  const c={wally:1,trubbish:1,floatStone:1,garbodor:1,
    otherBasics:1,other:3};
  const x=exactWallyWindow(c,{opening:3,prizes:1});
  assert.ok(Math.abs(x.validOpeningProbability-9/14)<1e-13);
  assert.ok(Math.abs(x.directEventProbability-39/1120)<1e-13);
  assert.ok(Math.abs(x.eventGivenValidOpening-13/240)<1e-13);
});
