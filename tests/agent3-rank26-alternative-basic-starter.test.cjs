'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {count,run}=
  require('../scripts/agent3-rank26-alternative-basic-starter.cjs');

test('exact Bunnelby hand-seven partition matches prior 59-card DP',()=>{
  const r=run();
  assert.deepEqual(r.starterBranches.Bunnelby.numerators,{
    'three-pumps-two-eggs':'382571527752960',
    'two-pumps-dowsing':'22347178351680',
    'one-egg-dowsing':'62324232064640'
  });
  assert.ok(Math.abs(r.starterBranches.Bunnelby.conditionalValidBasicSevenProbability-
    0.0651118949414483)<1e-12);
});

test('Unown original Active and second Bench donor yield nonoverlapping class',()=>{
  const r=run();
  assert.deepEqual(r.starterBranches.Unown.numerators,{
    'three-pumps-two-eggs':'1179047969709344',
    'two-pumps-dowsing':'68226606022848',
    'one-egg-dowsing':'191482047728384'
  });
  assert.equal(r.numeratorValidOpeningSeven,'312577848');
  assert.equal(r.prizeDrawsPerHand,'22957480');
  assert.equal(r.denominator,'7175999693903040');
  assert.ok(Math.abs(r.starterBranches.Unown.conditionalValidBasicSevenProbability-
    0.20049563612481616)<1e-12);
  assert.ok(Math.abs(r.combinedProbability-0.26560753106626445)<1e-12);
});

test('each original starter and Pump/Egg branch has a nonzero integer census',()=>{
  for(const starter of ['Bunnelby','Unown'])for(const branch of [
    'three-pumps-two-eggs','two-pumps-dowsing','one-egg-dowsing'
  ])assert.ok(count(starter,branch)>0n);
});

test('unrecognized starters and lines fail closed',()=>{
  assert.throws(()=>count('Tapu','three-pumps-two-eggs'),assert.AssertionError);
  assert.throws(()=>count('Unown','unknown-branch'),assert.AssertionError);
});
