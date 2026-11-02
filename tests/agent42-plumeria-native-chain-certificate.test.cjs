'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {sourcePlumeriaActionCertificates}=
 require('../simulation/evaluation/agent42-plumeria-native-chain-certificate.cjs');
function fixture(){
 const root=(o,turn,seat,action,pending=null,rootAction=o,extra={})=>({
  actionOrdinal:o,turnBefore:turn,turnAfter:turn,playerSlot:seat,
  action,pendingPrompt:pending,initiatingRootActionOrdinal:rootAction,...extra
 });
 const row={trial:{id:'6:1:B:new-moon-lockbreaker-v1',rank:6,
  candidateSlot:'B'},rootActionLedger:[
  root(57,8,0,'PlayCardAction',null,57,{card:'Plumeria'}),
  root(58,8,0,'ResolvePromptAction','ChooseCardsPrompt',57),
  root(59,8,0,'ResolvePromptAction','ChoosePokemonPrompt',57),
  root(60,8,0,'ResolvePromptAction','ChooseCardsPrompt',57),
  root(61,8,0,'PassTurnAction',null,61),
  root(62,8,0,'ResolvePromptAction','WaitPrompt',61),
  root(63,9,1,'ResolvePromptAction','WaitPrompt',61),
  root(64,9,1,'AttackAction',null,64,
   {actorPolicyDecisionOrdinal:14,attack:'Hidden Power'})
 ],nativePromptChoices:{events:[
  {ordinal:58,actorSeat:0,kind:'ChooseCardsPrompt',
   nativePromptMin:2,nativePromptMax:2,
   selectedCards:['Cynthia & Caitlin CEC','Enhanced Hammer TWM']},
  {ordinal:60,actorSeat:0,kind:'ChooseCardsPrompt',
   nativePromptMin:1,nativePromptMax:1,
   selectedCards:['Psychic Energy MEE']}
 ]}};
 const payments=[{ownerSeat:0,globalTurnAfter:8,nativeStoreOrdinal:4,
  independentlyPaidTwo:true,
  paymentNames:['Enhanced Hammer TWM','Cynthia & Caitlin CEC']}];
 const effects=[{ownerSeat:0,nativeStoreOrdinal:4,
  paymentIndependentlyPaidTwo:true,independentEnergyRemoval:true,
  energyPrinting:'Psychic Energy MEE'}];
 return {row,payments,effects};
}
test('original source payment-to-effect-to-next-opponent chain positive',()=>{
 const f=fixture(),result=sourcePlumeriaActionCertificates(
  f.row,f.payments,f.effects);
 assert.equal(result.length,1);
 assert.equal(result[0].allLocalChecksPassed,true);
 assert.equal(result[0].playOrdinal,57);
 assert.equal(result[0].costPromptOrdinal,58);
 assert.equal(result[0].targetPromptOrdinal,59);
 assert.equal(result[0].energyPromptOrdinal,60);
 assert.equal(result[0].sourcePassOrdinal,61);
 assert.equal(result[0].opponentContinuation.ordinal,64);
 assert.equal(result[0].opponentContinuation.attack,'Hidden Power');
 assert.equal(result[0].qualifiedCompetitiveGames,0);
});
test('reject source paper chain if payment missing',()=>{
 const f=fixture(),result=sourcePlumeriaActionCertificates(f.row,[],f.effects);
 assert.equal(result[0].checks.physicalTwoCardPayment,false);
 assert.equal(result[0].checks.physicalOpponentEnergyRemoval,false);
 assert.equal(result[0].allLocalChecksPassed,false);
});
test('reject source paper chain if Energy object not physically moved',()=>{
 const f=fixture();
 f.effects[0].independentEnergyRemoval=false;
 assert.equal(sourcePlumeriaActionCertificates(f.row,f.payments,f.effects)[0]
  .allLocalChecksPassed,false);
});
test('reject source paper chain if no actual opponent root',()=>{
 const f=fixture();
 f.row.rootActionLedger.pop();
 const z=sourcePlumeriaActionCertificates(f.row,f.payments,f.effects)[0];
 assert.equal(z.checks.subsequentOpponentPolicyRoot,false);
 assert.equal(z.allLocalChecksPassed,false);
});
test('do not mistake cost and Energy prompts from another root',()=>{
 const f=fixture();
 const r=f.row.rootActionLedger.find(r=>r.actionOrdinal===60);
 r.initiatingRootActionOrdinal=61;
 const z=sourcePlumeriaActionCertificates(f.row,f.payments,f.effects)[0];
 assert.equal(z.checks.nativeEnergySelection,false);
 assert.equal(z.allLocalChecksPassed,false);
});
test('no natural source Plumeria root gives empty certificates',()=>{
 const f=fixture();
 f.row.rootActionLedger[0].card='Faba';
 assert.deepEqual(sourcePlumeriaActionCertificates(f.row,f.payments,f.effects),[]);
});

test('attack after Plumeria settles the source turn',()=>{
 const f=fixture();
 const r=f.row.rootActionLedger.find(x=>x.actionOrdinal===61);
 r.action='AttackAction';
 r.attack='Volt Cyclone';
 const c=sourcePlumeriaActionCertificates(f.row,f.payments,f.effects)[0];
 assert.equal(c.checks.actualSourceTurnCompletion,true);
 assert.equal(c.sourceTurnCompletionAction,'AttackAction');
 assert.equal(c.allLocalChecksPassed,true);
});
