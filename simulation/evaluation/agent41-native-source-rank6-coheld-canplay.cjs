'use strict';

const assert=require('node:assert/strict');
const {readRegistration}=require('./agent41-rank6-grouped-denial-source-panel.cjs');

const VERSION='agent41-two-candidate-natural-rank6-source-canplay-v1';
const SOURCE_DEAL_SHA='29db5b5feaf15b2eec86b19e7d1bbe46738f63ef8e479da9a22ecb46970a1dab';

/** Focus on the exact early registered source state, preserving both candidate replies. */
function runFocusedNativeEligibility(){
  const plan=readRegistration();
  const focus=plan.trials.filter(t=>t.rank===6&&t.repeat===10);
  assert.equal(focus.length,2);
  assert.equal(focus[0].seed,296638747);
  assert.ok(focus.every(t=>t.seed===focus[0].seed&&
    t.candidateSlot==='A'));
  const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
  const original=runDevelopment({
    actorOnlyComposition:true,
    mandatoryOptionFallback:true,
    paperSupporterQuota:true,
    nativePressureWindows:true,
    nativeAcceptedTargets:true,
    sameRootProposalChoice:true,
    sameRootProbeAll:true,
    sameRootChoiceApply:false,
    nativeCoheldDenialCanPlay:true,
    registeredTrials:focus,
    registeredFrameName:
      'agent41-preregistered-rank6-physical-source-seed-296638747-native-canplay'
  });
  // Keep incomplete native outcomes in the report for diagnosis.
  const rows=original.rows.map(row=>{
    const audit=row.actorOnlyDecisionCoverage?.detailedComponentAudits
      ?.root??null;
    const physical=audit?.nativeCoheldDenialCanPlayWitnesses??[];
    return {
      trial:row.trial.id,
      // Physical source seat is fixed by the registered candidate slot.
      // 'sourceSeat' is not a standard row field in the development runner.
      sourceSeat:row.trial.candidateSlot==='A'?1:0,
      sourceDealFingerprint:row.sourceDealFingerprint??null,
      fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
      nativeStatus:row.status??(row.finished?'engine-terminal':'censored'),
      originalActionLedgerSha256:row.rootActionLedgerSha256??null,
      naturalCoheldRootCount:audit?.nativeCoheldDenialCanPlayRoots??null,
      bothNativeCardCanPlayRoots:audit?.nativeCoheldDenialBothPlayableRoots??null,
      firstAuthenticCoheldRoot:physical[0]??null,
      allBoundedNativeCanPlayReceipts:physical,
      noActualSupporterBranchDispatched:true,
      qualification:false
    };
  });
  const validation=validateFocusedNativeEvidence(rows,original);
  return {
    schema:VERSION,manifestBlob:
      '6f4a694403069674f33daf81eff18971e214b758',
    originalSourceSeed:296638747,originalSourceRank:6,
    candidatePhysicalSlot:'A',pinnedTwinleafRevision:
      'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    rows,validation,competitiveQualifiedGames:0,
    caveat:'Exact native owner-hand canPlay and owner-public nonmutation only. Neither alternate Supporter was dispatched; their multi-step prompt settlements, followthrough and competitive strength are unknown.'
  };
}

/**
 * Pure fail-closed validator. A failed requirement must survive as a JSON
 * witness rather than aborting before the CI artifact is written.
 */
function validateFocusedNativeEvidence(rows,original){
  const failures=[];
  if(original.attempted!==2)failures.push('expected-two-registered-arms');
  if(rows.length!==2)failures.push('missing-attempted-arm-row');
  if(original.competitiveQualifiedGames!==0)
    failures.push('unexpected-competitive-qualified-claim');
  const champion=rows.find(r=>
    r.trial==='6:10:A:champion-reference');
  if(!champion)failures.push('missing-original-champion-source-row');
  else {
    if(champion.sourceSeat!==1)
      failures.push('wrong-physical-source-seat');
    if(champion.sourceDealFingerprint!==SOURCE_DEAL_SHA)
      failures.push('original-source-deal-fingerprint-mismatch');
    const first=champion.firstAuthenticCoheldRoot;
    if(!first)failures.push('missing-first-natural-native-coheld-witness');
    else {
      if(first.globalTurn!==2||first.rootOrdinal!==4||first.seat!==1)
        failures.push('wrong-original-source-root-identity');
      if(!Array.isArray(first.plumeria)||first.plumeria.length===0||
         !Array.isArray(first.teamFlare)||first.teamFlare.length===0)
        failures.push('missing-either-physical-supporter-copy');
    }
  }
  return {passed:failures.length===0,failures};
}

if(require.main===module){
  const result=runFocusedNativeEligibility();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.validation.passed)process.exitCode=1;
}

module.exports={VERSION,runFocusedNativeEligibility,
  validateFocusedNativeEvidence};
