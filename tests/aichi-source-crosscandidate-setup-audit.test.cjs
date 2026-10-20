'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {auditCrossCandidateSourceZones}=
  require('../scripts/aichi-source-crosscandidate-setup-audit.cjs');

const ARMS=[
  ['champion-reference','source-row-order-v1'],
  ['hood-shield-v1','source-row-order-v1'],
  ['hood-shield-v1','reference-aligned-v1'],
  ['temple-v1','source-row-order-v1'],
  ['temple-v1','reference-aligned-v1']
];

/** @returns {object} */
function fixture(){
  return {
    schema:'aichi-actual-source-postsetup-paired-sampler-v1',
    status:'initial-setup-only-not-games',
    qualifiedCompetitiveGames:0,
    sourceAndCandidate60Unchanged:true,
    stopsBeforeNormalTurnDecisions:true,
    samples:ARMS.map(([candidateId,inputOrderProtocol])=>({
      rank:6,repeat:0,seed:20261020,physicalSlot:'A',
      candidateId,inputOrderProtocol,
      stoppedAtFirstTurn:true,openingInventoriesVerified:true,
      error:null,
      actualPostSetup:{opponentDigest:'a'.repeat(64),firstTurn:true}
    }))
  };
}

test('five source-dealt arrangements retain the same source post-setup zone',()=>{
  const result=auditCrossCandidateSourceZones(fixture());
  assert.deepEqual({
    blocks:result.setupBlocks,arms:result.setupArms,
    comparisons:result.comparisons,sourceSame:result.sameSourcePostsetup,
    sourceDifferent:result.differentSourcePostsetup,
    turnSame:result.sameActualFirstTurn
  },{blocks:1,arms:5,comparisons:4,sourceSame:4,sourceDifferent:0,
    turnSame:4});
  assert.deepEqual(result.byRank,[{
    rank:6,comparisons:4,sameSourcePostsetup:4,sameActualFirstTurn:4
  }]);
});

test('legitimate divergent source state is counted and disclosed, not erased',()=>{
  const archive=fixture();
  archive.samples[2].actualPostSetup.opponentDigest='b'.repeat(64);
  archive.samples[4].actualPostSetup.firstTurn=false;
  const result=auditCrossCandidateSourceZones(archive);
  assert.equal(result.sameSourcePostsetup,3);
  assert.equal(result.differentSourcePostsetup,1);
  assert.equal(result.sameActualFirstTurn,3);
  assert.deepEqual(result.mismatches.map(row=>row.inputOrderProtocol),
    ['reference-aligned-v1','reference-aligned-v1']);
  assert.deepEqual(result.mismatches.map(row=>row.candidateId),
    ['hood-shield-v1','temple-v1']);
});

test('duplicate, missing and invented arms fail closed',()=>{
  const duplicate=fixture();
  duplicate.samples.push(structuredClone(duplicate.samples[0]));
  assert.throws(()=>auditCrossCandidateSourceZones(duplicate),/Duplicate/);
  const missing=fixture();
  missing.samples.pop();
  assert.throws(()=>auditCrossCandidateSourceZones(missing),/Incomplete source setup block/);
  const invented=fixture();
  invented.samples[0].candidateId='newmoon';
  assert.throws(()=>auditCrossCandidateSourceZones(invented),/Unexpected frozen sample arm/);
});

test('unverified, altered and falsely certified source archives fail closed',()=>{
  const partial=fixture();
  partial.samples[1].openingInventoriesVerified=false;
  assert.throws(()=>auditCrossCandidateSourceZones(partial),/Incomplete or unverified/);
  const unknown=fixture();
  unknown.samples[1].actualPostSetup.opponentDigest=null;
  assert.throws(()=>auditCrossCandidateSourceZones(unknown),/Incomplete or unverified/);
  const certified=fixture();
  certified.qualifiedCompetitiveGames=1;
  assert.throws(()=>auditCrossCandidateSourceZones(certified),/uncertified setup-only/);
});

test('settled ordered-source mode compares the full physical source fingerprint',()=>{
  const archive=fixture();
  archive.schema='aichi-actual-source-ordered-deal-paired-sampler-v2';
  archive.orderedSourceAudit=true;
  for(const row of archive.samples){
    row.sourcePhysicalDealDigest='c'.repeat(64);
    row.sourcePhysicalDealSchema='initial-source-physical-position-sha256-v1';
  }
  const result=auditCrossCandidateSourceZones(archive);
  assert.equal(result.auditSchema,
    'frozen-cross-candidate-full-ordered-source-parity-v2');
  assert.equal(result.sameSourcePostsetup,4);
  assert.equal(result.sameOrderedSourceDeal,4);
  assert.equal(result.differentOrderedSourceDeal,0);
  assert.equal(result.mismatches.length,0);
  assert.deepEqual(result.byRank,[{
    rank:6,comparisons:4,sameSourcePostsetup:4,sameActualFirstTurn:4,
    sameOrderedSourceDeal:4
  }]);

  // Earlier source-zone equality cannot conceal a changed deck order.
  archive.samples[2].sourcePhysicalDealDigest='d'.repeat(64);
  const divergent=auditCrossCandidateSourceZones(archive);
  assert.equal(divergent.sameSourcePostsetup,4);
  assert.equal(divergent.sameOrderedSourceDeal,3);
  assert.equal(divergent.differentOrderedSourceDeal,1);
  assert.deepEqual(divergent.mismatches.map(row=>row.candidateId),
    ['hood-shield-v1']);
  assert.deepEqual(divergent.mismatches.map(row=>row.inputOrderProtocol),
    ['reference-aligned-v1']);
});

test('ordered-source mode requires settled typed fingerprint and explicit opt-in',()=>{
  const archive=fixture();
  archive.schema='aichi-actual-source-ordered-deal-paired-sampler-v2';
  archive.orderedSourceAudit=true;
  for(const row of archive.samples){
    row.sourcePhysicalDealDigest='a'.repeat(64);
    row.sourcePhysicalDealSchema='initial-source-physical-position-sha256-v1';
  }
  archive.samples[0].sourcePhysicalDealDigest=null;
  assert.throws(()=>auditCrossCandidateSourceZones(archive),
    /Incomplete or unverified/);
  archive.samples[0].sourcePhysicalDealDigest='a'.repeat(64);
  archive.samples[0].sourcePhysicalDealSchema='premature-turn1-v1';
  assert.throws(()=>auditCrossCandidateSourceZones(archive),
    /Incomplete or unverified/);
  archive.samples[0].sourcePhysicalDealSchema=
    'initial-source-physical-position-sha256-v1';
  archive.orderedSourceAudit=false;
  assert.throws(()=>auditCrossCandidateSourceZones(archive),
    /uncertified setup-only/);
});
