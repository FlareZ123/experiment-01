'use strict';
// Bounded rank13-like public-geometry successor policy regression.
// No native Store/CI/game; no opponent hidden deck or rank ID input.
const test=require('node:test');
const assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-two-profile-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

const PROFILE=Object.freeze({
 schema:'agent46-candidate-profile-v1',
 profileId:'lockbridge-shadow-rider-v1',
 deckSha256:'011cb8481b473c8566935d6835fc9a2a5762e4f09349f23c8284ec19b0cac642'
});
const restrictions=()=>({
 gxUsed:false,vstarUsed:false,attackLockTurnsRemaining:0,
 attackMaxEnergy:null,attackMaxEnergyTurnsRemaining:0,
 ignoreAttackCostCardTypes:[],ignoreAttackCostTurnsRemaining:0,
 cannotUseGXAttacks:false,pokemonPlayLocked:false,abilityPokemonPlayLocked:false,
 evolutionPlayLocked:false,itemPlayLocked:false,supporterPlayLocked:false,
 stadiumPlayLocked:false,toolPlayLocked:false,energyPlayLocked:false,
 specialEnergyPlayLocked:false,stadiumAndToolHaveNoEffectTurnsRemaining:0
});
const pokemonRestrictions=()=>({
 cannotAttackNextTurn:false,cannotUseAttacksNextTurn:[],
 blockedAttackNameNextTurn:null,blockedAttackNameUntilLeavesActive:null,
 onlyAllowedAttackNameNextTurn:null,attackCostIncreaseNextTurn:0,
 attackCostIncreaseWhileActive:0,cannotRetreat:false,cannotRetreatNextTurn:false,
 cannotRetreatWhileActive:false,cannotEvolveNextTurn:false
});
function slot(printing,energies,attacks=[],types=['Psychic'],stage=['Basic']) {
 return {
  printing,name:printing,hp:printing.includes('VSTAR')?280:90,damage:0,
  lastPlayedOrEvolvedTurn:0,
  printed:{stage:stage[0],subtypes:stage,types,retreatCost:[],weakness:[],resistance:[]},
  specialConditions:[],publicRestrictions:pokemonRestrictions(),
  evolutionPrintings:[],energies,tools:[],attacks:attacks.map(([name,cost,damage])=>({
   name,cost,damage,damageCalculation:null,text:null,gxAttack:false,barrage:false
  })),abilities:[],abilityDetails:[],abilitySuppressions:[]
 };
}
const player=(active,discard=[],stadium=[],bench=[])=>({
 active,bench:[...bench,...Array(Math.max(0,5-bench.length)).fill(null)],
 stadium,discard,lostZone:[],resolvingSupporter:[],publicHand:null,prizeSlots:[],
 publicTurnRestrictions:restrictions(),handCount:4,deckCount:30,prizeCount:6
});
function view(seat) {
 const gir=slot('Girafarig LOT',['Psychic Energy SVE'],
  [['Get Lost',['Colorless'],0]]);
 const dragon=slot('Regidrago VSTAR SIT',
  ['Grass Energy SVE','Double Dragon Energy ROS'],
  [['Apex Dragon',['Grass','Grass','Fire'],null]],['Dragon'],['VSTAR']);
 const own=player(gir,[],['Temple of Sinnoh ASR']);
 const opp=player(dragon,['Dialga-GX UPR','Kyurem SFA','Megaton Blower SSP','Crispin SCR','Dragapult ex TWM']);
 opp.lostZone=['Silent Lab PRC','Parallel City BKT'];
 return {
  actorSeat:seat,globalTurn:7,phase:2,decisionKind:'owner-root',
  pendingPromptType:null,pendingOwnerDeckSearch:false,
  ownHand:[],ownPublic:own,opponentPublic:opp,
  ownTurnResources:{
   supporterPlayedTurn:0,retreatedTurn:0,extraTurnActive:false,
   energyPlayedTurn:false,stadiumPlayedTurn:false,stadiumUsedTurn:false,
   vstarUsed:false,pokemonPlayLocked:false,abilityPokemonPlayLocked:false,
   evolutionPlayLocked:false,itemPlayLocked:false,supporterPlayLocked:false,
   stadiumPlayLocked:false,toolPlayLocked:false,energyPlayLocked:false,
   specialEnergyPlayLocked:false
  },ownerK1:null
 };
}
function root(seat,v){
 return {
  schema:protocol.REQUEST_SCHEMA,type:'decision',requestId:'agent26-root',
  sequence:1,role:'candidate',seat,
  observationSchema:protocol.OBSERVATION_SCHEMA,observation:v,prompt:null,
  publicEventReceipt:null,
  actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[
   {token:'attack-getlost',kind:'attack',attackName:'Get Lost',
    actorPrinting:'Girafarig LOT',publicMetadata:{attackCostPayable:true}},
   {token:'pass',kind:'pass'}
  ]}
 };
}
function prompt(seat,v) {
 const list=v.opponentPublic.discard;
 return {
  schema:protocol.REQUEST_SCHEMA,type:'decision',requestId:'agent26-prompt',
  sequence:1,role:'candidate',seat,
  observationSchema:protocol.OBSERVATION_SCHEMA,
  observation:{...v,decisionKind:'owner-prompt',pendingPromptType:'ChooseCardsPrompt'},
  prompt:{
   schema:protocol.PROMPT_SCHEMA,actingSeat:seat,promptType:'ChooseCardsPrompt',
   description:'CHOOSE_CARD_TO_DISCARD',
   source:{classification:'actor-choice',sourceKind:'card-effect',
    sourcePrinting:'Girafarig LOT',effectName:'Get Lost'},
   choices:list.map((printing,i)=>({
    token:'card-'+i,kind:'card',printing,label:printing,
    publicMetadata:{selectionIndex:i,selectedCount:1,sourceZone:'discard',
     ownerSeat:'opponent',isOwnerVisible:true}
   })),
   publicMetadata:{sourceZone:'discard',ownerSeat:'opponent',isOwnerVisible:true,
    minimumCount:2,maximumCount:2,allowCancel:false,isSecret:false,
    selectionType:'card-combination'}
  },publicEventReceipt:null,
  actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[]}
 };
}
function decision(req) {
 const check=protocol.validateRequest(req,{role:'candidate',seat:req.seat},1,new Set());
 const owner=policy.createPolicy({
  role:'candidate',seat:req.seat,policyVersion:policy.POLICY_VERSION,config:PROFILE
 });
 const out=owner.decideWithAudit(req);
 protocol.validateDecision(out.decision,check.prompt,check.actionTokens);
 protocol.validatePolicyAudit(out.policyAudit,req,out.decision,policy.POLICY_VERSION);
 return out.decision;
}
for(const seat of [0,1]){
 test('public rank13 geometry: root Get Lost still offered and selected, seat '+seat,()=>{
  assert.deepEqual(decision(root(seat,view(seat))),
   {kind:'select-action',token:'attack-getlost'});
 });
 test('public rank13 geometry: cut funding pair not redundant donors, seat '+seat,()=>{
  assert.deepEqual(decision(prompt(seat,view(seat))),
   {kind:'select-choices',tokens:['card-2','card-3']});
 });
 test('Temple absent: retains donor-target preference, seat '+seat,()=>{
  const v=view(seat);v.ownPublic.stadium=[];
  assert.deepEqual(decision(prompt(seat,v)),
   {kind:'select-choices',tokens:['card-0','card-1']});
 });
 test('missing Lost Silent Lab: retains donor preference, seat '+seat,()=>{
  const v=view(seat);v.opponentPublic.lostZone=['Parallel City BKT'];
  assert.deepEqual(decision(prompt(seat,v)),
   {kind:'select-choices',tokens:['card-0','card-1']});
 });
 test('missing Lost Parallel City: retains donor preference, seat '+seat,()=>{
  const v=view(seat);v.opponentPublic.lostZone=['Silent Lab PRC'];
  assert.deepEqual(decision(prompt(seat,v)),
   {kind:'select-choices',tokens:['card-0','card-1']});
 });
 test('Regidrago lacking Grass+DDE geometry keeps donor preference, seat '+seat,()=>{
  const v=view(seat);v.opponentPublic.active.energies=[
   'Fire Energy SVE','Double Dragon Energy ROS'];
  assert.deepEqual(decision(prompt(seat,v)),
   {kind:'select-choices',tokens:['card-0','card-1']});
 });
 test('already-funded alternative VSTAR prevents funding-cut bonus, seat '+seat,()=>{
  const v=view(seat);
  v.opponentPublic.bench[0]=slot('Regidrago VSTAR SIT',
   ['Grass Energy SVE','Grass Energy SVE','Fire Energy SVE'],
   [['Apex Dragon',['Grass','Grass','Fire'],null]],['Dragon'],['VSTAR']);
  assert.deepEqual(decision(prompt(seat,v)),
   {kind:'select-choices',tokens:['card-0','card-1']});
 });
 test('two public Crispins leave uncut funding route; select donors, seat '+seat,()=>{
  const v=view(seat);v.opponentPublic.discard.push('Crispin SCR');
  assert.deepEqual(decision(prompt(seat,v)),
   {kind:'select-choices',tokens:['card-0','card-1']});
 });
 test('without revealed donor, avoid speculative cutoff reward, seat '+seat,()=>{
  const v=view(seat);v.opponentPublic.discard=[
   'Megaton Blower SSP','Crispin SCR','Psychic Energy SVE'];
  const result=decision(prompt(seat,v));
  assert.equal(result.kind,'select-choices');
  assert.equal(result.tokens.length,2);
 });
}

