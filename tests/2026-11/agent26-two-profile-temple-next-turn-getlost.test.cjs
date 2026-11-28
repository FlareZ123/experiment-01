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

for(const seat of [0,1]){
 test('Benched funded Regidrago V may evolve next turn; no funding-cut premium, seat '+seat,()=>{
  const v=view(seat);
  v.opponentPublic.bench[0]=slot('Regidrago V SIT',
    ['Grass Energy SVE','Grass Energy SVE','Fire Energy SVE'],
    [['Dragon Laser',['Grass','Grass','Fire'],130]],['Dragon'],['Basic','V']);
  assert.deepEqual(decision(prompt(seat,v)),
   {kind:'select-choices',tokens:['card-0','card-1']});
 });
}

for(const seat of [0,1]){
 test('Salamence ex JTG Dragon Impact uses printed 300 into VMAX, seat '+seat,()=>{
  const v=view(seat);
  v.ownPublic.stadium=[];
  v.ownPublic.active=slot('Shadow Rider Calyrex VMAX CRE',
   ['Psychic Energy SVE'],[['Max Geist',['Colorless','Colorless','Colorless'],10]],
   ['Psychic'],['VMAX','V']);
  v.ownPublic.active.hp=320;
  v.ownPublic.active.damage=50; // 270 remaining, Dragon Impact printed 300.
  v.opponentPublic.active.energies=[
   'Grass Energy SVE','Grass Energy SVE','Fire Energy SVE'];
  v.opponentPublic.discard=['Salamence ex JTG'];
  const result=policy.__test.apexHazard(v);
  assert.equal(result.known,true);
  assert.equal(result.direct,3); // One 3-Prize VMAX, no special KOs.
  v.opponentPublic.discard=[];
  assert.equal(policy.__test.apexHazard(v).direct,0);
 });
 test('Salamence ex JTG Wide Blast 50 applies to every wounded Bench, seat '+seat,()=>{
  const v=view(seat);
  v.ownPublic.stadium=[];
  v.ownPublic.active=slot('Shadow Rider Calyrex VMAX CRE',
   ['Psychic Energy SVE'],[['Max Geist',['Colorless','Colorless','Colorless'],10]],
   ['Psychic'],['VMAX','V']);
  v.ownPublic.active.hp=320;v.ownPublic.active.damage=0;
  for(let i=0;i<2;i++){
   const p=slot('Mimikyu GRI',[],[['Copycat',['Psychic','Colorless'],0]]);
   p.hp=70;p.damage=30; // 40 remaining, each KO by 50 bench damage.
   v.ownPublic.bench[i]=p;
  }
  v.opponentPublic.active.energies=[
   'Grass Energy SVE','Grass Energy SVE','Fire Energy SVE'];
  v.opponentPublic.discard=['Salamence ex JTG'];
  const result=policy.__test.apexHazard(v);
  assert.equal(result.known,true);
  assert.equal(result.direct,2); // Exactly two single-Prize Benched KOs.
  // A full-health 70HP Mimikyu survives Wide Blast's 50.
  v.ownPublic.bench[1].damage=0;
  assert.equal(policy.__test.apexHazard(v).direct,1);
 });
 test('Salamence ex absent from discard gives no imagined donor, seat '+seat,()=>{
  const v=view(seat);
  v.ownPublic.stadium=[];
  v.opponentPublic.active.energies=[
   'Grass Energy SVE','Grass Energy SVE','Fire Energy SVE'];
  v.opponentPublic.discard=[];
  v.opponentPublic.lostZone=['Salamence ex JTG'];
  const result=policy.__test.apexHazard(v);
  assert.equal(result.known,true);
  assert.equal(result.direct,0);
 });
}

for(const seat of [0,1]){
 test('Dragon Koraidon ex TEF Kaiser Tackle 280 threatens wounded VMAX, seat '+seat,()=>{
  const v=view(seat);
  v.ownPublic.stadium=[];
  const own=slot('Shadow Rider Calyrex VMAX CRE', ['Psychic Energy SVE'],
   [['Max Geist',['Colorless','Colorless','Colorless'],10]],['Psychic'],['VMAX','V']);
  own.hp=320;own.damage=70; // 250 remaining, 280 Kaiser Tackle KO.
  v.ownPublic.active=own;
  v.opponentPublic.active.energies=[
   'Grass Energy SVE','Grass Energy SVE','Fire Energy SVE'];
  v.opponentPublic.discard=['Koraidon ex TEF'];
  assert.equal(policy.__test.apexHazard(v).direct,3);
 });
 test('Fighting Koraidon SSP is not an Apex Dragon donor, seat '+seat,()=>{
  const v=view(seat);
  v.ownPublic.stadium=[];
  const own=slot('Shadow Rider Calyrex VMAX CRE', ['Psychic Energy SVE'],
   [['Max Geist',['Colorless','Colorless','Colorless'],10]],['Psychic'],['VMAX','V']);
  own.hp=320;own.damage=70;
  v.ownPublic.active=own;
  v.opponentPublic.active.energies=[
   'Grass Energy SVE','Grass Energy SVE','Fire Energy SVE'];
  v.opponentPublic.discard=['Koraidon SSP'];
  assert.equal(policy.__test.apexHazard(v).direct,0);
 });
}

