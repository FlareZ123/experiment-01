'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=require('../twinleaf/headless.cjs');
const {originalPrintings}=require(
  './agent2-vs-seeker-research-original-rank13-aba.cjs');
const {withCanonicalActorOnlyPolicy}=require(
  './agent7-canonical-actor-composition.cjs');
const {withActorOnlyRootPolicy}=require(
  '../twinleaf/agent34-actor-only-root-policy.cjs');
const {withNativeRawStateFallbackQuarantine,CODE}=require(
  '../twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');
const {withNativePaperSupporterDiscipline}=require(
  '../twinleaf/agent41-paper-supporter-discipline.cjs');
const {withSameTargetAttachEnergySelection}=require(
  '../twinleaf/same-target-attach-energy-hook.cjs');
const {withGoFirstChoice,VERSION:GO_FIRST_VERSION}=require('../twinleaf/agent6-go-first-choice.cjs');
const {withOwnerStartingBasicChoice,VERSION:STARTING_BASIC_VERSION}=require('../twinleaf/agent50-owner-starting-basic-choice.cjs');
const {withOwnerPublicAcknowledgements,VERSION:PUBLIC_ACK_VERSION}=require('../twinleaf/agent50-owner-public-acknowledgements.cjs');
const {withOwnerMandatoryShowCards,VERSION:SHOWCARDS_VERSION}=require('../twinleaf/agent50-owner-mandatory-showcards.cjs');
const {withBlockedPromptEnvelope,VERSION:BLOCKED_ENVELOPE_VERSION}=require('../twinleaf/agent50-first-blocked-prompt-envelope.cjs');
const {withFirstBlockedPromptContract,VERSION:PROMPT_CONTRACT_VERSION}=require('../twinleaf/agent2-first-blocked-prompt-contract.cjs');

const VERSION='agent2-first-native-quarantined-owner-view-original2seat-v3-selected-setup-stack';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SEED=290134,ACTION_LIMIT=220;
const hash=x=>createHash('sha256').update(JSON.stringify(x))
  .digest('hex');

/**
 * Fixed original 60s, one precommitted seed, both physical orientations.
 * All original native decoder calls must remain quarantined.
 * @param {0|1} candidateSeat Physical rank13 seat.
 * @param {{source:string[],candidate:string[]}} cards Original cards.
 * @returns {object} Error-inclusive exact visible owner-root audit.
 */
