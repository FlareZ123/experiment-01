'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {auditRank26CompressorProvenance}=require('../scripts/agent3-rank26-compressor-provenance-audit.cjs');

function attempt(first,plays,receipts) {
  return {
    sourceFirst:first,
    sourceFirstCompressorPlays:plays,
    sourceFirstActions:Array.from({length:plays},()=>({action:'PlayCardAction',card:'Battle Compressor'})),
    settlementAudit:{receipts:receipts.map(ids=>({
      globalTurn:1,nativeDispatchReturned:true,paperMinimumMet:true,
      physicallyMoved:ids.map(id=>({id}))
    }))}
  };
}
function cohort(cases) {return {schema:'agent3-rank26-physical-compressor-prospective-v2',cases};}
function pair(baseline,treatment,slot='A',repeat=72){
  return {repeat,slot,sourceSeat:slot==='A'?0:1,baseline,treatment};
}
test('orphan baseline native receipts cannot certify source firstturn Compressor',()=>{
  const result=auditRank26CompressorProvenance(cohort([
    pair(attempt(true,0,[[72,73,117],[72,73,117]]),
         attempt(true,1,[[117,118,64]]),'B')
  ]));
  assert.equal(result.byArm.baseline.orphanReceiptDeals,1);
  assert.equal(result.byArm.baseline.orphanReceiptCount,2);
  assert.equal(result.byArm.baseline.sameTurnReusedPhysicalIdReceipts,1);
  assert.equal(result.byArm.treatment.countsConsistentDeals,1);
  assert.equal(result.competitiveQualifiedGames,0);
});
test('positive receipt greater than card-play count is an unresolved lineage excess',()=>{
  const result=auditRank26CompressorProvenance(cohort([
    pair(attempt(true,0,[]),attempt(true,1,[[1],[2]]))
  ]));
  assert.equal(result.byArm.treatment.excessReceiptCount,1);
  assert.equal(result.byArm.treatment.excessReceiptDeals,1);
  assert.equal(result.byArm.treatment.countsConsistentDeals,0);
});
test('source-second roots stay out of the first-global-turn denominator',()=>{
  const result=auditRank26CompressorProvenance(cohort([
    pair(attempt(false,0,[[1]]),attempt(false,0,[[1]])),
    pair(attempt(true,0,[]),attempt(true,0,[]),'B',73)
  ]));
  assert.equal(result.sourceFirstPhysicalDeals,1);
  assert.equal(result.byArm.baseline.claimedPositiveReceipts,0);
  assert.equal(result.byArm.treatment.claimedPositiveReceipts,0);
});
test('inconsistent source decision trace is rejected',()=>{
  const b=attempt(true,0,[]);
  b.sourceFirstActions=[{action:'PlayCardAction',card:'Battle Compressor'}];
  assert.throws(()=>auditRank26CompressorProvenance(cohort([
    pair(b,attempt(true,0,[]))
  ])),/Inconsistent source action trace/);
});
test('wrong artifact schema is rejected',()=>{
  assert.throws(()=>auditRank26CompressorProvenance({schema:'other',cases:[]}),TypeError);
});
