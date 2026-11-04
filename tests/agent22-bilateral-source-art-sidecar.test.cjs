'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const source=require('../results/aichi-2026/full-decklists.json');
const {
  VERSION,auditBilateralOriginalSourceArt
}=require('../simulation/evaluation/agent22-bilateral-source-art-sidecar.cjs');

const sourceEnergy=source.decks.find(x=>x.rank===1).cards.find(x=>
  x.category==='Energy'&&x.printing?.set==='MEE'&&
  String(x.printing?.number)==='13');
const energyAlias={
  sourceName:sourceEnergy.name,count:sourceEnergy.count,
  sourcePrinting:sourceEnergy.printing,resolvedId:'Psychic Energy MEE',
  reason:'same-set-basic-energy-number-mismatch'
};
const pin='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const candidates=['champion-reference','new-moon-lockbreaker-v1'];
const digestA='a'.repeat(64),digestB='b'.repeat(64);
function fixture(left=digestA,right=digestA){
  const rows=candidates.map((id,i)=>({
    trial:{id:'1:0:A:'+id,rank:1,candidateSlot:'A',
      candidateId:id,seed:123,repeat:0},
    verifiedFirstTurn:true,actualStarterSeat:0,
    sourceDealFingerprint:i===0?left:right
  }));
  const run={
    rows,sourcePairs:[{
      pairId:'1:0:A',
      sourceDealStatus:left===null||right===null?'UNKNOWN':
        left===right?'MATCHED':'MISMATCHED',
      actualStarterStatus:'MATCHED'
    }]
  };
  const plans=new Map(candidates.map(id=>[id,{
    engineRevision:pin,
    opponents:[{rank:1,status:'ready',substitutions:[energyAlias]}]
  }]));
  return {run,plans};
}

test('read-only sidecar proves observed equal candidate initial source and starter',()=>{
  const {run,plans}=fixture();
  const before=structuredClone(run);
  const audit=auditBilateralOriginalSourceArt(run,source,plans);
  assert.deepEqual(run,before);
  assert.equal(audit.schema,VERSION);
  assert.equal(audit.sourceOriginalCount,29);
  assert.equal(audit.sourceInputProvenanceReceipts.length,2);
  assert.equal(audit.sourceOpeningPairs.length,1);
  assert.equal(audit.sourceOpeningPairs[0].physicalPairObserved,true);
  assert.equal(audit.sourceOpeningPairs[0].sourceOpeningStatus,
    'MATCHED_INITIAL_SOURCE_AND_STARTER');
  assert.equal(audit.allNativeSourceArtRowsCovered,true);
  assert.ok(audit.sourceInputProvenanceReceipts.every(r=>
    r.originalSourceProvenance.native_physical_deal_match==='observed-match'));
  assert.equal(audit.competitiveQualifiedGames,0);
});

test('different source physical setup is explicitly unpaired even with same seed',()=>{
  const {run,plans}=fixture(digestA,digestB);
  const audit=auditBilateralOriginalSourceArt(run,source,plans);
  assert.equal(audit.sourceOpeningPairs[0].sourceOpeningStatus,
    'UNPAIRED_SOURCE_DEAL');
  assert.ok(audit.sourceInputProvenanceReceipts.every(r=>
    r.originalSourceProvenance.native_physical_deal_match==='observed-mismatch'));
  assert.equal(audit.sourceOpeningPairs[0].physicalPairObserved,true);
});

test('no physical digest leaves physical equality unknown without asserting match',()=>{
  const {run,plans}=fixture(null,digestA);
  const audit=auditBilateralOriginalSourceArt(run,source,plans);
  assert.equal(audit.sourceOpeningPairs[0].sourcePhysicalStatus,'UNKNOWN');
  assert.equal(audit.sourceOpeningPairs[0].physicalPairObserved,false);
  assert.equal(audit.sourceInputProvenanceReceipts[0]
    .originalSourceProvenance.native_physical_deal_match,'not-compared');
  assert.equal(audit.officialPaperClockCertified,false);
});

test('advertised matched source pair cannot override genuinely different deals',()=>{
  const {run,plans}=fixture(digestA,digestB);
  run.sourcePairs[0].sourceDealStatus='MATCHED';
  assert.throws(()=>auditBilateralOriginalSourceArt(run,source,plans),
    /Expected values/u);
});

test('each pair must have both authentic fixed candidate arms and actual plan',()=>{
  const {run,plans}=fixture();
  run.rows.splice(0,1);
  assert.throws(()=>auditBilateralOriginalSourceArt(run,source,plans),
    /exactly two/u);
  const bad=fixture();
  bad.plans.delete('new-moon-lockbreaker-v1');
  assert.throws(()=>auditBilateralOriginalSourceArt(
    bad.run,source,bad.plans),/Missing actual resolver plan/u);
});

test('unknown source rank and duplicate ids are vetoed',()=>{
  const bad=fixture();
  bad.run.rows[0].trial.rank=23;
  assert.throws(()=>auditBilateralOriginalSourceArt(
    bad.run,source,bad.plans),/assertion|expression/u);
  const same=fixture();
  same.run.rows[1].trial.id=same.run.rows[0].trial.id;
  assert.throws(()=>auditBilateralOriginalSourceArt(
    same.run,source,same.plans),/Duplicate game-result trial/u);
});
