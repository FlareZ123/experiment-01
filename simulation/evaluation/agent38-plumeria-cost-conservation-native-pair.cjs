'use strict';

const assert=require('node:assert/strict');
const {runNativeCommonChoicePair}=
  require('./agent41-rank6-native-plumeria-common-choice-pair.cjs');

const VERSION='agent38-native-plumeria-last-printing-retrospective-pair-v1';
const SWITCH='AGENT38_NATIVE_PLUMERIA_PAYMENT_CONSERVATION_DEV';

/**
 * Compare exactly the same original rank6 registered native source deal under
 * the original common Plumeria decision and its default-off conservation
 * gate. Both treatments run the existing canonical two-seat actor/Store.
 * Capped native attempts remain censored, never competitive game outcomes.
 *
 * @param {object} baseline Existing four-attempt native fixture
 * @param {object} guarded Matching four-attempt fixture with gate enabled
 * @returns {object} Same-physical-input and native outcome comparison
 */
function compareConservationNativePairs(baseline,guarded){
  const failures=[];
  if(!baseline.validation?.passed||!guarded.validation?.passed)
    failures.push('underlying-paired-native-fixture-failed');
  if(baseline.enginePin!==guarded.enginePin||
     baseline.registrationGitBlob!==guarded.registrationGitBlob||
     baseline.originalSourceSeed!==guarded.originalSourceSeed)
    failures.push('different-source-engine-or-registration');
  if(baseline.actualNativeAttempts!==4||guarded.actualNativeAttempts!==4)
    failures.push('incorrect-native-attempt-count');
  if(baseline.competitiveQualifiedGames!==0||
     guarded.competitiveQualifiedGames!==0)
    failures.push('unexpected-competitive-game-claim');
  if(baseline.paired?.length!==2||guarded.paired?.length!==2)
    failures.push('incomplete-original-pairing');

  const pairs=(baseline.paired??[]).map(off=>{
    const on=(guarded.paired??[]).find(x=>x.id===off.id);
    if(!on){failures.push('missing-conserved-pair:'+off.id);
      return {id:off.id,matched:false};}
    const arms=['control','treatment'];
    const inputMatched=arms.every(arm=>
      off[arm]?.fullPhysicalDealFingerprint!=null&&
      off[arm].fullPhysicalDealFingerprint===
        on[arm]?.fullPhysicalDealFingerprint&&
      off[arm]?.sourceDealFingerprint!=null&&
      off[arm].sourceDealFingerprint===
        on[arm]?.sourceDealFingerprint);
    const controlActionUnchanged=
      off.control?.rootActionLedgerSha256!=null&&
      off.control.rootActionLedgerSha256===
        on.control?.rootActionLedgerSha256;
    const flagCorrect=
      off.treatment?.plumeriaCostConservationOptIn===false&&
      on.treatment?.plumeriaCostConservationOptIn===true;
    if(!inputMatched)failures.push('physical-deal-drift:'+off.id);
    if(!controlActionUnchanged)
      failures.push('baseline-control-root-policy-drift:'+off.id);
    if(!flagCorrect)failures.push('missing-true-policy-toggle:'+off.id);
    return {
      id:off.id,sourceSeat:off.sourceSeat,
      originalSourceDealFingerprint:off.treatment?.sourceDealFingerprint??null,
      matchedFullOriginalDeal:inputMatched,
      controlRootLedgerUnchanged:controlActionUnchanged,
      exactPolicyToggleWitness:flagCorrect,
      baseline:{
        status:off.treatment?.status,
        acceptedPlumeria:off.treatment?.acceptedPlumeria,
        settledPlumeria:off.treatment?.settledPhysicalEnergyDiscards,
        selectedRoots:off.treatment?.selectedPlumeriaOwnerRoots,
        ownerPayments:off.treatment?.physicalOwnerPayments,
        rootLedgerSha256:off.treatment?.rootActionLedgerSha256
      },
      conserved:{
        status:on.treatment?.status,
        acceptedPlumeria:on.treatment?.acceptedPlumeria,
        settledPlumeria:on.treatment?.settledPhysicalEnergyDiscards,
        selectedRoots:on.treatment?.selectedPlumeriaOwnerRoots,
        ownerPayments:on.treatment?.physicalOwnerPayments,
        rootLedgerSha256:on.treatment?.rootActionLedgerSha256
      },
      changedNativeRootLedger:
        off.treatment?.rootActionLedgerSha256!==
        on.treatment?.rootActionLedgerSha256,
      sourceRootPaymentSavings:
        (off.treatment?.acceptedPlumeria??0)-
        (on.treatment?.acceptedPlumeria??0)
    };
  });
  return {
    version:VERSION,enginePin:baseline.enginePin,
    registrationGitBlob:baseline.registrationGitBlob,
    originalSourceSeed:baseline.originalSourceSeed,
    originalPhysicalDeals:pairs.length,
    nativeAttempts:baseline.actualNativeAttempts+
      guarded.actualNativeAttempts,
    validation:{passed:failures.length===0,failures},
    pairs,competitiveQualifiedGames:0,
    caveat:'Retrospective reused one original source seed and two distinct candidate 60s. Actor-only payment conservation is a heuristic. Capped and unqualified policy-development games do not demonstrate match-win improvement.'
  };
}

/** Run 8 genuine pinned original Store attempts in the canonical actor. */
function runConservationNativePair(){
  const prior=process.env[SWITCH];
  try{
    process.env[SWITCH]='false';
    const baseline=runNativeCommonChoicePair();
    process.env[SWITCH]='true';
    const guarded=runNativeCommonChoicePair();
    return compareConservationNativePairs(baseline,guarded);
  }finally{
    if(prior===undefined)delete process.env[SWITCH];
    else process.env[SWITCH]=prior;
  }
}

if(require.main===module){
  const result=runConservationNativePair();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.validation.passed)process.exitCode=1;
}
module.exports={VERSION,SWITCH,compareConservationNativePairs,
  runConservationNativePair};
