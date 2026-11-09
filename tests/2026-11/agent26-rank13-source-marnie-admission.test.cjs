'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {compareSourceMarnie,turn3SourceRoots,EXPECTED_SOURCE_SHA}=
  require('../../simulation/evaluation/2026-11/agent26-rank13-source-marnie-native-pair.cjs');

/** @param {boolean} treat @param {object} overrides @returns {object} */
function originalNative(treat=false,overrides={}){
  const roots=[{actionOrdinal:0,turnBefore:1,playerSlot:1,
    action:'PlayCardAction',card:'Kyurem'},
  {actionOrdinal:1,turnBefore:1,playerSlot:1,
    action:'PlayCardAction',card:'Double Dragon Energy'},
  {actionOrdinal:2,turnBefore:3,playerSlot:1,
    action:treat?'PlayCardAction':'PassTurnAction',
    ...(treat?{card:'Marnie'}:{})}];
  return {trial:{id:'13:1:A:champion-reference',
      candidateId:'champion-reference'},
    sourceSeat:1,candidateSeat:0,
    sourceDealFingerprint:EXPECTED_SOURCE_SHA,
    actualStarterSeat:1,finished:false,winner:null,
    endReason:'action-limit',rootActionLedger:roots,
    nativeAllOwnerPassFrontier:{receipts:[{
      turn:3,actorSeat:1,
      ownerHandAtChosenPass:['Marnie SSH','Quick Ball FST',
        'Echoing Horn CRE','Guzma BUS','Parallel City BKT']
    }]},finalPrizes:[6,6],...overrides};
}

test('source-only Marnie at real owner T3 cannot be fabricated by candidate roots',()=>{
  const a=originalNative();
  const b=originalNative(true);
  assert.equal(turn3SourceRoots(b).length,1);
  const out=compareSourceMarnie(a,b);
  assert.equal(out.ownerRootOfferAndAcceptanceDemonstrated,true);
  assert.equal(out.originalFrozenSourceOpeningMatched,true);
  assert.equal(out.controlNative,'ACTION_CAP');
  assert.equal(out.treatmentNative,'ACTION_CAP');
  assert.equal(out.paperQualifiedGames,0);
  assert.equal(out.competitiveWinRate,undefined);
});

test('physical-mismatched source, unoffered Marnie and same Pass remain unqualified',()=>{
  const control=originalNative();
  const diff=originalNative(true,
    {sourceDealFingerprint:'other-real-source'});
  const noOffer=originalNative(true,{nativeAllOwnerPassFrontier:{receipts:[]}});
  const noMarnie=originalNative();
  assert.equal(compareSourceMarnie(control,diff)
    .ownerRootOfferAndAcceptanceDemonstrated,false);
  assert.equal(compareSourceMarnie(noOffer,originalNative(true))
    .ownerRootOfferAndAcceptanceDemonstrated,false);
  assert.equal(compareSourceMarnie(control,noMarnie)
    .ownerRootOfferAndAcceptanceDemonstrated,false);
});

test('rejects wrong original source actor and trial identity',()=>{
  assert.throws(()=>compareSourceMarnie(originalNative(),
    originalNative(true,{sourceSeat:0})));
  assert.throws(()=>compareSourceMarnie(originalNative(),
    originalNative(true,{trial:{id:'11:1:A:champion-reference',
      candidateId:'champion-reference'}})));
});
