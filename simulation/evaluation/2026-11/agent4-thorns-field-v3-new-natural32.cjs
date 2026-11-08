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
const {withNeutralThornsUnderworldVeto,VERSION:GUARD}=
  require('../../twinleaf/2026-11/agent4-thorns-lock-field-neutral-v3.cjs');
const {auditRow}=
  require('../agent4-rank6-underworld-visible-guard-holdout-16.cjs');
const {writeAtomicLocked}=
  require('../agent20-frozen-rank6-canary-v1.cjs');
const REG=require('../../../results/aichi-2026/registrations/agent4-original-rank6-field-v3-natural-seeds32-20261108.json');
const VERSION='agent4-rank6-new-16-natural-groups-v3-20261108';

/**
 * Run 32 new, predeclared original rank6 native attempts in two physical
 * orientations and with two unchanged reference 60s. Intended to measure
 * whether genuinely natural owner roots can exhibit a newly admitted v3
 * Ability-lock veto, not to estimate benchmark competitive winning.
 *
 * @param {{native?:Function,runtime?:Function,typed?:Function,
 *   guard?:Function,manifest?:Function}} [deps]
 * @returns {object}
 */
function run(deps={}){
  const checked=(deps.manifest??manifestWithDriftAudit)();
  const manifest=checked.manifest;
  const mode=manifest.modes.find(m=>m.id===REG.policyMode);
  assert.ok(mode,'Registered current v3 policy mode missing');
  assert.equal(manifest.nativeActionCap,REG.perGameNativeRootCap);
  assert.equal(REG.seedDraws.length,16);
  assert.equal(new Set(REG.seedDraws).size,16);
  assert.equal(REG.predeclaredTrials.length,32);
  const seenTrials=new Set();
  for(let i=0;i<16;i++){
    const first=REG.predeclaredTrials[2*i];
    const second=REG.predeclaredTrials[2*i+1];
    assert.equal(first.seed,REG.seedDraws[i]);
    assert.equal(second.seed,first.seed);
    assert.equal(first.candidateId,'champion-reference');
    assert.equal(second.candidateId,'new-moon-lockbreaker-v1');
    assert.equal(first.candidateSlot,second.candidateSlot);
    assert.equal(first.rank,6);
    assert.equal(second.rank,6);
    for(const row of [first,second]){
      assert.equal(seenTrials.has(row.id),false);
      seenTrials.add(row.id);
    }
  }
  const opts={...effectiveOptions(manifest,mode),
    registeredTrials:REG.predeclaredTrials};
  const native=deps.native??runDevelopment;
  const runtime=deps.runtime??withSameRuntime;
  const typed=deps.typed??withLiveUnknownPowerActionWitness;
  const guard=deps.guard??withNeutralThornsUnderworldVeto;
  const wrapped=runtime(()=>guard(()=>typed(()=>native(opts))));
  const observed=wrapped.result.result;
  assert.equal(observed.attempted,32,'One attempted real Store per source trial');
  const typedAudits=wrapped.result.audit.abilityActions;
  const rows=observed.rows.map((row,i)=>{
    const registered=REG.predeclaredTrials[i];
    const audit=auditRow(row,typedAudits.filter(x=>x.liveGameIndex===i));
    assert.equal(audit.id,registered.id);
    return {
      id:audit.id,seed:registered.seed,rank:registered.rank,
      candidateId:registered.candidateId,
      candidateSlot:registered.candidateSlot,
      status:audit.status,nativeFinished:audit.nativeFinished,
      nativeEndReason:audit.nativeEndReason,
      acceptedNativeRoots:audit.acceptedNativeRoots,
      namedUnderworldUnknownPowerRejections:
        audit.typedUnderworldUnknownPowerRejections,
      originalFullPhysicalDealFingerprint:audit.fullPhysicalDeal,
      originalSourcePhysicalDealFingerprint:audit.sourcePhysicalDeal,
      nativeAbortAction:audit.nativeAbortAction,
      nativeAbortTurn:audit.nativeAbortTurn,
      nativeAbortOrdinal:audit.nativeAbortOrdinal,
      nativePaperQualification:false
    };
  });
  const guardAudit=wrapped.audit;
  const gates={
    exactAttemptCount:rows.length===32&&
      wrapped.result.audit.liveGameCount===32,
    correctUniqueRegisteredSeeds:
      new Set(rows.map(r=>r.seed)).size===16,
    originalPrintedSourceUnchanged:
      guardAudit.changesPrintedSixties===false,
    noOpponentPrivateInformation:
      guardAudit.readsOpponentHidden===false&&
      guardAudit.onlyDetatchedOwnerView===true,
    guardVersion:guardAudit.schema===GUARD,
    everyPhysicalSourceStartRecorded:rows.every(x=>
      x.originalFullPhysicalDealFingerprint!==null&&
      x.originalSourcePhysicalDealFingerprint!==null)
  };
  return {schema:VERSION,registration:REG.schema,
    enginePin:REG.enginePin,nativeGameAttempts:32,
    independentSeedGroupCount:16,rootCap:REG.perGameNativeRootCap,
    codeSameForOriginal60s:true,manifestDriftAudit:checked.audit,
    gates,guardAudit,
    newlyEligibleVetoes:guardAudit.expandedKnownNeutralVetoes,
    nativeFinishedRows:rows.filter(row=>row.nativeFinished).length,
    engineErrors:rows.filter(row=>row.status==='engine-error').length,
    nativeUnderworldUnknownPowerErrors:rows.reduce((n,row)=>n+
      row.namedUnderworldUnknownPowerRejections,0),
    rows,paperQualifiedGames:0,
    estimatedWinRate:null};
}
if(require.main===module){
  const output=process.env.AGENT4_NEW_NATURAL_V3_OUTPUT;
  assert.ok(output,'Set a locked atomic native artifact path');
  const result=run(),bytes=JSON.stringify(result,null,2)+'\n';
  fs.mkdirSync(path.dirname(output),{recursive:true});
  writeAtomicLocked(output,bytes);
  writeAtomicLocked(output+'.sha256',
    createHash('sha256').update(bytes).digest('hex')+
      '  '+path.basename(output)+'\n');
  process.stdout.write('AGENT4_NEW_NATURAL_V3 '+JSON.stringify({
    gates:result.gates,
    guardAudit:result.guardAudit,
    newlyEligibleVetoes:result.newlyEligibleVetoes,
    nativeFinishedRows:result.nativeFinishedRows,
    engineErrors:result.engineErrors,
    nativeUnderworldUnknownPowerErrors:
      result.nativeUnderworldUnknownPowerErrors,
    statuses:result.rows.map(row=>({
      id:row.id,status:row.status,roots:row.acceptedNativeRoots,
      nativeFinished:row.nativeFinished
    })),
    paperQualifiedGames:0
  })+'\n');
  if(!Object.values(result.gates).every(Boolean))process.exitCode=1;
}
module.exports={VERSION,run};
