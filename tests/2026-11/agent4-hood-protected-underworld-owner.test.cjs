'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const original = require('../../simulation/twinleaf/agent31-underworld-door-owner-frontier.cjs');
const policy = require('../../simulation/twinleaf/2026-11/agent4-hood-protected-underworld-owner-exception.cjs');

const VMAX = 'Shadow Rider Calyrex VMAX CRE';
const THORNS = 'Iron Thorns ex TWM';
const catalog = {
  basicEnergyTypes:{Psychic:7},
  basicEnergies:new Set(['Psychic Energy SVE'])
};
const receipt = {activeUnspent:false,benchUnspent:[true,true]};
function source(tool='Stealthy Hood UNB') {
  return {printing:VMAX,abilities:['Underworld Door'],
    printed:{types:[7]},tools:tool ? [tool] : []};
}
function view() {
  return {decisionKind:'owner-root',actorSeat:0,globalTurn:5,
    ownTurnResources:{toolPlayLocked:false},
    ownHand:['Psychic Energy SVE'],
    ownPublic:{
      active:{printing:'Shadow Rider Calyrex V CRE',tools:[]},
      bench:[source(''),source()],
      stadium:['Sky Field ROS']
    },
    opponentPublic:{
      active:{printing:THORNS,name:'Iron Thorns ex',
        abilities:['Initialization'],tools:[]},
      bench:[{printing:THORNS,name:'Iron Thorns ex',tools:[]}],
      stadium:[]
    }
  };
}
test('protected Bench source is selected without altering detached owner view',()=>{
  const observed=view();
  const serialized=JSON.stringify(observed);
  assert.equal(original.chooseUnderworldDoorRoot(observed,catalog,receipt),null);
  assert.deepEqual(policy.protectedBenchIndices(observed,receipt),[1]);
  const chosen=policy.chooseProtectedHoodUnderworld(
    observed,catalog,receipt,original.chooseUnderworldDoorRoot);
  assert.equal(chosen.kind,'use-underworld-door');
  assert.equal(chosen.position,'bench');
  assert.equal(chosen.benchIndex,1);
  assert.equal(chosen.sourcePrinting,VMAX);
  assert.equal(JSON.stringify(observed),serialized);
});
test('closed positive scope abstains under tool, stadium, target, or marker doubts',()=>{
  for(const alter of [
    v=>v.opponentPublic.active.tools.push('Tool Jammer BST'),
    v=>v.opponentPublic.stadium.push('Jamming Tower TWM'),
    v=>v.opponentPublic.stadium.push('Path to the Peak CRE'),
    v=>v.opponentPublic.bench.push({printing:'Garbodor BKP'}),
    v=>v.ownPublic.bench[1].tools.splice(0),
    v=>v.ownHand.splice(0),
    v=>v.opponentPublic.active.abilities.splice(0),
    v=>v.ownPublic.bench.splice(1)
  ]){
    const observed=view();alter(observed);
    assert.equal(policy.chooseProtectedHoodUnderworld(
      observed,catalog,receipt,original.chooseUnderworldDoorRoot),null);
  }
  assert.deepEqual(policy.protectedBenchIndices(view(),{
    activeUnspent:false,benchUnspent:[false,false]}),[]);
});
test('physical Hood-in-hand owner gets exact Bench Tool intent before protected power',()=>{
  const observed=view();
  observed.ownPublic.bench[1].tools=[];
  observed.ownHand.push('Stealthy Hood UNB');
  const toolCatalog={toolPrintings:new Set(['Stealthy Hood UNB'])};
  const intent=policy.chooseHoodToolPreparation(observed,toolCatalog);
  assert.deepEqual(intent,{
    kind:'attach-tool-candidate',
    printing:'Stealthy Hood UNB',
    handIndex:1,slot:'bench',index:1
  });
  for(const alter of [
    v=>v.ownPublic.bench[1].tools.push('Float Stone BKT'),
    v=>v.ownPublic.publicTurnRestrictions={toolPlayLocked:true},
    v=>v.opponentPublic.active.tools.push('Tool Jammer BST'),
    v=>v.opponentPublic.stadium.push('Jamming Tower TWM'),
    v=>v.opponentPublic.bench.push({printing:'Garbodor BKP'})
  ]){
    const variant=view();
    variant.ownPublic.bench[1].tools=[];
    variant.ownHand.push('Stealthy Hood UNB');
    alter(variant);
    assert.equal(policy.chooseHoodToolPreparation(variant,toolCatalog),null);
  }
});
test('reversible wrapper calls the actual original chooser and restores it',()=>{
  const base=original.chooseUnderworldDoorRoot;
  const observed=view();
  const wrapped=policy.withProtectedHoodUnderworld(()=>(
    original.chooseUnderworldDoorRoot(observed,catalog,receipt)));
  assert.equal(wrapped.result.benchIndex,1);
  assert.equal(wrapped.audit.protectedSelected,1);
  assert.equal(wrapped.audit.baselineSelected,0);
  assert.equal(wrapped.audit.privateOpponentRead,false);
  assert.strictEqual(original.chooseUnderworldDoorRoot,base);
});
