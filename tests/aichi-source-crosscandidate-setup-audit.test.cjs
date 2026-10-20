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
