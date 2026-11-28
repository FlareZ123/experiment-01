'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const policy = require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const E = 'Psychic Energy MEE 13';
const poke=(printing,type='Psychic',attacks=[])=>({
  name: printing.split(' CRE')[0], printing, hp:210, damage:0, 
  printed:{stage:'BASIC',subtypes:['Basic'],types:[type],weakness:[],
    resistance:[],retreatCost:[]}, energies:[],tools:[],attacks,
  abilities:[],abilitySuppressions:[]
});
const side=(active,bench=[],stadium=[])=>({
  active,bench,stadium,discard:[],lostZone:[],resolvingSupporter:[],
  deckCount:30,handCount:1,
  publicTurnRestrictions:{gxUsed:false,stadiumAndToolHaveNoEffectTurnsRemaining:0}
});
function observation(seat,benchCount=0,paidAttack=false) {
  const vmax=poke('Shadow Rider Calyrex VMAX CRE 75','Psychic',
    [{name:'Max Geist',cost:['Colorless','Colorless','Colorless'],damage:'10+'}]);
  vmax.energies=paidAttack?[E,E,E,E]:[];
  const active=paidAttack?vmax:poke('Shadow Rider Calyrex V CRE 74');
  const bench=Array.from({length:benchCount},(_,i)=>
    poke(i?'Mimikyu GRI 58':'Latias ex SSP 76'));
  return {actorSeat:seat,decisionKind:'owner-root',
    ownPublic:side(active,bench),opponentPublic:side(
      poke('Regidrago VSTAR SIT 136','Dragon')),
    ownHand:['Radiant Eternatus CRZ 105'],
    ownTurnResources:{supporterPlayedTurn:0}
  };
}
function root(seat,benchCount,paidAttack) {
  const view=observation(seat,benchCount,paidAttack);
  return {role:'candidate',seat,observation:view,prompt:null,
    publicEventReceipt:null,actionFrontier:{items:[
      {token:'bench-radiant',kind:'play-card',
        actorPrinting:'Radiant Eternatus CRZ 105',
        publicMetadata:{targetSeat:'actor',targetZone:'bench'}},
      ...(paidAttack?[{token:'max-geist',kind:'attack',attackName:'Max Geist'}]:[]),
      {token:'pass',kind:'pass'}
    ]}};
}
const source={classification:'actor-choice',sourceKind:'card-effect',
  sourcePrinting:'Radiant Eternatus CRZ 105',effectName:'Climactic Gate'};
function prompt(seat,phase) {
  const view=observation(seat);
  view.decisionKind='owner-prompt';
  view.ownPublic.bench=[poke('Radiant Eternatus CRZ 105','Dragon')];
  const confirm=phase==='confirm';
  const choices=confirm?[
    {token:'yes',kind:'confirm',label:'Yes'},
    {token:'no',kind:'confirm',label:'No'}
  ]:[
    {token:'vmax-a',kind:'card',printing:'Shadow Rider Calyrex VMAX CRE 75',
      publicMetadata:{ownerSeat:'actor',isOwnerVisible:true,sourceZone:'deck',selectionIndex:0,selectedCount:1}},
    {token:'vmax-b',kind:'card',printing:'Shadow Rider Calyrex VMAX CRE 75',
      publicMetadata:{ownerSeat:'actor',isOwnerVisible:true,sourceZone:'deck',selectionIndex:1,selectedCount:1}},
    {token:'energy',kind:'card',printing:E,
      publicMetadata:{ownerSeat:'actor',isOwnerVisible:true,sourceZone:'deck',selectionIndex:2,selectedCount:1}},
    {token:'empty',kind:'empty-selection',label:'Choose no items'}
  ];
  const pr={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
    promptType:confirm?'ConfirmPrompt':'ChooseCardsPrompt',
    description:confirm?'WANT_TO_USE_ABILITY':'CHOOSE_CARD_TO_PUT_ONTO_BENCH',
    source,choices,publicMetadata:confirm?{selectionType:'confirm'}:{
      selectionType:'card-combination',sourceZone:'deck',
      ownerSeat:'actor',isOwnerVisible:true,minimumCount:0,
      maximumCount:2,allowCancel:false,isSecret:false
    }};
  return {role:'candidate',seat,observation:view,
    prompt:pr,publicEventReceipt:null,
    actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}};
}
function check(input,want) {
  const result=policy.createPolicy({role:'candidate',seat:input.seat,
    policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(input);
  assert.deepEqual(result.decision,want);
  if(input.prompt) protocol.validatePrompt(input.prompt,input.seat);
  protocol.validateDecision(result.decision,input.prompt,
    new Set(input.actionFrontier.items.map(x=>x.token)));
  protocol.validatePolicyAudit(result.policyAudit,input,result.decision,
    policy.POLICY_VERSION);
}
for(const seat of [0,1]){
  test('Radiant before pass with two VMAX slots '+seat,()=>check(
    root(seat,0,false),{kind:'select-action',token:'bench-radiant'}));
  test('Do not Radiant over funded Max Geist '+seat,()=>check(
    root(seat,0,true),{kind:'select-action',token:'max-geist'}));
  test('Do not Radiant when no VMAX bench room '+seat,()=>check(
    root(seat,4,false),{kind:'select-action',token:'pass'}));
  test('Climactic Gate native Yes confirmation '+seat,()=>check(
    prompt(seat,'confirm'),{kind:'select-choice',token:'yes'}));
  test('Climactic Gate directly retrieves two VMAX '+seat,()=>check(
    prompt(seat,'cards'),{kind:'select-choices',tokens:['vmax-a','vmax-b']}));
}
