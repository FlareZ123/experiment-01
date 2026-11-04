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
 * fail-closed four-arm *historical* diagnostic, not a selected policy release.
 *
 * The exact original registered source 60, profile and vendor pins remain
 * fixed. Both trials have different registered physical deals, so the panel
 * makes no paired-outcome comparison. The quarantine is installed around the
 * entire selected bilateral runner, before its actor components.
 *
 * @param {{preflight?:Function,runner?:Function,quarantine?:Function,
 *   ownerSetup?:Function,ownerSetupConfirm?:boolean,
 *   ownerStarting?:Function,ownerSetupBasics?:boolean,
 *   ownerWait?:Function,ownerPhaseWait?:boolean,
 *   ownerShowCards?:Function,ownerShowCardsAck?:boolean,pinNative?:boolean}} [deps] Controlled pure-test seams.
 * @returns {object} Bounded non-secret first-blocker evidence.
 */
function runFirstOwnerDecoderPanel(deps={}) {
  assert.ok(deps.ownerAttackVisualWait!==true || deps.ownerPhaseWait===true,
    'Attack animation acknowledgement requires the phase-wait handler');
  const preflight=deps.preflight??diagnosticPreflight;
  const runner=deps.runner??
    require('./agent41-bilateral-v2-development.cjs').runDevelopment;
  const guard=deps.quarantine??withNativeRawStateFallbackQuarantine;
  const ownerSetup=deps.ownerSetup??require('../twinleaf/agent21-owner-setup-go-first-confirm.cjs')
    .withOwnerSetupGoFirstConfirm;
  const ownerStarting=deps.ownerStarting??require('../twinleaf/agent21-owner-setup-starting-basics.cjs')
    .withOwnerSetupStartingBasics;
  const ownerWait=deps.ownerWait??require('../twinleaf/agent21-owner-nonvisual-phase-wait.cjs')
    .withOwnerNonvisualPhaseWait;
  const ownerShowCards=deps.ownerShowCards??require('../twinleaf/agent21-owner-showcards-acknowledgment.cjs')
    .withOwnerShowCardsAcknowledgment;
  const {profile,trials,codeProvenance}=preflight(deps.pinNative!==false);
  const grouped=['A','B'].map(slot=>trials.filter(t=>
    t.candidateSlot===slot && t.repeat===0));
  assert.ok(grouped.every(g=>g.length===2 &&
    g.some(t=>t.candidateId==='champion-reference') &&
    g.some(t=>t.candidateId==='new-moon-lockbreaker-v1')),
    'Both source seats need original registered candidate pairs');
  assert.notEqual(grouped[0][0].seed,grouped[1][0].seed,
    'This panel requires two distinct historical registered seeds');

  const attempts=grouped.map(pair=>{
    let audit=null;
    let status='NO_RAW_DECODER_CALL_OBSERVED_UNQUALIFIED';
    let returnedRows=0;
    let errorName=null,errorMessage=null,ownerSetupAudit=null;
    let ownerStartingAudit=null,ownerWaitAudit=null,ownerShowCardsAudit=null;
    try {
      const execute=()=>runner({
        ...profile.selectedPolicyOptions,
        registeredTrials:pair,registeredFrameName:VERSION,
        allowAdditionalOriginalSourceRanks:
          profile.allowAdditionalOriginalSourceRanks
      });
      const wrapped=guard(()=>{
        const withShowCards=()=>{
          if(deps.ownerShowCardsAck!==true)return execute();
          const installed=ownerShowCards(execute);
          ownerShowCardsAudit=installed.audit;
          return installed.result;
        };
        const withWait=()=>{
          if(deps.ownerPhaseWait!==true)return withShowCards();
          const installed=ownerWait(withShowCards,{
            allowVisualAttackWait:deps.ownerAttackVisualWait===true
          });
          ownerWaitAudit=installed.audit;
          return installed.result;
        };
        const withBasics=()=>{
          if(deps.ownerSetupBasics!==true)return withWait();
          const installed=ownerStarting(withWait);
          ownerStartingAudit=installed.audit;
          return installed.result;
        };
        if(deps.ownerSetupConfirm!==true)return withBasics();
        const installed=ownerSetup(withBasics);
        ownerSetupAudit=installed.audit;
        return installed.result;
      },{maxRecords:4});
      audit=wrapped.audit;
      returnedRows=wrapped.result?.rows?.length??0;
      assert.equal(wrapped.result?.attempted,2);
      assert.equal(returnedRows,2);
    }catch(error) {
      audit=error?.nativeRawStateFallbackQuarantine??null;
      ownerSetupAudit=error?.agent21OwnerGoFirstAudit??ownerSetupAudit;
      ownerStartingAudit=error?.agent21OwnerStartingAudit??ownerStartingAudit;
      ownerWaitAudit=error?.agent21OwnerWaitAudit??ownerWaitAudit;
      ownerShowCardsAudit=error?.agent21OwnerShowCardsAudit??ownerShowCardsAudit;
      status=error?.code===CODE?
        CODE:'OTHER_NATIVE_OR_PREFLIGHT_ERROR';
      errorName=error?.name??null;
      errorMessage=typeof error?.message==='string'?
        error.message.slice(0,240):null;
    }
    return {
      registeredTrialIds:pair.map(t=>t.id),
      sourceSeat:pair[0].candidateSlot==='A'?1:0,
      errorName,errorMessage,
      ownerSetupConfirmEnabled:deps.ownerSetupConfirm===true,
      ownerGoFirstHandled:ownerSetupAudit?.ownerGoFirstHandled??null,
      ownerGoFirstBySeat:ownerSetupAudit?.ownerGoFirstBySeat??null,
      ownerSetupDecisions:ownerSetupAudit?.records??[],
      ownerStartingBasicsEnabled:deps.ownerSetupBasics===true,
      ownerStartingBasicSelections:ownerStartingAudit?.setupBasicSelections??null,
      ownerStartingBySeat:ownerStartingAudit?.bySeat??null,
      ownerStartingDecisions:ownerStartingAudit?.records??[],
      ownerPhaseWaitEnabled:deps.ownerPhaseWait===true,
      ownerNonvisualWaitsHandled:ownerWaitAudit?.nativePendingWaitHandled??null,
      ownerNonvisualWaitBySeat:ownerWaitAudit?.bySeat??null,
      ownerAttackVisualWaits:ownerWaitAudit?.visualAttackWaitHandled??null,
      ownerWaitDecisions:ownerWaitAudit?.records??[],
      ownerDelegatedWaitMetadata:ownerWaitAudit?.delegatedWaitMetadata??[],
      ownerDelegatedWaitMetadataOmitted:ownerWaitAudit?.delegatedWaitMetadataOmitted??null,
      ownerShowCardsAckEnabled:deps.ownerShowCardsAck===true,
      ownerShowCardsAcknowledged:ownerShowCardsAudit?.showCardsAcknowledged??null,
      ownerShowCardsBySeat:ownerShowCardsAudit?.bySeat??null,
      ownerShowCardsDecisions:ownerShowCardsAudit?.records??[],
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
    exactOwnerSetupConfirmEnabled:deps.ownerSetupConfirm===true,
    exactOwnerStartingBasicsEnabled:deps.ownerSetupBasics===true,
    exactOwnerPhaseWaitEnabled:deps.ownerPhaseWait===true,
    exactOwnerAttackVisualWaitEnabled:deps.ownerAttackVisualWait===true,
    exactOwnerShowCardsAckEnabled:deps.ownerShowCardsAck===true,
    sourceRank:5,
    independentProspective:false,
    priorRegisteredProfileBlob:
      '841b1bc65584c0cf2643c679e5ceffa204263a25',
    priorRegisteredTrialBlob:
      '268023063cfcd1af2312b892e7a1eefd04e28c49',
    vendorPinnedRevision:profile.pinnedVendorRevision,
    codeProvenance:codeProvenance??null,
    originalRegisteredPhysicalSeats:[1,0],
    originalRegisteredCandidateArms:4,
    attempts,
    gameWinRateVerified:false,
    competitivelyQualifiedGames:0,
    caveat:'A hit identifies a necessary missing owner-safe root/prompt interface. A clean detector alone cannot establish full owner-equivalence, paper legality, strategic competence or an actual shared release.'
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(runFirstOwnerDecoderPanel({
    ownerSetupConfirm:process.argv.includes('--owner-setup-confirm'),
    ownerSetupBasics:process.argv.includes('--owner-setup-basics'),
    ownerPhaseWait:process.argv.includes('--owner-phase-wait'),
    ownerAttackVisualWait:process.argv.includes('--owner-attack-visual-wait'),
    ownerShowCardsAck:process.argv.includes('--owner-showcards-ack')
  }),null,2)+'\n');

module.exports={VERSION,runFirstOwnerDecoderPanel};
