'use strict';

const assert=require('node:assert/strict');
const {
  diagnosticPreflight
}=require('./agent21-root-anchored-mew-historical-diagnostic.cjs');
const {
  CODE,withNativeRawStateFallbackQuarantine
}=require('../twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

const VERSION='agent21-first-native-owner-decoder-quarantine-panel-v1';

/**
 * Examine the earliest inherited raw-State decoder delegation under an
 * original rank-5 source on each real physical seat. This is a deliberately
 * fail-closed two-trial *historical* diagnostic, not a selected policy release.
 *
 * The exact original registered source 60, profile and vendor pins remain
 * fixed. Both trials have different registered physical deals, so the panel
 * makes no paired-outcome comparison. The quarantine is installed around the
 * entire selected bilateral runner, before its actor components.
 *
 * @param {{preflight?:Function,runner?:Function,quarantine?:Function,
 *   pinNative?:boolean}} [deps] Controlled pure-test seams.
 * @returns {object} Bounded non-secret first-blocker evidence.
 */
function runFirstOwnerDecoderPanel(deps={}) {
  const preflight=deps.preflight??diagnosticPreflight;
  const runner=deps.runner??
    require('./agent41-bilateral-v2-development.cjs').runDevelopment;
  const guard=deps.quarantine??withNativeRawStateFallbackQuarantine;
  const {profile,trials,codeProvenance}=preflight(deps.pinNative!==false);
  const control=trials.filter(t=>t.candidateId==='champion-reference');
  const selected=['A','B'].map(slot=>
    control.find(t=>t.candidateSlot===slot));
  assert.ok(selected.every(Boolean),'Original source seats A and B required');
  assert.notEqual(selected[0].seed,selected[1].seed,
    'This panel requires two distinct historical registered seeds');

  const attempts=selected.map(trial=>{
    let audit=null;
    let status='NO_RAW_DECODER_CALL_OBSERVED_UNQUALIFIED';
    let returnedRows=0;
    try {
      const wrapped=guard(()=>runner({
        ...profile.selectedPolicyOptions,
        registeredTrials:[trial],registeredFrameName:VERSION,
        allowAdditionalOriginalSourceRanks:
          profile.allowAdditionalOriginalSourceRanks
      }),{maxRecords:4});
      audit=wrapped.audit;
      returnedRows=wrapped.result?.rows?.length??0;
      assert.equal(wrapped.result?.attempted,1);
      assert.equal(returnedRows,1);
    }catch(error) {
      audit=error?.nativeRawStateFallbackQuarantine??null;
      status=error?.code===CODE?
        CODE:'OTHER_NATIVE_OR_PREFLIGHT_ERROR';
    }
    return {
      trialId:trial.id,sourceSeat:trial.candidateSlot==='A'?1:0,
      actualFullPhysicalDeal:null,
      mode:'historical-registered-single-attempt',
      status,
      rawStateFallbackCalls:audit?.rawStateFallbackCalls??null,
      originalNativeDecoderExecuted:
        audit?.originalNativeDecoderExecuted??null,
      firstBlockedDecision:audit?.records?.[0]??null,
      boundedBlockedDecisions:audit?.records??[],
      recordsOmitted:audit?.recordsOmitted??null,
      returnedRows,
      ownerInformationSafeWholePolicyCertified:false,
      paperPaymentCertified:false,
      competitiveGameQualified:false
    };
  });
  return {
    schema:VERSION,
    actualSelectedCommonPolicyRelease:false,
    sourceRank:5,
    independentProspective:false,
    priorRegisteredProfileBlob:
      '841b1bc65584c0cf2643c679e5ceffa204263a25',
    priorRegisteredTrialBlob:
      '268023063cfcd1af2312b892e7a1eefd04e28c49',
    vendorPinnedRevision:profile.pinnedVendorRevision,
    codeProvenance:codeProvenance??null,
    originalRegisteredPhysicalSeats:[1,0],
    attempts,
    gameWinRateVerified:false,
    competitivelyQualifiedGames:0,
    caveat:'A hit identifies a necessary missing owner-safe root/prompt interface. A clean detector alone cannot establish full owner-equivalence, paper legality, strategic competence or an actual shared release.'
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(runFirstOwnerDecoderPanel(),null,2)+'\n');

module.exports={VERSION,runFirstOwnerDecoderPanel};
