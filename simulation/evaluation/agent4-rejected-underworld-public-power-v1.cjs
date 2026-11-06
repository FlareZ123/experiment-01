'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {run:runOriginal,VERSION:ORIGINAL_VERSION}=
  require('./agent4-v3-two-unknown-power-readout.cjs');
const {withLiveUnknownPowerActionWitness}=
  require('../twinleaf/agent39-live-unknown-power-action-witness.cjs');
const {withRejectedUnderworldPublicLockWitness,VERSION:LOCK_VERSION}=
  require('../twinleaf/agent4-underworld-door-public-lock-witness.cjs');
const {writeAtomicLocked}=
  require('./agent20-frozen-rank6-canary-v1.cjs');
const REG=require('../../results/aichi-2026/registrations/agent4-underworld-public-lock-probe-v1-20261106.json');

const VERSION='agent4-rejected-underworld-door-public-native-power-check-v1';

/**
 * Keep the typed native error observer and add a passive public pre-action
 * snapshot with the pinned native PowerEffect predicate probed only AFTER
 * the underlying native dispatch has rejected the owner's attempted action.
 *
 * @template T
 * @param {()=>T} work
 * @param {{typed?:Function,publicLock?:Function}} [deps]
 */
function withCombinedUnderworldWitness(work,deps={}){
  const typed=deps.typed??withLiveUnknownPowerActionWitness;
  const lock=deps.publicLock??withRejectedUnderworldPublicLockWitness;
  const observed=lock(()=>typed(work));
  assert.ok(observed?.result?.audit&&observed?.audit);
  return {
    result:observed.result.result,
    audit:{...observed.result.audit,
      nativeUnderworldRejectionAudit:observed.audit}
  };
}

/**
 * Run all twelve frozen-seed source/candidate attempts with diagnostic-only
 * hooks. Keep failed attempts and evidence of a negative power check.
 * @param {{runner?:Function,witness?:Function}} [deps]
 * @returns {object}
 */
function run(deps={}){
  const witness=deps.witness??withCombinedUnderworldWitness;
  const original=(deps.runner??runOriginal)({witness});
  const full=original.modes??[];
  const targetRows=full.flatMap(mode=>REG.exactOriginalTargetIDs.map(id=>({
    modeId:mode.modeId,id,
    row:mode.rows.find(r=>r.id===id)??null
  })));
  const powerChecks=targetRows.map(({modeId,id,row})=>({
    modeId,id,
    nativeStatus:row?.status??null,
    rejectedUnderworldTyped:row?.rejectedUnknownPowerActions?.filter(a=>
      a.name==='Underworld Door'&&a.rejection==='UNKNOWN_POWER').length??0,
    rejectedPublicLockWitnesses:
      row?.publicLockWitnessAtActualRejectedPower??[],
    sourcePhysicalDeal:
      row?.originalSourceDealFingerprint??null,
    completePhysicalDeal:
      row?.originalFullPhysicalDealFingerprint??null
  }));
  const gates={
    exactTwelveAttempts:original.actualNativeAttemptCount===
      REG.expectedNativeAttempts,
    allFourRealStoresPerMode:full.length===3&&full.every(mode=>
      mode.observedLiveStoreCount===4&&
      mode.nativeUnderworldRejectionAudit?.liveGameCount===4),
    allSixNamedTypedNativeRejections:powerChecks.length===6&&
      powerChecks.every(row=>row.rejectedUnderworldTyped===1),
    allSixPublicPostRejectPowerReceipts:powerChecks.length===6&&
      powerChecks.every(row=>row.rejectedPublicLockWitnesses.length===1),
    allFourInitialDealsComparable:original.paired.length===4&&
      original.paired.every(x=>x.sourceFingerprintMatchedAllThree&&
        x.fullPhysicalDealMatchedAllThree),
    controlsExact:original.paired.every(x=>
      x.aRepeatExactAcceptedPrefixAndDisposition)
  };
  const allChecks=powerChecks.flatMap(row=>
    row.rejectedPublicLockWitnesses.map(event=>({
      modeId:row.modeId,id:row.id,
      opposingActiveIronThornsEx:
        event.preDispatchPublicContext.opposingActiveIronThornsEx,
      opposingActive:
        event.preDispatchPublicContext.opposingActive,
      opposingActivePowers:
        event.preDispatchPublicContext.opposingActivePowerNames,
      ownerUnderworldSources:
        event.preDispatchPublicContext.actingUnderworldSources,
      actualPrintedPowerBlockChecks:
        event.postRejectionSpecificNativePowerChecks,
      everyOwnerUnderworldPowerBlocked:
        event.allPrintedUnderworldPowersBlocked
    })));
  return {
    schema:VERSION,registration:REG.schema,
    baselineTypedObserver:ORIGINAL_VERSION,
    addedPostRejectWitness:LOCK_VERSION,
    retainedOriginalSourceAndCandidatePrintings:true,
    realStoreEffectWasCheckedOnlyAfterRejection:true,
    gates,allNamedRejectionPublicNativePowerChecks:allChecks,
    pairedOriginalSourceComparisons:original.paired,
    allNativeAttempts:original,
    provenUniquePaperCause:false,
    qualifiedCompetitiveGames:0,winRate:null
  };
}

if(require.main===module){
  const file=process.env.AGENT4_UNDERWORLD_POWER_OUTPUT;
  assert.ok(file,'Require atomic native power observer output filename');
  const result=run(),bytes=JSON.stringify(result,null,2)+'\n';
  fs.mkdirSync(path.dirname(file),{recursive:true});
  writeAtomicLocked(file,bytes);
  writeAtomicLocked(file+'.sha256',
    createHash('sha256').update(bytes).digest('hex')+
      '  '+path.basename(file)+'\n');
  process.stdout.write('AGENT4_UNDERWORLD_NATIVE_POWER '+JSON.stringify({
    gates:result.gates,
    checks:result.allNamedRejectionPublicNativePowerChecks,
    qualifiedGames:0
  })+'\n');
  if(!Object.values(result.gates).every(Boolean))process.exitCode=1;
}
module.exports={VERSION,withCombinedUnderworldWitness,run};
