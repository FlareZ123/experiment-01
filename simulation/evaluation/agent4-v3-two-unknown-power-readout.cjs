'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {MANIFEST,MANIFEST_BLOB,effectiveOptions,withSameRuntime}=
  require('./agent4-selected-v3-paper-funded-release.cjs');
const {gitBlobHash}=
  require('./agent36-profile-provenance-gate.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {withLiveUnknownPowerActionWitness,VERSION:OBSERVER_VERSION}=
  require('../twinleaf/agent39-live-unknown-power-action-witness.cjs');
const {writeAtomicLocked}=
  require('./agent20-frozen-rank6-canary-v1.cjs');
const REG=require('../../results/aichi-2026/registrations/agent4-v3-two-unknown-power-readout-20261106.json');

const REG2=require('../../results/aichi-2026/registrations/agent4-v3-two-unknown-power-native-12-20261106.json');
const VERSION='agent4-v3-two-context-paired-candidate-live-store-readout-v2';
/**
 * Reuse the immutable original manifest and current printed source 60s.
 * Changed current code is explicitly versioned and reported. Never relabel
 * a contemporary-code reproduction as the historic frozen-v3 release.
 * @returns {{manifest:object,audit:object}}
 */
function manifestWithDriftAudit(){
  const root=path.resolve(__dirname,'../..');
  const bytes=fs.readFileSync(path.join(root,MANIFEST));
  assert.equal(gitBlobHash(bytes),MANIFEST_BLOB,
    'Historical v3 manifest itself has changed');
  const manifest=JSON.parse(bytes.toString('utf8'));
  assert.equal(manifest.pinnedTwinleafRevision,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(manifest.nativeActionCap,180);
  const keys=[
    ['sourceRunner','sourceRunnerBlobSha'],
    ['sourceRoster','sourceRosterBlobSha'],
    ['baselineProfile','baselineProfileBlobSha'],
    ['fundedFloatStoneSource','fundedFloatStoneBlobSha'],
    ['paperOwnerNecessary','paperOwnerNecessaryBlobSha'],
    ['canonicalActorComposition','canonicalActorCompositionBlobSha']
  ];
  const files=keys.map(([p,h])=>{
    const filename=manifest.frozenInputs[p];
    const expected=manifest.frozenInputs[h];
    const actual=gitBlobHash(fs.readFileSync(path.join(root,filename)));
    return {role:p,path:filename,expected,actual,matches:actual===expected};
  });
  assert.ok(files.find(x=>x.role==='sourceRoster')?.matches,
    'Exact historical printed original roster drift');
  assert.ok(files.find(x=>x.role==='baselineProfile')?.matches,
    'Exact historical baseline policy manifest drift');
  return {manifest,audit:{
    frozenHistoricalManifestBlob:MANIFEST_BLOB,
    sourceAndRosterVerified:true,
    currentFilesComparedWithFrozenHistoricalV3:files,
    everyFrozenInputMatches:files.every(x=>x.matches),
    historicalCodeParityNotAssumed:true
  }};
}


/**
 * Include each preregistered target and the mandatory same-seed companion.
 * @param {object} manifest Validated original v3 manifest.
 * @returns {object[]} Immutable original trial descriptions.
 */
function selectedTrials(manifest){
  const trials=[];
  for(const target of REG.contexts){
    const partnerId=target.id.replace(/:champion-reference$/,
      ':new-moon-lockbreaker-v1');
    for(const id of [target.id,partnerId]){
      const trial=manifest.registeredTrials.find(x=>x.id===id);
      assert.ok(trial,'Missing original v3 registered trial: '+id);
      for(const key of ['rank','repeat','candidateSlot','seed'])
        assert.equal(trial[key],target[key],key+' drift for '+id);
      assert.equal(trial.id,id);
      trials.push(trial);
    }
  }
  assert.equal(trials.length,REG2.registeredPerMode);
  assert.equal(new Set(trials.map(x=>x.id)).size,4);
  assert.deepEqual(trials.filter(x=>x.candidateId==='new-moon-lockbreaker-v1')
    .map(x=>x.id),REG2.companionIDs);
  return trials;
}

/**
 * Retain public/deidentified native failure provenance and actual typed Store
 * Ability action. Do not expose private cards to either acting policy.
 * @param {object} row Native row returned or abort-preserved by runner.
 * @param {object[]} actions All actual observer Ability events for this game.
 * @param {boolean} gameIndexReliable Observer saw four live game Stores.
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
 * Twelve native attempts, with unchanged original v3 policy modes and
 * paper-source sixties. Override dependencies only for pure tests.
 * @param {{manifest?:Function,native?:Function,runtime?:Function,
 *   witness?:Function,witnessDeps?:object}} [deps]
 * @returns {object} Typed error diagnosis and source-preserving A/B/A.
 */
function run(deps={}){
  const checked=deps.manifest?{
    manifest:deps.manifest(),
    audit:{injectedSyntheticManifest:true,everyFrozenInputMatches:false}
  }:manifestWithDriftAudit();
  const manifest=checked.manifest;
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
    assert.equal(result.attempted,REG2.registeredPerMode);
    assert.deepEqual(result.rows.map(x=>x.trial?.id),trials.map(x=>x.id));
    const audit=observed.audit;
    const aligned=audit.liveGameCount===REG2.registeredPerMode;
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
    schema:VERSION,registration:REG2.schema,
    previousSixAttemptRegistration:REG.schema,
    originalV3SourceManifestBlob:REG.sourceManifestGitBlob,
    originalPrintedSourceAndCandidateSixtiesUnchanged:true,
    originalHistoricalNativeCodeRevisionReproduced:
      checked.audit.everyFrozenInputMatches===true,
    provenanceDriftAudit:checked.audit,
    observer:OBSERVER_VERSION,
    proposedNativeAttemptCount:REG2.plannedNativeAttempts,
    actualNativeAttemptCount:
      modes.reduce((n,x)=>n+x.nativeAttemptCount,0),
    modes,paired,
    registeredOriginalAbortTargets:REG2.originalTargetTrialIDs,
    exactOriginalSourceSeedPairsMaintained:true,
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

module.exports={VERSION,manifestWithDriftAudit,selectedTrials,summarize,run};
