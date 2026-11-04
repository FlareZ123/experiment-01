'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const source=require('../results/aichi-2026/full-decklists.json');
const {
  VERSION,sourceProvenanceReceipt,sameTranscribedRow
}=require('../simulation/evaluation/agent22-source-provenance-receipt.cjs');

function fakePlan(rank,substitutions=[],status='ready'){
  return {
    engineRevision:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    opponents:[{rank,status,substitutions}]
  };
}
const energyRow=source.decks.find(x=>x.rank===1).cards.find(x=>
  x.category==='Energy'&&x.printing?.set==='MEE'&&
  String(x.printing?.number)==='13');
const observedAlias={
  sourceName:energyRow.name,count:energyRow.count,
  sourcePrinting:energyRow.printing,resolvedId:'Psychic Energy MEE',
  reason:'same-set-basic-energy-number-mismatch'
};

test('nonexistent original source rank fails closed without fabricated 60',()=>{
  const got=sourceProvenanceReceipt(source,23);
  assert.equal(got.schema,VERSION);
  assert.equal(got.sourceOriginalExists,false);
  assert.equal(got.historical_print_match,'unknown');
  assert.equal(got.native_physical_deal_match,'not-compared');
  assert.equal(got.engine_proxy_map.entries.length,0);
  assert.equal(got.competitiveQualified,false);
});

test('rank1 retains original printing and counts with honest unset native status',()=>{
  const before=structuredClone(source);
  const got=sourceProvenanceReceipt(source,1);
  assert.deepEqual(source,before);
  assert.equal(got.sourceOriginalExists,true);
  assert.equal(got.sourceCardCount,60);
  assert.equal(got.postEventArtCopies,11);
  assert.equal(got.engine_proxy_map.status,'not-assessed');
  assert.equal(got.engine_proxy_map.entries[0].archivedPrinting.number,'13');
  assert.equal(got.engine_proxy_map.entries[0].proposedRepresentative.number,'5');
  assert.equal(got.engine_proxy_map.entries[0].actualNativePrinting,'unverified');
  assert.equal(got.composition_match,'source-derived-name-count-preserved');
  assert.equal(got.native_physical_deal_match,'not-compared');
});

test('real-shaped external resolver alias attaches native ID without art certification',()=>{
  const got=sourceProvenanceReceipt(source,1,fakePlan(1,[observedAlias]),{
    matched:true,evidenceDigest:'a'.repeat(64)
  });
  assert.equal(got.engine_proxy_map.status,'resolver-receipts-present');
  assert.equal(got.engine_proxy_map.datedArtRowsAccountedFor,true);
  assert.equal(got.engine_proxy_map.entries[0].observedNativeId,'Psychic Energy MEE');
  assert.equal(got.engine_proxy_map.entries[0].observedResolverReason,
    'same-set-basic-energy-number-mismatch');
  assert.equal(got.engine_proxy_map.entries[0].paperSemanticEquivalence,'unverified');
  assert.equal(got.native_physical_deal_match,'observed-match');
  assert.equal(got.competitiveQualified,false);
  assert.equal(got.historical_print_match,'unknown');
});

test('silent native exact printing leaves source chronology unresolved',()=>{
  const got=sourceProvenanceReceipt(source,1,fakePlan(1,[]),{
    matched:false,evidenceDigest:'b'.repeat(64)
  });
  assert.equal(got.engine_proxy_map.status,'missing-art-receipts');
  assert.equal(got.engine_proxy_map.datedArtRowsAccountedFor,false);
  assert.equal(got.engine_proxy_map.entries[0].nativeResolutionStatus,
    'native-exact-or-unexplained');
  assert.equal(got.native_physical_deal_match,'observed-mismatch');
});

test('unresolved deck remains nonqualified and other-rank substitutions do not count',()=>{
  const got=sourceProvenanceReceipt(source,1,
    fakePlan(1,[{...observedAlias,sourceName:'Darkness Energy'}],
      'unresolved-printings'));
  assert.equal(got.engine_proxy_map.entries[0].observedNativeId,null);
  assert.equal(got.engine_proxy_map.entries[0].nativeResolutionStatus,'not-resolved');
  assert.equal(got.engine_proxy_map.nativeDeckStatus,'unresolved-printings');
  assert.equal(got.engine_proxy_map.status,'native-deck-unresolved');
  assert.equal(got.engine_proxy_map.datedArtRowsAccountedFor,false);
  assert.equal(sameTranscribedRow({
    name:energyRow.name,count:energyRow.count,
    transcribedPrinting:energyRow.printing
  },observedAlias),true);
  assert.equal(sameTranscribedRow({
    name:energyRow.name,count:energyRow.count,
    transcribedPrinting:energyRow.printing
  },{...observedAlias,sourceName:'Darkness Energy'}),false);
});

test('bad physical digest and duplicate native aliases fail closed',()=>{
  assert.throws(()=>sourceProvenanceReceipt(source,1,null,{
    matched:true,evidenceDigest:'not-a-hash'
  }),/regular expression/u);
  assert.throws(()=>sourceProvenanceReceipt(source,1,
    fakePlan(1,[observedAlias,observedAlias])),/Ambiguous resolver/u);
});

test('unknown plan and a rejected deck cannot vacuously certify mapped art',()=>{
  const noPlan=sourceProvenanceReceipt(source,1);
  assert.equal(noPlan.engine_proxy_map.status,'not-assessed');
  assert.equal(noPlan.engine_proxy_map.datedArtRowsAccountedFor,false);
  const badPlan=sourceProvenanceReceipt(source,1,
    fakePlan(1,[observedAlias],'unresolved-printings'));
  assert.equal(badPlan.engine_proxy_map.status,'native-deck-unresolved');
  assert.equal(badPlan.engine_proxy_map.datedArtRowsAccountedFor,false);
  assert.equal(badPlan.engine_proxy_map.entries[0].nativeResolutionStatus,
    'not-resolved');
  assert.equal(badPlan.competitiveQualified,false);
});
