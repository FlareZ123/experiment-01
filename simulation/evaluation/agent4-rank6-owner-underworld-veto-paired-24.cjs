'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {run:runFrozenSource}=
  require('./agent4-v3-two-unknown-power-readout.cjs');
const {withLiveUnknownPowerActionWitness}=
  require('../twinleaf/agent39-live-unknown-power-action-witness.cjs');
const {withPublicThornsUnderworldVeto,VERSION:VETO_VERSION}=
  require('../twinleaf/agent4-underworld-visible-thorns-veto.cjs');
const {writeAtomicLocked}=
  require('./agent20-frozen-rank6-canary-v1.cjs');
const REG=require('../../results/aichi-2026/registrations/agent4-rank6-owner-underworld-veto-paired-24-v1-20261106.json');
const VERSION='agent4-rank6-public-underworld-guard-paired-24-v1';

/**
 * Nest actual typed Store observer and the reversible owner detached-view
 * guard. Neither may alter physical deals or raw Twinleaf Store effects.
 * @template T
 * @param {()=>T} work Same native experiment.
 * @returns {{result:T,audit:object}}
 */
function withGuardAndTypedWitness(work){
  const guard=withPublicThornsUnderworldVeto(()=>
    withLiveUnknownPowerActionWitness(work));
  return {result:guard.result.result,
    audit:{...guard.result.audit,publicUnderworldVetoAudit:guard.audit}};
}

/** @param {object} run */
function runStatistics(run){
  const modes=run.modes??[];
  return {
    modes:modes.map(m=>({
      modeId:m.modeId,attempted:m.nativeAttemptCount,
      observedStores:m.observedLiveStoreCount,
      guard:m.publicUnderworldVetoAudit??null,
      rank6ChampionAbortTargets:m.rows.filter(r=>
        REG.historicalAbortTargets.includes(r.id)).map(row=>({
          id:row.id,status:row.status,
          actualNativeStoreUnknownPower:
            row.rejectedUnknownPowerActions?.filter(a=>
              a.rejection==='UNKNOWN_POWER').length??0,
          knownNativeError:row.nativeErrorClass??null,
          acceptedRootCount:row.acceptedRootCount??null,
          acceptedRootHash:row.acceptedRootLedgerSha256??null,
          nativeFinished:row.nativeFinished===true
        }))
    })),
    allRows:modes.flatMap(m=>m.rows.map(row=>({
      modeId:m.modeId,id:row.id,status:row.status,
      sourceDeal:row.originalSourceDealFingerprint,
      fullDeal:row.originalFullPhysicalDealFingerprint,
      acceptedRootHash:row.acceptedRootLedgerSha256,
      acceptedRootCount:row.acceptedRootCount,
      namedUnderworldRejections:row.rejectedUnknownPowerActions
        .filter(a=>a.rejection==='UNKNOWN_POWER'&&a.name==='Underworld Door').length,
      nativeFinished:row.nativeFinished===true
    })))
  };
}

/**
 * Same-code, same-physical source/candidate comparisons. All failure modes
 * remain in the output even if a qualification gate fails.
 * @param {{controlRunner?:Function,guardRunner?:Function}} [deps]
 * @returns {object}
 */
