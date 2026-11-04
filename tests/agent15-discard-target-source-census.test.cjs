'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const test=require('node:test');
const {sourceRecoveryCensus,metadataCollisionCensus,
  publicSourceNameSetCoverage,originalSourceNameSetAmbiguityCensus,
  verifyRecoveryPrints,run}=require(
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


test('source-wide name+set coverage reports unresolved original source printings',()=>{
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
  assert.equal(result.japaneseOnlyPromoCopies,14);
  assert.deepEqual(result.japaneseOnlyPromoDistinctOriginals,[3,6,7,24,29]);
  assert.equal(result.japaneseOnlyPromoPublicMetadataCoverage
    .registeredOriginalSourceCardCopies,1740);
  assert.equal(result.japaneseOnlyPromoPublicMetadataCoverage
    .nameSetRepresentedCopies,1740);
  assert.equal(result.japaneseOnlyPromoPublicMetadataCoverage
    .nameSetUnrepresentedCopies,0);
  assert.equal(result.sourceJapanesePaperLegalityOfficiallyVerified,false);
  assert.equal(result.sourceInternationalPaperLegalityVerified,false);
});


test('source-aligned name-set collision counts preserve actual physical copy weights',()=>{
  const index=new Map([
    ['Bouffalant BLW',{variants:[
      {supertype:'Pokémon',subtypes:['Basic'],hp:'90'},
      {supertype:'Pokémon',subtypes:['Basic'],hp:'100'}]}],
    ['Mystery Trainer EX',{variants:[
      {supertype:'Trainer',subtypes:['Item']},
      {supertype:'Trainer',subtypes:['Supporter']}]}]
  ]);
  const cards=[
    {name:'Bouffalant',category:'Pokémon',count:2,
      printing:{set:'BLW',number:'90'}},
    {name:'Mystery Trainer',category:'Trainer',count:1,
      printing:{set:'EX',number:'4'}},
    {name:'Other',category:'Trainer',count:57,
      printing:{set:'A',number:'1'}}
  ];
  const field={decks:[{rank:5,cards}]};
  const x=originalSourceNameSetAmbiguityCensus(field,index);
  assert.equal(x.originalSourcePhysicalCards,60);
  assert.equal(x.ambiguousEnglishNameSetSourceCopies,3);
  assert.equal(x.distinctAmbiguousOriginalNameSetKeys,2);
  assert.equal(x.subtypeConflictingSourceCopies,1);
  assert.equal(x.hp90ConflictingSourceCopies,2);
  assert.deepEqual(x.rows.find(r=>r.printing==='Bouffalant BLW')
    .sourceCollectorKeys,['90']);
  assert.equal(x.originalJapaneseExactPrintFidelityCertified,false);
});

test('source-aligned original field ambiguity reports bounded physical copies',()=>{
  const result=run(path.join(__dirname,'..'));
  const x=result.originalSourceNameSetAmbiguities;
  assert.equal(x.originalSourcePhysicalCards,1740);
  assert.ok(x.ambiguousEnglishNameSetSourceCopies>=0);
  assert.ok(x.ambiguousEnglishNameSetSourceCopies<=1740);
  assert.ok(x.hp90ConflictingSourceCopies<=x.ambiguousEnglishNameSetSourceCopies);
  assert.ok(x.subtypeConflictingSourceCopies<=x.ambiguousEnglishNameSetSourceCopies);
  assert.equal(x.rows.every(r=>r.publicVariantCount>=2),true);
});
