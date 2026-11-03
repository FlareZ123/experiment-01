'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {preregistered,followthrough,BLOB}=
  require('../simulation/evaluation/agent42-selected-v3-known-witness-opponent-reply-extension.cjs');
test('sealed posthoc cap extension preserves original source rank, seed, profile and A/B/A',()=>{
 const {registration:r,trial}=preregistered();
 assert.equal(BLOB,'b70ce79ab3c295e0e2142f4fb47fd9ff0125fefd');
 assert.equal(r.extendedActionCap,240);
 assert.equal(r.baselineActionCap,180);
 assert.equal(r.totalNativeAttempts,3);
 assert.equal(trial.id,'1:420:A:new-moon-lockbreaker-v1');
});
function row(reply){
 const roots=[
  {actionOrdinal:172,playerSlot:1,action:'PlayCardAction',
   card:'Float Stone',turnBefore:36},
  {actionOrdinal:173,playerSlot:1,action:'RetreatAction',turnBefore:36},
  {actionOrdinal:174,playerSlot:1,action:'AttackAction',
   attack:'Max Geist',turnBefore:36},
  {actionOrdinal:175,playerSlot:0,action:'ResolvePromptAction',
   pendingPrompt:'ChoosePokemonPrompt',turnBefore:36},
 ];
 if(reply)roots.push({actionOrdinal:181,playerSlot:0,action:reply,turnBefore:37});
 return {rootActionLedger:roots,
  nativeAcceptedTargetSidecar:{events:[
   {rootActionOrdinal:172,playerSlot:1,action:'PlayCardAction',storeAccepted:true,
    declared:{ownerHandPrinting:'Float Stone BKT'}},
   {rootActionOrdinal:173,playerSlot:1,action:'RetreatAction',storeAccepted:true}
  ]},
  sourceAttackSettlement:{attacks:[
   {actionOrdinal:174,attackName:'Max Geist',settledPromptChain:true}
  ]}};
}
test('postattack opponent promotion prompt is not a meaningful opponent root',()=>{
 const result=followthrough(row(null));
 assert.equal(result.chains.length,1);
 assert.equal(result.chains[0].attackSettled,true);
 assert.equal(result.chains[0].opponentFirstNonPrompt,null);
});
test('followthrough joins physically accepted Tool/Retreat/attack to next actual opponent root',()=>{
 const result=followthrough(row('AttackAction'));
 assert.equal(result.chains[0].toolPhysicallyAccepted,true);
 assert.equal(result.chains[0].retreatPhysicallyAccepted,true);
 assert.equal(result.chains[0].opponentFirstNonPrompt.action,'AttackAction');
});
test('missing physical attachment receipt blocks the certified chain',()=>{
 const x=row('PassTurnAction');
 x.nativeAcceptedTargetSidecar.events=[];
 assert.equal(followthrough(x).chains[0].toolPhysicallyAccepted,false);
});

test('opponent root audit is symmetric in physical seat 0 and seat 1',()=>{
 const x=row('AttackAction');
 x.rootActionLedger=x.rootActionLedger.map(a=>({
  ...a,playerSlot:1-a.playerSlot
 }));
 x.nativeAcceptedTargetSidecar.events=x.nativeAcceptedTargetSidecar.events.map(a=>({
  ...a,playerSlot:0
 }));
 const r=followthrough(x,0);
 assert.equal(r.chains.length,1);
 assert.equal(r.chains[0].sourceSeat,0);
 assert.equal(r.chains[0].toolPhysicallyAccepted,true);
 assert.equal(r.chains[0].retreatPhysicallyAccepted,true);
 assert.equal(r.chains[0].opponentFirstNonPrompt.action,'AttackAction');
});