for(const seat of [0,1]){
 for(const donor of ['Koraidon ex TEF','Salamence ex JTG']){
  test('source-backed donor triggers actual Get Lost root: '+donor+', seat '+seat,()=>{
   const v=view(seat);
   v.ownPublic.stadium=[];v.opponentPublic.active.energies=[
    'Grass Energy SVE','Grass Energy SVE','Fire Energy SVE'];
   v.opponentPublic.discard=[donor,'Battle VIP Pass FST','Psychic Energy SVE'];
   assert.deepEqual(decision(root(seat,v)),
    {kind:'select-action',token:'attack-getlost'});
   const selected=decision(prompt(seat,v));
   assert.equal(selected.kind,'select-choices');
   assert.equal(selected.tokens.includes('card-0'),true);
  });
 }
 test('Fighting Koraidon SSP cannot trigger phantom Apex donor root, seat '+seat,()=>{
  const v=view(seat);
  v.ownPublic.stadium=[];v.opponentPublic.active.energies=[
   'Grass Energy SVE','Grass Energy SVE','Fire Energy SVE'];
  v.opponentPublic.discard=[
   'Koraidon SSP','Battle VIP Pass FST','Psychic Energy SVE'];
  assert.deepEqual(decision(root(seat,v)),
   {kind:'select-action',token:'pass'});
 });
}

for(const seat of [0,1]){
 test('Regidrago V SIT Dragon Laser 130 Active plus one Bench 30, seat '+seat,()=>{
  const v=view(seat);v.ownPublic.stadium=[];
  const own=slot('Shadow Rider Calyrex VMAX CRE',
   ['Psychic Energy SVE'],[['Max Geist',['Colorless','Colorless','Colorless'],10]],
   ['Psychic'],['VMAX','V']);
  own.hp=320;own.damage=200; // 120 remaining, KO by 130 Dragon Laser.
  v.ownPublic.active=own;
  const bench=slot('Mimikyu GRI',[],[['Copycat',['Psychic','Colorless'],0]]);
  bench.hp=70;bench.damage=50; // 20 remaining, KO by 30 Bench.
  v.ownPublic.bench[0]=bench;
  v.opponentPublic.active.energies=[
   'Grass Energy SVE','Grass Energy SVE','Fire Energy SVE'];
  v.opponentPublic.discard=['Regidrago V SIT'];
  assert.equal(policy.__test.apexHazard(v).direct,4);
  v.ownPublic.bench[0].damage=0;
  assert.equal(policy.__test.apexHazard(v).direct,3);
  v.ownPublic.active.damage=0;
  assert.equal(policy.__test.apexHazard(v).direct,0);
 });
 test('single Regidrago V Dragon Laser donor triggers actual root, seat '+seat,()=>{
  const v=view(seat);v.ownPublic.stadium=[];
  v.opponentPublic.active.energies=[
   'Grass Energy SVE','Grass Energy SVE','Fire Energy SVE'];
  v.opponentPublic.discard=[
   'Regidrago V SIT','Battle VIP Pass FST','Psychic Energy SVE'];
  assert.deepEqual(decision(root(seat,v)),
   {kind:'select-action',token:'attack-getlost'});
  assert.equal(decision(prompt(seat,v)).tokens.includes('card-0'),true);
 });
}

for(const seat of [0,1]){
 test('one Grass plus two DDE remains Temple-unpaid but Megaton recovery-pays, seat '+seat,()=>{
  const v=view(seat);
  v.opponentPublic.active.energies=[
   'Grass Energy SVE','Double Dragon Energy ROS','Double Dragon Energy ROS'];
  assert.deepEqual(decision(prompt(seat,v)),
   {kind:'select-choices',tokens:['card-2','card-3']});
 });
 test('one Grass plus three DDE still needs colored rescue under Temple, seat '+seat,()=>{
  const v=view(seat);
  v.opponentPublic.active.energies=[
   'Grass Energy SVE','Double Dragon Energy ROS',
   'Double Dragon Energy ROS','Double Dragon Energy ROS'];
  assert.deepEqual(decision(prompt(seat,v)),
   {kind:'select-choices',tokens:['card-2','card-3']});
 });
 test('Grass plus Fire plus DDE has different future attachment cutoff, seat '+seat,()=>{
  const v=view(seat);
  v.opponentPublic.active.energies=[
   'Grass Energy SVE','Fire Energy SVE','Double Dragon Energy ROS'];
  assert.deepEqual(decision(prompt(seat,v)),
   {kind:'select-choices',tokens:['card-0','card-1']});
 });
}

for(const seat of [0,1]){
 test('rank32-like third Dragon donor leaves two distinct funding cuts, seat '+seat,()=>{
  const v=view(seat);
  v.opponentPublic.discard=[
   'Dialga-GX UPR','Kyurem SFA','Megaton Blower SSP',
   'Crispin SCR','Mega Dragonite ex ASC'];
  assert.deepEqual(decision(root(seat,v)),
   {kind:'select-action',token:'attack-getlost'});
  assert.deepEqual(decision(prompt(seat,v)),
   {kind:'select-choices',tokens:['card-2','card-3']});
 });
}

for(const seat of [0,1]){
 test("Fighting Koraidon ex ASC must not inherit TEF's Dragon donor score, seat "+seat,()=>{
  const v=view(seat);
  v.ownPublic.stadium=[];
  v.opponentPublic.active.energies=[
   'Grass Energy SVE','Grass Energy SVE','Fire Energy SVE'];
  v.opponentPublic.discard=[
   'Koraidon ex ASC','Battle VIP Pass FST','Psychic Energy SVE'];
  assert.deepEqual(decision(root(seat,v)),
   {kind:'select-action',token:'pass'});
 });
}
