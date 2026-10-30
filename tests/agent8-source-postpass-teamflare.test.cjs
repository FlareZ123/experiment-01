'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {sourcePostPassTeamFlare,PRINTING,VERSION}=
  require('../simulation/evaluation/agent8-source-postpass-teamflare.cjs');

/** @returns {{trace:object[], roots:object[]}} Source in physical seat 1. */
function fixture(){
  const original={actionOrdinal:0,playerSlot:1,turnBefore:4,
    action:'PlayCardAction',card:'Crushing Hammer'};
  const pass={actionOrdinal:1,playerSlot:1,turnBefore:4,
    action:'PassTurnAction'};
  const row={...pass,
    decisionHandBefore:{perspectiveSeat:1,ownHandPrintings:[
      PRINTING,'Plumeria BUS','Psychic Energy SVE']},
    publicBoardBeforePass:[
      {active:{name:'Shadow Rider Calyrex V',
        energyCards:['Psychic Energy SVE']},bench:[]},
      {active:{name:'Iron Thorns ex',energyCards:[]},bench:[]}
    ]
  };
  return {trace:[row],roots:[original,pass]};
}

test('genuine source accepted Pass with owned printed Flare and public Active Energy',()=>{
  const {trace,roots}=fixture();
  const result=sourcePostPassTeamFlare(trace,roots,1);
  assert.equal(VERSION,'agent8-source-postpass-teamflare-visible-target-v1');
  assert.equal(result.sourcePasses,1);
  assert.equal(result.observedPasses,1);
  assert.equal(result.heldPasses,1);
  assert.equal(result.publicOpponentEnergyPasses,1);
  assert.equal(result.heldAndTargetPasses,1);
  assert.equal(result.heldAndTargetAfterFirstTurn,1);
  assert.equal(result.heldTargetNoEarlierObservedSupporter,1);
  assert.deepEqual(result.samples,[{
    ordinal:1,globalTurn:4,heldCount:1,
    opposingActiveEnergyCards:1,afterFirstTurn:true,
    noEarlierObservedSupporter:true
  }]);
  assert.equal(result.nativeLegality,'unverified');
  assert.equal(result.competitiveGameQualified,false);
});

test('earlier same-turn Supporter and first-player T1 are individually excluded',()=>{
  const first=fixture();
  first.roots[0].card='Plumeria';
  assert.equal(sourcePostPassTeamFlare(first.trace,first.roots,1)
    .heldTargetNoEarlierObservedSupporter,0);
  const t1=fixture();
  t1.roots[0].turnBefore=1;
  t1.roots[1].turnBefore=1;
  t1.trace[0].turnBefore=1;
  const a=sourcePostPassTeamFlare(t1.trace,t1.roots,1);
  assert.equal(a.heldAndTargetPasses,1);
  assert.equal(a.heldAndTargetAfterFirstTurn,0);
});

test('source seat 0 uses physical opponent board 1 and never inspects hidden zones',()=>{
  const {trace,roots}=fixture();
  trace[0].playerSlot=0;
  roots[0].playerSlot=0;
  roots[1].playerSlot=0;
  trace[0].decisionHandBefore.perspectiveSeat=0;
  trace[0].publicBoardBeforePass.reverse();
  Object.defineProperty(trace[0],'opponentHiddenHand',{
    get(){throw Error('must never read hidden opponent hand');}
  });
  Object.defineProperty(trace[0],'sourcePrizes',{
    get(){throw Error('must never read source Prize identities');}
  });
  const a=sourcePostPassTeamFlare(trace,roots,0);
  assert.equal(a.heldTargetNoEarlierObservedSupporter,1);
  assert.equal(JSON.stringify(a).includes('Plumeria BUS'),false);
});

test('incomplete owner or opposing-public witness never counts a missed opportunity',()=>{
  const x=fixture();
  x.trace[0].decisionHandBefore.perspectiveSeat=0;
  const a=sourcePostPassTeamFlare(x.trace,x.roots,1);
  assert.equal(a.incompletePasses,1);
  assert.equal(a.observedPasses,0);
  assert.equal(a.heldAndTargetPasses,0);
  x.trace[0].decisionHandBefore.perspectiveSeat=1;
  x.trace[0].publicBoardBeforePass[0].active.energyCards=undefined;
  assert.equal(sourcePostPassTeamFlare(x.trace,x.roots,1).incompletePasses,1);
});

test('no active Energy, no owned printed Flare or wrong native epoch cannot pass gate',()=>{
  const x=fixture();
  x.trace[0].publicBoardBeforePass[0].active.energyCards=[];
  assert.equal(sourcePostPassTeamFlare(x.trace,x.roots,1).heldAndTargetPasses,0);
  x.trace[0].publicBoardBeforePass[0].active.energyCards=['Psychic'];
  x.trace[0].decisionHandBefore.ownHandPrintings=['Team Flare Grunt OTHER'];
  assert.equal(sourcePostPassTeamFlare(x.trace,x.roots,1).heldAndTargetPasses,0);
  x.roots[1].turnBefore=5;
  assert.throws(()=>sourcePostPassTeamFlare(x.trace,x.roots,1));
});
