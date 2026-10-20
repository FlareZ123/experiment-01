'use strict';

const {createHash}=require('node:crypto');
const {isDeepStrictEqual}=require('node:util');

/** @param {unknown} value @returns {string} */
function digest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/**
 * Compare an unchanged source-dealt game to a single native Farewell-over-Pass
 * intervention. A submission alone is never proof of a Store-settled effect.
 *
 * Only engine action metadata is inspected. No deck top, opponent hand,
 * unrevealed Prize identities or future information enter a policy decision.
 *
 * @param {object} baseline Original executed source-dealt game.
 * @param {object} intervention The same source game with one Farewell action.
 * @param {{seat:number,turn:number,archivedRootSha256:string,ownerSettlementAudit?:object}} options
 * @returns {object} Failure-inclusive, noncompetitive attestation.
 */
function attestFarewellPair(baseline,intervention,options) {
  const {seat,turn,archivedRootSha256,ownerSettlementAudit=null}=options;
  const original=baseline.rootActionLedger;
  const changed=intervention.rootActionLedger;
  const fullDeckIdentitiesPresent=Array.isArray(baseline.deckHashes) &&
    baseline.deckHashes.length===2 &&
    baseline.deckHashes.every(hash=>typeof hash==='string'&&hash.length>0) &&
    Array.isArray(intervention.deckHashes) &&
    intervention.deckHashes.length===2;
  const originalDeal=baseline.initialFullPhysicalDealFingerprint?.digestSha256??null;
  const forkDeal=intervention.initialFullPhysicalDealFingerprint?.digestSha256??null;
  const samePhysicalDeal=typeof originalDeal==='string' && originalDeal.length===64 && originalDeal===forkDeal;
  const sourceComparable=samePhysicalDeal && fullDeckIdentitiesPresent &&
    typeof baseline.engine==='string' &&
    baseline.engine.length>0 &&
    baseline.engine===intervention.engine &&
    baseline.seed===intervention.seed &&
    isDeepStrictEqual(baseline.deckHashes,intervention.deckHashes) &&
    baseline.verifiedByDrawLog===true &&
    intervention.verifiedByDrawLog===true &&
    baseline.firstTurnSlot===intervention.firstTurnSlot &&
    Array.isArray(original) && Array.isArray(changed);
  const originalRootSha256=Array.isArray(original)?digest(original):null;
  const archivedSourceUnchanged=originalRootSha256===archivedRootSha256;
  const instances=Array.isArray(changed)?changed.filter(row=>
    row.action==='UseAbilityAction' && row.ability==='Farewell Letter' &&
    row.playerSlot===seat && row.turnBefore===turn):[];
  const exactlyOneFarewell=instances.length===1;
  const position=exactlyOneFarewell?changed.indexOf(instances[0]):-1;
  const baselineRoot=Array.isArray(original)&&position>=0?
    original[position]:null;
  const actualRoot=position>=0?changed[position]:null;
  const matchedPrefix=Array.isArray(original)&&position>=0 &&
    isDeepStrictEqual(original.slice(0,position),changed.slice(0,position));
  const replacedOriginalPass=baselineRoot?.action==='PassTurnAction' &&
    baselineRoot.playerSlot===seat && baselineRoot.turnBefore===turn &&
    baselineRoot.actionOrdinal===actualRoot?.actionOrdinal;
  // A Farewell declaration opens a WaitPrompt in the pinned reducer. Its
  // following real ResolvePromptAction must close before a new voluntary root.
  const promptRoot=position>=0?changed[position+1]:null;
  const waitPromptSettled=promptRoot?.action==='ResolvePromptAction' &&
    promptRoot.pendingPrompt==='WaitPrompt' &&
    promptRoot.playerSlot===seat &&
    promptRoot.turnBefore===turn;
  const authenticAbilityCount=(intervention.abilityTrace||[])
    .filter(row=>row.seat===seat && row.turn===turn &&
      row.name==='Farewell Letter').length;
  const nextSourceRoot=position>=0?changed.slice(position+1).find(row=>
    row.playerSlot===1-seat && row.action!=='ResolvePromptAction' &&
    row.turnBefore>turn):null;
  const sourceContinued=Boolean(nextSourceRoot);
  const nextCandidateRoot=position>=0?changed.slice(position+1).find(row=>
    row.playerSlot===seat && row.action!=='ResolvePromptAction' &&
    row.turnBefore>=turn):null;
  const candidateContinued=Boolean(nextCandidateRoot);
  const observedOwnerZoneSettlement=ownerSettlementAudit?.settledZonePostcondition===true;
  const genuineSingleRootReplacement=Boolean(sourceComparable &&
    archivedSourceUnchanged && exactlyOneFarewell && matchedPrefix &&
    replacedOriginalPass && waitPromptSettled &&
    authenticAbilityCount===1);
  const genuineResolvedFarewell=genuineSingleRootReplacement &&
    observedOwnerZoneSettlement;
  return {
    schema:'agent25-rank6-farewell-paired-native-root-attestation-v1',
    sourceComparable,samePhysicalDeal,physicalDealSha256:originalDeal,
    archivedSourceUnchanged,originalRootSha256,
    exactlyOneFarewell,alteredRootOrdinal:actualRoot?.actionOrdinal??null,
    matchedPrefix,replacedOriginalPass,waitPromptSettled,
    authenticAbilityCount,candidateContinued,sourceContinued,
    nextSourceAction:nextSourceRoot?{
      actionOrdinal:nextSourceRoot.actionOrdinal,
      turn:nextSourceRoot.turnBefore,action:nextSourceRoot.action
    }:null,
    genuineSingleRootReplacement,genuineResolvedFarewell,
    observedOwnerZoneSettlement,
    classification:!sourceComparable?'source-deal-or-start-mismatch':
      !archivedSourceUnchanged?'archived-baseline-policy-drift':
      !exactlyOneFarewell?'missing-or-multiple-native-farewell':
      !matchedPrefix?'pre-intervention-action-drift':
      !replacedOriginalPass?'original-choice-not-pass':
      !waitPromptSettled?'farewell-prompt-unsettled':
      authenticAbilityCount!==1?'ability-declaration-unverified':
      !observedOwnerZoneSettlement?'owner-zone-postcondition-unverified':
      !sourceContinued?'single-native-replacement-no-source-continuation':
      'single-native-replacement-with-real-source-continuation',
    // Zone evidence comes from the next real owner decision, not the action
    // ledger itself. A prior detached-Store probe independently observed
    // the same 42->41 deck / 4->5 hand / Bench-Unown removal transition.
    postPromptZoneChangeDirectlyMeasured:observedOwnerZoneSettlement,
    competitivelyQualifiedGames:0
  };
}

module.exports={attestFarewellPair};
