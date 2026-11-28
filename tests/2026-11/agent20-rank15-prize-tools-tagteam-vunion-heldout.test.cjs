'use strict';

// Three-Prize TAG TEAM-GX and V-UNION are paper Expanded, and Life Dew / Island
// Challenge Amulet reduce Prize liability. Tool-nullification can restore the
// normal yield; an opponent's visible Life Dew does not prevent damage.
const test=require('node:test');
const assert=require('node:assert/strict');
const {rootDecision,guzmaOpportunity,printedDamage}=require(
  '../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const MEGA='Mega Lopunny ex PFL 84', GRASS='Grass Energy BLW 105';
const BELT='Choice Belt PAL 176',DEW='Life Dew PLF 107';
const AMULET='Island Challenge Amulet CEC 194';
const LEGACY='Legacy Energy TWM 167';
const SHADOW='Shadow Rider Calyrex V CRE 74';
const TAG='Mewtwo & Mew-GX UNM 71';
const VUNION='Mewtwo V-UNION PR-SW SWSH159';
const GUZMA='Guzma BUS 115';
const JET='Jet Energy PAL 190';
const ELD='Eldegoss V RCL 19';
const card=(printing,tools=[],energies=[],extra={})=>({
  printing,tools,energies,hp:210,damage:0,
  printed:{stage:'BASIC'},...extra
});
function direct(seat,target,tools=[],energy=[],stadium=[],prizes=2){
  return {role:'opponent',seat,prompt:null,
    observation:{actorSeat:seat,globalTurn:8,ownHand:[ELD],
      ownPublic:{active:card(MEGA,[BELT],[GRASS],{
        hp:330,printed:{stage:'STAGE_1'}}),
        bench:[card('Oddish UNB 5')],prizeCount:prizes,stadium,
        discard:[GUZMA]},
      opponentPublic:{active:card(target,tools,energy,{
        hp:210,damage:60}),bench:[card('Pidgey FLF 75')],
        prizeCount:3,stadium:[]}
    },
    actionFrontier:{items:[
      {kind:'attack',token:'spiky',attackName:'Spiky Hopper'},
      {kind:'play-card',token:'eldegoss',actorPrinting:ELD}
    ]}
  };
}
for(const seat of [0,1]){
  for(const [name,target,tools,energy,stadium,prizes,expected] of [
    ['plain V yields two Prizes',SHADOW,[],[],[],2,'spiky'],
    ['live Life Dew reduces V to one Prize',SHADOW,[DEW],[],[],2,'eldegoss'],
    ['Jamming Tower shuts off Life Dew',SHADOW,[DEW],[],
      ['Jamming Tower TWM 153'],2,'spiky'],
    ['one remaining Prize still wins through Life Dew',SHADOW,[DEW],[],[],1,'spiky'],
    ['TAG TEAM-GX inherently yields three',TAG,[],[],[],3,'spiky'],
    ['Island Amulet reduces TAG TEAM-GX to two',TAG,[AMULET],[],[],3,'eldegoss'],
    ['V-UNION inherently yields three',VUNION,[],[],[],3,'spiky'],
    ['Life Dew and Legacy are conservative together',SHADOW,[DEW],[LEGACY],[],2,'eldegoss'],
    ['single-Prize Pidgey with live Life Dew gives zero', 'Pidgey FLF 75',
      [DEW],[],[],1,'eldegoss']
  ]){
    test('seat '+seat+': '+name,()=>{
      assert.deepEqual(rootDecision(direct(
        seat,target,tools,energy,stadium,prizes
      )),{kind:'select-action',token:expected});
    });
  }
  test('seat '+seat+': Spiky damage can still be certified through Life Dew',()=>{
    const r=direct(seat,SHADOW,[DEW]);
    assert.equal(printedDamage(r.actionFrontier.items[0],r),190);
  });
  for(const [hasDew,stadium,terminal] of [
    [false,[],true],[true,[],false],
    [true,['Jamming Tower TWM 153'],true]
  ]){
    test('seat '+seat+': Guzma into Life Dew Tool '+hasDew+' Jamming '+!!stadium.length,()=>{
      const source=direct(seat,SHADOW,hasDew?[DEW]:[],[],stadium);
      const opp=source.observation.opponentPublic;
      opp.bench=[opp.active];
      opp.active=card('Pidgey FLF 75');
      const own=source.observation.ownPublic;
      own.active=card('Vileplume BUS 6',[],[],{printed:{stage:'STAGE_2'}});
      own.bench=[card(MEGA,[],[GRASS],{printed:{stage:'STAGE_1'}})];
      own.prizeCount=2;
      own.ownTurnResources={supporterPlayedTurn:7};
      source.observation.ownTurnResources={supporterPlayedTurn:7};
      source.observation.ownHand=[GUZMA,ELD];
      assert.equal(!!guzmaOpportunity(source.observation),terminal);
    });
  }
}
