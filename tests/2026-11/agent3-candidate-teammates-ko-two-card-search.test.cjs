'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const TM='Teammates PRC 141',V='Shadow Rider Calyrex V CRE 74',
  DIALGA='Dialga-GX UPR 100',MIM='Mimikyu GRI 58';
const mon=(printing)=>({
  name:printing.split(' ')[0],printing,hp:210,damage:0,
  printed:{stage:'BASIC',types:['Psychic'],subtypes:['Basic'],
    weakness:[],resistance:[],retreatCost:[]},
  energies:[],tools:[],attacks:[],abilities:[],abilitySuppressions:[]
});
const side=(active,bench=[])=>({
  active,bench,stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
  deckCount:30,handCount:1,prizeCount:5,
  publicTurnRestrictions:{gxUsed:false,vstarUsed:false,
    stadiumAndToolHaveNoEffectTurnsRemaining:0}
});
const apex={turn:7,sourcePrinting:'Regidrago VSTAR SIT 136',
  attackName:'Apex Dragon',gxAttack:false,copycatAttack:false};
function receipt(view,knockout) {
  return {version:protocol.EVENT_RECEIPT_VERSION,
    actorSeat:view.actorSeat,turn:view.globalTurn,
    ownerActive:{printing:view.ownPublic.active.printing,
      movedFromBenchToActiveThisTurn:false,knownAbilityUse:[]},
    ownerBench:view.ownPublic.bench.map(slot=>slot?{
      printing:slot.printing,movedFromBenchToActiveThisTurn:false,
      knownAbilityUse:[]}:null),
    priorOpponentTurnKO:{any:knockout,byAttack:knockout},
    opponentLastTurnAttack:null,opponentLastTurnTurn:7,
    opponentLastTurnAttacks:[{...apex}],
    opponentCopycatChoices:[{...apex}],
    mimikyuCopycatCompatible:false
  };
}
function root(seat,{knockout=true,used=0,remaining=30}={}) {
  const view={actorSeat:seat,globalTurn:8,decisionKind:'owner-root',
    ownHand:[TM],ownTurnResources:{supporterPlayedTurn:used},
    ownPublic:side(mon('Latias ex SSP 76')),
    opponentPublic:side(mon('Regidrago VSTAR SIT 136'))};
  view.ownPublic.deckCount=remaining;
  return {role:'candidate',seat,prompt:null,observation:view,
    publicEventReceipt:receipt(view,knockout),
    actionFrontier:{items:[
      {kind:'play-card',token:'teammates',actorPrinting:TM,
        publicMetadata:{cardType:'supporter'}},
      {kind:'pass',token:'pass'}
    ]}};
}
function prompt(seat,hasV=false,sourcePrinting=TM) {
  const request=root(seat);
  const view=request.observation;view.decisionKind='owner-prompt';
  if(hasV)view.ownPublic.bench=[mon(V)];
  const cards=[V,DIALGA,MIM,'Psychic Energy MEE 13'];
  const choices=cards.map((printing,index)=>({
    token:'card-'+index,kind:'card',printing,
    publicMetadata:{sourceZone:'deck',ownerSeat:'actor',
      isOwnerVisible:true,selectionIndex:index,selectedCount:1}
  }));
  choices.push({kind:'empty-selection',token:'empty',label:'Choose no items'});
  request.prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
    promptType:'ChooseCardsPrompt',description:'CHOOSE_CARD_TO_HAND',
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting,effectName:'Teammates'},
    choices,publicMetadata:{selectionType:'card-combination',
      sourceZone:'deck',ownerSeat:'actor',isOwnerVisible:true,
      minimumCount:0,maximumCount:2,allowCancel:false,isSecret:false}};
  request.actionFrontier={schema:protocol.FRONTIER_SCHEMA,items:[]};
  request.publicEventReceipt=receipt(view,true);
  return request;
}
function check(input,expect){
  protocol.validatePublicEventReceipt(input.publicEventReceipt,input.observation);
  if(input.prompt)protocol.validatePrompt(input.prompt,input.seat);
  const got=policy.createPolicy({role:'candidate',seat:input.seat,
    policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(input);
  assert.deepEqual(got.decision,expect);
  protocol.validateDecision(got.decision,input.prompt,
    new Set(input.actionFrontier.items.map(x=>x.token)));
  protocol.validatePolicyAudit(got.policyAudit,input,got.decision,
    policy.POLICY_VERSION);
}
for(const seat of [0,1]){
  test('Teammates usable after source-stamped previous opponent KO '+seat,
    ()=>check(root(seat),{kind:'select-action',token:'teammates'}));
  test('Teammates not played without an opponent-turn KO '+seat,
    ()=>check(root(seat,{knockout:false}),
      {kind:'select-action',token:'pass'}));
  test('Teammates cannot follow another Supporter this turn '+seat,
    ()=>check(root(seat,{used:1}),
      {kind:'select-action',token:'pass'}));
  test('Teammates searches one of remaining deck cards '+seat,
    ()=>check(root(seat,{remaining:1}),
      {kind:'select-action',token:'teammates'}));
  test('Teammates baseline two-card V and Dragon donor line '+seat,
    ()=>check(prompt(seat),{kind:'select-choices',
      tokens:['card-0','card-1']}));
  test('Teammates with V already in play selects donor plus Mimikyu '+seat,
    ()=>check(prompt(seat,true),{kind:'select-choices',
      tokens:['card-1','card-2']}));
  test('Teammates wrong typed card source rejected '+seat,
    ()=>check(prompt(seat,true,'Arven SVI 166'),
      {kind:'abstain',reasonCode:'UNTRUSTED_PROMPT_SOURCE'}));
}