function runOne(candidateSeat,cards){
  const sourceSeat=1-candidateSeat;
  const request={
    deckA:candidateSeat===0?cards.candidate:cards.source,
    deckB:candidateSeat===1?cards.candidate:cards.source,
    seed:SEED,maxActions:ACTION_LIMIT,
    strictPromptValidation:true,mandatoryOptionFallback:true,
    enforceSelectOptionLegality:true,enforceVisiblePlayLockBothSeats:true,
    captureInitialFullPhysicalDeal:true,
    captureInitialSourceDealFingerprintSeat:sourceSeat,
    captureDecisionTrace:true,captureNativeAbortEvidence:true,
    label:'agent2-first-quarantined-owner-r13-r3-seat'+candidateSeat
  };
  try{
    const guarded=withNativeRawStateFallbackQuarantine(()=>
      withFirstBlockedPromptContract(()=>
        withGoFirstChoice([false,false],()=>
          withOwnerStartingBasicChoice(()=>
            withOwnerPublicAcknowledgements(()=>
              withOwnerMandatoryShowCards(()=>
                withBlockedPromptEnvelope(()=>
                  withNativePaperSupporterDiscipline(()=>
                    withCanonicalActorOnlyPolicy(()=>
          withSameTargetAttachEnergySelection(()=>
            runMatch(request)).result,
        {root:work=>withActorOnlyRootPolicy(work,{
          publicContextSpecialEnergy:true,specialEnergyRoot:true,
          nativeOwnerTrainerFallback:true,
          ownerFallbackDiagnosticView:true
        })},{ownerSingleSearch:true,genericFallbackAttribution:true})))))))));
    return {
      candidateSeat,sourceSeat,seed:SEED,enginePin:PIN,
      status:'no-quarantine-abort',
      returnedAudit:guarded.audit??null,
      goFirstChoiceAudit:guarded.result?.result?.audit??null,
      firstBlockedPromptContract:guarded.result?.audit?.firstBlockedPromptContract??null,
      capturedFirstUnsupportedOwnerRoot:null,
      competitivelyQualified:false
    };
  }catch(error){
    const agg=error?.actorNativeTrainerFallbackAbortAudit??null;
    const first=agg?.firstUnsupportedOwnerRoot??null;
    const goFirstChoiceAudit=error?.goFirstChoiceAudit??null;
    const firstBlockedPromptContract=
      error?.agent2FirstBlockedPromptContract??null;
    const guard=error?.nativeRawStateFallbackQuarantine??null;
    const native=error?.nativeAbortEvidence??error?.nativeAbortProvenance??null;
    const valid=error?.code===CODE&&
      agg?.attemptedUnsupportedPasses===1&&
      first?.ownerView?.decisionKind==='owner-root'&&
      typeof first.ownerVisibleSha256==='string'&&
      goFirstChoiceAudit?.choices?.length===1&&
      goFirstChoiceAudit.choices[0].chooseFirst===false&&
      guard?.rawStateFallbackCalls===1&&
      guard.originalNativeDecoderExecuted===false&&
      Number.isSafeInteger(native?.actionOrdinal)&&
      native?.rootActionCount===native.actionOrdinal&&
      first.hiddenSourceIdentitiesIncluded===false;
    return {
      candidateSeat,sourceSeat,seed:SEED,enginePin:PIN,
      status:valid?'quarantined-first-owner-root-captured':
        'error-before-qualified-owner-root',
      thrownCode:error?.code??null,errorName:error?.name??null,
      nativeErrorDigest:hash(String(error?.stack??error)),
      nativeErrorPrefix:String(error?.message??error).slice(0,250),
      goFirstChoiceAudit,
      firstBlockedPromptContract,
      firstRootProvenance:first?{
        candidateSeat,sourceSeat,
        actorSeat:first.ownerView?.actorSeat??null,
        actionOrdinal:native?.actionOrdinal??null,
        acceptedRootCount:native?.rootActionCount??null,
        intentKind:'pass',
        intentReason:'no-supported-owner-visible-root',
        quarantineCode:error?.code??null,
        quarantineMessage:String(error?.message??error).slice(0,250),
        rootActionPrefixSha256:native?.rootActionLedgerSha256??null
      }:null,
      acceptedRootPrefix:Array.isArray(native?.rootActionLedger)?
        native.rootActionLedger.slice(-12).map(root=>({
          actionOrdinal:root.actionOrdinal,turnBefore:root.turnBefore,
          turnAfter:root.turnAfter,playerSlot:root.playerSlot,
          action:root.action,pendingPrompt:root.pendingPrompt
        })):[],
      actorAbortCounters:agg?{
        attemptedUnsupportedPasses:agg.attemptedUnsupportedPasses,
        selectedNativeTrainerRoots:agg.selectedNativeTrainerRoots,
        acceptedNativeTrainerRoots:agg.acceptedNativeTrainerRoots
      }:null,
      capturedFirstUnsupportedOwnerRoot:first,
      nativeQuarantine:{
        rawStateFallbackCalls:guard?.rawStateFallbackCalls??null,
        originalNativeDecoderExecuted:
          guard?.originalNativeDecoderExecuted??null,
        records:guard?.records??null
      },
      originalNativeRootPrefixSha256:native?.rootActionLedger?
        hash(native.rootActionLedger):null,
      originalNativeRootPrefixLength:
        native?.rootActionLedger?.length??null,
      competitivelyQualified:false
    };
  }
}
/** @returns {object} Frozen two-seat prospectively selected run. */
function run(){
  initializeCards();
  const cards=originalPrintings();
  const rows=[0,1].map(seat=>runOne(seat,cards));
  return {
    version:VERSION,enginePin:PIN,seed:SEED,actionLimit:ACTION_LIMIT,
    sourceCodeCommit:process.env.GITHUB_SHA??null,
    setupAdapterVersions:{
      goFirst:GO_FIRST_VERSION,
      startingBasics:STARTING_BASIC_VERSION,
      publicAcknowledgements:PUBLIC_ACK_VERSION,
      mandatoryShowCards:SHOWCARDS_VERSION,
      blockedPromptEnvelope:BLOCKED_ENVELOPE_VERSION,
      firstBlockedPromptContract:PROMPT_CONTRACT_VERSION
    },
    goFirstPolicy:[false,false],
    selectedSetupAdapters:[
      'agent50-owner-starting-basic-choice',
      'agent50-owner-public-acknowledgements',
      'agent50-owner-mandatory-showcards',
      'agent50-first-blocked-prompt-envelope'
    ],
    originalCandidateRank:13,originalSourceRank:3,
    candidateSha256:hash(cards.candidate),
    sourceSha256:hash(cards.source),
    registration:'results/methodology/registrations/'+
      'agent2-first-owner-fallback-original-rank13-rank3-20261107.md',
    plannedSeats:[0,1],
    qualifiedGames:0,rows,
    bothSeatsCaptured:rows.every(x=>
      x.status==='quarantined-first-owner-root-captured')
  };
}
if(require.main===module){
  const r=run();
  process.stderr.write('AGENT2_FIRST_BLOCKED_OWNER_NATIVE '+
    JSON.stringify(r.rows.map(x=>({
      candidateSeat:x.candidateSeat,status:x.status,
      thrownCode:x.thrownCode,
      goFirstChoices:x.goFirstChoiceAudit?.choices??null,
      blockedPrompt:x.firstBlockedPromptContract??null,
      firstRootProvenance:x.firstRootProvenance??null,
      actorSeat:x.capturedFirstUnsupportedOwnerRoot?.ownerView?.actorSeat??null,
      globalTurn:x.capturedFirstUnsupportedOwnerRoot?.ownerView?.globalTurn??null,
      ownHand:x.capturedFirstUnsupportedOwnerRoot?.ownerView?.ownHand??null,
      firstViewSha256:x.capturedFirstUnsupportedOwnerRoot?.ownerVisibleSha256??null,
      originalNativeRootPrefixLength:x.originalNativeRootPrefixLength,
      nativeErrorPrefix:x.nativeErrorPrefix??null,
      actorAbortCounters:x.actorAbortCounters??null,
      quarantineRecords:x.nativeQuarantine?.records??null
    })))+'\n');
  process.stdout.write(JSON.stringify(r,null,2)+'\n');
  if(!r.bothSeatsCaptured)process.exitCode=1;
}
module.exports={VERSION,PIN,SEED,ACTION_LIMIT,runOne,run};
