'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const proto=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const RANGER='Pokémon Ranger STS 104';
const mon=(printing,locks={})=>({
 name:printing.split(' ')[0],printing,hp:210,damage:0,
 printed:{stage:'BASIC',subtypes:['Basic'],types:['Psychic'],
   weakness:[],resistance:[],retreatCost:[]},
 energies:[],tools:[],attacks:[],abilities:[],abilitySuppressions:[],
 publicRestrictions:locks
});
function side(active,itemPlayLocked=false){
 return {active,bench:[],stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
  handCount:1,deckCount:30,
  publicTurnRestrictions:{gxUsed:false,vstarUsed:false,itemPlayLocked,
   stadiumAndToolHaveNoEffectTurnsRemaining:0}};
}
const event=(attackName)=>({
 turn:7,sourcePrinting:'Budew PRE 4',attackName,
 gxAttack:false,copycatAttack:false
});
function request(seat,{attackName='Itchy Pollen',itemLock=true,
   activeLock={},used=0,receiptAbsent=false}={}){
 const view={actorSeat:seat,globalTurn:8,decisionKind:'owner-root',
   ownHand:[RANGER],ownTurnResources:{supporterPlayedTurn:used},
   ownPublic:side(mon('Latias ex SSP 76',activeLock),itemLock),
   opponentPublic:side(mon('Budew PRE 4'))};
 const attack=event(attackName);
 const receipt=receiptAbsent?null:{
   version:proto.EVENT_RECEIPT_VERSION,
   actorSeat:seat,turn:8,
   ownerActive:{printing:view.ownPublic.active.printing,
     movedFromBenchToActiveThisTurn:false,knownAbilityUse:[]},
   ownerBench:[],priorOpponentTurnKO:{any:false,byAttack:false},
   opponentLastTurnAttack:null,opponentLastTurnTurn:7,
   opponentLastTurnAttacks:[attack],opponentCopycatChoices:[attack],
   mimikyuCopycatCompatible:false
 };
 return {role:'candidate',seat,observation:view,prompt:null,
   publicEventReceipt:receipt,actionFrontier:{items:[
    {kind:'play-card',token:'ranger',actorPrinting:RANGER,
      publicMetadata:{cardType:'supporter'}},
    {kind:'pass',token:'pass'}
   ]}};
}
function check(input,token){
 proto.validatePublicEventReceipt(input.publicEventReceipt,input.observation);
 const got=policy.createPolicy({role:'candidate',seat:input.seat,
   policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(input);
 assert.deepEqual(got.decision,{kind:'select-action',token});
 proto.validateDecision(got.decision,null,
   new Set(input.actionFrontier.items.map(x=>x.token)));
 proto.validatePolicyAudit(got.policyAudit,input,got.decision,
   policy.POLICY_VERSION);
}
for(const seat of [0,1]){
 test('Ranger clears Budew attack-origin Item lock '+seat,()=>check(
   request(seat), 'ranger'));
 test('Ranger clears Seismitoad Quaking Punch Item lock '+seat,()=>check(
   request(seat,{attackName:'Quaking Punch'}),'ranger'));
 test('Ranger clears Frillish Oceanic Gloom lock '+seat,()=>check(
   request(seat,{attackName:'Oceanic Gloom'}),'ranger'));
 test('Ranger does not clear ungrounded apparent Ability Item lock '+seat,
   ()=>check(request(seat,{attackName:'Tackle'}),'pass'));
 test('Ranger without last opponent attack receipt declines '+seat,
   ()=>check(request(seat,{receiptAbsent:true}),'pass'));
 test('Ranger clears attack-imposed cannot attack on Active '+seat,
   ()=>check(request(seat,{itemLock:false,activeLock:{
     cannotUseAttacksNextTurn:true}}),'ranger'));
 test('Ranger cannot be second Supporter '+seat,
   ()=>check(request(seat,{used:1}),'pass'));
}
