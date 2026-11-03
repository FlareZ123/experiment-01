'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {auditMode,digest}=require('./agent3-observed-policy-closure.cjs');

const VERSION='agent4-selected-v3-independent-offline-native-attestation-v1';

/**
 * This is a strictly offline analyzer for the already-frozen, raw,
 * 48-attempt source artifact. No native Store or bot action is selected.
 *
 * @param {object} root Selected physical owner-paper frontier audit.
 * @returns {{decisionFrames:number,heldCopies:number,necessaryFailures:number,
 *   unresolvedCopies:number,blockerCounts:Record<string,number>}}
 */
function paperRootCensus(root){
  const out={
    decisionFrames:0,heldCopies:0,necessaryFailures:0,unresolvedCopies:0,
    blockerCounts:{}
  };
  if(root?.ownerPaperNecessityOptIn!==true)return out;
  assert.ok(Array.isArray(root.roots));
  for(const observed of root.roots){
    const screen=observed.ownerPaperNecessity;
    assert.ok(screen&&Array.isArray(screen.rows));
    out.decisionFrames++;
    out.heldCopies+=screen.heldTrainerCopies;
    out.necessaryFailures+=screen.provenNecessaryConditionFailures;
    out.unresolvedCopies+=screen.remainingUnresolvedCopies;
    for(const copy of screen.rows){
      for(const blocker of copy.necessaryBlockers??[]){
        const family=blocker.split(':',1)[0];
        out.blockerCounts[family]=(out.blockerCounts[family]??0)+1;
      }
    }
  }
  assert.equal(out.heldCopies,
    out.necessaryFailures+out.unresolvedCopies);
  return out;
}

/**
 * Return a deterministic forensic comparison for the genuine pinned-Store
 * aborts. Matching accepted preabort roots and source deals do not prove
 * the unobserved full initial deals.
 *
 * @param {object[]} rows Exactly three raw attempted trial rows.
 * @returns {{sameFailure:boolean,identity:object|null,fullPhysicalVerified:false}}
 */
function matchingAbortPrefix(rows){
  assert.equal(rows.length,3);
  const keys=rows.map(row=>{
    const e=row.nativeAbortEvidence;
    if(row.status!=='engine-error'||!e)return null;
    return {
      trialId:row.trial?.id??null,
      seed:row.trial?.seed??null,
      actionOrdinal:e.actionOrdinal??null,
      actionName:e.actionName??null,
      turnBefore:e.turnBefore??null,
      actingSeat:e.actingSeat??null,
      errorMessage:e.errorMessage??null,
      rootActionCount:e.rootActionCount??null,
      rootActionLedgerSha256:e.rootActionLedgerSha256??null,
      sourceDealSha256:e.sourceDealFingerprint?.digestSha256??null
    };
  });
  const complete=keys.every(x=>
    x&&typeof x.rootActionLedgerSha256==='string'&&
    typeof x.sourceDealSha256==='string'&&
    typeof x.actionName==='string'&&Number.isSafeInteger(x.actionOrdinal));
  return {
    sameFailure:complete&&keys.every(x=>digest(x)===digest(keys[0])),
    identity:complete?keys[0]:null,
    fullPhysicalVerified:false
  };
}

/**
 * Independently audit the preserved raw A/B/A archive. Every native failure
 * remains in the result denominator. Actor closure uses the already-published
 * Agent3 runtime version + ordered handlers + components + VIP environment.
 *
 * @param {object} archive Raw 48-attempt registration-bound archive.
 * @returns {object}
 */
