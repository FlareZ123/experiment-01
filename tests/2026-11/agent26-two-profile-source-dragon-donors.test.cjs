'use strict';
// Printed Dragon-donor scope only; no next-turn Temple funding heuristic.
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

function paidRegidrago(seat,donor){
 const v=view(seat);
 v.ownPublic.stadium=[];
 v.opponentPublic.active.energies=[
   'Grass Energy SVE','Grass Energy SVE','Fire Energy SVE'];
 v.opponentPublic.discard=[donor,'Battle VIP Pass FST','Psychic Energy SVE'];
 return v;
}
function candidateVmax(v,damage){
 const own=slot('Shadow Rider Calyrex VMAX CRE',
  ['Psychic Energy SVE'],[['Max Geist',['Colorless','Colorless','Colorless'],10]],
  ['Psychic'],['VMAX','V']);
 own.hp=320;own.damage=damage;v.ownPublic.active=own;
}
for(const seat of [0,1]){
 test('Salamence JTG Dragon Impact 300: 3-Prize VMAX KO, seat '+seat,()=>{
  const v=paidRegidrago(seat,'Salamence ex JTG');
  candidateVmax(v,50); // 270 HP remaining
  assert.equal(policy.__test.apexHazard(v).direct,3);
  v.opponentPublic.discard=[];
  assert.equal(policy.__test.apexHazard(v).direct,0);
 });
 test('Salamence JTG Wide Blast 50 each Bench, not Active, seat '+seat,()=>{
  const v=paidRegidrago(seat,'Salamence ex JTG');
  candidateVmax(v,0);
  for(let i=0;i<2;i++){
   const p=slot('Mimikyu GRI',[],[['Copycat',['Psychic','Colorless'],0]]);
   p.hp=70;p.damage=30;v.ownPublic.bench[i]=p;
  }
  assert.equal(policy.__test.apexHazard(v).direct,2);
  v.ownPublic.bench[1].damage=0;
  assert.equal(policy.__test.apexHazard(v).direct,1);
 });
 test('Koraidon ex TEF Kaiser Tackle 280 enters only Dragon copy, seat '+seat,()=>{
  const v=paidRegidrago(seat,'Koraidon ex TEF');
  candidateVmax(v,70); // 250 remaining
  assert.equal(policy.__test.apexHazard(v).direct,3);
 });
 test('Koraidon ex TEF Retribution Strike counts active Regidrago counters, seat '+seat,()=>{
  const v=paidRegidrago(seat,'Koraidon ex TEF');
  candidateVmax(v,35); // 285 remaining; 280 Kaiser Tackle not enough
  for(const [damage,want] of [[0,0],[260,0],[270,3]]){
   v.opponentPublic.active.damage=damage;
   assert.equal(policy.__test.apexHazard(v).direct,want);
  }
 });
 test('Regidrago V SIT Dragon Laser 130 Active and one Bench 30, seat '+seat,()=>{
  const v=paidRegidrago(seat,'Regidrago V SIT');
  candidateVmax(v,200); // 120 HP remaining
  const bench=slot('Mimikyu GRI',[],[['Copycat',['Psychic','Colorless'],0]]);
  bench.hp=70;bench.damage=50;v.ownPublic.bench[0]=bench;
  assert.equal(policy.__test.apexHazard(v).direct,4);
  v.ownPublic.bench[0].damage=0;
  assert.equal(policy.__test.apexHazard(v).direct,3);
  v.ownPublic.active.damage=0;
  assert.equal(policy.__test.apexHazard(v).direct,0);
 });
 for(const donor of ['Salamence ex JTG','Koraidon ex TEF','Regidrago V SIT']){
  test('valid '+donor+' discard changes offered Get Lost root, seat '+seat,()=>{
   const v=paidRegidrago(seat,donor);
   assert.deepEqual(decision(root(seat,v)),{
    kind:'select-action',token:'attack-getlost'
   });
   assert.equal(decision(prompt(seat,v)).tokens.includes('card-0'),true);
  });
 }
 for(const phantom of ['Koraidon SSP','Koraidon ex ASC','Garchomp ex PAR']){
  test('non-Dragon '+phantom+' cannot create phantom Apex threat, seat '+seat,()=>{
   const v=paidRegidrago(seat,phantom);
   candidateVmax(v,200);
   assert.equal(policy.__test.apexHazard(v).direct,0);
   // Root has Girafarig (not VMAX) and only this fake donor.
   v.ownPublic.active=slot('Girafarig LOT',['Psychic Energy SVE'],
     [['Get Lost',['Colorless'],0]]);
   assert.deepEqual(decision(root(seat,v)),{
    kind:'select-action',token:'pass'
   });
  });
 }
}
