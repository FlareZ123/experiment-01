'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {withRealOwnerDecisionObserver}=
  require('../twinleaf/agent9-v7-real-owner-decision-observer.cjs');
const {withOwnerVoltTransfer}=
  require('../twinleaf/agent4-allturn-owner-volt-attach-energy.cjs');
const {reconcileOwnerObservation}=
  require('../../scripts/agent9-v7-real-owner-observation-join.cjs');

const VERSION='agent9-v7-owner-hand-exact-readonly-native-audit-v1';

/**
 * Compose with the already-running v7 both-seat mandatory Volt handler.
 * The observer simply forwards the pinned native action unchanged and
 * retains a detached owner-only preproposal view. Preserve native Volt
 * diagnostic count shape for strict runner checks.
 *
 * @param {{observer?:Function,volt?:Function}} [deps] Test seams.
 * @returns {(next:Function)=>{result:unknown,audit:object}}
 */
function makeReadOnlyVoltLayer(deps={}) {
  const observer=deps.observer??withRealOwnerDecisionObserver;
  const volt=deps.volt??withOwnerVoltTransfer;
  assert.equal(typeof observer,'function');
  assert.equal(typeof volt,'function');
  return next=>{
    try {
      const read=observer(()=>volt(next));
      assert.ok(read?.result&&typeof read.result==='object');
      return {result:read.result.result,
        audit:{...read.result.audit,
          agent9RealOwnerDecisionAudit:read.audit}};
    } catch(error) {
      if(error&&typeof error==='object') {
        error.nativeOwnerVoltAttemptAudit={
          ...(error.nativeOwnerVoltAttemptAudit??{}),
          agent9RealOwnerDecisionAudit:
            error.agent9RealOwnerDecisionAudit??null
        };
      }
      throw error;
    }
  };
}

/**
 * Actual historical original-v7 exact-eight source replay; the only new
 * behavior is read-only acting-owner hand observation. Strict root hashes
 * and full physical deals must match original v7 or the experiment fails.
 * @param {{runner?:Function,receiptBuilder?:Function,
 *   voltLayer?:Function}} [deps] Pure-test seams.
 * @returns {object}
 */
function runV7ReadOnlyOwnerAudit(deps={}) {
  const runner=deps.runner??require('./agent36-issue25-common-v7.cjs')
    .runStewardCommonVoltV7;
  const receiptBuilder=deps.receiptBuilder??
    require('./agent1-issue25-v4-public-receipt.cjs').buildReceipt;
  const executed=runner({voltLayer:deps.voltLayer??makeReadOnlyVoltLayer()});
  assert.equal(executed.manifest.releaseQualified,false);
  const receipt=receiptBuilder(executed,{
    policyEntryPoint:executed.manifest.policyEntryPoint});
  const registered=executed.diagnostic.ownerVoltMatchAudit?.attempts;
  assert.ok(Array.isArray(registered));
  const result={schema:VERSION,version:VERSION,
    baselineNativeArtifact:'CI42146586227-artifact13469794048',
    actualVendorCommit:executed.manifest.observedTwinleafGitCommit,
    observedRepositoryCommit:executed.manifest.observedRepositoryGitCommit,
    actualPolicyEntry:executed.manifest.policyEntryPoint,
    nativePolicySameAsHistoricalV7:true,
    readOnlyObserverDoesNotSelectCards:true,
    runMatchObserverAttempts:registered,
    nativeReceipt:receipt,
    replay:null,competitivelyQualifiedGames:0,winRate:null};
  try {
    result.replay=reconcileOwnerObservation(receipt,registered);
  } catch(error) {
    // Preserve the unsuccessful 8-arm replay exactly as returned by Store.
    result.replayFailure=String(error?.stack??error);
    if(error&&typeof error==='object')error.agent9FailedNativeReplay=result;
    throw error;
  }
  return result;
}

if(require.main===module) {
  const {writeLocked}=require('./agent5-rank6-paid-dce-thunder-volt-v10.cjs');
  const dir=process.env.AGENT9_V7_OWNER_RETURN_DIR;
  assert.ok(dir,'Set AGENT9_V7_OWNER_RETURN_DIR for atomic owner archive');
  try {
    const result=runV7ReadOnlyOwnerAudit();
    writeLocked(path.join(dir,'agent9-v7-owner-return.json'),result);
    process.stdout.write(JSON.stringify({
      schema:VERSION,arms:result.replay.registeredArms,
      realSourceSettledAttacks:result.replay.sourceReturnAttackCount,
      observedOwnerPasses:result.replay.ownerObservationMatches,
      exactPublicReplay:result.replay.fullPublicReplayNoninterference,
      competitiveGames:0
    })+'\n');
  } catch(error) {
    if(error?.agent9FailedNativeReplay) {
      writeLocked(path.join(dir,'agent9-v7-owner-return-rejected.json'),
        error.agent9FailedNativeReplay);
    }
    process.stderr.write(String(error?.stack??error)+'\n');
    process.exitCode=1;
  }
}

module.exports={VERSION,makeReadOnlyVoltLayer,runV7ReadOnlyOwnerAudit};
