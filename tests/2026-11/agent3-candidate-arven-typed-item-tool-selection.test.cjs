'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const FOG='Fog Crystal CRE 140', QUICK='Quick Ball FST 237';
const FOREST='Forest Seal Stone SIT 156', FLOAT='Float Stone BKT 137';
const ENERGY='Psychic Energy MEE 13';
const mon=printing=>({
  name:printing.split(' ')[0],printing,hp:210,damage:0,
  printed:{stage:'BASIC',types:['Psychic'],subtypes:['Basic'],
    weakness:[],resistance:[],retreatCost:['Colorless']},
  energies:[],tools:[],attacks:[],abilities:[],abilitySuppressions:[]
});
const side=(active,bench=[])=>({
  active,bench,stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
  handCount:0,deckCount:30,publicTurnRestrictions:{
    gxUsed:false,vstarUsed:false,stadiumAndToolHaveNoEffectTurnsRemaining:0
  }
});
function ownerPrompt(seat,printings,{source='Arven SVI 166',min=0,max=2}={}){
 const choices=printings.map((printing,index)=>({
   token:'card-'+index,kind:'card',printing,
   publicMetadata:{selectionIndex:index,selectedCount:1,
     sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true}
 }));
 if(min===0)choices.push({token:'empty',kind:'empty-selection',label:'Choose no items'});
 return {role:'candidate',seat,publicEventReceipt:null,
   observation:{actorSeat:seat,decisionKind:'owner-prompt',ownHand:[],
     ownTurnResources:{supporterPlayedTurn:1},
     ownPublic:side(mon('Latias ex SSP 76')),
     opponentPublic:side(mon('Regidrago VSTAR SIT 136'))},
   prompt:{schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
     promptType:'ChooseCardsPrompt',description:'CHOOSE_CARD_TO_HAND',
     source:{classification:'actor-choice',sourceKind:'card-effect',
       sourcePrinting:source,effectName:'Arven'},
     choices,publicMetadata:{
       selectionType:'card-combination',sourceZone:'deck',ownerSeat:'actor',
       isOwnerVisible:true,minimumCount:min,maximumCount:max,
       allowCancel:false,isSecret:false
     }},
   actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}};
}
function check(input,expected){
 const got=policy.createPolicy({role:'candidate',seat:input.seat,
   policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(input);
 assert.deepEqual(got.decision,expected);
 protocol.validatePrompt(input.prompt,input.seat);
 protocol.validateDecision(got.decision,input.prompt,new Set());
 protocol.validatePolicyAudit(got.policyAudit,input,got.decision,
   policy.POLICY_VERSION);
}
for(const seat of [0,1]){
 test('Arven exactly one Item and one Pokémon Tool '+seat,()=>check(
   ownerPrompt(seat,[FOG,QUICK,FOREST]),
   {kind:'select-choices',tokens:['card-2','card-0']}));
 test('Arven cannot select two Items without a Tool '+seat,()=>check(
   ownerPrompt(seat,[FOG,QUICK]),
   {kind:'select-choices',tokens:['card-0']}));
 test('Arven cannot select two Tools without an Item '+seat,()=>check(
   ownerPrompt(seat,[FOREST,FLOAT]),
   {kind:'select-choices',tokens:['card-1']}));
 test('Arven minimum-two pair impossible fails closed '+seat,()=>check(
   ownerPrompt(seat,[FOG,QUICK],{min:2,max:2}),
   {kind:'abstain',reasonCode:'NO_LEGAL_CARD_SET'}));
 test('Arven maximum one chooses highest useful category '+seat,()=>check(
   ownerPrompt(seat,[FOG,FOREST],{min:0,max:1}),
   {kind:'select-choices',tokens:['card-1']}));
 test('Arven no eligible categories chooses native empty '+seat,()=>check(
   ownerPrompt(seat,[ENERGY],{min:0,max:2}),
   {kind:'select-choice',token:'empty'}));
 test('Arven wrong source is rejected '+seat,()=>check(
   ownerPrompt(seat,[FOG,FOREST],{source:'Guzma BUS 115'}),
   {kind:'abstain',reasonCode:'UNTRUSTED_PROMPT_SOURCE'}));
}
