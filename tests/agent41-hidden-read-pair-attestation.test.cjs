'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {compareNativeReadArchives,VERSION}=
  require('../simulation/evaluation/agent41-hidden-read-pair-attestation.cjs');

const ids=[
  '6:0:A:champion-reference','6:0:A:new-moon-lockbreaker-v1',
  '11:2:B:champion-reference','11:2:B:new-moon-lockbreaker-v1'
];

function fixture(){
  const base={
    enginePin:'a9905a76',candidatePolicy:'frozen-common-v0',
    nativeOpponentHiddenReadAuditOptIn:false,
    rows:ids.map((id,i)=>({
      trial:{id,seed:i+1,rank:i<2?6:11},
      actualStarterSeat:i<2?0:1,verifiedFirstTurn:true,
      sourceActuallyFirst:false,candidateSeat:i<2?0:1,
      sourceSeat:i<2?1:0,sourceDealFingerprint:'source-'+i,
      sourceFirstOwnHandSha256:'owner-'+i,
      rootActionLedgerSha256:'roots-'+i,actionCount:100,
      turns:17,attackDeclarations:{candidate:1,source:2},
      settledPublicAttackCount:2,firstSettledPublicAttack:[],
      finalPrizes:[6,4],finalBoard:{cards:10},finished:false,
      winner:null,endReason:'action-cap'
    }))
  };
  const instrumented=structuredClone(base);
  instrumented.nativeOpponentHiddenReadAuditOptIn=true;
  for(const row of instrumented.rows)row.nativeOpponentHiddenReadAudit={
    observedNativeRoot:true,
    nativeRootChangedDuringDecision:false,
    proposalReads:2,validationReads:5
  };
  return {base,instrumented};
}

test('identical physical four-arm playback certifies bounded read census only',()=>{
  const {base,instrumented}=fixture();
  const report=compareNativeReadArchives(base,instrumented);
  assert.equal(report.schema,VERSION);
  assert.equal(report.attempted,4);
  assert.equal(report.fullyNoninterferingNativeReadCensuses,4);
  assert.equal(report.completeNativeReadCensusQualified,true);
  assert.equal(report.actorInformationSetCertified,false);
  assert.equal(report.competitiveQualifiedGames,0);
  assert.ok(report.pairs.every(r=>r.sourceRootMatched&&
    r.fullPhysicalPlaybackMatched&&r.proposalReads===2));
});

test('one altered source root fails that arm and global certification',()=>{
  const {base,instrumented}=fixture();
  instrumented.rows[1].rootActionLedgerSha256='different-roots';
  const report=compareNativeReadArchives(base,instrumented);
  assert.equal(report.fullyNoninterferingNativeReadCensuses,3);
  assert.equal(report.completeNativeReadCensusQualified,false);
  assert.equal(report.pairs[1].status,'instrumentation-altered-physical-playback');
  assert.equal(report.pairs[1].sourceRootMatched,false);
});

test('no authentic native root cannot be upgraded from empty counters',()=>{
  const {base,instrumented}=fixture();
  instrumented.rows[0].nativeOpponentHiddenReadAudit.observedNativeRoot=false;
  instrumented.rows[0].nativeOpponentHiddenReadAudit.proposalReads=0;
  const report=compareNativeReadArchives(base,instrumented);
  assert.equal(report.pairs[0].status,'target-native-decision-unobserved');
  assert.equal(report.completeNativeReadCensusQualified,false);
});

test('both native engine errors or missing roots fail closed',()=>{
  const {base,instrumented}=fixture();
  for(const archive of [base,instrumented]) {
    archive.rows[2].status='engine-error';
    archive.rows[2].sourceDealFingerprint=null;
    archive.rows[2].rootActionLedgerSha256=null;
  }
  const report=compareNativeReadArchives(base,instrumented);
  assert.equal(report.pairs[2].status,
    'insufficient-native-deal-or-root-evidence');
  assert.equal(report.completeNativeReadCensusQualified,false);
});

test('real State mutation even with equal Store action transcript remains censored',()=>{
  const {base,instrumented}=fixture();
  instrumented.rows[3].nativeOpponentHiddenReadAudit
    .nativeRootChangedDuringDecision=true;
  const report=compareNativeReadArchives(base,instrumented);
  assert.equal(report.pairs[3].status,
    'original-state-mutated-during-observed-decision');
  assert.equal(report.completeNativeReadCensusQualified,false);
});

test('duplicate or missing trial arms reject archive',()=>{
  const {base,instrumented}=fixture();
  instrumented.rows[0].trial.id=instrumented.rows[1].trial.id;
  assert.throws(()=>compareNativeReadArchives(base,instrumented));
});
