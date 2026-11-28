'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION}=
  require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const LILLIE="Lillie's Determination MEG 119", IONO='Iono PAL 185';
const V='Shadow Rider Calyrex V CRE 74';
const VMAX='Shadow Rider Calyrex VMAX CRE 75';
const mon=(printing)=>({
  name:printing.split(' ')[0],printing,hp:210,damage:0,
  printed:{stage:'BASIC',subtypes:['Basic'],types:['Psychic'],
    weakness:[],resistance:[],retreatCost:[]},
  energies:[],tools:[],abilities:[],abilitySuppressions:[],attacks:[]
});
const side=(active,bench=[],handCount=7,prizeCount=6)=>({
  active,bench,stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
  deckCount:30,handCount,prizeCount,
  publicTurnRestrictions:{gxUsed:false,vstarUsed:false,
    stadiumAndToolHaveNoEffectTurnsRemaining:0}
});
function root(seat,{items=[LILLIE],hasV=false,hasVMAX=false,
  ownHandCount=7,oppHandCount=5,mine=6,theirs=6,used=0}={}){
  const bench=[...(hasV?[mon(V)]:[]),...(hasVMAX?[mon(VMAX)]:[])];
  return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
    observation:{actorSeat:seat,decisionKind:'owner-root',
      ownHand:items,ownTurnResources:{supporterPlayedTurn:used},
      ownPublic:side(mon('Latias ex SSP 76'),bench,ownHandCount,mine),
      opponentPublic:side(mon('Regidrago VSTAR SIT 136'),[],
        oppHandCount,theirs)},
    actionFrontier:{items:[
      ...items.map((actorPrinting,index)=>({
        kind:'play-card',token:'supporter-'+index,actorPrinting,
        publicMetadata:{cardType:'supporter'}})),
      {kind:'pass',token:'pass'}
    ]}};
}
function check(input,token) {
  const got=createPolicy({role:'candidate',seat:input.seat,
    policyVersion:POLICY_VERSION,config:{}}).decideWithAudit(input);
  assert.deepEqual(got.decision,{kind:'select-action',token});
  protocol.validateDecision(got.decision,null,
    new Set(input.actionFrontier.items.map(x=>x.token)));
  protocol.validatePolicyAudit(got.policyAudit,input,got.decision,
    POLICY_VERSION);
}
for(const seat of [0,1]){
 test('Lillie draws proactively in a seven-card hand lacking engine '+seat,
   ()=>check(root(seat), 'supporter-0'));
 test('Lillie not burned at full board and seven cards '+seat,
   ()=>check(root(seat,{hasV:true,hasVMAX:true}),'pass'));
 test('Lillie draws when small hand even with established board '+seat,
   ()=>check(root(seat,{hasV:true,hasVMAX:true,ownHandCount:3}),
     'supporter-0'));
 test('Iono replaces big opponent hand at one Prize '+seat,
   ()=>check(root(seat,{items:[IONO],mine:4,theirs:1,oppHandCount:6}),
     'supporter-0'));
 test('Iono does not strengthen already empty opponent hand '+seat,
   ()=>check(root(seat,{items:[IONO],mine:2,theirs:1,oppHandCount:0,
     ownHandCount:7,hasV:true,hasVMAX:true}),'pass'));
 test('Iono draws from short own hand with many Prizes '+seat,
   ()=>check(root(seat,{items:[IONO],mine:6,theirs:6,ownHandCount:2}),
     'supporter-0'));
 test('Iono loses early to larger Lillie draw if both in hand '+seat,
   ()=>check(root(seat,{items:[LILLIE,IONO],mine:6,theirs:6,ownHandCount:3}),
     'supporter-0'));
 test('Iono overrides Lillie for decisive late hand reduction '+seat,
   ()=>check(root(seat,{items:[LILLIE,IONO],mine:5,theirs:1,
     ownHandCount:4,oppHandCount:6}),'supporter-1'));
 test('No second Supporter same turn regardless of value '+seat,
   ()=>check(root(seat,{items:[LILLIE,IONO],mine:6,theirs:1,used:1}),
     'pass'));
}
