'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {summarize}=
  require('../scripts/agent18-aichi-k0-same-root-census.cjs');

/** @param {number} rank @param {0|1} seat @returns {object} */
function sourceRoot(rank,seat){
  const independent=rank%2===0;
  const error=rank===3&&seat===1;
  const offers=[{source:'first-return',kind:'pass'}];
  if(independent)offers.push({
    source:'payable-printed-attack',kind:'attack',
    printing:null,attackName:'Test Attack',slot:null,index:null,
    score:-10,reason:'unverified-opportunity-cost',
    proposedDiscardPrinting:null
  });
  return {
    physicalSeat:seat,globalTurn:seat+1,
    nativeStoreFirstActionDispatched:true,
    nativeStoreFirstActionAccepted:true,
    nativeBotProposedActionClass:'PassTurnAction',
    nativeBotProposedHandPrinting:null,
    nativeStoreFirstActionAttachedToolTarget:null,
    sameRootAllProposersK0Invariant:true,
    sameRootReceipt:{
      mode:'all-proposers-observe',changed:false,baselineKind:'pass',
      supportedAlternativeCount:Number(independent),
      offers,
      selectorErrors:error?[{selector:'fixture',error:'expected'}]:[]
    }
  };
}
function fixtures(){
  const ranks=Array.from({length:32},(_,i)=>i+1)
    .filter(rank=>![23,25,28].includes(rank));
  const rows=ranks.map(rank=>({
    rank,status:'native-source-K0-both-owner-roots-passed',
    ownerRoots:[sourceRoot(rank,0),sourceRoot(rank,1)]
  }));
  return [
    {registration:'six',pinnedEngine:'test-pin',
      sourceRootSameRootCollectorVersion:'test-collector',rows:rows.slice(0,6)},
    {registration:'rest',pinnedEngine:'test-pin',
      sourceRootSameRootCollectorVersion:'test-collector',rows:rows.slice(6)}
  ];
}
test('counts the complete 29-source first-root denominator without native-playability claims',()=>{
  const s=summarize(fixtures());
  assert.equal(s.attemptedRanks.length,29);
  assert.equal(s.attemptedOwnerRoots,58);
  assert.equal(s.observedOwnerRoots,58);
  assert.equal(s.K0PrivacyMatchedRoots,58);
  assert.equal(s.nativeSourceActionsAccepted,58);
  assert.equal(s.competitiveQualifiedGames,0);
  assert.equal(s.nativeOfferPlayabilityQualified,false);
  assert.equal(s.selectorErrorCount,1);
  assert.equal(s.independentOfferRoots,s.passWithIndependentOffer.length);
  assert.equal(s.supportedIndependentOffers,s.independentOfferRoots);
  assert.equal(s.bySeat[0].roots,29);
  assert.equal(s.bySeat[1].roots,29);
  assert.equal(s.noIndependentOfferRoots,58-s.independentOfferRoots);
});
test('retains failed original source rank instead of silently discarding it',()=>{
  const q=fixtures();
  q[0].rows[0]={rank:1,status:'blocked',error:'source native error'};
  const s=summarize(q);
  assert.equal(s.blockedRanks.length,1);
  assert.equal(s.observedOwnerRoots,56);
  assert.equal(s.attemptedOwnerRoots,58);
});
test('refuses duplicated source rank rather than inflating field exposure',()=>{
  const q=fixtures();
  q[1].rows[0].rank=6;
  assert.throws(()=>summarize(q),/duplicated rank/);
});
