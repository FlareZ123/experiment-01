'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION}=require('../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const mon=(printing,options={})=>({printing,hp:options.hp??60,damage:0,energies:[],tools:[],abilitySuppressions:options.abilitySuppressions??[],printed:{stage:'BASIC',weakness:[],resistance:[]}});
const board=(active,bench=[])=>({active,bench,stadium:[],discard:[],prizeCount:3,publicTurnRestrictions:{itemPlayLocked:false}});
const request=(seat=0)=>({role:'opponent',seat,prompt:null,observation:{actorSeat:seat,globalTurn:2,ownHand:[],ownPublic:board(mon('Budew ASC 16')),opponentPublic:board(mon('Regidrago V SIT 135'))},actionFrontier:{items:[{kind:'attack',token:'itch',attackName:'Itchy Pollen'}]}});
const decide=r=>createPolicy({role:'opponent',seat:r.seat,policyVersion:POLICY_VERSION,config:{}}).decide(r);
for(const seat of [0,1])test('seat '+seat+': free early Budew Itchy Pollen locks opponent Items',()=>{
 const r=request(seat);assert.deepEqual(decide(r),{kind:'select-action',token:'itch'});
});
test('late-game Budew attack is not automatically preferred',()=>{const r=request();r.observation.globalTurn=13;assert.equal(decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION')});
test('AOR Item lock makes Budew denial redundant unless AOR suppressed',()=>{
 const r=request();r.observation.ownPublic.bench=[mon('Vileplume AOR 3')];
 assert.equal(decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
 r.observation.ownPublic.bench[0].abilitySuppressions=[{abilityName:'Irritating Pollen',suppressed:true}];
 assert.deepEqual(decide(r),{kind:'select-action',token:'itch'});
});
test('early Itchy Pollen refuses to pretend overlapping item lock has additive effect',()=>{
 const r=request();r.observation.opponentPublic.publicTurnRestrictions.itemPlayLocked=true;
 assert.equal(decide(r).reasonCode,'NO_SUPPORTED_ROOT_ACTION');
});
test('funded early bench setup is prioritized before Budew turn-ending attack',()=>{
 const r=request();r.observation.ownPublic.bench=[mon('Bunnelby PRC 121')];
 r.actionFrontier.items.push({kind:'play-card',token:'energy',actorPrinting:'Grass Energy BLW 105',targetPrinting:'Bunnelby PRC 121'});
 assert.deepEqual(decide(r),{kind:'select-action',token:'energy'});
});
