'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {manifestWithDriftAudit}=
  require('../agent4-v3-two-unknown-power-readout.cjs');
const {effectiveOptions,withSameRuntime}=
  require('../agent4-selected-v3-paper-funded-release.cjs');
const {runDevelopment}=
  require('../agent41-bilateral-v2-development.cjs');
const {withLiveUnknownPowerActionWitness}=
  require('../../twinleaf/agent39-live-unknown-power-action-witness.cjs');
const v2=require('../../twinleaf/2026-11/agent4-thorns-lock-neutral-stadium-tool-v2.cjs');
const v3=require('../../twinleaf/2026-11/agent4-thorns-lock-field-neutral-v3.cjs');
const {auditRow}=require('../agent4-rank6-underworld-visible-guard-holdout-16.cjs');
const {writeAtomicLocked}=
  require('../agent20-frozen-rank6-canary-v1.cjs');
const REG=require('../../../results/aichi-2026/registrations/agent4-rank6-underworld-visible-guard-holdout-16-v1-20261106.json');
const VERSION='agent4-original-rank6-frozen-v2-v3-field-neutral-replay-20261108';

/**
 * Matched 8-by-2 original source physical states from the existing four
 * registered independent seeds. NOT a new holdout; inspect native player
 * trajectories, differential proposals and original store outcomes only.
 * Both policies are tested in the same checkout with separately restored
 * monkeypatches, same pinned engine and exact printed source 60s.
 * @param {{native?:Function,runtime?:Function,typed?:Function,
 *   manifest?:Function,guardV2?:Function,guardV3?:Function}} [deps]
 */
function run(deps={}){
  const checked=(deps.manifest??manifestWithDriftAudit)();
  const manifest=checked.manifest;
  const mode=manifest.modes.find(m=>m.id===REG.policyMode);
  assert.ok(mode,'Registered mode missing');
  assert.equal(REG.predeclaredTrials.length,8);
  assert.equal(REG.perGameNativeRootCap,180);
  const opts={...effectiveOptions(manifest,mode),
    registeredTrials:REG.predeclaredTrials};
  const native=deps.native??runDevelopment;
  const runtime=deps.runtime??withSameRuntime;
  const typed=deps.typed??withLiveUnknownPowerActionWitness;
  const guardV2=deps.guardV2??v2.withNeutralThornsUnderworldVeto;
  const guardV3=deps.guardV3??v3.withNeutralThornsUnderworldVeto;
  const baseline=runtime(()=>guardV2(()=>typed(()=>native(opts))));
  const treatment=runtime(()=>guardV3(()=>typed(()=>native(opts))));
  const a=baseline.result.result, b=treatment.result.result;
  assert.equal(a.attempted,8);
  assert.equal(b.attempted,8);
  const ledgerA=baseline.result.audit.abilityActions;
  const ledgerB=treatment.result.audit.abilityActions;
  const nativeA=a.rows.map((row,i)=>auditRow(row,
    ledgerA.filter(x=>x.liveGameIndex===i)));
  const nativeB=b.rows.map((row,i)=>auditRow(row,
    ledgerB.filter(x=>x.liveGameIndex===i)));
  const pairs=nativeA.map((left,i)=>{
    const right=nativeB[i],reg=REG.predeclaredTrials[i];
    assert.equal(left.id,reg.id);
    assert.equal(right.id,reg.id);
    return {
      id:reg.id,seed:reg.seed,candidateId:reg.candidateId,
      sameFullPhysicalStart:
        left.fullPhysicalDeal!==null&&
        JSON.stringify(left.fullPhysicalDeal)===
          JSON.stringify(right.fullPhysicalDeal),
      sameSourcePhysicalStart:
        left.sourcePhysicalDeal!==null&&
        JSON.stringify(left.sourcePhysicalDeal)===
          JSON.stringify(right.sourcePhysicalDeal),
      v2Status:left.status,v3Status:right.status,
      v2Finished:left.nativeFinished,v3Finished:right.nativeFinished,
      v2AcceptedRoots:left.acceptedNativeRoots,
      v3AcceptedRoots:right.acceptedNativeRoots,
      v2UnderworldUnknownPowerRejections:
        left.typedUnderworldUnknownPowerRejections,
      v3UnderworldUnknownPowerRejections:
        right.typedUnderworldUnknownPowerRejections
    };
  });
  const v2audit=baseline.audit,v3audit=treatment.audit;
  const gates={
    sameRegisteredSourceStates:pairs.length===8&&pairs.every(p=>
      p.sameFullPhysicalStart&&p.sameSourcePhysicalStart),
    fourFrozenSeeds:new Set(pairs.map(p=>p.seed)).size===4,
    correctNativeAttemptCount:baseline.result.audit.liveGameCount===8&&
      treatment.result.audit.liveGameCount===8,
    ownerOnly:v2audit.readsOpponentHidden===false&&
      v3audit.readsOpponentHidden===false&&
      v2audit.onlyDetatchedOwnerView===true&&
      v3audit.onlyDetatchedOwnerView===true,
    printedSixtiesUnchanged:v2audit.changesPrintedSixties===false&&
      v3audit.changesPrintedSixties===false,
    correctlyVersioned:v2audit.schema===v2.VERSION&&
      v3audit.schema===v3.VERSION
  };
  return {schema:VERSION,
    registration:REG.schema,enginePin:REG.enginePin,
    originalSourceSixtiesUnchanged:true,independentHoldout:false,
    registeredTrialCount:8,nativeAttempts:16,
    manifestDriftAudit:checked.audit,
    gates,pairs,
    v2GuardAudit:v2audit,v3GuardAudit:v3audit,
    nativeV2UnderworldErrors:pairs.reduce((n,p)=>
      n+p.v2UnderworldUnknownPowerRejections,0),
    nativeV3UnderworldErrors:pairs.reduce((n,p)=>
      n+p.v3UnderworldUnknownPowerRejections,0),
    paperQualifiedGames:0,fullFieldWinRate:null
  };
}
if(require.main===module){
  const file=process.env.AGENT4_FIELD_V3_ORIGINAL16_OUTPUT;
  assert.ok(file,'Specify locked atomic output filename');
  const result=run(),bytes=JSON.stringify(result,null,2)+'\n';
  fs.mkdirSync(path.dirname(file),{recursive:true});
  writeAtomicLocked(file,bytes);
  writeAtomicLocked(file+'.sha256',
    createHash('sha256').update(bytes).digest('hex')+
      '  '+path.basename(file)+'\n');
  process.stdout.write('AGENT4_ORIGINAL_V2_V3_NATIVE '+JSON.stringify({
    gates:result.gates,
    neutralV2:result.v2GuardAudit.expandedKnownNeutralVetoes,
    fieldV3:result.v3GuardAudit.expandedKnownNeutralVetoes,
    v2Errors:result.nativeV2UnderworldErrors,
    v3Errors:result.nativeV3UnderworldErrors,
    pairs:result.pairs.map(x=>({
      id:x.id,sameFullStart:x.sameFullPhysicalStart,
      v2Status:x.v2Status,v3Status:x.v3Status,
      v2Roots:x.v2AcceptedRoots,v3Roots:x.v3AcceptedRoots,
      v2Finished:x.v2Finished,v3Finished:x.v3Finished
    })),paperQualifiedGames:0
  })+'\n');
  if(!Object.values(result.gates).every(Boolean))process.exitCode=1;
}
module.exports={VERSION,run};
