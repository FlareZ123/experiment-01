'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {withMode,writeAtomicLocked}=
  require('./agent23-selected-joint-v2-release.cjs');
const {withLiveUnknownPowerActionWitness,VERSION}=
  require('../twinleaf/agent39-live-unknown-power-action-witness.cjs');

const PROFILE=path.resolve(__dirname,'agent23-selected-joint-v2-manifest.json');
const ARCHIVED_SOURCE_SHA='1180bb8d34c5364ce202e23f94eebc5e3c0d83381b85bc2991ba1e002f70a0a7';
const ARCHIVED_PREFIX_SHA='75c90e10e1178b30a2579cfa689498b4f3e6a65389883ed615662fadec8edf97';

/** @returns {object} Historic selected source rank6 pair without changing 60s. */
function selectedOriginalRank6Plan(){
  const bytes=fs.readFileSync(PROFILE);
  const manifest=JSON.parse(bytes.toString('utf8'));
  const trials=manifest.registeredTrials.filter(x=>
    x.rank===6&&x.repeat===300&&x.candidateSlot==='A');
  assert.deepEqual(trials.map(x=>x.candidateId),[
    'champion-reference','new-moon-lockbreaker-v1']);
  for(const trial of trials){
    assert.equal(trial.seed,3738819225);
    assert.equal(trial.rank,6);
    assert.equal(trial.candidateSlot,'A');
  }
  assert.equal(manifest.enginePin,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  return {manifest,trials,
    manifestSha256:createHash('sha256').update(bytes).digest('hex')};
}

/**
 * Observe the old aborted exact source-seed context with CURRENT code.
 * A changed codebase might diverge from historical action prefix: explicitly
 * report equality as evidence rather than calling this a verbatim replay.
 *
 * @param {(options:object)=>object} [runDevelopment] Inject in pure tests.
 * @param {{Store?:Function}} [deps] Actual Store is loaded from pinned output.
 */
function runTypedRank6Forensic(runDevelopment=
  require('./agent41-bilateral-v2-development.cjs').runDevelopment,deps={}){
  const {manifest,trials,manifestSha256}=selectedOriginalRank6Plan();
  const modes=[];
  for(const mode of manifest.modes){
    const observed=withMode(mode.ownerVipAfterPass,()=>
      withLiveUnknownPowerActionWitness(()=>runDevelopment({
        ...manifest.policyOptions,
        registeredTrials:trials,
        registeredFrameName:'agent23-selected-joint-v2-'+mode.id
      }),deps));
    const native=observed.result;
    assert.equal(native.rows.length,2);
    assert.deepEqual(native.rows.map(x=>x.trial.id),
      trials.map(x=>x.id));
    const rows=native.rows.map((row,i)=>{
      const abort=row.nativeAbortEvidence??null;
      const rejectedAbility=observed.audit.abilityActions.filter(x=>
        x.liveGameIndex===i&&x.rejection==='UNKNOWN_POWER');
      const sourceDeal=abort?.sourceDealFingerprint?.digestSha256??null;
      const prefix=abort?.rootActionLedgerSha256??null;
      return {
        trialId:row.trial.id,sourceSeat:1,
        nativeStatus:row.status,gameCompleted:row.finished===true,
        actionCount:row.actionCount??null,
        nativeErrorClass:String(row.error??'').split('\n')[0],
        nativeAbortAction:abort?.actionName??null,
        nativeAbortOrdinal:abort?.actionOrdinal??null,
        nativeAbortTurn:abort?.turnBefore??null,
        originalSourcePhysicalDealSha256:sourceDeal,
        sourceDealMatchesArchivedAbort:sourceDeal===ARCHIVED_SOURCE_SHA,
        prefixRootLedgerSha256:prefix,
        acceptedPrefixMatchesArchivedAbort:prefix===ARCHIVED_PREFIX_SHA,
        typedRejectedAbilityActions:rejectedAbility,
        allObservedLiveAbilityActions:observed.audit.abilityActions
          .filter(x=>x.liveGameIndex===i),
        competitiveQualifiedGames:0
      };
    });
    modes.push({
      modeId:mode.id,ownerVipAfterPass:mode.ownerVipAfterPass,
      liveStoreObserver:observed.audit.schema,
      liveStoreGameCount:observed.audit.liveGameCount,
      auxiliaryAbilityDispatchCount:
        observed.audit.auxiliaryAbilityDispatchCount,
      rows
    });
  }
  return {
    schema:'agent39-original-rank6-typed-native-unknown-power-v1',
    selectedHistoricalManifestContentSha256:manifestSha256,
    historicRegisteredContextCount:trials.length,
    historicAichiSourceRank:6,
    candidateListChanges:0,
    simulatorPin:manifest.enginePin,
    observerVersion:VERSION,
    observedNativeAttempts:4,
    archivedAbortComparison:{
      rootSha256:ARCHIVED_PREFIX_SHA,
      originalSourceDealSha256:ARCHIVED_SOURCE_SHA,
      sameCodeRevisionAsArchivedRelease:false
    },
    modes,
    allFourGamesClaimedCompetitivelyQualified:false,
    competitiveQualifiedGames:0
  };
}

if(require.main===module){
  const result=runTypedRank6Forensic();
  writeAtomicLocked('agent39-rank6-original-unknown-power-native.json',result);
  process.stdout.write('AGENT39_TYPED_UNKNOWN_POWER '+
    JSON.stringify({
      schema:result.schema,
      archivedMatchModes:result.modes.map(m=>({
        modeId:m.modeId,
        rows:m.rows.map(x=>({
          id:x.trialId,sourceMatch:x.sourceDealMatchesArchivedAbort,
          prefixMatch:x.acceptedPrefixMatchesArchivedAbort,
          typedRejected:x.typedRejectedAbilityActions,
          status:x.nativeStatus
        }))
      })),
      competitiveQualifiedGames:0
    })+'\n');
}
module.exports={selectedOriginalRank6Plan,runTypedRank6Forensic};