function run(deps={}){
  const control=(deps.controlRunner??runFrozenSource)();
  const treatment=(deps.guardRunner??runFrozenSource)({
    witness:withGuardAndTypedWitness
  });
  const original=runStatistics(control),guarded=runStatistics(treatment);
  const modeIds=REG.sourceModes;
  assert.deepEqual(control.modes.map(x=>x.modeId),modeIds);
  assert.deepEqual(treatment.modes.map(x=>x.modeId),modeIds);
  const targetComparisons=modeIds.flatMap(modeId=>
    REG.historicalAbortTargets.map(id=>{
      const b=original.allRows.find(x=>x.modeId===modeId&&x.id===id);
      const t=guarded.allRows.find(x=>x.modeId===modeId&&x.id===id);
      assert.ok(b&&t,'Missing frozen target row '+modeId+':'+id);
      return {
        modeId,id,controlStatus:b.status,treatmentStatus:t.status,
        sameFullPhysicalDeal:b.fullDeal!==null&&
          JSON.stringify(b.fullDeal)===JSON.stringify(t.fullDeal),
        sameSourcePhysicalDeal:b.sourceDeal!==null&&
          JSON.stringify(b.sourceDeal)===JSON.stringify(t.sourceDeal),
        controlNamedUnderworldRejections:b.namedUnderworldRejections,
        treatmentNamedUnderworldRejections:t.namedUnderworldRejections,
        controlAcceptedRoots:b.acceptedRootCount,
        treatmentAcceptedRoots:t.acceptedRootCount,
        treatmentAcceptedPrefixChanged:
          b.acceptedRootHash!==t.acceptedRootHash,
        treatmentNativeFinished:t.nativeFinished
      };
    }));
  const matchedRows=original.allRows.map(b=>{
    const t=guarded.allRows.find(x=>
      x.modeId===b.modeId&&x.id===b.id);
    assert.ok(t,'Missing paired row '+b.id);
    return {
      modeId:b.modeId,id:b.id,
      fullStartingDealParity:b.fullDeal!==null&&
        JSON.stringify(b.fullDeal)===JSON.stringify(t.fullDeal),
      sourceStartingDealParity:b.sourceDeal!==null&&
        JSON.stringify(b.sourceDeal)===JSON.stringify(t.sourceDeal),
      baselineStatus:b.status,treatmentStatus:t.status,
      sameAcceptedRootHash:b.acceptedRootHash===t.acceptedRootHash,
      baselineRootCount:b.acceptedRootCount,
      treatedRootCount:t.acceptedRootCount
    };
  });
  const vetoAudits=guarded.modes.map(m=>m.guard);
  const gates={
    all24GenuineAttempts:control.actualNativeAttemptCount===12&&
      treatment.actualNativeAttemptCount===12,
    allPairedPhysicalDealsMatch:matchedRows.length===12&&
      matchedRows.every(row=>row.fullStartingDealParity&&
        row.sourceStartingDealParity),
    controlARepeatMatches:control.paired.every(x=>
      x.aRepeatExactAcceptedPrefixAndDisposition),
    treatedARepeatMatches:treatment.paired.every(x=>
      x.aRepeatExactAcceptedPrefixAndDisposition),
    controlSixErrorsReproduced:targetComparisons.length===6&&
      targetComparisons.every(x=>x.controlNamedUnderworldRejections===1),
    liveVetoAuditsReturned:vetoAudits.length===3&&
      vetoAudits.every(a=>a?.onlyDetatchedOwnerView===true)
  };
  return {
    schema:VERSION,registration:REG.schema,
    vetoPolicy:VETO_VERSION,pinnedNativeSameCodeComparison:true,
    sourcePrintedSixtiesOrSeedChanged:false,
    checks:gates,targetComparisons,matchedRows,
    controlRootStatistics:original,
    guardedRootStatistics:guarded,
    observedVetoCount:vetoAudits.reduce((n,a)=>n+(a?.provenVetoes??0),0),
    noQualifiedCompetitiveGames:true,fieldWinRate:null
  };
}

if(require.main===module){
  const name=process.env.AGENT4_UNDERWORLD_VETO_OUTPUT;
  assert.ok(name,'Provide archival filename for atomic result');
  const result=run(),bytes=JSON.stringify(result,null,2)+'\n';
  fs.mkdirSync(path.dirname(name),{recursive:true});
  writeAtomicLocked(name,bytes);
  writeAtomicLocked(name+'.sha256',
    createHash('sha256').update(bytes).digest('hex')+
      '  '+path.basename(name)+'\n');
  process.stdout.write('AGENT4_UNDERWORLD_VETO_PAIRED24 '+JSON.stringify({
    checks:result.checks,
    observedVetoCount:result.observedVetoCount,
    targetComparisons:result.targetComparisons,
    modeVetoes:result.guardedRootStatistics.modes.map(x=>({
      modeId:x.modeId,guard:x.guard
    })),
    paperQualifiedGames:0
  })+'\n');
  if(!Object.values(result.checks).every(Boolean))process.exitCode=1;
}

module.exports={VERSION,withGuardAndTypedWitness,runStatistics,run};
