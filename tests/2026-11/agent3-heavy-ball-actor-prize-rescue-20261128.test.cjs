'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const BALL='Hisuian Heavy Ball ASR 146';
const V='Shadow Rider Calyrex V CRE 74';
const VMAX='Shadow Rider Calyrex VMAX CRE 75';
const M='Mimikyu GRI 58';
const LAT='Latias ex SSP 76';
const R='Regidrago VSTAR SIT 136';
function mon(printing){
  return {printing,hp:210,damage:0,energies:[],tools:[],attacks:[],
    abilities:[],abilitySuppressions:[],printed:{
      stage:'BASIC',subtypes:['Basic'],types:['Psychic'],
      weakness:[],resistance:[],retreatCost:['Colorless']}};
}
function side(active,bench=[],prizeCount=6) {
  return {active,bench,prizeCount,deckCount:31,handCount:1,
    stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
    publicTurnRestrictions:{gxUsed:false,vstarUsed:false,
      stadiumAndToolHaveNoEffectTurnsRemaining:0}};
}
function base(seat,dragon=false){
  return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
    observation:{actorSeat:seat,decisionKind:'owner-root',
      ownHand:[BALL],ownTurnResources:{supporterPlayedTurn:0},
      ownPublic:side(mon(VMAX)),opponentPublic:side(mon(dragon?R:LAT))},
    actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}};
}
function root(seat,opts={}){
  const req=base(seat,opts.dragon);
  req.observation.ownPublic.prizeCount=opts.prizes??6;
  req.observation.ownHand=[BALL,...(opts.basic?[V]:[])];
  req.actionFrontier.items=[
    {token:'heavy-ball',kind:'play-card',actorPrinting:BALL,
      publicMetadata:{cardType:'item'}},
    ...(opts.basic?[{token:'bench-v',kind:'play-card',actorPrinting:V,
      publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:0}}]:[]),
    {token:'pass',kind:'pass'}];
  return req;
}
function prizes(seat,opts={}){
  const req=base(seat,opts.dragon);
  req.observation.decisionKind='owner-prompt';
  const choices=(opts.entries??[V,LAT]).map((printing,i)=>({
    kind:'card',token:'prize-'+i,printing,
    publicMetadata:{ownerSeat:opts.foreign?'opponent':'actor',
      isOwnerVisible:!opts.hidden,sourceZone:'prizes',selectionIndex:i}
  }));
  // Strict optional cardinality (minimum 0) must offer the empty token.
  choices.push({kind:'empty-selection',token:'none',
    publicMetadata:{ownerSeat:'actor',sourceZone:'prizes'}});
  req.prompt={schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
    promptType:'ChooseCardsPrompt',description:'CHOOSE_CARD',
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:opts.wrongSource?'VS Seeker PHF 109':BALL,
      effectName:'Hisuian Heavy Ball'},
    choices,
    publicMetadata:{selectionType:'card-combination',sourceZone:'prizes',
      ownerSeat:'actor',isOwnerVisible:true,minimumCount:0,
      maximumCount:1,allowCancel:false,isSecret:true}};
  req.actionFrontier={schema:protocol.FRONTIER_SCHEMA,items:[]};
  return req;
}
const cases=[
 ['Play free owner-Prize rescue item with six face-down Prizes',
   root,{}, {kind:'select-action',token:'heavy-ball'}],
 ['Heavy Ball is played before optional second V Bench expansion',
   root,{basic:true},{kind:'select-action',token:'heavy-ball'}],
 ['Native stale Ball root when no Prizes: do not select',
   root,{prizes:0},{kind:'select-action',token:'pass'}],
 ['Prize owner Mimikyu counter outranks second Basic against Regidrago',
   prizes,{dragon:true,entries:[V,M,LAT]},{kind:'select-choices',tokens:['prize-1']}],
 ['Prize owner second Basic outranks Latias without Dragon matchup',
   prizes,{entries:[LAT,V]},{kind:'select-choices',tokens:['prize-1']}],
 ['Prize selection rejects wrong card source',
   prizes,{wrongSource:true},{kind:'abstain',reasonCode:'UNTRUSTED_PROMPT_SOURCE'}],
 ['Unrevealed Prize identity never leaked as a policy guess',
   prizes,{hidden:true,entries:[M]},{kind:'abstain',reasonCode:'HIDDEN_PRIZE_IDENTITY'}],
 ['No Basic among Prizes: valid empty selection completes Item',
   prizes,{entries:[],empty:true},{kind:'select-choice',token:'none'}],
 ['Foreign-owner Prize card may not be chosen',
   prizes,{foreign:true,entries:[M]},{kind:'abstain',reasonCode:'HIDDEN_PRIZE_IDENTITY'}],
 ['VMAX Evolution erroneously projected as a Prize choice must be rejected',
   prizes,{entries:[VMAX]},{kind:'select-choice',token:'none'}]
];
for(const seat of [0,1])for(const [label,fn,opts,expected]of cases)
 test(label+' seat '+seat,()=>{
  const input=fn(seat,opts);
  if(input.prompt)protocol.validatePrompt(input.prompt,seat);
  const out=policy.createPolicy({role:'candidate',seat,
     policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(input);
  assert.deepEqual(out.decision,expected);
  protocol.validateDecision(out.decision,input.prompt,
    new Set(input.actionFrontier.items.map(x=>x.token)));
  protocol.validatePolicyAudit(out.policyAudit,input,out.decision,
    policy.POLICY_VERSION);
 });
