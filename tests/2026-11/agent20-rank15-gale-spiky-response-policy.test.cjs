'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION,printedDamage}=
  require('../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const pokemon=(printing,options={})=>({printing,hp:options.hp??330,damage:options.damage??0,
  energies:options.energies??[],tools:options.tools??[],
  printed:{stage:options.stage??'BASIC',weakness:[],resistance:[]}});
function req(){return {role:'opponent',seat:0,prompt:null,
 observation:{actorSeat:0,globalTurn:6,ownHand:[],
  ownPublic:{active:pokemon('Mega Lopunny ex PFL 84',
    {damage:120,energies:['Double Colorless Energy SUM 136']}),bench:[],prizeCount:3},
  opponentPublic:{active:pokemon('Regidrago VSTAR SIT 136',{hp:280,stage:'VSTAR'}),
    bench:[],prizeCount:3}},
 publicEventReceipt:{actorSeat:0,turn:6,
  ownerActive:{printing:'Mega Lopunny ex PFL 84',movedFromBenchToActiveThisTurn:true}},
 actionFrontier:{items:[{kind:'attack',token:'gale',attackName:'Gale Thrust'},
                        {kind:'attack',token:'spiky',attackName:'Spiky Hopper'}]}}}
const decide=r=>createPolicy({role:'opponent',seat:0,policyVersion:POLICY_VERSION,config:{}}).decide(r);
test('moved Lopunny uses 230 Gale against 280HP rather than arbitrary 160 Spiky',()=>{
 const r=req();assert.equal(printedDamage(r.actionFrontier.items[0],r),230);
 assert.deepEqual(decide(r),{kind:'select-action',token:'gale'});
});
test('Gale 230 KO beats non-KO Spiky on 190HP Active',()=>{
 const r=req();r.observation.opponentPublic.active.hp=190;
 assert.deepEqual(decide(r),{kind:'select-action',token:'gale'});
});
test('stationary Lopunny uses Spiky 160 instead of Gale 60',()=>{
 const r=req();r.publicEventReceipt.ownerActive.movedFromBenchToActiveThisTurn=false;
 assert.deepEqual(decide(r),{kind:'select-action',token:'spiky'});
});
test('funded opposing Copycat Mimikyu makes a 230 Gale revenge KO unsafe',()=>{
 const r=req();r.observation.opponentPublic.bench=[
  pokemon('Mimikyu GRI 58',{hp:70,
   energies:['Psychic Energy MEE 13','Psychic Energy MEE 13']})];
 assert.deepEqual(decide(r),{kind:'select-action',token:'spiky'});
});
test('defensive Tool leaves Gale unproved but Spiky ignores effects',()=>{
 const r=req();r.observation.opponentPublic.active.tools=['Stealthy Hood UNB 186'];
 assert.equal(printedDamage(r.actionFrontier.items[0],r),null);
 assert.equal(printedDamage(r.actionFrontier.items[1],r),160);
 assert.deepEqual(decide(r),{kind:'select-action',token:'spiky'});
});
test('no movement certificate does not invent 230 Gale damage',()=>{
 const r=req();r.publicEventReceipt=null;
 assert.equal(printedDamage(r.actionFrontier.items[0],r),null);
 assert.deepEqual(decide(r),{kind:'select-action',token:'spiky'});
});
