'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const MYST='Mysterious Treasure FLI 113',
  QUICK='Quick Ball FST 237',ULTRA='Ultra Ball SVI 196',
  PSYCHIC='Psychic Energy MEE 13',MIM='Mimikyu GRI 58',
  V='Shadow Rider Calyrex V CRE 74',DIALGA='Dialga-GX UPR 100';
const mon=printing=>({
  name:printing.split(' ')[0],printing,hp:210,damage:0,
  printed:{stage:'BASIC',types:['Psychic'],subtypes:['Basic'],
    weakness:[],resistance:[],retreatCost:[]},
  energies:[],tools:[],abilities:[],abilitySuppressions:[],attacks:[]
});
const side=(active,bench=[])=>({
  active,bench,stadium:[],discard:[],lostZone:[],resolvingSupporter:[],
  deckCount:30,handCount:2,
  publicTurnRestrictions:{gxUsed:false,vstarUsed:false,
    stadiumAndToolHaveNoEffectTurnsRemaining:0}
});
function input(seat,item,rest,withV=false){
 const hand=[item,...rest];
 const own=side(mon('Latias ex SSP 76'),withV?[mon(V)]:[]);
 own.handCount=hand.length;
 return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
   observation:{actorSeat:seat,decisionKind:'owner-root',
     ownHand:hand,ownPublic:own,
     opponentPublic:side(mon('Regidrago VSTAR SIT 136')),
     ownTurnResources:{supporterPlayedTurn:0}},
   actionFrontier:{items:[
     {token:'ball',kind:'play-card',actorPrinting:item,
       publicMetadata:{cardType:'item'}},
     {token:'pass',kind:'pass'}
   ]}};
}
function check(req,token) {
 const got=policy.createPolicy({role:'candidate',seat:req.seat,
   policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(req);
 assert.deepEqual(got.decision,{kind:'select-action',token});
 protocol.validateDecision(got.decision,null,
   new Set(req.actionFrontier.items.map(item=>item.token)));
 protocol.validatePolicyAudit(got.policyAudit,req,got.decision,
   policy.POLICY_VERSION);
}
for (const seat of [0,1]){
 test('Mysterious Treasure cannot discard itself '+seat,()=>check(
   input(seat,MYST,[]),'pass'));
 test('Mysterious Treasure can pay with a Psychic '+seat,()=>check(
   input(seat,MYST,[PSYCHIC]),'ball'));
 test('Mysterious Treasure cannot burn protected singleton Mimikyu '+seat,
   ()=>check(input(seat,MYST,[MIM]),'pass'));
 test('Mysterious Treasure can discard second copy '+seat,()=>check(
   input(seat,MYST,[MYST]),'ball'));
 test('Quick Ball cannot discard itself '+seat,()=>check(
   input(seat,QUICK,[]),'pass'));
 test('Quick Ball can discard a Psychic '+seat,()=>check(
   input(seat,QUICK,[PSYCHIC]),'ball'));
 test('Ultra Ball cannot pay two with one Psychic and itself '+seat,
   ()=>check(input(seat,ULTRA,[PSYCHIC],true),'pass'));
 test('Ultra Ball can pay two with two Psychic '+seat,()=>check(
   input(seat,ULTRA,[PSYCHIC,PSYCHIC],true),'ball'));
 test('Ultra Ball protects essential Mimikyu despite one Psychic '+seat,
   ()=>check(input(seat,ULTRA,[PSYCHIC,MIM],true),'pass'));
 test('Ultra Ball protects both Dragon and Mimikyu donor pieces '+seat,
   ()=>check(input(seat,ULTRA,[MIM,DIALGA],true),'pass'));
}
