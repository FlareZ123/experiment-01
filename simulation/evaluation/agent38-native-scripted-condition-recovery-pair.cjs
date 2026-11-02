'use strict';

const assert=require('node:assert/strict');
const {diagnoseRegisteredFailure}=
  require('./agent38-source-special-condition-native-diagnostic.cjs');
const VERSION='agent38-native-rank6-scripted-condition-recovery-v1';
const SWITCH='AGENT38_RANK6_SCRIPTED_SPECIAL_CONDITION_GUARD_DEV';
const FAILED_ID='6:0:B:new-moon-lockbreaker-v1';

/**
 * Compare precisely the one original previously observed native error.
 * New repair is deliberately versioned and opt-in, never silently applied
 * to the earlier preregistered 32-attempt dataset.
 * @param {object} baseline
 * @param {object} protectedRun
 */
function auditNativeRecovery(baseline,protectedRun){
  const errors=[];
  if(baseline.nativeAttempts!==2||protectedRun.nativeAttempts!==2)
    errors.push('wrong-exact-attempt-count');
  const before=baseline.rows.find(row=>row.trial.id===FAILED_ID);
  const after=protectedRun.rows.find(row=>row.trial.id===FAILED_ID);
  if(!before||!after)errors.push('failed-case-not-present');
  const evidence=before?.nativeAbortEvidence;
  const sourceId=evidence?.sourceDealFingerprint?.digestSha256??null;
  const beforePrefix=before?.prefixActionLedger??[];
  const afterPrefix=after?.prefixActionLedger??[];
  const allPrefixMatched=beforePrefix.length===40&&
    afterPrefix.length>=41&&
    beforePrefix.every((line,index)=>
      JSON.stringify(line)===JSON.stringify(afterPrefix[index]));
  const correctedAction=afterPrefix[40]??null;
  const beforeBlocked=evidence?.errorMessage==='BLOCKED_BY_SPECIAL_CONDITION'&&
    evidence.actionName==='AttackAction'&&
    evidence.attackName==='Volt Cyclone'&&
    evidence.attackingPokemon==='Iron Thorns ex TWM'&&
    evidence.actionOrdinal===40&&evidence.turnBefore===3&&
    evidence.actingSeat===0;
  const physicalSourceMatched=sourceId!=null&&
    sourceId===after?.sourceDealFingerprint;
  const successfullyResolved=after?.status!=='engine-error'&&
    after?.status!=='engine-physical-invalid';
  const fixedSourcePass=correctedAction?.action==='PassTurnAction'&&
    correctedAction?.playerSlot===0&&
    correctedAction?.turnBefore===3;
  if(!beforeBlocked)errors.push('original-native-paralysis-error-missing');
  if(!allPrefixMatched)errors.push('accepted-public-prefix-did-not-match');
  if(!physicalSourceMatched)errors.push('source-deal-not-physically-matched');
  if(!successfullyResolved)errors.push('guarded-native-store-still-failed');
  if(!fixedSourcePass)errors.push('guard-did-not-dispatch-legal-source-pass');
  const companionId='6:0:B:champion-reference';
  const companionA=baseline.rows.find(x=>x.trial.id===companionId);
  const companionB=protectedRun.rows.find(x=>x.trial.id===companionId);
  const companionSameInitialSource=companionA?.sourceDealFingerprint!=null&&
    companionA?.sourceDealFingerprint===companionB?.sourceDealFingerprint;
  if(!companionSameInitialSource)
    errors.push('source-physical-companion-drift');
  return {
    version:VERSION,
    firstOriginalFailedSourceId:FAILED_ID,
    registeredSourceSeed:3406624545,
    matchingNativeSourceDeal:physicalSourceMatched,
    originalRejectedActionConfirmed:beforeBlocked,
    identicalFortyActionPreDispatchPrefix:allPrefixMatched,
    correctiveNativePass:fixedSourcePass,
    nativeAcceptedCorrection:successfullyResolved,
    companionSamePhysicalSource:companionSameInitialSource,
    failureExclusiveStatus:{
      baseline:before?.status??null,
      protected:after?.status??null
    },
    retainedUnqualifiedEvidence:{
      original:before?.nativeAbortEvidence??null,
      guardedFirstNewAction:correctedAction,
      guardedFullPhysicalDealFingerprint:
        after?.physicalDealFingerprint??null,
      guardedSourceDealFingerprint:after?.sourceDealFingerprint??null,
      nativeInputWitness:after?.nativeActionInputAudit??null
    },
    validation:{passed:errors.length===0,errors},
    nativeAttempts:baseline.nativeAttempts+protectedRun.nativeAttempts,
    competitiveQualifiedGames:0,
    caveat:'Retrospective selected one prior failure; the script does not alter prior 32-game analysis or qualify new games. The repair requires new preregistered independent deals for performance claims.'
  };
}

/** @returns {object} Fixed-source native Store repair test. */
function runNativeRecoveryPair(){
  const old=process.env[SWITCH];
  try{
    process.env[SWITCH]='false';
    const before=diagnoseRegisteredFailure();
    process.env[SWITCH]='true';
    const after=diagnoseRegisteredFailure();
    return auditNativeRecovery(before,after);
  }finally{
    if(old===undefined)delete process.env[SWITCH];
    else process.env[SWITCH]=old;
  }
}
if(require.main===module){
  const result=runNativeRecoveryPair();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.validation.passed)process.exitCode=1;
}
module.exports={VERSION,SWITCH,FAILED_ID,auditNativeRecovery,
  runNativeRecoveryPair};
