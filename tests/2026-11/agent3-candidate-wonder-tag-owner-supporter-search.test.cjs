'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const mon=printing=>({
  name:printing.split(' GRI')[0],printing,hp:200,damage:0,
  printed:{stage:'BASIC',subtypes:['Basic'],types:['Psychic'],
    weakness:[],resistance:[],retreatCost:[]},
  energies:[],tools:[],attacks:[],abilities:[],abilitySuppressions:[]
});
const side=(active,bench=[])=>({
  active,bench,stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
  handCount:1,deckCount:30,
  publicTurnRestrictions:{gxUsed:false,stadiumAndToolHaveNoEffectTurnsRemaining:0}
});
function view(seat,hasV=false,lock=false){
  const benched=hasV?[mon('Shadow Rider Calyrex V CRE 74'),
    mon('Shadow Rider Calyrex VMAX CRE 75')]:[];
  return {actorSeat:seat,decisionKind:'owner-root',
    ownPublic:side(mon('Mimikyu GRI 58'),benched),
    opponentPublic:side(mon(lock?'Iron Thorns ex TWM 77':'Regidrago VSTAR SIT 136')),
    ownHand:['Tapu Lele-GX GRI 60'],
    ownTurnResources:{supporterPlayedTurn:0}};
}
function root(seat,lock){
 return {role:'candidate',seat,observation:view(seat,false,lock),
  prompt:null,publicEventReceipt:null,actionFrontier:{items:[
    {token:'bench-lele',kind:'play-card',actorPrinting:'Tapu Lele-GX GRI 60',
      publicMetadata:{targetSeat:'actor',targetZone:'bench'}},
    {token:'pass',kind:'pass'}
  ]}};
}
function choose(seat,hasV=false,sourcePrinting='Tapu Lele-GX GRI 60',
    cardNames=['Arven SVI 166',"Lillie's Determination MEG 119",'Iono PAL 185']){
 const observation=view(seat,hasV);
 observation.decisionKind='owner-prompt';
 observation.ownPublic.bench.push(mon('Tapu Lele-GX GRI 60'));
 const choices=cardNames.map((printing,i)=>({
   token:'card-'+i,kind:'card',printing,
   publicMetadata:{sourceZone:'deck',ownerSeat:'actor',
     isOwnerVisible:true,selectionIndex:i,selectedCount:1}
 }));
 choices.push({token:'empty',kind:'empty-selection',label:'Choose no items'});
 return {role:'candidate',seat,observation,publicEventReceipt:null,
   prompt:{schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
     promptType:'ChooseCardsPrompt',description:'CHOOSE_CARD_TO_HAND',
     source:{classification:'actor-choice',sourceKind:'card-effect',
       sourcePrinting,effectName:'Wonder Tag'},choices,publicMetadata:{
       sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true,
       minimumCount:0,maximumCount:1,allowCancel:false,isSecret:false,
       selectionType:'card-combination'}},
   actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}};
}
function check(req,expected){
 const actual=policy.createPolicy({role:'candidate',seat:req.seat,
   policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(req);
 assert.deepEqual(actual.decision,expected);
 if(req.prompt)protocol.validatePrompt(req.prompt,req.seat);
 protocol.validateDecision(actual.decision,req.prompt,
   new Set(req.actionFrontier.items.map(x=>x.token)));
 protocol.validatePolicyAudit(actual.policyAudit,req,actual.decision,
   policy.POLICY_VERSION);
}
for(const seat of [0,1]){
 test('Tapu Lele in hand gets played when no Supporter '+seat,()=>check(
   root(seat,false),{kind:'select-action',token:'bench-lele'}));
 test('Tapu Lele not played into Iron Thorns ability lock '+seat,()=>check(
   root(seat,true),{kind:'select-action',token:'pass'}));
 test('Wonder Tag gets Arven when V engine absent '+seat,()=>check(
   choose(seat,false),{kind:'select-choices',tokens:['card-0']}));
 test('Wonder Tag gets Lillie draw when V+VMAX established '+seat,()=>check(
   choose(seat,true),{kind:'select-choices',tokens:['card-1']}));
 test('Wonder Tag optional zero Supporter search chooses empty '+seat,()=>check(
   choose(seat,false,'Tapu Lele-GX GRI 60',['Psychic Energy MEE 13']),
   {kind:'select-choice',token:'empty'}));
 test('Wrong typed Wonder Tag source is rejected '+seat,()=>check(
   choose(seat,false,'Mimikyu GRI 58'),
   {kind:'abstain',reasonCode:'UNTRUSTED_PROMPT_SOURCE'}));
}
