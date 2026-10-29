'use strict';

const {isDeepStrictEqual}=require('node:util');
const {firstPhysicalTargetDifference}=
  require('../twinleaf/native-accepted-target-sidecar.cjs');

const VERSION='agent41-physical-policy-pair-audit-v1';
const ENERGY_PROMPT_SCHEMA='accepted-attach-energy-prompt-public-delta-v1';

/**
 * Compare accepted native Energy prompt public effects. Prompt IDs and raw
 * Store dispatch ordinals are recorder metadata, not physical coordinates.
 * Public delta is only an immediate effect and may miss deferred movement.
 * @param {object|null} left
 * @param {object|null} right
 * @returns {object}
 */
function firstAcceptedEnergyPromptDifference(left,right){
  if(left?.schema!==ENERGY_PROMPT_SCHEMA||
      right?.schema!==ENERGY_PROMPT_SCHEMA||
      left.observedLiveStore!==true||right.observedLiveStore!==true||
      !Array.isArray(left.events)||!Array.isArray(right.events))
    return {status:'target-unobserved',reason:'missing-native-prompt-evidence'};
  for(let index=0;index<Math.max(left.events.length,right.events.length);index++){
    const a=left.events[index],b=right.events[index];
    if(!a||!b)
      return {status:'different',index,reason:'accepted-prompt-count',
        firstDispatchOrdinal:a?.dispatchOrdinal??null,
        secondDispatchOrdinal:b?.dispatchOrdinal??null};
    if(a.nativeDispatchAccepted!==true||b.nativeDispatchAccepted!==true||
        a.publicAfterDispatch!==true||b.publicAfterDispatch!==true||
        !Array.isArray(a.publicChanges)||!Array.isArray(b.publicChanges)||
        !a.publicChanges.length||!b.publicChanges.length)
      return {status:'target-unobserved',index,
        reason:'missing-immediate-public-prompt-delta'};
    const physical=row=>({
      turnBefore:row.turnBefore,playerSlot:row.playerSlot,
      promptType:row.promptType,action:row.action,
      publicChanges:row.publicChanges
    });
    if(!isDeepStrictEqual(physical(a),physical(b)))
      return {status:'different',index,
        firstDispatchOrdinal:a.dispatchOrdinal,
        secondDispatchOrdinal:b.dispatchOrdinal};
  }
  return {status:'same-observed-prompt-effects',
    observed:left.events.length,
    scope:'Immediate public effects of accepted AttachEnergyPrompt only'};
}

/**
 * A policy A/B pair must be the same exact physical decks, actual starting
 * deal, seat, and engine. Current canonical champion-vs-NewMoon sourcePairs
 * intentionally FAIL this contract, even if the source's opening deal matches.
 * This is observational evidence, never competitive certification.
 * @param {object|null} control Canonical complete or aborted development row.
 * @param {object|null} treatment Corresponding policy intervention row.
 * @returns {object}
 */
function comparePairedAcceptedTargets(control,treatment){
  const prefix={version:VERSION,competitiveQualified:false};
  if(!control?.trial||!treatment?.trial)
    return {...prefix,status:'incomparable',reason:'missing-trial'};
  const a=control.trial,b=treatment.trial;
  if(a.candidateId!==b.candidateId)
    return {...prefix,status:'incomparable',reason:'different-fixed-60'};
  if(a.rank!==b.rank||a.seed!==b.seed||a.candidateSlot!==b.candidateSlot||
     control.candidateSeat!==treatment.candidateSeat||
     control.sourceSeat!==treatment.sourceSeat)
    return {...prefix,status:'incomparable',reason:'different-trial-or-seat'};
  if(!control.enginePin||control.enginePin!==treatment.enginePin)
    return {...prefix,status:'incomparable',reason:'unverified-engine-pin'};
  if(!control.candidateDeckFingerprint||!control.sourceDeckFingerprint||
     control.candidateDeckFingerprint!==treatment.candidateDeckFingerprint||
     control.sourceDeckFingerprint!==treatment.sourceDeckFingerprint)
    return {...prefix,status:'incomparable',reason:'missing-or-different-deck-fingerprint'};
  if(!control.sourceDealFingerprint||
     control.sourceDealFingerprint!==treatment.sourceDealFingerprint)
    return {...prefix,status:'incomparable',reason:'different-or-missing-source-deal'};
  if(control.fullPhysicalDealProtocol!=='initial-full-physical-deal-sha256-v1'||
     treatment.fullPhysicalDealProtocol!=='initial-full-physical-deal-sha256-v1'||
     !control.fullPhysicalDealFingerprint||
     control.fullPhysicalDealFingerprint!==treatment.fullPhysicalDealFingerprint)
    return {...prefix,status:'incomparable',
      reason:'different-or-missing-both-player-physical-deal'};
  if(!Number.isSafeInteger(control.actualStarterSeat)||
     control.actualStarterSeat!==treatment.actualStarterSeat||
     control.verifiedFirstTurn!==true||
     treatment.verifiedFirstTurn!==true)
    return {...prefix,status:'incomparable',reason:'unverified-actual-starter'};
  if(control.status||treatment.status)
    return {...prefix,status:'incomplete-native-pair',
      controlStatus:control.status??'complete',
      treatmentStatus:treatment.status??'complete'};
  const root=control.nativeAcceptedTargetSidecar?.observedLiveStore===true&&
    treatment.nativeAcceptedTargetSidecar?.observedLiveStore===true?
    firstPhysicalTargetDifference(
      control.nativeAcceptedTargetSidecar,
      treatment.nativeAcceptedTargetSidecar):
    {status:'target-unobserved',reason:'missing-actual-native-Store-observation'};
  const energyPrompt=firstAcceptedEnergyPromptDifference(
    control.nativeAcceptedEnergyPromptSidecar,
    treatment.nativeAcceptedEnergyPromptSidecar);
  return {...prefix,status:'selective-physical-evidence',
    legacyRootLabelsEqual:Boolean(control.rootActionLedgerSha256&&
      control.rootActionLedgerSha256===treatment.rootActionLedgerSha256),
    root,energyPrompt,
    fullPhysicalParityCertified:false,
    inferenceScope:'Accepted PlayCard/Retreat targets and immediate public AttachEnergyPrompt effects only'};
}

module.exports={VERSION,ENERGY_PROMPT_SCHEMA,
  firstAcceptedEnergyPromptDifference,comparePairedAcceptedTargets};
