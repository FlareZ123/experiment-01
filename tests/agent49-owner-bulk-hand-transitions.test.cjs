'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const roster=require('../results/aichi-2026/full-decklists.json');
const {
  BULK_HAND_PRINTS,ownerBulkHandTransition,summarizeOwnerBulkHandTransitions
}=require('../simulation/twinleaf/agent49-owner-bulk-hand-transitions.cjs');
const {summarizeOwnerHandPayment,summarizeNativePaymentRoots}=
  require('../simulation/twinleaf/agent27-owner-trainer-payment-observer.cjs');

const COPIES=Object.freeze({
  'Carmine TWM':[15,12,'discard',5],
  "Professor's Research JTG":[11,5,'discard',7],
  'Professor Sycamore BKP':[7,4,'discard',7],
  "Lillie's Determination MEG":[19,16,'deck',6],
  'N FCO':[8,7,'deck',undefined],
  'Marnie SSH':[16,13,'deck-bottom',5],
  'Iono PAL':[11,10,'deck-bottom',undefined]
});

/** @param {string[]} hand @param {number|null} prizeCount */
function view(hand,prizeCount=6){
  return Object.freeze({
    decisionKind:'owner-root',actorSeat:1,globalTurn:3,
    ownHand:Object.freeze([...hand]),
    ownPublic:Object.freeze({prizeCount}),
    opponentPublic:Object.freeze({
      hiddenHand:Object.freeze(['OPPONENT_SECRET_MUST_NOT_BE_READ']),
      prizeCount:1
    })
  });
}
/** @param {string[]} hand @param {number[]} indices */
function rows(hand,indices){
  return indices.map(handIndex=>Object.freeze({
    handIndex,printing:hand[handIndex],type:'Supporter',
    publicBlocker:null
  }));
}

test('all seven print-verified full-hand Supporters occur in exactly 29 sources',()=>{
  assert.equal(roster.decks.length,29);
  const all=roster.decks.flatMap(d=>d.cards.filter(
    c=>c.category==='Trainer').map(c=>({
      rank:d.rank,printing:c.name+' '+c.printing.set,
      copies:c.count
    })));
  let totalCopies=0,totalRows=0;
  for(const [printing,[expectedCopies,expectedRows,destination,draw]]
    of Object.entries(COPIES)){
    const matched=all.filter(row=>row.printing===printing);
    const copies=matched.reduce((sum,row)=>sum+row.copies,0);
    const definition=BULK_HAND_PRINTS[printing];
    assert.equal(copies,expectedCopies,printing);
    assert.equal(matched.length,expectedRows,printing);
    assert.equal(definition?.moveTo,destination);
    assert.equal(definition?.baseDraw,draw);
    totalCopies+=copies;
    totalRows+=matched.length;
  }
  assert.equal(totalCopies,87);
  assert.equal(totalRows,67);
  assert.equal(Object.keys(BULK_HAND_PRINTS).length,7);
});

test('all-other-hand discards include every protected owner singleton',()=>{
  const hand=['Carmine TWM','Critical A','Carmine TWM','Energy'];
  const result=ownerBulkHandTransition(view(hand),
    rows(hand,[0])[0],new Set([1,2]));
  assert.equal(result.destination,'discard');
  assert.equal(result.movedHandCount,3);
  assert.equal(result.protectedMovedCount,2);
  assert.deepEqual(result.protectedMovedIndices,[1,2]);
  assert.deepEqual(result.movedHandCopies.map(x=>x.handIndex),[1,2,3]);
  assert.equal(result.drawnCardCountRequested,5);
  assert.equal(result.effectIsNotActivationPayment,true);
  assert.equal(result.paperPlayabilityCertified,false);
  assert.equal(result.physicalZoneTransitionUnverified,true);
  assert.equal(hand.length,4);
});

test('the played Supporter cannot be a sacrificed hand card',()=>{
  for(const printing of [
    'Carmine TWM',"Professor's Research JTG",'Professor Sycamore BKP'
  ]){
    const alone=ownerBulkHandTransition(view([printing]),
      rows([printing],[0])[0]);
    assert.equal(alone.movedHandCount,0);
    assert.equal(alone.protectedMovedCount,0);
    assert.equal(alone.actualDrawnCardsUnknown,true);
    assert.equal(alone.drawnCardCountRequested,
      BULK_HAND_PRINTS[printing].baseDraw);
  }
});

test('Lillie preserves deck destination and uses own PUBLIC Prize count',()=>{
  const hand=["Lillie's Determination MEG",'Protected Tool','Other'];
  const row=rows(hand,[0])[0];
  const six=ownerBulkHandTransition(view(hand,6),row,new Set([1]));
  const five=ownerBulkHandTransition(view(hand,5),row,new Set([1]));
  const unknown=ownerBulkHandTransition(view(hand,null),row);
  assert.equal(six.destination,'deck');
  assert.equal(six.returnedToDeckRatherThanDiscard,true);
  assert.equal(six.drawnCardCountRequested,8);
  assert.equal(five.drawnCardCountRequested,6);
  assert.equal(unknown.drawnCardCountRequested,null);
  assert.equal(unknown.conditionalPrizeDrawCount.publicPrizeCountKnown,false);
  assert.equal(six.protectedMovedCount,1);
  assert.equal(six.paperPlayabilityCertified,false);
});

