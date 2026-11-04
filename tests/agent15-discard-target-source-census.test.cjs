'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const test=require('node:test');
const {sourceRecoveryCensus,metadataCollisionCensus,
  publicSourceNameSetCoverage,verifyRecoveryPrints,run}=require(
  '../scripts/agent15-discard-target-source-census.cjs');
const {loadBundledPublicPrintMetadata}=require(
  '../simulation/twinleaf/planning/owner-public-discard-target-necessary.cjs');

const resourceRoot=path.join(__dirname,'../resources');

test('source rank and exact 60 validation, five printed families',()=>{
  const cards=[{category:'Trainer',name:'VS Seeker',
    printing:{set:'PHF'},count:2},
    {category:'Trainer',name:'Super Rod',printing:{set:'PAL'},count:1},
    {category:'Pokémon',name:'Test Pokémon',
      printing:{set:'ABC'},count:57}];
  const x=sourceRecoveryCensus({decks:[{rank:4,cards}]});
  assert.equal(x.authenticatedSourceDecks,1);
  assert.equal(x.registeredPhysicalTrainerCopies,3);
  assert.equal(x.rows.find(r=>r.printing==='VS Seeker PHF').copies,2);
  assert.deepEqual(x.rows.find(r=>r.printing==='Super Rod PAL').ranks,[4]);
  assert.throws(()=>sourceRecoveryCensus({decks:[
    {rank:4,cards},{rank:4,cards}]}));
});

test('five card text predicates have exact source IDs and Item class',()=>{
  const receipts=verifyRecoveryPrints(resourceRoot);
  assert.equal(receipts.length,5);
  assert.ok(receipts.every(r=>r.verifiedFromBundledEnglish));
});

test('complete public database preserves HP-90 ambiguity quantitatively',()=>{
  const index=loadBundledPublicPrintMetadata(resourceRoot);
  const m=metadataCollisionCensus(index);
  assert.deepEqual(m,{
    indexedNameSetKeys:16475,
    nonidenticalSameNameSetMetadataKeys:493,
    hpVariantsStraddling90:38,
    metadataPoolNotPreFilteredForPaperExpanded:true
  });
});


test('source-wide name+set representation preserves 14 unresolved original cards',()=>{
  const result=run(path.join(__dirname,'..'));
  assert.equal(result.incidence.authenticatedSourceDecks,29);
  assert.equal(result.incidence.registeredPhysicalTrainerCopies,96);
  const coverage=result.enrichedPublicMetadataSourceCoverage;
  assert.equal(coverage.registeredOriginalSourceCardCopies,1740);
  assert.equal(coverage.nameSetUnrepresentedCopies,14);
  assert.equal(coverage.nameSetRepresentedCopies,1726);
  assert.deepEqual(coverage.missingKeys.map(row=>[
    row.printing,row.copies]),[
    ['Palace Book SMP',6],["Player's Ceremony SP",5],['Palace Belt BWP',3]
  ]);
  assert.equal(coverage.exactCollectorNumberCertified,false);
  assert.equal(coverage.sourceLegalityCertified,false);
  assert.equal(result.supplementalMEEExternalProvenance,true);
});
