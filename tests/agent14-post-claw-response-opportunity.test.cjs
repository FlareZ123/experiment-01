'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {auditBehindResponse,CATCHER,LILLIE}=
  require('../simulation/evaluation/agent14-post-claw-response-opportunity.cjs');

function fixture(){
  return {decisionKind:'owner-root',actorSeat:0,globalTurn:32,
    ownHand:['Squawkabilly ex PAL',CATCHER,LILLIE,'Psychic Energy SVE'],
    ownTurnResources:{itemPlayLocked:false,supporterPlayLocked:false,
      supporterPlayedTurn:0},
    ownPublic:{prizeCount:6,deckCount:23,
      active:{energies:[]},resolvingSupporter:[],
      publicTurnRestrictions:{itemPlayLocked:false,supporterPlayLocked:false}},
    opponentPublic:{prizeCount:5,active:{energies:['Darkness Energy SVE']},
      bench:[null,{printing:'Garbodor BKP',energies:[],
        printed:{retreatCost:[1,1,1]}},
      {printing:'Absol MEG',energies:['Darkness Energy SVE'],
        printed:{retreatCost:[1]}},
      {printing:'Free Retreater X',energies:[],
        printed:{retreatCost:[]}}]}
  };
}
const bench={kind:'bench-basic',printing:'Squawkabilly ex PAL',handIndex:0};
test('source-derived first Claw response conditions produce separate hypotheses',()=>{
  const r=auditBehindResponse(fixture(),bench);
  assert.ok(r);assert.equal(r.catcher.paperPreconditionsVisible,true);
  assert.equal(r.catcher.targetHypotheses.length,3);
  assert.equal(r.catcher.targetHypotheses[0].potentialEnergyStrand,true);
  assert.equal(r.catcher.targetHypotheses[1].potentialEnergyStrand,false);
  assert.equal(r.catcher.targetHypotheses[2].potentialEnergyStrand,false);
  assert.equal(r.lillie.paperPreconditionsVisible,true);
  assert.equal(r.selectedLateSquawk.firstTurnOnlyAbilityExpired,true);
  assert.equal(r.competitiveGameQualified,false);
});
test('Prize equality, Item lock and lack of Bench each independently block Catcher',()=>{
  const x=fixture();x.opponentPublic.prizeCount=6;
  assert.equal(auditBehindResponse(x).catcher.paperPreconditionsVisible,false);
  x.opponentPublic.prizeCount=5;x.ownTurnResources.itemPlayLocked=true;
  assert.equal(auditBehindResponse(x).catcher.paperPreconditionsVisible,false);
  x.ownTurnResources.itemPlayLocked=false;x.opponentPublic.bench=[];
  assert.equal(auditBehindResponse(x).catcher.paperPreconditionsVisible,false);
});
test('Supporter quota, lock, zero deck and first-player turn each block Lillie',()=>{
  const x=fixture();
  for(const update of [()=>x.ownTurnResources.supporterPlayedTurn=1,
    ()=>{x.ownTurnResources.supporterPlayedTurn=0;x.ownTurnResources.supporterPlayLocked=true;},
    ()=>{x.ownTurnResources.supporterPlayLocked=false;x.ownPublic.deckCount=0;},
    ()=>{x.ownPublic.deckCount=20;x.globalTurn=1;}]){
    update();assert.equal(auditBehindResponse(x).lillie.paperPreconditionsVisible,false);
  }
});
test('late Squawk liability is diagnostic, not a universal bench veto',()=>{
  const x=fixture();x.ownHand=['Squawkabilly ex PAL'];
  assert.equal(auditBehindResponse(x,bench).selectedLateSquawk.present,true);
  assert.equal(auditBehindResponse(x,null),null);
  x.globalTurn=2;assert.equal(auditBehindResponse(x,bench),null);
});
test('opponent hidden hand/deck/prize identities never influence results',()=>{
  const x=fixture(),baseline=auditBehindResponse(x,bench);
  x.opponentHiddenHand=['Secret Box TWM'];
  x.opponentHiddenPrizeCards=['Key card'];
  x.opponentHiddenDeck=['Counter Catcher PAR'];
  assert.deepEqual(auditBehindResponse(x,bench),baseline);
  x.decisionKind='owner-prompt';assert.equal(auditBehindResponse(x,bench),null);
});
