'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION,peakLockOpportunity,silentLabOpportunity}=
 require('../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const decision=r=>createPolicy({role:'opponent',seat:r.seat,policyVersion:POLICY_VERSION,config:{}}).decide(r);
const pokemon=(printing,options={})=>({printing,hp:options.hp??130,damage:0,
 energies:[],tools:[],abilitySuppressions:[],
 printed:{stage:options.stage??'BASIC',weakness:[],resistance:[]}});
const pl=(active,bench=[],options={})=>({active,bench,stadium:options.stadium??[],
 discard:options.discard??[],prizeCount:3,
 publicTurnRestrictions:{vstarUsed:options.vstarUsed??false}});
function source(opp,seat=0){
 return {role:'opponent',seat,prompt:null,
 observation:{actorSeat:seat,globalTurn:5,ownHand:[],
 ownPublic:pl(pokemon('Bunnelby PRC 121',{hp:60})),
 opponentPublic:opp,ownTurnResources:{supporterPlayedTurn:0}},
 actionFrontier:{items:[
 {kind:'play-card',token:'peak',actorPrinting:'Path to the Peak CRE 148'},
 {kind:'play-card',token:'lab',actorPrinting:'Silent Lab PRC 140'}]}};
}
for(const seat of [0,1]){
 test('seat '+seat+': Path suppresses unused Regidrago VSTAR Legacy Star without disabling our engine',()=>{
  const r=source(pl(pokemon('Regidrago VSTAR SIT 136',{stage:'VSTAR'}),[],{vstarUsed:false}),seat);
  assert.equal(peakLockOpportunity(r.observation),true);
  assert.deepEqual(decision(r),{kind:'select-action',token:'peak'});
  r.observation.opponentPublic.publicTurnRestrictions.vstarUsed=true;
  assert.equal(peakLockOpportunity(r.observation),false);
  assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
 });
}
test('Path refused if it would disable own Pidgeot ex Quick Search',()=>{
 const r=source(pl(pokemon('Regidrago VSTAR SIT 136',{stage:'VSTAR'}),[],{vstarUsed:false}));
 r.observation.ownPublic.bench=[pokemon('Pidgeot ex OBF 164',{stage:'STAGE2'})];
 assert.equal(peakLockOpportunity(r.observation),false);
 assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
});
test('Path refuses when Eldegoss Happy Match needed for discarded Supporter',()=>{
 const r=source(pl(pokemon('Regidrago VSTAR SIT 136',{stage:'VSTAR'})));
 r.observation.ownHand=['Eldegoss V RCL 19'];r.observation.ownPublic.discard=['Karen XYP 177'];
 assert.equal(peakLockOpportunity(r.observation),false);
 assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
});
test('Path locks multiple Shadow Rider VMAX abilities without own Pidgeot',()=>{
 const r=source(pl(pokemon('Shadow Rider Calyrex VMAX CRE 75',{stage:'VMAX'}),
 [pokemon('Shadow Rider Calyrex VMAX CRE 75',{stage:'VMAX'})],{vstarUsed:true}));
 assert.equal(peakLockOpportunity(r.observation),true);assert.equal(decision(r).token,'peak');
});
test('Silent Lab suppresses Active Iron Thorns ex Initialization and frees own Pidgeot ex',()=>{
 const r=source(pl(pokemon('Iron Thorns ex TWM 77')));
 r.observation.ownPublic.bench=[pokemon('Pidgeot ex OBF 164',{stage:'STAGE2'})];
 assert.equal(silentLabOpportunity(r.observation),true);assert.equal(decision(r).token,'lab');
});
test('Silent Lab replaces self-locking Path when VSTAR Power not imminent',()=>{
 const r=source(pl(pokemon('Mimikyu GRI 58'),[],{vstarUsed:true}));
 r.observation.ownPublic.bench=[pokemon('Pidgeot ex OBF 164',{stage:'STAGE2'})];
 r.observation.ownPublic.stadium=['Path to the Peak CRE 148'];
 assert.equal(silentLabOpportunity(r.observation),true);assert.equal(decision(r).token,'lab');
});
test('Silent Lab disrupts two visible Basic ability engines, not one Comfey',()=>{
 const r=source(pl(pokemon('Comfey LOR 79'),[pokemon('Radiant Greninja ASR 46')]));
 assert.equal(silentLabOpportunity(r.observation),true);assert.equal(decision(r).token,'lab');
 r.observation.opponentPublic.bench=[];
 assert.equal(silentLabOpportunity(r.observation),false);
 assert.equal(decision(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
});