for(const seat of [0,1]){
 test('spent VSTAR power makes Megaton recovery unproven; keep donors, seat '+seat,()=>{
  const v=view(seat);v.opponentPublic.publicTurnRestrictions.vstarUsed=true;
  assert.deepEqual(decision(prompt(seat,v)),
   {kind:'select-choices',tokens:['card-0','card-1']});
 });
 test('public Faba counter leaves another Temple-removal line, seat '+seat,()=>{
  const v=view(seat);v.opponentPublic.discard.push('Faba LOT');
  assert.deepEqual(decision(prompt(seat,v)),
   {kind:'select-choices',tokens:['card-0','card-1']});
 });
 test('public Bench Marshadow remains an alternate Resetting Hole route, seat '+seat,()=>{
  const v=view(seat);
  v.opponentPublic.bench[0]=slot('Marshadow UNB',[],[],['Fighting']);
  assert.deepEqual(decision(prompt(seat,v)),
   {kind:'select-choices',tokens:['card-0','card-1']});
 });
}

for(const seat of [0,1]){
 test('two exposed donors exhaust observed payload: donor cut beats funding cut, seat '+seat,()=>{
  const v=view(seat);
  v.opponentPublic.discard.pop(); // Remove the third observed Dragon payload.
  assert.deepEqual(decision(prompt(seat,v)),
   {kind:'select-choices',tokens:['card-0','card-1']});
 });
}
