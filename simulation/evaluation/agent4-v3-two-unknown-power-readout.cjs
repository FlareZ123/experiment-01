'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {preflight,effectiveOptions,withSameRuntime}=
  require('./agent4-selected-v3-paper-funded-release.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {withLiveUnknownPowerActionWitness,VERSION:OBSERVER_VERSION}=
  require('../twinleaf/agent39-live-unknown-power-action-witness.cjs');
const {writeAtomicLocked}=
  require('./agent20-frozen-rank6-canary-v1.cjs');
const REG=require('../../results/aichi-2026/registrations/agent4-v3-two-unknown-power-readout-20261106.json');

const VERSION='agent4-v3-two-context-live-store-unknown-power-readout-v1';

/**
 * Choose only the two preregistered historical original-60 contexts.
 * @param {object} manifest Validated original v3 manifest.
 * @returns {object[]} Immutable original trial descriptions.
 */
function selectedTrials(manifest){
  const trials=REG.contexts.map(target=>{
    const trial=manifest.registeredTrials.find(x=>x.id===target.id);
    assert.ok(trial,'Missing registered original v3 trial: '+target.id);
    for(const key of ['rank','repeat','candidateSlot','candidateId','seed'])
      assert.equal(trial[key],target[key],key+' drift for '+target.id);
    return trial;
  });
  assert.equal(trials.length,2);
  assert.equal(new Set(trials.map(x=>x.id)).size,2);
  return trials;
}

/**
 * Retain public/deidentified native failure provenance and actual typed Store
 * Ability action. Do not expose private cards to either acting policy.
 * @param {object} row Native row returned or abort-preserved by runner.
 * @param {object[]} actions All actual observer Ability events for this game.
 * @param {boolean} gameIndexReliable Observer saw exactly two live game Stores.
 * @returns {object}
 */
function summarize(row,actions,gameIndexReliable){
  const evidence=row.nativeAbortEvidence??{};
  return {
    id:row.trial?.id??row.id,
    status:row.status??null,
    nativeFinished:row.finished===true,
    originalFullPhysicalDealFingerprint:
      row.fullPhysicalDealFingerprint??null,
    originalSourceDealFingerprint:
      row.sourceDealFingerprint??evidence.sourceDealFingerprint??null,
    acceptedRootLedgerSha256:
      row.rootActionLedgerSha256??evidence.rootActionLedgerSha256??null,
    acceptedRootCount:Array.isArray(row.rootActionLedger)?
      row.rootActionLedger.length:null,
    abortStage:evidence.failureStage??null,
    abortedRootOrdinal:evidence.actionOrdinal??null,
    abortTurn:evidence.turnBefore??null,
    abortActingSeat:evidence.actingSeat??null,
    abortActionClass:evidence.actionName??null,
    nativeErrorClass:typeof row.error==='string'?
      row.error.split('\n')[0]:null,
    typedStoreAbilityAttributionReliable:gameIndexReliable,
    actualLiveStoreAbilityActions:gameIndexReliable?actions:[],
    rejectedUnknownPowerActions:gameIndexReliable?
      actions.filter(x=>x.rejection==='UNKNOWN_POWER'):[],
    independentPaperPaymentCertified:false,
    competitiveGameQualified:false
  };
}

/**
 * Six native attempts, with unchanged original v3 policy modes and
 * paper-source sixties. Override dependencies only for pure tests.
 * @param {{manifest?:Function,native?:Function,runtime?:Function,
 *   witness?:Function,witnessDeps?:object}} [deps]
 * @returns {object} Typed error diagnosis and source-preserving A/B/A.
 */
function run(deps={}){
  const manifest=(deps.manifest??preflight)();
  const trials=selectedTrials(manifest);
  assert.deepEqual(manifest.modes.map(x=>x.id),REG.modes);
  assert.equal(manifest.nativeActionCap,180);
  const native=deps.native??runDevelopment;
  const runtime=deps.runtime??withSameRuntime;
  const witness=deps.witness??withLiveUnknownPowerActionWitness;
  const modes=[];
  for(const mode of manifest.modes){
    const options={...effectiveOptions(manifest,mode),
      registeredTrials:trials};
    const observed=runtime(()=>witness(()=>native(options),
      deps.witnessDeps??{}));
    const result=observed.result;
    assert.equal(result.attempted,2);
    assert.deepEqual(result.rows.map(x=>x.trial?.id),trials.map(x=>x.id));
    const audit=observed.audit;
    const aligned=audit.liveGameCount===2;
    const rows=result.rows.map((row,i)=>summarize(row,
      audit.abilityActions.filter(x=>x.liveGameIndex===i),aligned));
    modes.push({
      modeId:mode.id,ownerTrainerCensus:mode.ownerGenericTrainerFrontier,
      fundedShadowRiderFloatStone:mode.actorFundedShadowRiderFloatStoneRoot,
      observedLiveStoreCount:audit.liveGameCount,
      typedActionObserver:OBSERVER_VERSION,
      liveGameIndexAttributionReliable:aligned,
      auxiliaryAbilityDispatchCount:audit.auxiliaryAbilityDispatchCount,
      nativeAttemptCount:rows.length,rows
    });
  }
  assert.equal(modes.length,3);
  const paired=trials.map((trial,i)=>{
    const all=modes.map(mode=>mode.rows[i]);
    const sameSource=all.every(x=>x.originalSourceDealFingerprint!==null&&
      JSON.stringify(x.originalSourceDealFingerprint)===
      JSON.stringify(all[0].originalSourceDealFingerprint));
    const sameFull=all.every(x=>x.originalFullPhysicalDealFingerprint!==null&&
      JSON.stringify(x.originalFullPhysicalDealFingerprint)===
      JSON.stringify(all[0].originalFullPhysicalDealFingerprint));
    const controlReproduced=all[0].status===all[2].status&&
      all[0].acceptedRootLedgerSha256!==null&&
      all[0].acceptedRootLedgerSha256===all[2].acceptedRootLedgerSha256;
    return {
      id:trial.id,sourceSeat:trial.candidateSlot==='A'?1:0,
      sourceFingerprintMatchedAllThree:sameSource,
      fullPhysicalDealMatchedAllThree:sameFull,
      aRepeatExactAcceptedPrefixAndDisposition:controlReproduced,
      unknownPowerRejectionsByMode:all.map(x=>
        x.rejectedUnknownPowerActions.length),
      nativeStatusesByMode:all.map(x=>x.status)
    };
  });
  return {
    schema:VERSION,registration:REG.schema,
    originalV3SourceManifestBlob:REG.sourceManifestGitBlob,
    originalPrintedSourceAndCandidateSixtiesUnchanged:true,
    originalHistoricalNativeCodeRevisionReproduced:false,
    observer:OBSERVER_VERSION,
    proposedNativeAttemptCount:6,actualNativeAttemptCount:
      modes.reduce((n,x)=>n+x.nativeAttemptCount,0),
    modes,paired,
    typedDiagnosisOnly:true,competitiveQualifiedGames:0,
    fieldWinRate:null
  };
}

if(require.main===module){
  const file=process.env.AGENT4_V3_UNKNOWN_POWER_OUTPUT;
  assert.ok(file,'Set output path for atomic forensic record');
  const output=run();
  const bytes=JSON.stringify(output,null,2)+'\n';
  fs.mkdirSync(path.dirname(file),{recursive:true});
  writeAtomicLocked(file,bytes);
  writeAtomicLocked(file+'.sha256',
    createHash('sha256').update(bytes).digest('hex')+
    '  '+path.basename(file)+'\n');
  process.stdout.write('AGENT4_TWO_UNKNOWN_POWER '+JSON.stringify({
    paired:output.paired,
    modes:output.modes.map(m=>({id:m.modeId,
      liveStores:m.observedLiveStoreCount,
      rejected:m.rows.map(r=>({id:r.id,status:r.status,
        unknownPower:r.rejectedUnknownPowerActions,
        abortOrdinal:r.abortedRootOrdinal,
        nativeErrorClass:r.nativeErrorClass}))})),
    competitiveQualifiedGames:0
  })+'\n');
}

module.exports={VERSION,selectedTrials,summarize,run};
