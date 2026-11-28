'use strict';
// Aichi original rank32 Regidrago VSTAR deck contains Stealthy Hood UNB186.
// Opponent-facing Fairy Zone is an Ability effect on a Dragon; Hood protects.
// Source-level attacker ordering and printed-Weakness distinction; no Store.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const E='Psychic Energy MEE 13';
const D="Lillie's Determination MEG 119";
function mon(printing,opts={}){
 const {hp=200,damage=0,types=['Psychic'],subtypes=['Basic'],
   energies=[],tools=[],abilities=[],abilitySuppressions=[],
   attacks=[],weakness=[]}=opts;
 return {name:printing,printing,hp,damage,
  printed:{stage:subtypes.includes('VMAX')?'VMAX':'Basic',
    types,subtypes,weakness,resistance:[],retreatCost:[]},
  tools,abilities,abilitySuppressions,attacks,energies};
}
const pp=(a,bench,prizes)=>({active:a,bench,prizeCount:prizes,
 deckCount:15,handCount:1,stadium:[],discard:[],lostZone:[],
 resolvingSupporter:[],publicTurnRestrictions:{gxUsed:false,
 stadiumAndToolHaveNoEffectTurnsRemaining:0}});
function make(seat,opts={}){
 const {hood=false,fairy=true,suppressed=false,actualWeakness=false,
   targetDamage=170,prizes=2}=opts;
 const vmax=mon('Shadow Rider Calyrex VMAX CRE 75',{
   hp:320,subtypes:['VMAX','V'],energies:[E,E,E],
   attacks:[{name:'Max Geist',cost:['Colorless','Colorless','Colorless'],
     damage:'10+'}]});
 const clefairy=mon("Lillie's Clefairy ex JTG 56",{
   hp:190,subtypes:['Basic','ex'],
   abilities:fairy?['Fairy Zone']:[],
   abilitySuppressions:fairy?
     [{abilityName:'Fairy Zone',suppressed}]:[]});
 const target=mon('Regidrago VSTAR SIT 136',{
   hp:280,damage:targetDamage,types:['Dragon'],
   subtypes:['VSTAR','V'],tools:hood?['Stealthy Hood UNB 186']:[],
   weakness:actualWeakness?[{type:'Psychic',value:'×2'}]:[]});
 const mate=mon('Mimikyu GRI 58',{hp:60});
 return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
  observation:{actorSeat:seat,decisionKind:'owner-root',globalTurn:6,
   ownHand:[D],ownTurnResources:{supporterPlayedTurn:0},
   ownPublic:pp(vmax,[clefairy],prizes),
   opponentPublic:pp(target,[mate],6)},
  actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[
   {kind:'play-card',token:'draw',actorPrinting:D,
      publicMetadata:{cardType:'supporter'}},
   {kind:'attack',token:'geist',attackName:'Max Geist'},
   {kind:'pass',token:'pass'}
  ]}};
}
function pick(r){
 return policy.createPolicy({role:'candidate',seat:r.seat,
  policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(r);
}
for(const seat of [0,1]){
 for(const [label,opts,want] of [
   ['live Fairy Zone with no Hood gives 200 vs 110 remaining',
     {},'geist'],
   ['rank32 effective Stealthy Hood blocks Ability weakness; 100 vs110',
     {hood:true},'draw'],
   ['non-Hood card on target does not veto genuine Fairy Zone',
     {hood:false},'geist'],
   ['Hood cannot erase already printed Psychic Weakness',
     {hood:true,actualWeakness:true},'geist'],
   ['Fairy Zone already suppressed: no double with Hood',
     {hood:true,suppressed:true},'draw'],
   ['Fairy Zone absent: no double without Hood',
     {hood:false,fairy:false},'draw'],
   ['even without Hood the 200 attack may still be nonfinal by prizes',
     {hood:false,prizes:3},'draw'],
   ['200 nonlethal despite Fairy Zone; neither branch ends game',
     {hood:false,targetDamage:50},'draw'],
   ['natural two-times Psychic Weakness remains even with Fairy suppressed',
     {hood:true,actualWeakness:true,suppressed:true},'geist']
 ]){
   test(label+' seat '+seat,()=>{
     const r=make(seat,opts);
     const x=pick(r);
     assert.deepEqual(x.decision,{kind:'select-action',token:want});
     assert.deepEqual(x.policyAudit.selectedTokens,[want]);
   });
 }
}
