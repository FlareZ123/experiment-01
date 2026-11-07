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

const VERSION='agent2-first-native-quarantined-owner-view-original2seat-v1';
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
      withNativePaperSupporterDiscipline(()=>
        withCanonicalActorOnlyPolicy(()=>
          withSameTargetAttachEnergySelection(()=>
            runMatch(request)).result,
        {root:work=>withActorOnlyRootPolicy(work,{
          publicContextSpecialEnergy:true,specialEnergyRoot:true,
          nativeOwnerTrainerFallback:true,
          ownerFallbackDiagnosticView:true
        })},{ownerSingleSearch:true,genericFallbackAttribution:true})));
    return {
      candidateSeat,sourceSeat,seed:SEED,enginePin:PIN,
      status:'no-quarantine-abort',
      returnedAudit:guarded.audit??null,
      capturedFirstUnsupportedOwnerRoot:null,
      competitivelyQualified:false
    };
  }catch(error){
    const agg=error?.actorNativeTrainerFallbackAbortAudit??null;
    const first=agg?.firstUnsupportedOwnerRoot??null;
    const guard=error?.nativeRawStateFallbackQuarantine??null;
    const native=error?.nativeAbortEvidence??error?.nativeAbortProvenance??null;
    const valid=error?.code===CODE&&
      agg?.attemptedUnsupportedPasses===1&&
      first?.ownerView?.decisionKind==='owner-root'&&
      typeof first.ownerVisibleSha256==='string'&&
      guard?.rawStateFallbackCalls===1&&
      guard.originalNativeDecoderExecuted===false&&
      first.hiddenSourceIdentitiesIncluded===false;
    return {
      candidateSeat,sourceSeat,seed:SEED,enginePin:PIN,
      status:valid?'quarantined-first-owner-root-captured':
        'error-before-qualified-owner-root',
      thrownCode:error?.code??null,errorName:error?.name??null,
      nativeErrorDigest:hash(String(error?.stack??error)),
      nativeErrorPrefix:String(error?.message??error).slice(0,250),
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
      actorSeat:x.capturedFirstUnsupportedOwnerRoot?.ownerView?.actorSeat??null,
      globalTurn:x.capturedFirstUnsupportedOwnerRoot?.ownerView?.globalTurn??null,
      ownHand:x.capturedFirstUnsupportedOwnerRoot?.ownerView?.ownHand??null,
      firstViewSha256:x.capturedFirstUnsupportedOwnerRoot?.ownerVisibleSha256??null,
      originalNativeRootPrefixLength:x.originalNativeRootPrefixLength
    })))+'\n');
  process.stdout.write(JSON.stringify(r,null,2)+'\n');
  if(!r.bothSeatsCaptured)process.exitCode=1;
}
module.exports={VERSION,PIN,SEED,ACTION_LIMIT,runOne,run};
