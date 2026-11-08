'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {run:runHoldout}=require('../agent4-rank6-underworld-visible-guard-holdout-16.cjs');
const {
  VERSION:GUARD,withNeutralThornsUnderworldVeto
}=require('../../twinleaf/2026-11/agent4-thorns-lock-neutral-stadium-tool-v2.cjs');
const {writeAtomicLocked}=
  require('../agent20-frozen-rank6-canary-v1.cjs');
const VERSION='agent4-rank6-same-registered-holdout-neutral-v2-20261108';

/**
 * Reuse all four previously preregistered holdout seeds and both candidates.
 * This is an integration regression, NOT a new independent holdout and NOT
 * comparative competitive-game evidence.
 * @param {{holdout?:Function}} [deps]
 */
function run(deps={}){
  const result=(deps.holdout??runHoldout)({
    guard:withNeutralThornsUnderworldVeto
  });
  const audit=result.publicPolicyGuardAudit.guard;
  const checks={
    sameOriginalHoldoutRegistration:
      result.registration==='agent4-rank6-underworld-guard-independent-4-seed-groups-16-native-v1',
    sameNativeSixteens:result.nativeGamesAttempted===16,
    originalPhysicalDealsPreserved:
      result.pairs.length===8&&result.pairs.every(p=>
        p.sameFullStart&&p.sameSourceStart),
    ownerOnlyV2Audit: audit.schema===GUARD&&
      audit.onlyDetatchedOwnerView===true&&
      audit.readsOpponentHidden===false,
    nativeHoldoutNativeGatesPassed:
      Object.values(result.gates).every(Boolean)
  };
  return {schema:VERSION,guard:GUARD,
    originalRegistration:result.registration,
    checks,guardAudit:audit,
    pairedStatuses:result.pairs.map(p=>({
      id:p.id,seed:p.seed,candidateId:p.candidateId,
      sameSourceStart:p.sameSourceStart,sameFullStart:p.sameFullStart,
      beforeStatus:p.baseline.status,afterStatus:p.guarded.status,
      beforeRoots:p.baseline.acceptedNativeRoots,
      afterRoots:p.guarded.acceptedNativeRoots,
      beforeNamedUnderworldErrors:
        p.baseline.typedUnderworldUnknownPowerRejections,
      afterNamedUnderworldErrors:
        p.guarded.typedUnderworldUnknownPowerRejections,
      beforeFinished:p.baseline.nativeFinished,
      afterFinished:p.guarded.nativeFinished
    })),
    treatmentNamedUnderworldErrors:
      result.pairs.reduce((n,p)=>n+
        p.guarded.typedUnderworldUnknownPowerRejections,0),
    allNativeAttempts:16,paperQualifiedGames:0,
    fieldWinRate:null};
}
if(require.main===module){
  const name=process.env.AGENT4_NEUTRAL_V2_NATIVE_OUTPUT;
  assert.ok(name,'Require native result filename');
  const result=run(),data=JSON.stringify(result,null,2)+'\n';
  fs.mkdirSync(path.dirname(name),{recursive:true});
  writeAtomicLocked(name,data);
  writeAtomicLocked(name+'.sha256',
    createHash('sha256').update(data).digest('hex')+
      '  '+path.basename(name)+'\n');
  process.stdout.write('AGENT4_NEUTRAL_V2_NATIVE '+JSON.stringify({
    checks:result.checks,guardAudit:result.guardAudit,
    pairedStatuses:result.pairedStatuses,
    paperQualifiedGames:0
  })+'\n');
  if(!Object.values(result.checks).every(Boolean))process.exitCode=1;
}
module.exports={VERSION,run};
