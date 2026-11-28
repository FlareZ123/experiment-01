'use strict';

// Original rank-15 Choice Belt is not a damage modifier while Jamming Tower
// is active. Both-seat actor-visible root regression; not a native game.
const test=require('node:test');
const assert=require('node:assert/strict');
const {rootDecision,printedDamage,hoodProtectionScore}=require(
  '../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const MEGA='Mega Lopunny ex PFL 84';
const BELT='Choice Belt PAL 176';
const JAM='Jamming Tower TWM 153';
const OP='Shadow Rider Calyrex V CRE 74';
const AOR='Vileplume AOR 3';
const HOOD='Stealthy Hood UNB 186';
const card=(printing,tools=[],energies=[],extra={})=>({
  printing,tools,energies,hp:320,damage:0,printed:{stage:'STAGE_1'},...extra
});
function root(seat,jamming,muted) {
  const own=card(MEGA,[BELT],['Grass Energy BLW 105','Jet Energy PAL 190']);
  const op=card(OP,[],[],{hp:210,damage:30});
  return {
    role:'opponent',seat,prompt:null,
    publicEventReceipt:{actorSeat:seat,turn:9,
      ownerActive:{printing:MEGA,movedFromBenchToActiveThisTurn:true}},
    observation:{actorSeat:seat,globalTurn:9,ownHand:[],
      ownPublic:{active:own,bench:[],prizeCount:2,stadium:jamming?[JAM]:[],
        ...(muted?{publicTurnRestrictions:{stadiumAndToolHaveNoEffectTurnsRemaining:1}}:{})},
      opponentPublic:{active:op,bench:[card('Oddish UNB 5')],prizeCount:2,stadium:[]}
    },
    actionFrontier:{items:[
      {kind:'attack',attackName:'Spiky Hopper',token:'spiky'},
      {kind:'attack',attackName:'Gale Thrust',token:'gale'}
    ]}
  };
}
for(const seat of [0,1]){
  for(const [jamming,muted,damage,winner] of [
    [false,false,190,'spiky'],
    [false,true,160,'gale'],
    [true,false,160,'gale'],
    [true,true,160,'gale']
  ]) {
    test('seat '+seat+' Jamming '+jamming+' muted '+muted+' damage and terminal',()=>{
      const r=root(seat,jamming,muted);
      assert.equal(printedDamage(r.actionFrontier.items[0],r),damage);
      assert.deepEqual(rootDecision(r),{kind:'select-action',token:winner});
    });
  }
  for(const [jamming,muted,score] of [
    [false,false,172],[false,true,0],[true,false,0],[true,true,0]
  ]) {
    test('seat '+seat+' Jamming '+jamming+' muted '+muted+' Hood utility',()=>{
      const aor=card(AOR,[],[],{abilitySuppressions:[{
        abilityName:'Irritating Pollen',suppressed:true,
        sourcePrinting:'Garbodor BKP 57'
      }]});
      const o={actorSeat:seat,ownPublic:{
        active:card('Fan Rotom SCR 118'),bench:[aor],stadium:jamming?[JAM]:[],
        ...(muted?{publicTurnRestrictions:{stadiumAndToolHaveNoEffectTurnsRemaining:1}}:{})
      },opponentPublic:{stadium:[]}};
      const action={kind:'play-card',token:'hood',actorPrinting:HOOD,targetPrinting:AOR,
        publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:0}};
      assert.equal(hoodProtectionScore(action,o),score);
    });
  }
}
