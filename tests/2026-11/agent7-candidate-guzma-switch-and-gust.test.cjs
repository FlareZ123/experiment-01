'use strict';
// Guzma BUS 115 switches the ACTOR Active with a Benched attacker BEFORE
// gusting an opponent's Benched target. The original worker scored a KO
// from its current Active while ignoring forced self-switch and both prompts.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const {createPolicy,POLICY_VERSION}=
 require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const G='Guzma BUS 115',R='Shadow Rider Calyrex VMAX CRE 75';
const mon=(printing,{hp=210,damage=0,baseDamage=0,prizeValue=1}={})=>({
 printing,name:printing,hp,damage,prizeValue,abilities:[],tools:[],energies:[],
 attacks:baseDamage?[{name:'Usable Strike',energyCost:[],
   damage:baseDamage}]:[],printed:{subtypes:['VMAX','V'],
     types:['Psychic'],retreatCost:['Colorless']}
});
function fixture(seat,{readyBench=true,activeReady=false}={}){
 const active=mon('Shadow Rider Calyrex V CRE 74',{baseDamage:activeReady?200:0});
 const bench=[mon(R,{baseDamage:readyBench?170:0}),
   mon('Tapu Lele-GX GRI 60')];
 const opponent=mon('Regidrago VSTAR SIT 136',{hp:280});
 const oppBench=[mon('Dedenne-GX UNB 57',{hp:160,prizeValue:2}),
   mon('Regidrago VSTAR SIT 136',{hp:280,prizeValue:2})];
 const view={actorSeat:seat,globalTurn:5,decisionKind:'owner-root',
   ownHand:[G],ownTurnResources:{supporterPlayedTurn:0},
   ownPublic:{active,bench,stadium:[],discard:[],lostZone:[],deckCount:23,
     publicTurnRestrictions:{vstarUsed:false}},
   opponentPublic:{active:opponent,bench:oppBench,stadium:[],
     discard:[],lostZone:[],deckCount:22,publicTurnRestrictions:{}}
 };
 const frontier={schema:protocol.FRONTIER_SCHEMA,items:[
   {kind:'play-card',token:'guzma',actorPrinting:G,
     publicMetadata:{cardType:'trainer'}},{kind:'pass',token:'pass'}]};
 const policy=createPolicy({role:'candidate',seat,policyVersion:POLICY_VERSION,config:{}});
 return {view,frontier,policy,request:{role:'candidate',seat,observation:view,
   prompt:null,publicEventReceipt:null,actionFrontier:frontier}};
}
const src={classification:'actor-choice',sourceKind:'card-effect',
 sourcePrinting:G,effectName:'Guzma'};
const switchPrompt=(seat,owner,bench)=>({
 schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
 promptType:owner==='actor'?'SwitchPokemonPrompt':'ChoosePokemonPrompt',
 description:owner==='actor'?'SWITCH_POKEMON':'CHOOSE_POKEMON',
 source:{...src},
 publicMetadata:{selectionType:'pokemon-choice',sourceZone:'bench',
   ownerSeat:owner,minimumCount:1,maximumCount:1,allowCancel:false,
   isOwnerVisible:true},
 choices:bench.map((slot,i)=>({
   token:'target-'+i,kind:'pokemon',printing:slot.printing,
   label:slot.printing,publicMetadata:{sourceZone:'bench',ownerSeat:owner,
     benchIndex:i,isOwnerVisible:true,selectedCount:1}
 }))
});
for(const seat of [0,1]){
 test('Guzma root requires a ready Benched attacker rather than ready Active seat='+seat,()=>{
   const a=fixture(seat,{readyBench:false,activeReady:true});
   assert.deepEqual(a.policy.decide(a.request),{kind:'select-action',token:'pass'});
   const b=fixture(seat,{readyBench:true,activeReady:false});
   assert.deepEqual(b.policy.decide(b.request),{kind:'select-action',token:'guzma'});
 });
 test('forced own switch selects attacker with actual gust KO seat='+seat,()=>{
   const {view,policy,request}=fixture(seat);
   view.decisionKind='owner-prompt';
   const prompt=switchPrompt(seat,'actor',view.ownPublic.bench);
   assert.doesNotThrow(()=>protocol.validatePrompt(prompt,seat));
   request.prompt=prompt;
   const chosen=policy.decide(request);
   assert.deepEqual(chosen,{kind:'select-choice',token:'target-0'});
   assert.deepEqual(protocol.validateDecision(chosen,prompt,new Set()),chosen);
 });
 test('after own switch, gust selects vulnerable two-Prize opponent target seat='+seat,()=>{
   const {view,policy,request}=fixture(seat);
   view.decisionKind='owner-prompt';
   view.ownPublic.active=view.ownPublic.bench[0];
   view.ownPublic.bench=[mon('Shadow Rider Calyrex V CRE 74'),
     mon('Tapu Lele-GX GRI 60')];
   const prompt=switchPrompt(seat,'opponent',view.opponentPublic.bench);
   assert.doesNotThrow(()=>protocol.validatePrompt(prompt,seat));
   request.prompt=prompt;
   const chosen=policy.decide(request);
   assert.deepEqual(chosen,{kind:'select-choice',token:'target-0'});
   assert.deepEqual(protocol.validateDecision(chosen,prompt,new Set()),chosen);
 });
 test('wrong owner/zone/source in Guzma prompts fails closed seat='+seat,()=>{
   const {view,policy,request}=fixture(seat);
   view.decisionKind='owner-prompt';
   const prompt=switchPrompt(seat,'actor',view.ownPublic.bench);
   request.prompt=prompt;
   prompt.source.sourcePrinting='Guzma BUS 116';
   assert.deepEqual(policy.decide(request),
     {kind:'abstain',reasonCode:'UNTRUSTED_GUZMA_POKEMON_PROMPT'});
   prompt.source.sourcePrinting=G;
   prompt.publicMetadata.ownerSeat='opponent';
   assert.deepEqual(policy.decide(request),
     {kind:'abstain',reasonCode:'GUZMA_PROMPT_DIRECTION_MISMATCH'});
   prompt.publicMetadata.ownerSeat='actor';
   prompt.choices[0].publicMetadata.benchIndex=4;
   assert.deepEqual(policy.decide(request),{kind:'select-choice',token:'target-1'});
 });
}
