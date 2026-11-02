'use strict';

const assert=require('node:assert/strict');
const {registeredPlan,REGISTRATION_BLOB}=
  require('./agent38-prospective-plumeria-conservation-native.cjs');

const VERSION='agent38-registered-source-special-condition-native-debug-v1';

/**
 * Retrospective diagnosis of one previously registered native Store failure.
 * Preserve the original failed paired result as failed; this is separate from
 * the untouched 32-attempt prospectively registered cohort.
 */
function diagnoseRegisteredFailure(){
  const {plan,trials}=registeredPlan();
  assert.equal(REGISTRATION_BLOB,
    '6142a6bac7dcb3fc88eb135c38f60ed1d2083151');
  const selected=trials.filter(t=>t.repeat===0&&t.candidateSlot==='B');
  assert.deepEqual(selected.map(x=>x.candidateId),
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.ok(selected.every(x=>x.seed===3406624545));
  const {runDevelopment}=
    require('./agent41-bilateral-v2-development.cjs');
  const candidate=runDevelopment({...plan.frozenCommonRootOptions,
    registeredTrials:selected,
    registeredFrameName:plan.sourceRank+
      ':special-condition-diagnostic-of-immutable-registration',
    nativeActionInputWitness:true});
  return {
    version:VERSION,
    referenceRegistrationGitBlob:REGISTRATION_BLOB,
    originalFailedTrialId:'6:0:B:new-moon-lockbreaker-v1',
    nativeAttempts:candidate.attempted,
    rows:candidate.rows.map(row=>({
      trial:row.trial,status:row.status,
      sourceSeat:row.sourceSeat??null,
      sourceActuallyFirst:row.sourceActuallyFirst??null,
      sourceDealFingerprint:row.sourceDealFingerprint??null,
      physicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
      error:row.error??null,
      nativeAbortEvidence:row.nativeAbortEvidence??null,
      nativeStoreCauseStack:row.nativeStoreCauseStack??null,
      nativeActionInputAudit:row.nativeActionInputAudit??null,
      nativeGenericFallbackAbortEvidence:
        row.nativeGenericFallbackAbortEvidence??null,
      rootLedger:(row.rootActionLedger??[]).slice(-52),
      competitiveQualified:false
    })),
    competitiveQualifiedGames:0,
    caveat:'Retrospectively chosen failure, separately altered read-only diagnostic hooks. Does not replace or requalify prior failed original Store arms.'
  };
}
if(require.main===module){
  process.stdout.write(JSON.stringify(diagnoseRegisteredFailure(),null,2)+'\n');
}
module.exports={VERSION,diagnoseRegisteredFailure};
