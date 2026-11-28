'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const STONE='Float Stone BKT 137',V='Shadow Rider Calyrex VMAX CRE 75',LATIAS='Latias ex SSP 76';
const P='Psychic Energy MEE 13';
function mon(name,{energy=0,tool=[],attack=null,retreat=3}={}){return {
 printing:name,hp:320,damage:0,energies:Array(energy).fill(P),tools:tool,
 abilities:[],abilitySuppressions:[],attacks:attack?[attack]:[],
 printed:{stage:name===V?'VMAX':'BASIC',subtypes:name===V?['VMAX']:['Basic'],
 types:['Psychic'],retreatCost:Array(retreat).fill('Colorless'),
 weakness:[],resistance:[]}
};}
function player(active,bench=[]){return {active,bench,discard:[],
 stadium:[],lostZone:[],resolvingSupporter:[],handCount:1,
 deckCount:30,prizeCount:6,publicTurnRestrictions:{
 gxUsed:false,vstarUsed:false,stadiumAndToolHaveNoEffectTurnsRemaining:0}};}
function req(seat,mode='tool',options={}){
 const active=mon(V,{tool:mode==='retreat'?[STONE]:[],
 attack:{name:'Max Geist',cost:['Colorless','Colorless','Colorless'],damage:'10+'},
 retreat:3});
 const bench=mon(LATIAS,{energy:options.noEnergy?0:3,
 attack:{name:'Eon Blade',cost:['Psychic','Psychic','Colorless'],damage:'200'},
 retreat:2});
 const own=player(active,[bench]);
 const opp=player(mon('Iron Thorns ex TWM 77',{retreat:2}));
 if(options.suppressed){
  own.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining=1;
  opp.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining=1;
 }
 const items=mode==='tool'?[
 {token:'bad-bench',kind:'play-card',actorPrinting:STONE,
  targetPrinting:LATIAS,publicMetadata:{targetSeat:'actor',
   targetZone:'bench',targetIndex:0,isOwnerVisible:true,cardType:'trainer'}},
 {token:'float',kind:'play-card',actorPrinting:STONE,
  targetPrinting:V,publicMetadata:{targetSeat:'actor',
   targetZone:'active',targetIndex:0,isOwnerVisible:true,cardType:'trainer'}},
 {token:'pass',kind:'pass'}
 ]:[
 {token:'retreat',kind:'retreat',targetPrinting:LATIAS,
  publicMetadata:{targetSeat:'actor',targetZone:'bench',
   targetIndex:0,benchIndex:0,isOwnerVisible:true}},
 {token:'pass',kind:'pass'}];
 const observation={actorSeat:seat,decisionKind:'owner-root',
  ownPublic:own,opponentPublic:opp,
  ownHand:mode==='tool'?[STONE]:[],
  ownTurnResources:{supporterPlayedTurn:0,vstarUsed:false}};
 return {role:'candidate',seat,observation,prompt:null,publicEventReceipt:null,
 actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items}};
}
for(const seat of [0,1]){
 const agent=policy.createPolicy({role:'candidate',seat,
   policyVersion:policy.POLICY_VERSION,config:{}});
 test('Float Stone native Tool root then zero-cost retreat to paid Bench attacker seat '+seat,()=>{
  const tool=req(seat,'tool');
  const first=agent.decideWithAudit(tool);
  assert.deepEqual(first.decision,{kind:'select-action',token:'float'});
  protocol.validatePolicyAudit(first.policyAudit,tool,first.decision,policy.POLICY_VERSION);
  const later=req(seat,'retreat');
  const second=agent.decideWithAudit(later);
  assert.deepEqual(second.decision,{kind:'select-action',token:'retreat'});
  protocol.validatePolicyAudit(second.policyAudit,later,second.decision,policy.POLICY_VERSION);
 });
 for(const [name,opts] of [['suppressed', {suppressed:true}],
 ['no payable Bench attack',{noEnergy:true}]])
 test('Float Stone conserves unique Tool when '+name+' seat '+seat,()=>{
  const r=req(seat,'tool',opts);const got=agent.decideWithAudit(r);
  assert.deepEqual(got.decision,{kind:'select-action',token:'pass'});
  protocol.validatePolicyAudit(got.policyAudit,r,got.decision,policy.POLICY_VERSION);
 });
}