function auditRelease(archive){
  assert.equal(archive.schema,
    'agent4-selected-v3-paper-owner-floatstone-source-a-b-a-v1');
  assert.equal(archive.manifestBlobSha,
    '5a6c877ceee571f2f48bfbba83d50c913d7da9b2');
  assert.equal(archive.pinnedEngineRevision,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(archive.modes.length,3);
  const [a,b,c]=archive.modes;
  assert.deepEqual(archive.modes.map(x=>x.id),[
    'corrected-bilateral-control-a',
    'selected-v3-paper-plus-funded-mobility',
    'corrected-bilateral-control-b'
  ]);
  assert.ok(archive.modes.every(mode=>mode.fullNative?.rows?.length===16));
  for(let i=0;i<16;i++)assert.equal(a.fullNative.rows[i].trial?.id,
    b.fullNative.rows[i].trial?.id);
  for(let i=0;i<16;i++)assert.equal(a.fullNative.rows[i].trial?.id,
    c.fullNative.rows[i].trial?.id);
  const attestedRuntime=archive.modes.map(mode=>auditMode(
    {id:mode.id,native:mode.fullNative},
    {manifestBlob:archive.manifestBlobSha,
      enginePin:archive.pinnedEngineRevision}
  ));
  const completed=[],abort=[];
  for(let i=0;i<16;i++){
    const records=archive.modes.map(mode=>mode.fullNative.rows[i]);
    const trial=records[0].trial;
    if(records.some(row=>row.status==='engine-error')){
      abort.push({
        trialId:trial.id,...matchingAbortPrefix(records),
        errorStates:records.map(row=>row.status??null)
      });
      continue;
    }
    const [control,selected,repeated]=records;
    const physicalDeals=records.map(row=>
      row.fullPhysicalDealFingerprint);
    const sourceDeals=records.map(row=>row.sourceDealFingerprint);
    const starts=records.map(row=>row.actualStarterSeat);
    const roots=records.map(row=>row.rootActionLedgerSha256);
    const physicalSame=physicalDeals.every(x=>
      typeof x==='string'&&x===physicalDeals[0])&&
      sourceDeals.every(x=>typeof x==='string'&&x===sourceDeals[0])&&
      starts.every(x=>x!=null&&x===starts[0]);
    const controlExact=roots[0]!=null&&roots[0]===roots[2]&&
      control.endReason===repeated.endReason&&
      control.finished===repeated.finished;
    const selectedExact=roots[0]!=null&&roots[0]===roots[1]&&
      control.endReason===selected.endReason&&
      control.finished===selected.finished;
    completed.push({
      trialId:trial.id,rank:trial.rank,candidateId:trial.candidateId,
      candidateSlot:trial.candidateSlot,
      fullInitialPhysicalMatched:physicalSame,
      twoControlNativeTracesIdentical:controlExact,
      selectedVsControlNativeTraceIdentical:selectedExact,
      gameEndReason:control.endReason??null,
      actualEngineGameEnded:control.finished===true
    });
  }
  const paper={
    decisionFrames:0,heldCopies:0,necessaryFailures:0,unresolvedCopies:0,
    blockerCounts:{}
  };
  for(const row of b.fullNative.rows){
    const census=paperRootCensus(row.actorOnlyDecisionCoverage?.
      ownerTrainerFrontierAudit);
    for(const key of ['decisionFrames','heldCopies','necessaryFailures',
      'unresolvedCopies'])paper[key]+=census[key];
    for(const [key,value] of Object.entries(census.blockerCounts))
      paper.blockerCounts[key]=(paper.blockerCounts[key]??0)+value;
  }
  const modeSummary=archive.modes.map((mode,i)=>({
    id:mode.id,
    nativeAttempts:mode.fullNative.rows.length,
    engineAborts:mode.fullNative.rows.filter(
      r=>r.status==='engine-error').length,
    gameEngineEnded:mode.fullNative.rows.filter(
      r=>r.finished===true).length,
    nativeActionCapped:mode.fullNative.rows.filter(
      r=>r.endReason==='action-limit').length,
    selectedFundedFloatStoneIntents:mode.rows.reduce(
      (n,r)=>n+(r.selectedFundedFloatStoneIntents??0),0),
    actualSourceFloatStoneCardPlays:mode.rows.reduce(
      (n,r)=>n+(r.sourceFloatStonePlays??0),0),
    runtimePolicyStatus:attestedRuntime[i].policyStatus,
    runtimeObservedRows:attestedRuntime[i].runtimeObservedRows,
    runtimeMissingRows:attestedRuntime[i].runtimeMissingRows,
    uniqueObservedRuntimeClosures:
      attestedRuntime[i].uniqueObservedClosures,
    runtimeObservedDigest:attestedRuntime[i].observedRuntimeDigest,
    vipEnvironmentObserved:
      attestedRuntime[i].observedClosures[0]?.closure
        ?.ownerVipAfterPassOptIn??null
  }));
  const fullPhysicalQualified=completed.length===16&&
    completed.every(x=>x.fullInitialPhysicalMatched);
  const controlReplayQualified=completed.length===16&&
    completed.every(x=>x.twoControlNativeTracesIdentical);
  const actingPolicyCompletelyObserved=
    attestedRuntime.every(x=>x.admittedWholeMode);
  const firstDifferingIntactRoot=completed.find(x=>
    !x.selectedVsControlNativeTraceIdentical)??null;
  const paperAuditAllAttemptedRoots=b.fullNative.rows.every(row=>
    row.actorOnlyDecisionCoverage?.ownerTrainerFrontierAudit
      ?.ownerPaperNecessityOptIn===true);
  return {
    schema:VERSION,
    archiveManifestSha:archive.manifestBlobSha,
    nativeTwinleafRevision:archive.pinnedEngineRevision,
    allAttempts:48,originalTrialContexts:16,
    originalSourceRanks:[1,5,6,11],
    identicalFullPhysicalAmongIntact:completed.filter(x=>
      x.fullInitialPhysicalMatched).length,
    intactRootComparisons:completed.length,
    exactSelectedAndControlIntactTraces:completed.filter(x=>
      x.selectedVsControlNativeTraceIdentical).length,
    exactControlRepeatIntactTraces:completed.filter(x=>
      x.twoControlNativeTracesIdentical).length,
    firstDifferingIntactRoot,
    abortsWithIdenticalSourceAndAcceptedTrace:abort.filter(x=>
      x.sameFailure).length,
    aborts:abort,
    paperCensus:paper,
    modes:modeSummary,
    runtimeClosures:attestedRuntime,
    paperAuditAllAttemptedRoots,
    releaseQualified:fullPhysicalQualified&&controlReplayQualified&&
      actingPolicyCompletelyObserved&&paperAuditAllAttemptedRoots,
    // A/B/A native replay is a policy comparison, never a gameplay win-rate.
    competitivePaperGamesQualified:0,
    paperFieldWinRate:null,
    finalFixedSixtySelected:false
  };
}

if(require.main===module){
  const filename=process.argv[2];
  assert.ok(typeof filename==='string'&&filename.length>0,
    'Pass an existing raw archived JSON path');
  const archive=JSON.parse(fs.readFileSync(filename,'utf8'));
  const a=auditRelease(archive);
  process.stdout.write('AGENT4_V3_OFFLINE_ATTESTATION '+
    JSON.stringify({
      complete:a.intactRootComparisons,
      fullInitialPhysical:a.identicalFullPhysicalAmongIntact,
      selectedTraceParity:a.exactSelectedAndControlIntactTraces,
      controlTraceParity:a.exactControlRepeatIntactTraces,
      identicalPreabort:a.abortsWithIdenticalSourceAndAcceptedTrace,
      runtime:a.modes.map(m=>({
        id:m.id,status:m.runtimePolicyStatus,
        digest:m.runtimeObservedDigest,missing:m.runtimeMissingRows,
        vip:m.vipEnvironmentObserved})),
      paper:a.paperCensus,releaseQualified:a.releaseQualified,
      competitivePaperGamesQualified:0
    })+'\n');
}

module.exports={VERSION,paperRootCensus,matchingAbortPrefix,auditRelease};
