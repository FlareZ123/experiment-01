'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const HOOD='Stealthy Hood UNB 186',STONE='Forest Seal Stone SIT 156';
const V='Shadow Rider Calyrex V CRE 74',MAX='Shadow Rider Calyrex VMAX CRE 75';
const IRON='Iron Thorns ex TWM 77';
function mon(name,tools=[]){return {
 printing:name,hp:320,damage:0,tools,energies:[],attacks:[],
 abilities:[],abilitySuppressions:[],printed:{stage:'BASIC',
 subtypes:name===MAX?['VMAX']:name===V?['V']:['Basic'],
 types:['Psychic'],weakness:[],resistance:[],retreatCost:[]}
};}
function side(active,bench=[]){return {active,bench,discard:[],
 stadium:[],lostZone:[],resolvingSupporter:[],handCount:1,deckCount:25,
 prizeCount:6,publicTurnRestrictions:{vstarUsed:false,gxUsed:false,
 stadiumAndToolHaveNoEffectTurnsRemaining:0}};}
function play(token,card,printing,zone,index,owner='actor'){
 return {token,kind:'play-card',actorPrinting:card,targetPrinting:printing,
 publicMetadata:{cardType:'trainer',handIndex:0,targetSeat:owner,
 targetZone:zone,targetIndex:index,isOwnerVisible:true}};
}
function req(seat,card,choices,own,opponent=side(mon(IRON))){
 return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
 observation:{actorSeat:seat,decisionKind:'owner-root',
 ownPublic:own,opponentPublic:opponent,ownHand:[card],
 ownTurnResources:{vstarUsed:false,supporterPlayedTurn:0}},
 actionFrontier:{schema:protocol.FRONTIER_SCHEMA,
 items:[...choices,{token:'pass',kind:'pass'}]}};
}
for(const seat of [0,1]){
 const worker=policy.createPolicy({role:'candidate',seat,
 policyVersion:policy.POLICY_VERSION,config:{}});
 test('physical Hood goes on Underworld Door VMAX, not eligible filler, seat '+seat,()=>{
  const own=side(mon(V),[mon('Latias ex SSP 76'),mon(MAX)]);
  const r=req(seat,HOOD,[
   play('a-filler',HOOD,'Latias ex SSP 76','bench',0),
   play('z-protect',HOOD,MAX,'bench',1),
   play('m-basic',HOOD,V,'active',0)],own);
  const got=worker.decideWithAudit(r);
  assert.deepEqual(got.decision,{kind:'select-action',token:'z-protect'});
  protocol.validatePolicyAudit(got.policyAudit,r,got.decision,policy.POLICY_VERSION);
 });
 test('Hood no-Ability-lock retains Tool; no unsafe physical target, seat '+seat,()=>{
  const own=side(mon(V),[mon(MAX)]);
  const r=req(seat,HOOD,[play('hood',HOOD,MAX,'bench',0)],own,
    side(mon('Mimikyu GRI 58')));
  const got=worker.decideWithAudit(r);
  assert.deepEqual(got.decision,{kind:'select-action',token:'pass'});
  protocol.validatePolicyAudit(got.policyAudit,r,got.decision,policy.POLICY_VERSION);
 });
 test('Hood refuses forged opponent ownership and occupied target, seat '+seat,()=>{
  const own=side(mon(V),[mon(MAX,[STONE]),mon('Latias ex SSP 76')]);
  const r=req(seat,HOOD,[
   play('foreign',HOOD,MAX,'bench',0,'opponent'),
   play('occupied',HOOD,MAX,'bench',0),
   play('filler',HOOD,'Latias ex SSP 76','bench',1)],own);
  const got=worker.decideWithAudit(r);
  assert.deepEqual(got.decision,{kind:'select-action',token:'pass'});
  protocol.validatePolicyAudit(got.policyAudit,r,got.decision,policy.POLICY_VERSION);
 });
 test('Stone should choose basic V over VMAX when Hood may be needed, seat '+seat,()=>{
  const own=side(mon(V),[mon(MAX)]);
  const r=req(seat,STONE,[
   play('a-vmax',STONE,MAX,'bench',0),
   play('z-basic',STONE,V,'active',0)],own);
  const got=worker.decideWithAudit(r);
  assert.deepEqual(got.decision,{kind:'select-action',token:'z-basic'});
  protocol.validatePolicyAudit(got.policyAudit,r,got.decision,policy.POLICY_VERSION);
 });
 test('Stone remains playable on VMAX as sole available V recipient, seat '+seat,()=>{
  const own=side(mon('Latias ex SSP 76'),[mon(MAX)]);
  const r=req(seat,STONE,[play('sole',STONE,MAX,'bench',0)],own);
  const got=worker.decideWithAudit(r);
  assert.deepEqual(got.decision,{kind:'select-action',token:'sole'});
  protocol.validatePolicyAudit(got.policyAudit,r,got.decision,policy.POLICY_VERSION);
 });
}
