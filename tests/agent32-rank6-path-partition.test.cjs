'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const x=require('../simulation/evaluation/agent32-rank6-thunder-dce-route-partition.cjs');
const base=require('../simulation/evaluation/agent32-rank6-thunder-dce-resource-gate.cjs');
const sum=r=>x.MODES.reduce((s,k)=>s+r[k],0);
const close=(a,b)=>assert.ok(Math.abs(a-b)<2e-12);
test('direct, held supporter and Tag paths stay disjoint',()=>{
  assert.equal(x.pathGivenHand([1,1,1,1,1,2],52,6).direct,1);
  assert.equal(x.pathGivenHand([1,1,1,1,1,2],52,6).heldGuzmaHala,0);
  assert.equal(x.pathGivenHand([1,0,0,0,0,6],52,6).viaTagCall,0);
});
test('independent small Prize calculation',()=>{
  const direct=x.pathGivenHand([1,1,0,1,1,1],8,2,1);
  const g=x.pathGivenHand([1,1,0,0,0,3],8,2,1);
  const tag=x.pathGivenHand([1,0,1,0,0,3],8,2,1);
  close(direct.direct,1);
  close(g.heldGuzmaHala,15/28);
  close(tag.viaTagCall,10/28);
});
test('mulligan strata preserve original total resource probability',()=>{
  for(const n of [0,1,2,3,5,8])close(sum(x.partitionGivenBonus(n)),base.routeProbabilityGivenBonus(n));
});
test('source no-bonus path probabilities fixed',()=>{
  const a=x.partitionGivenBonus(0);
  close(a.direct,0.01278355133906697);
  close(a.heldGuzmaHala,0.18188193894571547);
  close(a.viaTagCall,0.14314956682115315);
});
test('seven and fourteen basic contenders match original screening',()=>{
  for(const basics of [7,14]){
    const a=x.mixRoutePartition(basics,18),b=base.bilateralRank6Gate(basics,18);
    close(a.lowerSum,b.routeProbabilityLower);
    close(a.tailUpper,b.unknownTail);
    assert.ok(a.partitions.heldGuzmaHala>a.partitions.viaTagCall);
  }
});
test('invalid optional mulligan counts cannot run',()=>{
  assert.throws(()=>x.partitionGivenBonus(-1));
  assert.throws(()=>x.partitionGivenBonus(48));
  assert.throws(()=>x.mixRoutePartition(0));
});
