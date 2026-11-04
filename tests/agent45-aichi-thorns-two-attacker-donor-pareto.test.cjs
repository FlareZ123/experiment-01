'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {twoAttackerDonorPareto,originalThornsTwoAttackerCensus}=
  require('../simulation/evaluation/aichi-thorns-two-attacker-donor-pareto.cjs');
const {canPayVoltCost}=
  require('../simulation/evaluation/agent45-volt-cyclone-donor-debt.cjs');
const {THUNDER,WONDROUS}=
  require('../simulation/evaluation/aichi-thorns-physical-energy-donor-census.cjs');

const SPEED='Speed Lightning Energy';
const DCE='Double Colorless Energy';
const CAPTURE='Capture Energy';

function field(){
  const make=(rank,energy)=>({
    rank,player:'source '+rank,cards:[
      {name:'Iron Thorns ex',count:4},{name:'Other',count:48},
      ...energy.map(([name,count])=>({name,count}))
    ]});
  const six=[[SPEED,4],[CAPTURE,2],['Spiky Energy',1],[DCE,1]];
  const twentyFour=[[SPEED,4],[DCE,3],[CAPTURE,1]];
  return {decks:[make(6,six),make(24,twentyFour),make(29,six)]};
}

test('true two-objective conflict despite paid pre-transfer attack',()=>{
  const x=twoAttackerDonorPareto(
    [SPEED,SPEED,DCE],[SPEED],[],canPayVoltCost);
  assert.equal(x.activeInitiallyPayable,true);
  assert.equal(x.benchInitiallyPayable,false);
  assert.equal(x.someActivePayable,true);
  assert.equal(x.someBenchPayable,true);
  assert.equal(x.someBothPayable,false);
  assert.equal(x.nonDominatedFundingConflict,true);
  assert.deepEqual(x.candidates.map(v=>[
    v.donorName,v.activeCostPayable,v.benchCostPayable]),[
    [SPEED,true,false],[SPEED,true,false],[DCE,false,true]
  ]);
});

test('rank24 DCE bench creates another Active-v-Bench funding conflict',()=>{
  const x=twoAttackerDonorPareto(
    [SPEED,DCE,CAPTURE],[DCE],[],canPayVoltCost);
  assert.equal(x.nonDominatedFundingConflict,true);
  assert.deepEqual(x.candidates.map(v=>[
    v.donorName,v.activeCostPayable,v.benchCostPayable]),[
    [SPEED,false,true],[DCE,false,false],[CAPTURE,true,false]
  ]);
});

test('Stadium context can remove the conflict without changing Energy',()=>{
  const active=[SPEED,SPEED,DCE],bench=[SPEED];
  const thunder=twoAttackerDonorPareto(
    active,bench,[THUNDER],canPayVoltCost);
  assert.equal(thunder.nonDominatedFundingConflict,false);
  assert.equal(thunder.someBothPayable,true);
  const wondrous=twoAttackerDonorPareto(
    active,bench,[WONDROUS],canPayVoltCost);
  assert.equal(wondrous.nonDominatedFundingConflict,false);
  assert.equal(wondrous.someActivePayable,false);
  assert.equal(wondrous.someBenchPayable,false);
});

test('all original rank source physical Active3 Bench1 allocations are partitioned',()=>{
  const x=originalThornsTwoAttackerCensus(field(),canPayVoltCost);
  assert.deepEqual(x.rosters.map(r=>r.rank),[6,24,29]);
  assert.deepEqual(x.rosters.map(r=>r.strata[0].counts.physicalAllocations),
    [280,280,280]);
  assert.deepEqual(x.rosters.map(r=>r.strata[0].counts.activeInitiallyPayable),
    [260,260,260]);
  assert.deepEqual(x.rosters.map(r=>r.strata[0].counts.nonDominatedFundingConflict),
    [48,108,48]);
  assert.deepEqual(x.rosters.map(r=>r.strata[0].counts.someBothPayable),
    [0,72,0]);
  assert.ok(x.rosters.every(r=>
    r.strata[1].counts.someBothPayable===280));
  assert.ok(x.rosters.every(r=>
    r.strata[2].counts.someBothPayable===0));
  assert.equal(x.competitiveQualifiedGames,0);
});

test('unsupported printings and nonexistent recipients fail closed',()=>{
  assert.throws(()=>twoAttackerDonorPareto(
    [SPEED,'Fake Energy'],[DCE],[],canPayVoltCost),
  /UNKNOWN_PRINTED_COST/);
  assert.throws(()=>twoAttackerDonorPareto(
    [SPEED,DCE],null,[],canPayVoltCost),
  /INVALID_TWO_ATTACKER_INPUT/);
});
