'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {auditOriginalSourceContestArchive}=
  require('../scripts/agent25-source32-contest-example-fidelity.cjs');

/**
 * Synthetic 32-arm archive: eight rank6 and eight rank11 physical comparisons.
 * The counterexample reproduces the causal structure of the original v1
 * observed sample truncation, without copying uncommitted raw native hands.
 */
function fakeArchive(){
  const rows=[];
  for(const rank of [6,11]){
    for(const seat of ['A','B']){
      for(let repeat=0;repeat<4;repeat++){
        for(const candidate of ['champion-reference','new-moon-lockbreaker-v1']){
          rows.push({
            id:`${rank}:${repeat}:${seat}:${candidate}`,
            rank,sourceSeat:seat==='A'?1:0,
            sourceDealFingerprint:`${rank}-${repeat}-${seat}`,
            ownerAuditStatus:'actual-original-store',
            sourceOwnerRoots:10,
            bothHeldSourceRoots:0,bothNativePlayableSourceRoots:0,
            auditSamplesMayBeTruncated:false,sourceExamples:[]
          });
        }
      }
    }
  }
  return {
    frozenBeforeThisObserver:true,sourceOwnerReadOnly:true,
    sameRootNativeDispatchCounterfactual:false,competitiveQualifiedGames:0,
    rows
  };
}

test('complete two-seat original schedule is uniquely keyed and paired',()=>{
  const r=auditOriginalSourceContestArchive(fakeArchive());
  assert.equal(r.numberOfOriginalGames,32);
  assert.equal(r.unchangedSourceCandidatePairs,16);
  assert.equal(r.sourceDealsIdenticalAcrossPairCount,16);
  assert.equal(r.rank6PositiveOriginalArms,0);
  assert.equal(r.medianFirstSampledPositiveWitnessGlobalTurn,null);
  assert.equal(r.competitiveQualifiedGames,0);
});

test('detects missing positive witnesses and misleading per-arm complete flag',()=>{
  const a=fakeArchive();
  const row=a.rows.find(r=>r.id==='6:3:A:champion-reference');
  row.bothHeldSourceRoots=30;
  row.bothNativePlayableSourceRoots=22;
  row.sourceExamples=Array.from({length:8},(_,i)=>({
    paperScreenedBothPlayable:false,turn:2*i+2,
    ownerRootOrdinal:i+1
  }));
  const result=auditOriginalSourceContestArchive(a);
  assert.deepEqual(result.rank6PositiveArmsWithoutAnyBoundedNativePlayableWitness
    .map(v=>v.id),[row.id]);
  assert.deepEqual(result.perArmFalseSampleCompletenessClaims.map(v=>v.id),
    [row.id]);
  assert.deepEqual(
    result.rank6PositiveArmsWithoutAnyBoundedNativePlayableWitness[0]
      .firstEightSampledTurns,[2,4,6,8,10,12,14,16]);
});

test('retains matched positive sample as a witness, never a full-turn census',()=>{
  const a=fakeArchive();
  const row=a.rows.find(r=>r.id==='6:0:B:new-moon-lockbreaker-v1');
  row.bothHeldSourceRoots=1;row.bothNativePlayableSourceRoots=1;
  row.sourceExamples=[{paperScreenedBothPlayable:true,turn:15,
    ownerRootOrdinal:10,paymentPairs:66}];
  const z=auditOriginalSourceContestArchive(a);
  assert.equal(z.firstNativePlayableBoundedWitnesses.length,1);
  assert.equal(z.medianFirstSampledPositiveWitnessGlobalTurn,15);
  assert.equal(z.firstNativePlayableBoundedWitnesses[0]
    .firstAvailableInBoundedSamplesPaymentPairs,66);
  assert.equal(z.perArmFalseSampleCompletenessClaims.length,0);
});

test('detects same-seed source-deal mismatch across candidate deck change',()=>{
  const a=fakeArchive();
  a.rows.find(r=>r.id==='6:3:B:new-moon-lockbreaker-v1')
    .sourceDealFingerprint='changed-after-opponent-open';
  const z=auditOriginalSourceContestArchive(a);
  assert.equal(z.sourceDealsIdenticalAcrossPairCount,15);
  assert.equal(z.sourceDealMismatches[0].pair,'6:3:B');
});

test('rejects duplicate row and absent game',()=>{
  const a=fakeArchive();
  a.rows[31]=a.rows[0];
  assert.throws(()=>auditOriginalSourceContestArchive(a),/duplicate original/);
  a.rows.pop();
  assert.throws(()=>auditOriginalSourceContestArchive(a),/32/);
});
