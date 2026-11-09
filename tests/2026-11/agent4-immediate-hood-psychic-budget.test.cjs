'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  immediateHoodFunding,withImmediateFundedHoodOnly
}=require('../../simulation/twinleaf/2026-11/agent4-immediate-hood-psychic-budget.cjs');
const intent={kind:'attach-tool-candidate',
  printing:'Stealthy Hood UNB',slot:'bench',index:0};
const catalog={basicEnergies:new Set(['Psychic Energy MEE'])};
const view=()=>({
  decisionKind:'owner-root',
  ownHand:['Stealthy Hood UNB','Psychic Energy MEE'],
  ownPublic:{deckCount:11}
});

test('requires a real held printed Psychic Energy and enough public future draw',()=>{
  assert.deepEqual(immediateHoodFunding(view(),catalog,intent),
    {eligible:true,reason:'held-psychic-and-deck-reserve'});
  const empty=view();empty.ownHand=['Stealthy Hood UNB'];
  assert.equal(immediateHoodFunding(empty,catalog,intent).eligible,false);
  const altered=view();altered.ownHand[1]='Psychic Energy unknown';
  assert.equal(immediateHoodFunding(altered,catalog,intent).eligible,false);
  for(const deckCount of [0,1,2,3,4]){
    const scarce=view();scarce.ownPublic.deckCount=deckCount;
    assert.equal(immediateHoodFunding(scarce,catalog,intent).eligible,false);
  }
  assert.equal(immediateHoodFunding({...view(),ownPublic:{}},catalog,intent)
    .eligible,false);
  assert.equal(immediateHoodFunding(view(),catalog,{
    ...intent,printing:'Float Stone BKT'}).eligible,false);
});
test('scope restores previous activation state even on callback failure',()=>{
  const k='AGENT4_IMMEDIATE_PSYCHIC_HOOD_DEV';
  const before=process.env[k];
  try{
    assert.equal(withImmediateFundedHoodOnly(()=>process.env[k]),'true');
    assert.equal(process.env[k],before);
    assert.throws(()=>withImmediateFundedHoodOnly(()=>{
      throw new Error('intentional test failure');
    }),/intentional/);
    assert.equal(process.env[k],before);
  }finally{
    if(before===undefined)delete process.env[k];else process.env[k]=before;
  }
});
