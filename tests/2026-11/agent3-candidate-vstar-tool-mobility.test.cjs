'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

const V='Shadow Rider Calyrex V CRE 74';
const VMAX='Shadow Rider Calyrex VMAX CRE 75';
const FOREST='Forest Seal Stone SIT 156';
const FLOAT='Float Stone BKT 137';
const MIM='Mimikyu GRI 58';
const mon=(printing,tools=[],energyCount=0)=>({
  name:printing.split(' CRE')[0],printing,hp:210,damage:0,
  printed:{stage:'BASIC',subtypes:['Basic'],types:['Psychic'],
    weakness:[],resistance:[],retreatCost:['Colorless','Colorless']},
  energies:Array(energyCount).fill('Psychic Energy MEE 13'),tools,attacks:[],
  abilities:[],abilitySuppressions:[]
});
const side=(active,bench=[],vstarUsed=false)=>({
  active,bench,stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
  handCount:1,deckCount:30,publicTurnRestrictions:{
    gxUsed:false,vstarUsed,stadiumAndToolHaveNoEffectTurnsRemaining:0
  }
});
function base(seat,active,bench=[],vstarUsed=false){
 return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
   observation:{actorSeat:seat,decisionKind:'owner-root',
     ownHand:[],ownTurnResources:{supporterPlayedTurn:0},
     ownPublic:side(active,bench,vstarUsed),
     opponentPublic:side(mon('Regidrago VSTAR SIT 136'))},
   actionFrontier:{items:[{token:'pass',kind:'pass'}]}};
}
function rootTool(seat,name,{active=mon(V),bench=[],vstarUsed=false,
    zone='active',targetIndex=0}={}){
  const input=base(seat,active,bench,vstarUsed);
  const recipient=zone==='active'?active:bench[targetIndex];
  input.observation.ownHand=[name];
  input.actionFrontier.items.unshift({
    kind:'play-card',token:'attach-tool',actorPrinting:name,
    targetPrinting:recipient.printing,
    publicMetadata:{cardType:'pokemon-tool',targetSeat:'actor',
      targetZone:zone,targetIndex}
  });
  return input;
}
function rootStar(seat,{tools=[FOREST],vstarUsed=false,
    active=mon(V,tools),opponent='Regidrago VSTAR SIT 136'}={}){
  const input=base(seat,active,[],vstarUsed);
  input.observation.opponentPublic.active.printing=opponent;
  input.actionFrontier.items.unshift({
    kind:'use-ability',token:'star-alchemy',actorPrinting:V,
    publicMetadata:{abilityName:'Star Alchemy'}
  });
  return input;
}
function searchPrompt(seat,{sourcePrinting=FOREST,stage='v',visible=true}={}){
  const input=rootStar(seat);
  input.observation.decisionKind='owner-prompt';
  input.prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
    promptType:'ChooseCardsPrompt',description:'CHOOSE_CARD_TO_HAND',
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting,effectName:'Star Alchemy'},
    choices:[
      {token:'energy',kind:'card',printing:'Psychic Energy MEE 13',
        publicMetadata:{sourceZone:'deck',ownerSeat:'actor',
          isOwnerVisible:visible,selectionIndex:0,selectedCount:1}},
      {token:'vmax',kind:'card',printing:VMAX,
        publicMetadata:{sourceZone:'deck',ownerSeat:'actor',
          isOwnerVisible:visible,selectionIndex:1,selectedCount:1}}
    ],
    publicMetadata:{selectionType:'card-combination',sourceZone:'deck',
      ownerSeat:'actor',isOwnerVisible:visible,
      minimumCount:1,maximumCount:1,allowCancel:false,isSecret:false}
  };
  input.actionFrontier.items=[];
  return input;
}
function check(input,want){
 const decision=policy.createPolicy({role:'candidate',seat:input.seat,
   policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(input);
 assert.deepEqual(decision.decision,want);
 if(input.prompt)protocol.validatePrompt(input.prompt,input.seat);
 protocol.validateDecision(decision.decision,input.prompt,
   new Set(input.actionFrontier.items.map(x=>x.token)));
 protocol.validatePolicyAudit(decision.policyAudit,input,decision.decision,
   policy.POLICY_VERSION);
}
for (const seat of [0,1]){
 test('attach Forest Seal Stone to clean Active V '+seat,()=>check(
   rootTool(seat,FOREST),{kind:'select-action',token:'attach-tool'}));
 test('do not attach Forest after VSTAR spent '+seat,()=>check(
   rootTool(seat,FOREST,{vstarUsed:true}),
   {kind:'select-action',token:'pass'}));
 test('do not replace existing V Tool with Forest '+seat,()=>check(
   rootTool(seat,FOREST,{active:mon(V,[FLOAT])}),
   {kind:'select-action',token:'pass'}));
 test('Forest Stone grants Star Alchemy native Ability '+seat,()=>check(
   rootStar(seat),{kind:'select-action',token:'star-alchemy'}));
 test('Star Alchemy unavailable if VSTAR used '+seat,()=>check(
   rootStar(seat,{vstarUsed:true}),{kind:'select-action',token:'pass'}));
 test('Star Alchemy unavailable without attached Stone '+seat,()=>check(
   rootStar(seat,{active:mon(V,[])}),{kind:'select-action',token:'pass'}));
 test('Star Alchemy searches missing VMAX from own deck '+seat,()=>check(
   searchPrompt(seat),{kind:'select-choices',tokens:['vmax']}));
 test('Star Alchemy typed source mismatch fails closed '+seat,()=>check(
   searchPrompt(seat,{sourcePrinting:'Mimikyu GRI 58'}),
   {kind:'abstain',reasonCode:'UNTRUSTED_PROMPT_SOURCE'}));
 test('Float Stone on stuck Active with a Bench successor '+seat,()=>check(
   rootTool(seat,FLOAT,{bench:[mon(MIM)]}),
   {kind:'select-action',token:'attach-tool'}));
 test('Float Stone no Bench option not wasted '+seat,()=>check(
   rootTool(seat,FLOAT),{kind:'select-action',token:'pass'}));
 test('Float Stone cannot replace existing Tool '+seat,()=>check(
   rootTool(seat,FLOAT,{active:mon(V,[FOREST]),bench:[mon(MIM)]}),
   {kind:'select-action',token:'pass'}));
}
