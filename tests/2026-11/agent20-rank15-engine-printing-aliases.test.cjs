'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {POLICY_VERSION,createPolicy,SOURCE_COUNTS,ENGINE_COUNTS,
 ENGINE_PRINTING_ALIASES,karenOpportunity,energyActionScore}=
require('../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const src=Object.fromEntries(SOURCE_COUNTS),dst=Object.fromEntries(ENGINE_COUNTS);
const p=(printing,energies=[])=>({printing,hp:130,damage:0,energies,tools:[],
 abilitySuppressions:[],printed:{stage:'BASIC',weakness:[],resistance:[]}});
function req(){return {role:'opponent',seat:1,prompt:null,observation:{
 actorSeat:1,globalTurn:8,ownHand:[],ownTurnResources:{supporterPlayedTurn:0},
 ownPublic:{active:p('Bunnelby PRC 121'),bench:[],stadium:[],discard:[],prizeCount:3},
 opponentPublic:{active:p('Regidrago VSTAR SIT 136'),bench:[],
 discard:['Dialga-GX UPR 100','Dragapult ex TWM 130'],prizeCount:3}},
 actionFrontier:{items:[]}}}
const decide=r=>createPolicy({role:'opponent',seat:1,policyVersion:POLICY_VERSION,config:{}}).decide(r);
test('source remains original 60; resolvable engine printing aliases exactly 60',()=>{
 assert.equal(SOURCE_COUNTS.reduce((a,v)=>a+v[1],0),60);
 assert.equal(ENGINE_COUNTS.reduce((a,v)=>a+v[1],0),60);
 assert.equal(SOURCE_COUNTS.length,35);assert.equal(ENGINE_COUNTS.length,35);
 assert.equal(src['Karen XYP 177'],2);assert.equal(src['Grass Energy MEE 9'],2);
 assert.equal(dst['Karen PR-XY XY177'],2);assert.equal(dst['Grass Energy BLW 105'],2);
 assert.equal(Object.keys(ENGINE_PRINTING_ALIASES).length,2);
});
test('actual PR-XY Karen promo can disrupt Regidrago discard payloads',()=>{
 const r=req();r.actionFrontier.items=[
 {kind:'play-card',actorPrinting:'Karen PR-XY XY177',token:'karen'}];
 assert.equal(karenOpportunity(r.observation),true);
 assert.deepEqual(decide(r),{kind:'select-action',token:'karen'});
});
test('legal BLW Basic Grass Energy pays Bunnelby TM attack',()=>{
 const r=req();r.observation.ownPublic.active.tools=['Technical Machine: Evolution PAR 178'];
 r.actionFrontier.items=[{kind:'play-card',actorPrinting:'Grass Energy BLW 105',
   targetPrinting:'Bunnelby PRC 121',token:'grass'}];
 assert.equal(energyActionScore(r.actionFrontier.items[0],r.observation),165);
 assert.deepEqual(decide(r),{kind:'select-action',token:'grass'});
});
