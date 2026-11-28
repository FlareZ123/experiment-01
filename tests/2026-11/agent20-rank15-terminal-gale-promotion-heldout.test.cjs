'use strict';

// Rank1 Shadow Rider V conditional terminal paid-retreat decision.
// No prospective game, no hidden state, not a native Store replay.
const test=require('node:test');
const assert=require('node:assert/strict');
const {rootDecision}=require(
  '../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const MEGA='Mega Lopunny ex PFL 84', E='Grass Energy BLW 105';
const card=(printing,energies=[],extra={})=>({
  printing,tools:[],energies,hp:330,damage:0,printed:{stage:'STAGE_1'},...extra
});
function request(seat,{prizes=2,moved=false,opTools=[],benchPowered=true}={}) {
  return {
    role:'opponent',seat,prompt:null,
    observation:{
      actorSeat:seat,globalTurn:8,ownHand:[],
      ownPublic:{active:card(MEGA,[E]),
        bench:[card(MEGA,benchPowered?[E]:[])],
        prizeCount:prizes,stadium:[]},
      opponentPublic:{active:card('Shadow Rider Calyrex V CRE 74',[],{
          hp:210,damage:30,tools:opTools
        }),bench:[card('Pidgey FLF 75')],prizeCount:2,stadium:[]}
    },
    publicEventReceipt:{actorSeat:seat,turn:8,ownerActive:{
      printing:MEGA,movedFromBenchToActiveThisTurn:moved
    }},
    actionFrontier:{items:[
      {kind:'retreat',token:'promote-second',targetPrinting:MEGA,
        publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:0,benchIndex:0}},
      {kind:'attack',attackName:'Gale Thrust',token:'stationary-gale'}
    ]}
  };
}
for(const seat of [0,1]) {
  for(const [description,state,expected] of [
    ['terminal moved-Gale through Bench Mega',{prizes:2,moved:false},'promote-second'],
    ['nonterminal three remaining prizes',{prizes:3,moved:false},'stationary-gale'],
    ['untrusted movement history',{prizes:2,moved:null},'stationary-gale'],
    ['already moved current attacker',{prizes:2,moved:true},'stationary-gale'],
    ['defender Tool makes damage estimate uncertain',
      {prizes:2,moved:false,opTools:['Stealthy Hood UNB 186']},'stationary-gale'],
    ['Benched replacement has no attack Energy',
      {prizes:2,moved:false,benchPowered:false},'stationary-gale']
  ]) {
    test('seat '+seat+': '+description,()=>{
      const result=rootDecision(request(seat,state));
      assert.deepEqual(result,{kind:'select-action',token:expected});
    });
  }
}
