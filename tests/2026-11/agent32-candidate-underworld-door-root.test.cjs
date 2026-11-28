'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION}=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const E='Psychic Energy MEE 13';
const pokemon=(id,types=['PSYCHIC'],stage='BASIC')=>({
 printing:id,hp:200,damage:0,printed:{stage,types,subtypes:stage==='VMAX'?['VMAX']:['Basic'],
 weakness:[],resistance:[],retreatCost:[]},energies:[E],tools:[],
 attacks:[],abilities:stage==='VMAX'?['Underworld Door']:[],abilitySuppressions:[]});
const player=(active,bench,deckCount=30)=>({active,bench,deckCount,handCount:1,
 stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
 publicTurnRestrictions:{gxUsed:false,stadiumAndToolHaveNoEffectTurnsRemaining:0}});
function request(seat,variant) {
 const active=pokemon('Shadow Rider Calyrex VMAX CRE 75',['PSYCHIC'],'VMAX');
 const bench=variant==='metalBench'?[pokemon('Dialga-GX UPR 100',['METAL'])]:
   [pokemon('Shadow Rider Calyrex V CRE 74')];
 const hand=variant==='noHandEnergy'?[]:[E];
 const actions=[{token:'door',kind:'use-ability',actorPrinting:active.printing,
 publicMetadata:{abilityName:'Underworld Door',sourceZone:'active',sourceSeat:'actor'}},
 {token:'pass',kind:'pass'}];
 if(['benchAttach','activeAttach','evolve','fogFirst'].includes(variant)){
   const targetZone=variant==='activeAttach'?'active':'bench';
   actions.push({token:'attach',kind:'play-card',actorPrinting:E,
   targetPrinting:targetZone==='active'?active.printing:'Shadow Rider Calyrex V CRE 74',
   publicMetadata:{targetSeat:'actor',targetZone,targetIndex:0}});
 }
 if(variant==='evolve')actions.push({token:'evolve',kind:'play-card',
 actorPrinting:'Shadow Rider Calyrex VMAX CRE 75',
 targetPrinting:'Shadow Rider Calyrex V CRE 74',
 publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:0}});
 if(variant==='fogFirst')actions.push({token:'fog',kind:'play-card',
 actorPrinting:'Fog Crystal CRE 140',publicMetadata:{targetSeat:'actor'}});
 return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
 observation:{actorSeat:seat,decisionKind:'owner-root',ownHand:hand,
 ownPublic:player(active,bench,variant==='smallDeck'?2:30),
 opponentPublic:player(pokemon('Mimikyu GRI 58'),[]),
 ownTurnResources:{supporterPlayedTurn:0}},
 actionFrontier:{schema:'aichi-action-frontier-v1',items:actions}};
}
for(const seat of [0,1])for(const [variant,expected] of [
 ['benchAttach','door'],['abilityOnly','door'],['activeAttach','attach'],
 ['evolve','evolve'],['fogFirst','fog'],['noHandEnergy','pass'],
 ['metalBench','pass'],['smallDeck','pass']
])test('fixed Hood Underworld Door source turn '+variant+' seat '+seat,()=>{
 const req=request(seat,variant);
 const policy=createPolicy({role:'candidate',seat,policyVersion:POLICY_VERSION,config:{}});
 const z=policy.decideWithAudit(req);
 assert.deepEqual(z.decision,{kind:'select-action',token:expected});
 assert.deepEqual(z.policyAudit.selectedTokens,[expected]);
 assert.deepEqual(z.policyAudit.evaluations.map(r=>r.token),
   req.actionFrontier.items.map(r=>r.token));
});