test('unknown print stays unresolved, and exact printing and type are checked',()=>{
  const hand=['Professor Sycamore XY','A'];
  const unknown=ownerBulkHandTransition(view(hand),rows(hand,[0])[0]);
  assert.equal(unknown.knownBulkHandEffect,false);
  assert.equal(unknown.status,'unmodeled-printing');
  assert.throws(()=>ownerBulkHandTransition(view(['Carmine TWM']),
    {handIndex:0,printing:'Carmine TWM',type:'Item'}),/Supporter/);
  assert.throws(()=>ownerBulkHandTransition(view(['Carmine TWM']),
    {handIndex:1,printing:'Carmine TWM',type:'Supporter'}),
    /AssertionError/);
});

test('alternative whole-hand loss is counted per option, not as combined payment',()=>{
  const hand=['Carmine TWM',"Lillie's Determination MEG",'Keep'];
  const v=view(hand),r=rows(hand,[0,1]);
  const one=summarizeOwnerBulkHandTransitions(v,r,new Set([2]));
  assert.equal(one.knownBulkHandTrainerCopies,2);
  assert.equal(one.discardEntireHandCandidates,1);
  assert.equal(one.shuffleEntireHandCandidates,1);
  assert.equal(one.summedOtherHandCopiesExposedAcrossAlternatives,4);
  assert.equal(one.summedProtectedCopiesExposedAcrossAlternatives,2);
  assert.equal(one.countsAreCompetingHypotheticalAlternatives,true);
  assert.equal(one.competitiveGameQualified,false);
  const observed=summarizeOwnerHandPayment(v,r,new Set([2]));
  assert.equal(observed.supportedTrainerCopies,0);
  assert.equal(observed.printVerifiedBulkHandTrainerCopies,2);
  assert.equal(observed.bulkHandTransitions.length,2);
  const native=summarizeNativePaymentRoots([
    {seat:1,ownerPaymentSummary:observed}
  ]);
  assert.equal(native.bySeat[1].bulk,2);
  assert.equal(native.qualifiedCompetitiveGames,0);
});

test('opponent concealed changes cannot affect any owner bulk hand receipt',()=>{
  const hand=['Carmine TWM','Protected'];
  const v=view(hand);
  const r=rows(hand,[0]);
  const a=summarizeOwnerBulkHandTransitions(v,r,new Set([1]));
  const b=summarizeOwnerBulkHandTransitions({...v,opponentPublic:{
    handCount:44,hiddenHand:['OPPONENT_PRIVATE_DIFFERS'],
    prizeCount:0
  }},r,new Set([1]));
  assert.deepEqual(a,b);
  assert.equal(a.rows[0].opponentConcealedUsed,false);
  assert.deepEqual(v.ownHand,hand);
});

test('N uses owner Prize count and returns every other held card into deck',()=>{
  const hand=['N FCO','Valuable Pokémon','Other'];
  const result=ownerBulkHandTransition(view(hand,3),rows(hand,[0])[0],
    new Set([1]));
  assert.equal(result.destination,'deck');
  assert.equal(result.drawnCardCountRequested,3);
  assert.equal(result.protectedMovedCount,1);
  assert.equal(result.affectsOpponentHand,true);
  assert.equal(result.opponentConcealedUsed,false);
});

test('Marnie and Iono require actual moved cards; opponent count alone is insufficient',()=>{
  for(const [printing,ownPrizes,expected] of [
    ['Marnie SSH',4,5],['Iono PAL',2,2]
  ]){
    const lone=view([printing],ownPrizes);
    const row=rows(lone.ownHand,[0])[0];
    const emptyOpponent={...lone,opponentPublic:{handCount:0}};
    const heldOpponent={...lone,opponentPublic:{handCount:3}};
    const unknownOpponent={...lone,opponentPublic:{}};
    const empty=ownerBulkHandTransition(emptyOpponent,row);
    const held=ownerBulkHandTransition(heldOpponent,row);
    const unknown=ownerBulkHandTransition(unknownOpponent,row);
    assert.equal(empty.conditionalDrawTriggered,false);
    assert.equal(empty.drawnCardCountRequested,0);
    assert.equal(held.conditionalDrawTriggered,null,
      'Public opponent hand count cannot rule out Dew Guard protection');
    assert.equal(held.drawnCardCountRequested,null);
    assert.equal(unknown.conditionalDrawTriggered,null);
    assert.equal(unknown.drawnCardCountRequested,null);
    assert.equal(held.specificDeckDestination,'deck-bottom');
    assert.equal(held.opponentConcealedUsed,false);
    const ownTwo=ownerBulkHandTransition(
      {...lone,ownHand:Object.freeze([printing,'Energy']),
        opponentPublic:{}},row);
    assert.equal(ownTwo.conditionalDrawTriggered,true);
    assert.equal(ownTwo.drawnCardCountRequested,expected);
  }
});

test('seven-print owner census tracks bottom of deck separately',()=>{
  const hand=['Iono PAL','Carmine TWM','Marnie SSH','N FCO'];
  const s=summarizeOwnerBulkHandTransitions(view(hand),rows(hand,[0,1,2,3]));
  assert.equal(s.knownBulkHandTrainerCopies,4);
  assert.equal(s.discardEntireHandCandidates,1);
  assert.equal(s.shuffleEntireHandCandidates,3);
  assert.equal(s.bottomOfDeckHandCandidates,2);
  assert.equal(s.summedOtherHandCopiesExposedAcrossAlternatives,12);
});
