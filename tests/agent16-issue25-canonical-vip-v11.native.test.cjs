'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {createHash}=require('node:crypto');
const {runCanonicalVipIssue25V11}=
  require('../simulation/evaluation/agent16-issue25-canonical-vip-v11.cjs');
const {saveResult}=
  require('../simulation/twinleaf/agent3-rank26-compressor-settlement-prospective-v2.cjs');
const precommitted=require('../results/aichi-2026/registrations/agent16-issue25-v6-vip-after-pass-same-physical-20261104.json');

const sha256=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

test('same eight frozen v6 Store games, now with symmetric canonical inner owner Battle VIP Pass after Pass, remain fully archived',()=>{
  assert.equal(precommitted.referenceAttempts.length,8);
  const executed=runCanonicalVipIssue25V11();
  const {manifest,diagnostic,rawDevelopment}=executed;
  const reference=new Map(precommitted.referenceAttempts.map(row=>[row.id,row]));
  const rawRows=rawDevelopment?.rows??[];
  const byId=new Map(rawRows.map(row=>[row.trial?.id??row.id,row]));
  const rows=diagnostic.attemptedRows.map(row=>{
    const baseline=reference.get(row.id);
    const raw=byId.get(row.id)??null;
    const publicRoots=raw?.rootActionLedger??raw?.nativePublicRootArchive?.rootActionLedger
      ??raw?.nativeAbortEvidence?.rootActionLedger??null;
    return {
      id:row.id,
      actualSourceSeat:row.originalSourceSeat??row.nativeAbortProvenance?.sourceSeat??null,
      candidateSeat:row.candidateSeat??null,
      actualStarterSeat:row.actualStarterSeat??null,
      verifiedFirstTurn:row.verifiedFirstTurn===true,
      status:row.status,
      nativeRootCount:row.nativeRootActionCount,
      sourceDealFingerprint:row.sourceDealFingerprint,
      fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint,
      referenceSourceDealFingerprint:baseline?.sourceDealFingerprint??null,
      sourceDealMatchedArchivedV6:baseline?.sourceDealFingerprint===row.sourceDealFingerprint,
      referenceFullPhysicalDealFingerprint:baseline?.fullPhysicalDealFingerprint??null,
      fullPhysicalMatchedArchivedV6:baseline?.fullPhysicalDealFingerprint===row.fullPhysicalDealFingerprint,
      publicRootCount:Array.isArray(publicRoots)?publicRoots.length:null,
      publicRootSha256:Array.isArray(publicRoots)?sha256(publicRoots):null,
      publicRootActions:publicRoots,
      finished:row.finished===true,
      errorStage:row.nativeAbortProvenance?.failureStage??
        raw?.nativeAbortEvidence?.failureStage??null,
      firstLivePrivateHandRecordedInternally:
        raw?.sourceFirstOwnHandProtocol==='first-live-owner-hand-prebot-v1',
      firstLivePrivateHandDigestPublished:false,
      competitiveQualifiedGames:0
    };
  });
  const output={
    innerPolicyVipSummary:diagnostic.policyOwnerVipRows,
    innerPolicyVipAuditsReturned:diagnostic.nativeOwnerVipAuditsReturned,
    innerPolicyObservedPassRoots:diagnostic.observedCanonicalPassFallthroughRoots,
    innerPolicyAcceptedVipItems:diagnostic.observedAcceptedVipItems,
    innerPolicyAcceptedVipSearches:diagnostic.observedAcceptedVipSearches,
    schema:'agent16-v11-vip-after-pass-v6-preregistered-retrospective-development-native-v1',
    policyVersion:manifest.version,
    upstreamPinnedTwinleaf:manifest.observedTwinleafGitCommit,
    actualRepoCommit:manifest.observedRepositoryGitCommit,
    sourceControlRun:precommitted.sourceControlRun,
    sourceControlArtifact:precommitted.sourceControlArtifactId,
    sourceControlRawSha256:precommitted.sourceControlRawSha256,
    registrationReconciled:diagnostic.registeredAttemptReconciliation?.exactUniqueMatch===true,
    sourceIndependentActorBase:manifest.actualRunnerConfirmedOption===true,
    onlyNewBehavior:manifest.onlyBehavioralIntervention,
    selectedOwnerVipAfterPassObserved:
      diagnostic.sourceIndependentOwnerVipAfterPassObserved,
    ownerVipAfterPassSummary:diagnostic.ownerVipAfterPassSummary,
    allEightArchived:rows.length===8,
    sourceDealMatchCount:rows.filter(r=>r.sourceDealMatchedArchivedV6).length,
    fullPhysicalDealMatchCount:rows.filter(r=>r.fullPhysicalMatchedArchivedV6).length,
    nativeErrorCount:rows.filter(r=>r.status==='engine-error').length,
    nativeFinishedCount:rows.filter(r=>r.finished).length,
    winnerQualificationStatus:'NONE-PAPER-VERIFIED',
    competitivelyQualifiedGames:0,
    comparisonIsRetrospective:true,
    rows
  };
  const file=process.env.AGENT16_ISSUE25_CANONICAL_VIP_RECEIPT;
  if(file)saveResult(file,output);
  console.log('AGENT16_ISSUE25_V11_VIP',JSON.stringify({
    registered:rows.length,
    sourceDealMatch:output.sourceDealMatchCount,
    fullDealMatch:output.fullPhysicalDealMatchCount,
    originalErrors:output.nativeErrorCount,
    nativeFinished:output.nativeFinishedCount,
    canonicalVip:output.innerPolicyVipSummary,
    acceptedItems:output.innerPolicyAcceptedVipItems,
    originalPassRoots:output.innerPolicyObservedPassRoots,
    qualified:0
  }));
  assert.equal(manifest.developmentTrialCount,8);
  assert.equal(manifest.releaseQualified,false);
  assert.equal(diagnostic.registered.length,8);
  assert.deepEqual(diagnostic.registered,[...reference.keys()]);
  assert.equal(rows.length,8);
  assert.equal(byId.size,8);
  assert.equal(output.sourceDealMatchCount,8);
  assert.equal(output.fullPhysicalDealMatchCount,8);
  assert.ok(output.innerPolicyVipAuditsReturned>=1,
    'Canonical inner VIP must record at least one original native arm');
  assert.ok(output.innerPolicyObservedPassRoots>0,
    'Native actor Pass must reach the inner VIP handler');
  assert.equal(diagnostic.registeredAttemptReconciliation.exactUniqueMatch,true);
  assert.equal(manifest.actualRunnerConfirmedOption,true);
  assert.equal(diagnostic.competitiveGamesQualified,0);
  assert.equal(output.competitivelyQualifiedGames,0);
});
