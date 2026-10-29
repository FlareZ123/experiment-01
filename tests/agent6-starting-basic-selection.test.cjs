'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {choose,starterBounds}=
  require('../scripts/agent6-starting-basic-selection.cjs');

test('exact binomial coefficients and no impossible draws',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(5,6),0n);
  assert.equal(choose(5,0),1n);
});

test('Ham hypothetical 8 threat among 14 Basics',()=>{
  const p=starterBounds({basics:14,threatBasics:8});
  assert.ok(Math.abs(p.anyThreat-0.7587491294996692)<1e-12);
  assert.ok(Math.abs(p.forcedThreat-0.371453192090925)<1e-12);
  assert.ok(Math.abs(p.optionalThreat-0.387295937408744)<1e-12);
  assert.ok(Math.abs(p.safeOnly-0.2412508705003308)<1e-12);
});

test('all Basics classified threatening means every valid starter threatened',()=>{
  const p=starterBounds({basics:14,threatBasics:14});
  assert.equal(p.anyThreat,1);
  assert.equal(p.forcedThreat,1);
  assert.equal(p.optionalThreat,0);
  assert.equal(p.safeOnly,0);
});

test('no threatening Basics means no threatened starter',()=>{
  const p=starterBounds({basics:14,threatBasics:0});
  assert.equal(p.anyThreat,0);
  assert.equal(p.forcedThreat,0);
  assert.equal(p.optionalThreat,0);
  assert.equal(p.safeOnly,1);
});
