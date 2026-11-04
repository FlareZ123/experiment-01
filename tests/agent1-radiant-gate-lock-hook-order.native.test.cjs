'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {withRadiantZeroGateHook}=
  require('../simulation/twinleaf/agent1-radiant-zero-gate-hook.cjs');
const {installRadiantGateLockHook}=
  require('../simulation/twinleaf/radiant-gate-lock-hook.cjs');
const {probeThornsWobbuffet}=
  require('../simulation/twinleaf/radiant-wobbuffet-thorns-matrix.cjs');

/**
 * Match the exact real pinned reducer patch nesting order used by run-specific
 * adapters. Keep both restorations in inverse order.
 * @param {'lock-outside'|'zero-outside'} order
 * @param {boolean} wobbuffetActive
 * @param {boolean} cologne
 */
function probe(order,wobbuffetActive,cologne){
  if(order==='lock-outside'){
    const restore=installRadiantGateLockHook();
    try{return withRadiantZeroGateHook(
      ()=>probeThornsWobbuffet(wobbuffetActive,cologne));}
    finally{restore();}
  }
  return withRadiantZeroGateHook(()=>{
    const restore=installRadiantGateLockHook();
    try{return probeThornsWobbuffet(wobbuffetActive,cologne);}
    finally{restore();}
  });
}

test('Radiant entering Bench lock repair and zero-target turn-end hook compose in both reducer orders',()=>{
  const root=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
  const {RadiantEternatus}=require(path.join(root,
    'sets/09-sword-and-shield/set-crown-zenith/radiant-eternatus'));
  const {Store}=require(path.join(root,'game/store/store'));
  const priorReduce=Object.getOwnPropertyDescriptor(
    RadiantEternatus.prototype,'reduceEffect');
  const priorPrompt=Object.getOwnPropertyDescriptor(Store.prototype,'prompt');
  const cases=[
    {wobbuffetActive:true,cologne:false,gate:false},
    {wobbuffetActive:true,cologne:true,gate:false},
    {wobbuffetActive:false,cologne:false,gate:false},
    {wobbuffetActive:false,cologne:true,gate:true}
  ];
  for(const order of ['lock-outside','zero-outside'])
    for(const row of cases){
      const {result,audit}=probe(order,row.wobbuffetActive,row.cologne);
      console.log('AGENT1_RADIANT_DOUBLE_HOOK_LOCK '+JSON.stringify({
        order,...row,gatePrompt:result.gatePrompt,
        confirmations:audit.observedUseConfirmations
      }));
      assert.equal(result.gatePrompt,row.gate);
      assert.equal(result.radiantBenched,true);
      assert.equal(audit.observedUseConfirmations,row.gate?1:0);
      assert.equal(audit.repairedTurnEnds,0,
        'No source ChooseCards selection was submitted in lock test');
      assert.deepEqual(Object.getOwnPropertyDescriptor(
        RadiantEternatus.prototype,'reduceEffect'),priorReduce);
      assert.deepEqual(Object.getOwnPropertyDescriptor(
        Store.prototype,'prompt'),priorPrompt);
    }
});
