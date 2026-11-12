'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {buildCaptureOnlyPolicyProvenance} =
  require('../../simulation/evaluation/2026-11/agent26-4410-capture-policy-provenance.cjs');
const {jsonSafe} = require('../../simulation/evaluation/2026-11/agent26-4410-capture-policy-provenance.cjs');

test('4410 preserves runtime and actor receipts without promoting incomplete closure', () => {
  const entryFile = require.resolve(
    '../../simulation/evaluation/2026-11/agent26-4410-capture-policy-provenance.cjs');
  const helperCacheEntry = require.cache[entryFile];
  const rootReceipt = {
    mewDceRecipientRootOptIn: true,
    mewDceRecipientRootOwnerSeat: 0,
    appliedToPhysicalSeat: 0
  };
  const cologneAudit = {
    accepted: 1,
    bySeat: {0: 1, 1: 0},
    duplicateAcceptedBySeatTurn: [],
    acceptedOncePerSeatTurn: true
  };
  const row = {
    trial: {id: '5:4410:B:new-moon-lockbreaker-v1'},
    candidateSeat: 1,
    actorOnlyPolicyVersion: 'actor-policy-v7',
    actorOnlyDecisionCoverage: {
      version: 'actor-policy-v7',
      selectedHandlerPriority: ['owner-root', 'common-resource', 'fallback'],
      componentVersions: {ownerRoot: 'v7', commonResource: 'v2'},
      ownerVipAfterPassOptIn: false,
      detailedComponentAudits: {root: rootReceipt}
    },
    paperCologneNativePlayAudit: cologneAudit
  };
  const development = {
    actorOnlyCompositionVersion: 'actor-policy-v7',
    actorOnlyCompositionOptIn: true,
    rows: [row]
  };
  const options = {
    actorMewDceRecipientSourceOnly: true,
    actorMewDceRecipientRoot: true,
    sourceScopedQuickBallRoot: true,
    actorMewUltraBallRoot: true
  };
  const result = buildCaptureOnlyPolicyProvenance({
    repositoryRoot: process.cwd(),
    entryFile,
    development,
    row,
    options,
    sourceSeat: 0,
    candidateSeat: 1,
    trialId: row.trial.id,
    candidateManifestBlobSha: 'b'.repeat(40),
    policyProfileBlobSha: 'c'.repeat(40),
    enginePin: 'd'.repeat(40),
    runnerConfig: {nativeRootActionLimit: 300, callbackBindings: {
      onRootStoreCreated: 'testObserver.onRootStoreCreated'
    }},
    hookActivationReceipts: {
      agent41PaperSupporterQuota: {optIn: true}
    },
    runtimeEvidenceReceipts: {
      agent4RawStateFallbackQuarantine: {rawStateFallbackCalls: 0},
      agent50OwnerPublicAcknowledgements: {confirmPromptDefaultEquivalent: true},
      agent36LivePaperRootReceipts: {acceptedStoreRootCount: 3},
      agent48CologneNativePlayAudit: cologneAudit
    },
    cacheEntries: [helperCacheEntry]
  });

  assert.equal(result.status, 'PARTIAL_CAPTURE_ONLY');
  assert.equal(result.schema, 'agent26-4410-capture-only-policy-provenance-v2');
  assert.deepEqual(result.runnerExecutionConfig, {nativeRootActionLimit: 300,
    callbackBindings: {onRootStoreCreated: 'testObserver.onRootStoreCreated'}});
  assert.deepEqual(result.runtimeEvidenceReceipts.agent48CologneNativePlayAudit,cologneAudit);
  assert.deepEqual(result.activatedHookManifest.observedActivationReceipts,
    {agent41PaperSupporterQuota:{optIn:true}});
  assert.deepEqual(result.effectiveSeatConfiguration[0].configuredPolicyOptions,options);
  assert.equal(result.runtimeLoadedCodeManifest.complete, true);
  assert.match(result.runtimeLoadedCodeSnapshotSha256, /^[0-9a-f]{64}$/);
  assert.equal(result.actorRuntimeClosure.policyStatus, 'OBSERVED_CLOSURE_CONSISTENT');
  assert.match(result.actorRuntimeClosure.observedModeClosureDigest, /^[0-9a-f]{64}$/);

  const source = result.effectiveSeatConfiguration[0].effectiveSeatOptions;
  const candidate = result.effectiveSeatConfiguration[1].effectiveSeatOptions;
  assert.equal(source.actorMewDceRecipientRoot, true);
  assert.equal(candidate.actorMewDceRecipientRoot, false);
  assert.equal(source.quickBallRoot, true);
  assert.equal(source.quickBallRootOwnerSeat, 0);
  assert.equal(candidate.quickBallRoot, false);
  assert.equal(candidate.quickBallRootOwnerSeat, null);
  assert.equal(candidate.actorMewUltraBallRoot, false);

  assert.deepEqual(result.mewDceRootApplicationReceipt, rootReceipt);
  assert.deepEqual(result.paperCologneNativePlayAudit, cologneAudit);
  assert.equal(result.activatedHookManifest.complete, false);
  assert.equal(result.policyEntryManifest.complete, false);
  assert.equal(result.policyManifest.complete, false);
  assert.match(result.policyManifestSha256, /^[0-9a-f]{64}$/);
  assert.equal(result.hookRevisionSha, null);
  assert.deepEqual(result.policySha256BySeat, [null, null]);
  assert.equal(result.samePolicy, false);
  assert.equal(result.competitivePolicyCompetenceReady, false);
  assert.match(result.policyProvenanceSha256, /^[0-9a-f]{64}$/);
});
test('policy provenance serializer rejects executable and non-JSON values',()=>{
  assert.throws(()=>jsonSafe({onRootStoreCreated:()=>{}}),
    /Unsupported provenance value.*function/);
  assert.throws(()=>jsonSafe({symbol:Symbol('callback')}),
    /Unsupported provenance value.*symbol/);
  assert.throws(()=>jsonSafe({bigint:1n}),
    /Unsupported provenance value.*bigint/);
  assert.deepEqual(jsonSafe({missing:undefined}),{missing:null},
    'Undefined optional fields are represented explicitly as null so raw capture survives');
  assert.throws(()=>jsonSafe({notFinite:Infinity}),
    /Non-finite provenance number/);
  assert.throws(()=>jsonSafe({date:new Date()}),
    /plain JSON object/);
  const symbolKeyed={};
  symbolKeyed[Symbol('metadata')]=true;
  assert.throws(()=>jsonSafe(symbolKeyed),/Symbol-keyed provenance property/);
  const accessor={};
  Object.defineProperty(accessor,'computed',{enumerable:true,get(){return true;}});
  assert.throws(()=>jsonSafe(accessor),/Accessor provenance property/);
  const cyclic={};
  cyclic.self=cyclic;
  assert.throws(()=>jsonSafe(cyclic),/Cyclic provenance value/);
  const sparse=[];
  sparse[1]='value';
  assert.throws(()=>jsonSafe(sparse),/Sparse provenance array/);
  const extended=[];
  extended.extra='value';
  assert.throws(()=>jsonSafe(extended),/Non-index provenance array property/);
});

