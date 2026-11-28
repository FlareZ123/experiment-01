'use strict';

// Original rank15 Jet Energy PAL190 switches the attached Benched Pokémon to
// Active. A powered already-evolved Mega then gets moved Gale Thrust 230;
// Temple of Sinnoh removes only Jet's switch effect.
const test=require('node:test');
const assert=require('node:assert/strict');
const {rootDecision}=require(
  '../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const MEGA='Mega Lopunny ex PFL 84',BUS='Vileplume BUS 6';
const JET='Jet Energy PAL 190',E='Grass Energy BLW 105';
const ELD='Eldegoss V RCL 19',GUZMA='Guzma BUS 115';
const SHADOW='Shadow Rider Calyrex V CRE 74';
const card=(printing,tools=[],energies=[],extra={})=>({
  printing,tools,energies,hp:330,damage:0,printed:{stage:'BASIC'},...extra
});
const jetTo=i=>({kind:'play-card',token:'jet-'+i,actorPrinting:JET,
  targetPrinting:MEGA,publicMetadata:{
    targetSeat:'actor',targetZone:'bench',targetIndex:i,benchIndex:i
  }});
const retreatTo=i=>({kind:'retreat',token:'retreat-'+i,
  targetPrinting:MEGA,publicMetadata:{
    targetSeat:'actor',targetZone:'bench',targetIndex:i,benchIndex:i
  }});
const eldegoss={kind:'play-card',token:'eldegoss',actorPrinting:ELD};
function request(seat,options={}){
  const active=options.active??card(BUS,[],[],{printed:{stage:'STAGE_2'}});
  const bench=options.bench??[
    card(MEGA,[],[E],{printed:{stage:'STAGE_1'},publicRestrictions:options.restrictions??{}})
  ];
  return {
    role:'opponent',seat,prompt:null,
    observation:{actorSeat:seat,globalTurn:8,
      ownTurnResources:{supporterPlayedTurn:7},ownHand:[JET,ELD],
      ownPublic:{active,bench,discard:[GUZMA],prizeCount:options.prizes??2,
        stadium:options.stadium??[]},
      opponentPublic:{active:card(SHADOW,options.oppTools??[],[],{
        hp:210,damage:30
      }),bench:[],prizeCount:2,stadium:[]}
    },
    publicEventReceipt:{actorSeat:seat,turn:8,ownerActive:{
      printing:active.printing,movedFromBenchToActiveThisTurn:false
    }},
    actionFrontier:{items:options.items??[eldegoss,jetTo(0)]}
  };
}
for(const seat of [0,1]){
  for(const [name,options,expected] of [
    ['BUS lock sacrificed to win on legal Jet',{items:[eldegoss,jetTo(0)]},'jet-0'],
    ['paid Retreat before consuming same-win Jet',
      {items:[eldegoss,jetTo(0),retreatTo(0)]},'retreat-0'],
    ['Fan Rotom Active, free Jet promotion to Mega',
      {active:card('Fan Rotom SCR 118')},'jet-0'],
    ['stationary Mega Active, Jet moves the other Mega',
      {active:card(MEGA,[],[E])},'jet-0'],
    ['Temple disables Jet switch, keep supporting Eldegoss',
      {stadium:['Temple of Sinnoh ASR 155']},'eldegoss'],
    ['blocked Mega cannot take immediate attack after Jet',
      {restrictions:{cannotUseAttacksNextTurn:['Gale Thrust']}},'eldegoss'],
    ['defender Tool causes unknown KO damage',
      {oppTools:['Stealthy Hood UNB 186']},'eldegoss'],
    ['three remaining Prizes means it is not terminal',
      {prizes:3},'eldegoss'],
    ['Jet offered to wrong same-print target, powered Mega elsewhere',
      {bench:[
        card(MEGA,[],[],{printed:{stage:'STAGE_1'}}),
        card(MEGA,[],[E],{printed:{stage:'STAGE_1'}})
      ],items:[eldegoss,jetTo(0)]},'eldegoss']
  ]){
    test('seat '+seat+': '+name,()=>{
      const r=rootDecision(request(seat,options));
      assert.deepEqual(r,{kind:'select-action',token:expected});
    });
  }
}
