'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {analyze}=require('../scripts/agent18-aichi-k0-root-uniqueness.cjs');

/** @param {number} rank @param {0|1} seat */
function root(rank,seat){
  const independent=seat===0?[{source:'all-owner-basic-attachments',
    kind:'attach-basic-energy',printing:'Psychic Energy',
    slot:'bench',index:0}]:[];
  return {
    physicalSeat:seat,globalTurn:seat===0?2:1,
    ownActive:seat===0?'Champion V':'Different Opponent '+rank,
    ownBench:[],opponentActive:seat===0?'Opponent '+(rank%3):'Champion V',
    ownerKnownHand:seat===0?
      (rank%10===0?['Psychic Energy','Teammates']:['Psychic Energy']):
      ['Unique Source '+rank],
    sameRootAllProposersK0Invariant:true,
    sameRootReceipt:{
      supportedAlternativeCount:independent.length,
      offers:[{source:'first-return',kind:'pass'},...independent]
    }
  };
}
function fixtures(){
  const rows=Array.from({length:29},(_,i)=>({
    rank:i+1,status:'native-source-K0-both-owner-roots-passed',
    ownerRoots:[root(i+1,0),root(i+1,1)]
  }));
  return [{rows:rows.slice(0,6)},{rows:rows.slice(6)}];
}
test('repeated champion-side offers collapse to two recorded owner-local states',()=>{
  const r=analyze(fixtures());
  assert.equal(r.bySeat[0].observedRoots,29);
  assert.equal(r.bySeat[0].rootsWithIndependentOffer,29);
  assert.equal(r.bySeat[0].totalIndependentOffers,29);
  assert.equal(r.bySeat[0].uniqueRecordedOwnerLocalProjections,2);
  assert.equal(r.bySeat[1].uniqueRecordedOwnerLocalProjections,29);
  assert.equal(r.bySeat[1].rootsWithIndependentOffer,0);
  assert.equal(r.bySeat[0].distinctOfferSourcePrintingAndTarget.length,1);
  assert.equal(r.bySeat[0].distinctOfferSourcePrintingAndTarget[0].occurrences,29);
  assert.equal(r.competitiveQualifiedGames,0);
});
test('retains blocked rank in nominal 29 but excludes unobserved native owner roots',()=>{
  const input=fixtures();
  input[0].rows[0]={rank:1,status:'blocked',error:'native source unavailable'};
  const r=analyze(input);
  assert.deepStrictEqual(r.sourceBlockedRanks,[1]);
  assert.equal(r.bySeat[0].observedRoots,28);
  assert.equal(r.bySeat[1].observedRoots,28);
});
test('refuses repeated source rank',()=>{
  const input=fixtures();
  input[1].rows[0].rank=6;
  assert.throws(()=>analyze(input),/Expected values to be strictly equal/);
});
