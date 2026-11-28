'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const policy = require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const psychic='Psychic Energy MEE 13';
const mon=(printing,energies=0,attacks=[])=>({
  name:printing.split(' ')[0],printing,hp:90,damage:0,
  printed:{stage:'BASIC',subtypes:['Basic'],types:['Psychic'],
    weakness:[],resistance:[],retreatCost:[]},
  energies:Array(energies).fill(psychic),attacks,tools:[],abilities:[],
  abilitySuppressions:[]
});
const girafarig=n=>mon('Girafarig LOT 94',n,[
  {name:'Get Lost',cost:['Colorless'],damage:''},
  {name:'Mind Shock',cost:['Colorless','Colorless','Colorless'],damage:'70'}]);
const other=()=>mon('Regidrago VSTAR SIT 136');
const donor='Dialga-GX UPR 100', donor2='Dragapult ex TWM 130';
const side=(active,discard=[])=>({
  active,bench:[],stadium:[],discard,lostZone:[],resolvingSupporter:[],
  deckCount:20,handCount:1,
  publicTurnRestrictions:{gxUsed:false,stadiumAndToolHaveNoEffectTurnsRemaining:0}
});
function root(seat,energy,discard) {
  const active=girafarig(energy);
  const items=[
    ...(energy>=1?[{token:'get-lost',kind:'attack',attackName:'Get Lost'}]:[]),
    ...(energy===0?[{token:'attach',kind:'play-card',
      actorPrinting:psychic,targetPrinting:active.printing,
      publicMetadata:{targetSeat:'actor',targetZone:'active'}}]:[]),
    {token:'pass',kind:'pass'}
  ];
  return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
    observation:{actorSeat:seat,decisionKind:'owner-root',
      ownHand:energy===0?[psychic]:[],
      ownTurnResources:{supporterPlayedTurn:0},
      ownPublic:side(active),opponentPublic:side(other(),discard)},
    actionFrontier:{items}};
}
function ownerPrompt(seat,cards,{wrongSource=false,visible=true}={}) {
  const rows=cards.map((printing,i)=>({
    token:'card-'+i,kind:'card',printing,
    publicMetadata:{ownerSeat:'opponent',isOwnerVisible:visible,
      sourceZone:'discard',selectionIndex:i,selectedCount:1}
  }));
  const count=Math.min(2,cards.length);
  return {role:'candidate',seat,publicEventReceipt:null,
    observation:{actorSeat:seat,decisionKind:'owner-prompt',
      ownHand:[],ownTurnResources:{supporterPlayedTurn:0},
      ownPublic:side(girafarig(1)),
      opponentPublic:side(other(),cards)},
    prompt:{schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
      promptType:'ChooseCardsPrompt',description:'CHOOSE_CARD_TO_DISCARD',
      source:{classification:'actor-choice',sourceKind:'card-effect',
        sourcePrinting:wrongSource?'Shadow Rider Calyrex VMAX CRE 75':'Girafarig LOT 94',
        effectName:'Get Lost'},choices:rows,
      publicMetadata:{selectionType:'card-combination',
        sourceZone:'discard',ownerSeat:'opponent',isOwnerVisible:visible,
        minimumCount:count,maximumCount:count,allowCancel:false,isSecret:false}},
    actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}};
}
function check(req,expected) {
  const got=policy.createPolicy({role:'candidate',seat:req.seat,
    policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(req);
  assert.deepEqual(got.decision,expected);
  if(req.prompt)protocol.validatePrompt(req.prompt,req.seat);
  protocol.validateDecision(got.decision,req.prompt,
    new Set(req.actionFrontier.items.map(x=>x.token)));
  protocol.validatePolicyAudit(got.policyAudit,req,got.decision,
    policy.POLICY_VERSION);
}
for(const seat of [0,1]){
  test('Get Lost root attack with visible discard '+seat,()=>check(
    root(seat,1,[donor,donor2]),{kind:'select-action',token:'get-lost'}));
  test('Get Lost no opposing discard does not waste attack '+seat,()=>check(
    root(seat,1,[]),{kind:'select-action',token:'pass'}));
  test('Manual Psychic unlocks Get Lost for active Girafarig '+seat,()=>check(
    root(seat,0,[donor]),{kind:'select-action',token:'attach'}));
  test('Get Lost moves two public Dragon payloads '+seat,()=>check(
    ownerPrompt(seat,[donor,'Psychic Energy MEE 13',donor2]),
    {kind:'select-choices',tokens:['card-0','card-2']}));
  test('Get Lost one remaining card uses scoped paper min1 '+seat,()=>check(
    ownerPrompt(seat,[donor]),{kind:'select-choices',tokens:['card-0']}));
  test('Opponent-discard prompt requires typed Girafarig source '+seat,()=>check(
    ownerPrompt(seat,[donor],{wrongSource:true}),
    {kind:'abstain',reasonCode:'UNTRUSTED_CARD_SELECTION'}));
  test('Opponent-discard prompt rejects hidden choices '+seat,()=>{
    const req=ownerPrompt(seat,[donor],{visible:false});
    check(req,{kind:'abstain',reasonCode:'UNTRUSTED_CARD_SELECTION'});
  });
}
