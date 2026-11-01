'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {count,union,evaluate}=
  require('../scripts/agent3-rank26-direct-root-lightning-dce.cjs');

test('reconstruct original disjoint rank26 physical location union',()=>{
  const expected=[
    1483214381211216n,400709873941344n,22075306477296n
  ];
  assert.deepEqual([0,1,2].map(n=>union(n)),expected);
  assert.equal(union(),expected.reduce((a,b)=>a+b,0n));
  assert.equal(count('Bunnelby','three-pumps'),382571527752960n);
  assert.equal(count('Unown','three-pumps'),1179047969709344n);
});

test('split exact no-Lightning-hand event by DCE original seven',()=>{
  assert.equal(union(0,1),180069100137636n);
  assert.equal(union(0,0),1303145281073580n);
  assert.equal(union(0,1)+union(0,0),union(0));
});

test('one first-turn ordinary draw preserves both Lightning and finds DCE',()=>{
  const x=evaluate();
  assert.equal(x.favorableRootWeights,'9406254787267200');
  assert.equal(x.denominators.ordinaryDrawWeighted,
    '337271985613442880');
  assert.ok(Math.abs(x.conditionalDirectRootProbability-
    0.027889226465574225)<1e-15);
  assert.equal(x.sixDisjointStarterPumpBranches,true);
  assert.equal(x.sourceBasics,12);
  assert.ok(x.conditionalDirectRootProbability<x.originalUnionProbability);
});
