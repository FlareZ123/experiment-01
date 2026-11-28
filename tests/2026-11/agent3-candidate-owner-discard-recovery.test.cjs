'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

// Frozen Hood Shield 60: VS Seeker PHF 109 x2; Night Stretcher ASC 196 x1.
// Only actor-visible discard, no opponent hidden-zone access.
const poke=(printing,attack=[])=>({
  printing,name:printing.split(' ').slice(0,-2).join(' '),hp:200,damage:0,
  printed:{stage:'BASIC',types:['Psychic'],subtypes:['Basic'],
    weakness:[],resistance:[],retreatCost:[]},
  energies:[],tools:[],abilities:[],abilitySuppressions:[],attacks:attack
});
const side=(active,discard=[],bench=[])=>({
  active,discard,bench,stadium:[],lostZone:[],resolvingSupporter:[],
  deckCount:30,handCount:1,
  publicTurnRestrictions:{gxUsed:false,stadiumAndToolHaveNoEffectTurnsRemaining:0}
});
const V='Shadow Rider Calyrex V CRE 74';
const VMAX='Shadow Rider Calyrex VMAX CRE 75';
const MIM='Mimikyu GRI 58';
const PSY='Psychic Energy MEE 13';
const ARVEN='Arven SVI 166';
const LILLIE="Lillie's Determination MEG 119";
const VS='VS Seeker PHF 109';
const STRETCHER='Night Stretcher ASC 196';
function observation(seat,discard=[],bench=[],supporterUsed=0){
 return {actorSeat:seat,decisionKind:'owner-root',
   ownHand:[],ownPublic:side(poke('Latias ex SSP 76'),discard,bench),
   opponentPublic:side(poke('Regidrago VSTAR SIT 136')),
   ownTurnResources:{supporterPlayedTurn:supporterUsed}};
}
function root(seat,item,discard,supporterUsed=0){
  const obs=observation(seat,discard,[],supporterUsed);
  obs.ownHand=[item];
  return {role:'candidate',seat,observation:obs,prompt:null,
    publicEventReceipt:null,actionFrontier:{items:[
      {kind:'play-card',token:'item',actorPrinting:item,
        publicMetadata:{cardType:'item'}},
      {kind:'pass',token:'pass'}
    ]}};
}
function prompt(seat,item,cards,{wrongSource=false,visible=true,bench=[]}={}){
  const obs=observation(seat,cards,bench);
  obs.decisionKind='owner-prompt';
  const effect=item===VS?'VS Seeker':'Night Stretcher';
  const source=wrongSource?'Quick Ball FST 237':item;
  const choices=cards.map((printing,index)=>({
    token:'card-'+index,kind:'card',printing,
    publicMetadata:{ownerSeat:'actor',sourceZone:'discard',
      isOwnerVisible:visible,selectionIndex:index,selectedCount:1}
  }));
  return {role:'candidate',seat,observation:obs,publicEventReceipt:null,
    prompt:{schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
      promptType:'ChooseCardsPrompt',description:'CHOOSE_CARD_TO_HAND',
      source:{classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:source,effectName:effect},
      choices,publicMetadata:{selectionType:'card-combination',
        ownerSeat:'actor',sourceZone:'discard',isOwnerVisible:visible,
        minimumCount:1,maximumCount:1,allowCancel:false,isSecret:false}},
    actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}};
}
function check(input,expected){
  const got=policy.createPolicy({role:'candidate',seat:input.seat,
    policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(input);
  assert.deepEqual(got.decision,expected);
  if(input.prompt)protocol.validatePrompt(input.prompt,input.seat);
  protocol.validateDecision(got.decision,input.prompt,
    new Set(input.actionFrontier.items.map(x=>x.token)));
  protocol.validatePolicyAudit(got.policyAudit,input,got.decision,
    policy.POLICY_VERSION);
}
for(const seat of [0,1]){
  test('VS Seeker playable with discarded Arven '+seat,()=>check(
    root(seat,VS,[ARVEN]),{kind:'select-action',token:'item'}));
  test('VS Seeker not used with no known discarded Supporter '+seat,()=>check(
    root(seat,VS,[]),{kind:'select-action',token:'pass'}));
  test('VS Seeker should not burn second Supporter in same turn '+seat,()=>check(
    root(seat,VS,[ARVEN],1),{kind:'select-action',token:'pass'}));
  test('VS Seeker retrieves Arven to set up engine '+seat,()=>check(
    prompt(seat,VS,[ARVEN,LILLIE]),
    {kind:'select-choices',tokens:['card-0']}));
  test('VS Seeker retrieves draw with built engine '+seat,()=>check(
    prompt(seat,VS,[ARVEN,LILLIE],{bench:[poke(V),poke(VMAX)]}),
    {kind:'select-choices',tokens:['card-1']}));
  test('Stretcher playable with counter Mimikyu in own discard '+seat,()=>check(
    root(seat,STRETCHER,[MIM,PSY]),
    {kind:'select-action',token:'item'}));
  test('Stretcher not used with empty discard '+seat,()=>check(
    root(seat,STRETCHER,[]),
    {kind:'select-action',token:'pass'}));
  test('Stretcher recovers Mimikyu over Psychic Energy vs Regidrago '+seat,
    ()=>check(prompt(seat,STRETCHER,[PSY,MIM]),
      {kind:'select-choices',tokens:['card-1']}));
  test('Stretcher recovers VMAX to evolve existing V '+seat,()=>check(
    prompt(seat,STRETCHER,[PSY,VMAX],{bench:[poke(V)]}),
    {kind:'select-choices',tokens:['card-1']}));
  test('VS Seeker rejects cross-source spoof '+seat,()=>check(
    prompt(seat,VS,[ARVEN],{wrongSource:true}),
    {kind:'abstain',reasonCode:'UNTRUSTED_PROMPT_SOURCE'}));
  test('Stretcher rejects hidden discard rows '+seat,()=>check(
    prompt(seat,STRETCHER,[MIM],{visible:false}),
    {kind:'abstain',reasonCode:'UNTRUSTED_CARD_SELECTION'}));
}
