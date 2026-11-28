'use strict';

// Opponent Legacy Energy TWM167 reduces a damage-KO Prize pickup once per
// game. Without a certified public spent-history, assume the copy is live.
// It must prevent false last-Prize attack, Guzma and Jet decisions; Temple of
// Sinnoh suppresses Legacy's additional Prize-reduction effect.
const test=require('node:test');
const assert=require('node:assert/strict');
const {rootDecision,guzmaOpportunity}=require(
  '../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');

const V='Shadow Rider Calyrex V CRE 74';
const LEG='Legacy Energy TWM 167',TEMPLE='Temple of Sinnoh ASR 155';
const MEGA='Mega Lopunny ex PFL 84';
const GRASS='Grass Energy BLW 105';
const JET='Jet Energy PAL 190';
const GUZMA='Guzma BUS 115';
const BELT='Choice Belt PAL 176';
const ELD='Eldegoss V RCL 19';
const card=(printing,tools=[],energies=[],extra={})=>({
  printing,tools,energies,hp:210,damage:0,printed:{stage:'BASIC'},...extra
});
function base(seat,{legacy=false,temple=false,prizes=2}={}) {
  return {actorSeat:seat,globalTurn:9,ownHand:[ELD],
    ownTurnResources:{supporterPlayedTurn:8},
    ownPublic:{
      active:card('Vileplume BUS 6',[],[],{printed:{stage:'STAGE_2'}}),
      bench:[card(MEGA,[],[GRASS],{printed:{stage:'STAGE_1'}})],
      discard:[GUZMA],prizeCount:prizes,stadium:temple?[TEMPLE]:[]
    },
    opponentPublic:{
      active:card(V,[],legacy?[LEG]:[],{hp:210,damage:30}),
      bench:[card('Pidgey FLF 75')],prizeCount:3,stadium:[]
    }
  };
}
for(const seat of [0,1]){
  for(const [legacy,temple,expected] of [
    [false,false,'spiky'],[true,false,'eldegoss'],[true,true,'spiky']
  ]) {
    test('seat '+seat+': direct Spiky terminal legacy '+legacy+' Temple '+temple,()=>{
      const o=base(seat,{legacy,temple});
      o.ownPublic.active=card(MEGA,[BELT],[GRASS],{
        hp:330,printed:{stage:'STAGE_1'}
      });
      o.ownPublic.bench=[card('Oddish UNB 5')];
      const r=rootDecision({role:'opponent',seat,observation:o,prompt:null,
        actionFrontier:{items:[
          {kind:'attack',token:'spiky',attackName:'Spiky Hopper'},
          {kind:'play-card',token:'eldegoss',actorPrinting:ELD}
        ]}
      });
      assert.deepEqual(r,{kind:'select-action',token:expected});
    });
  }
  for(const [legacy,prizes,expected] of [
    [false,2,'jet'],[true,2,'eldegoss'],[false,3,'eldegoss'],[true,3,'eldegoss']
  ]) {
    test('seat '+seat+': BUS-lock Jet terminal legacy '+legacy+' prizes '+prizes,()=>{
      const o=base(seat,{legacy,prizes});
      const r=rootDecision({role:'opponent',seat,prompt:null,observation:o,
        publicEventReceipt:{actorSeat:seat,turn:9,ownerActive:{
          printing:'Vileplume BUS 6',movedFromBenchToActiveThisTurn:false}},
        actionFrontier:{items:[
          {kind:'play-card',token:'jet',actorPrinting:JET,
            targetPrinting:MEGA,publicMetadata:{
              targetSeat:'actor',targetZone:'bench',targetIndex:0,benchIndex:0
            }},
          {kind:'play-card',token:'eldegoss',actorPrinting:ELD}
        ]}
      });
      assert.deepEqual(r,{kind:'select-action',token:expected});
    });
  }
  for(const [legacy,temple,terminal] of [
    [false,false,true],[true,false,false],[true,true,true]
  ]) {
    test('seat '+seat+': BUS-lock Guzma terminal Legacy '+legacy+' Temple '+temple,()=>{
      const o=base(seat,{legacy,temple});
      o.opponentPublic.bench=[o.opponentPublic.active];
      o.opponentPublic.active=card('Pidgey FLF 75');
      assert.equal(!!guzmaOpportunity(o),terminal);
      const r=rootDecision({role:'opponent',seat,observation:o,prompt:null,
        actionFrontier:{items:[
          {kind:'play-card',token:'guzma',actorPrinting:GUZMA},
          {kind:'play-card',token:'eldegoss',actorPrinting:ELD}
        ]}
      });
      assert.deepEqual(r,{kind:'select-action',token:terminal?'guzma':'eldegoss'});
    });
  }
}
