'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {manifestWithDriftAudit}=
  require('./agent4-v3-two-unknown-power-readout.cjs');
const {effectiveOptions,withSameRuntime}=
  require('./agent4-selected-v3-paper-funded-release.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {withLiveUnknownPowerActionWitness}=
  require('../twinleaf/agent39-live-unknown-power-action-witness.cjs');
const {withPublicThornsUnderworldVeto}=
  require('../twinleaf/agent4-underworld-visible-thorns-veto.cjs');
const {writeAtomicLocked}=
  require('./agent20-frozen-rank6-canary-v1.cjs');
const REG=require('../../results/aichi-2026/registrations/agent4-rank6-underworld-visible-guard-holdout-16-v1-20261106.json');

const VERSION='agent4-independent-rank6-four-seed-paired-guard-holdout-v1';

/** @param {object} row @param {object[]} nativeTypedActions */
function auditRow(row,nativeTypedActions){
  const abort=row.nativeAbortEvidence??{};
  const nativeAccepted=Array.isArray(row.rootActionLedger)?
    row.rootActionLedger.length:abort.rootActionCount??null;
  return {
    id:row.trial?.id??null,
    status:row.status??null,
    nativeFinished:row.finished===true,
    nativeEndReason:row.endReason??null,
    nativeTurns:row.turns??null,
    acceptedNativeRoots:nativeAccepted,
    fullPhysicalDeal:row.fullPhysicalDealFingerprint??
      abort.fullPhysicalDealFingerprint??null,
    sourcePhysicalDeal:row.sourceDealFingerprint??
      abort.sourceDealFingerprint??null,
    nativeAbortAction:abort.actionName??null,
    nativeAbortTurn:abort.turnBefore??null,
    nativeAbortOrdinal:abort.actionOrdinal??null,
    typedUnderworldUnknownPowerRejections:
      nativeTypedActions.filter(x=>x.name==='Underworld Door'&&
        x.rejection==='UNKNOWN_POWER').length,
    nativeErrorPresent:row.status==='engine-error',
    paperQualifiedGame:false
  };
}

/**
 * One printed original rank6 60, exact two fixed candidate 60s, 4 independent
 * newly drawn seeds per arm; no post hoc seed selection or deck editing.
 * @param {{native?:Function,runtime?:Function,typed?:Function,
 *   guard?:Function,manifest?:Function}} [deps]
 */
function run(deps={}){
  const checked=(deps.manifest??manifestWithDriftAudit)();
  const manifest=checked.manifest;
  const mode=manifest.modes.find(m=>m.id===REG.policyMode);
  assert.ok(mode,'Registered selected v3 mode absent');
  assert.equal(manifest.nativeActionCap,REG.perGameNativeRootCap);
  const fresh=REG.predeclaredTrials;
  assert.equal(fresh.length,8);
  for(let i=0;i<fresh.length;i+=2){
    const [a,b]=fresh.slice(i,i+2);
    assert.equal(a.rank,6);
    assert.equal(a.candidateId,'champion-reference');
    assert.equal(b.candidateId,'new-moon-lockbreaker-v1');
    for(const k of ['rank','seed','repeat','candidateSlot'])
      assert.equal(a[k],b[k]);
  }
  const opts={...effectiveOptions(manifest,mode),registeredTrials:fresh};
  const native=deps.native??runDevelopment;
  const runtime=deps.runtime??withSameRuntime;
  const typed=deps.typed??withLiveUnknownPowerActionWitness;
  const guard=deps.guard??withPublicThornsUnderworldVeto;
  const original=runtime(()=>typed(()=>native(opts)));
  const intervention=runtime(()=>guard(()=>typed(()=>native(opts))));
  assert.equal(original.result.attempted,8);
  assert.equal(intervention.result.result.attempted,8);
  const controlNative=original.result.rows.map((row,i)=>auditRow(row,
    original.audit.abilityActions.filter(x=>x.liveGameIndex===i)));
  const treatedNative=intervention.result.result.rows.map((row,i)=>auditRow(row,
    intervention.result.audit.abilityActions.filter(x=>x.liveGameIndex===i)));
  const pairs=controlNative.map((baseline,i)=>{
    const guarded=treatedNative[i];
    assert.equal(baseline.id,REG.predeclaredTrials[i].id);
    assert.equal(guarded.id,baseline.id);
    return {
      id:baseline.id,
      seed:REG.predeclaredTrials[i].seed,
      candidateId:REG.predeclaredTrials[i].candidateId,
      sameSourceStart:baseline.sourcePhysicalDeal!==null&&
        JSON.stringify(baseline.sourcePhysicalDeal)===
        JSON.stringify(guarded.sourcePhysicalDeal),
      sameFullStart:baseline.fullPhysicalDeal!==null&&
        JSON.stringify(baseline.fullPhysicalDeal)===
        JSON.stringify(guarded.fullPhysicalDeal),
      baseline,guarded,
      blockedUnderworldRemoved:
        baseline.typedUnderworldUnknownPowerRejections>0&&
        guarded.typedUnderworldUnknownPowerRejections===0
    };
  });
  const audits={
    controlLiveStores:original.audit.liveGameCount,
    treatmentLiveStores:intervention.result.audit.liveGameCount,
    guard:intervention.audit
  };
  const gates={
    eightRealStoresInEachArm:audits.controlLiveStores===8&&
      audits.treatmentLiveStores===8,
    sameSourceAndFullPhysicalDeals:pairs.every(x=>
      x.sameSourceStart&&x.sameFullStart),
    everyRegisteredPairAudited:pairs.length===8,
    independentSeedGroupCount:
      new Set(pairs.map(x=>x.seed)).size===4,
    guardHasOnlyDetachedOwnerObservations:
      audits.guard.onlyDetatchedOwnerView===true&&
      audits.guard.readsOpponentHidden===false
  };
  return {
    schema:VERSION,registration:REG.schema,
    manifestDriftAudit:checked.audit,pinnedNativeEngine:REG.enginePin,
    modeId:mode.id,originalSourceSixtyUnchanged:true,
    exactCurrentCodeForBothArms:true,
    gates,pairs,publicPolicyGuardAudit:audits,
    nativeControlErrors:pairs.filter(x=>x.baseline.nativeErrorPresent).length,
    nativeGuardedErrors:pairs.filter(x=>x.guarded.nativeErrorPresent).length,
    removedNamedUnderworldErrors:pairs.filter(x=>x.blockedUnderworldRemoved).length,
    nativeGamesAttempted:16,
    qualifiedPaperGames:0,fullFieldWinRate:null
  };
}
if(require.main===module){
  const file=process.env.AGENT4_UNDERWORLD_HOLDOUT_OUTPUT;
  assert.ok(file,'Provide atomic holdout-output path');
  const result=run(),bytes=JSON.stringify(result,null,2)+'\n';
  fs.mkdirSync(path.dirname(file),{recursive:true});
  writeAtomicLocked(file,bytes);
  writeAtomicLocked(file+'.sha256',
    createHash('sha256').update(bytes).digest('hex')+
      '  '+path.basename(file)+'\n');
  process.stdout.write('AGENT4_RANK6_HOLDOUT16 '+JSON.stringify({
    gates:result.gates,
    guardVetoes:result.publicPolicyGuardAudit.guard.provenVetoes,
    baselineErrors:result.nativeControlErrors,
    guardedErrors:result.nativeGuardedErrors,
    removedNamedUnderworldErrors:result.removedNamedUnderworldErrors,
    pairs:result.pairs.map(x=>({
      id:x.id,sameFullStart:x.sameFullStart,
      baselineStatus:x.baseline.status,guardedStatus:x.guarded.status,
      baselineRoots:x.baseline.acceptedNativeRoots,
      guardedRoots:x.guarded.acceptedNativeRoots,
      baselineNamedUnderworldErrors:
        x.baseline.typedUnderworldUnknownPowerRejections,
      guardedNamedUnderworldErrors:
        x.guarded.typedUnderworldUnknownPowerRejections,
      baselineFinished:x.baseline.nativeFinished,
      guardedFinished:x.guarded.nativeFinished
    }))
  })+'\n');
  if(!Object.values(result.gates).every(Boolean))process.exitCode=1;
}
module.exports={VERSION,auditRow,run};
