'use strict';

const assert=require('node:assert/strict');
const {VERSION:PRIZE_VERSION,publicPrizeTrainerPrerequisite,
  screenOwnerTrainerPrizePrerequisites}=
  require('./agent30-public-prize-trainer-necessary.cjs');

const VERSION='agent44-m4-public-necessary-v1';
const SPECIAL_PRINTINGS=new Set(['Special Red Card M4','Special Red Card CRI']);

/**
 * Extend the frozen v2 Prize-only negative certificate with the independently
 * verified Special Red Card no-opponent-hand paper rule.
 *
 * Input is a detached owner-root observation; only the public opponent hand
 * count is used. Positive necessary checks are NOT paper-playability proof.
 * This does not modify v2 or install a policy wrapper.
 *
 * @param {object} view Owner-root actorObservation.
 * @param {{handIndex:number,printing:string,type:string}} row Exact owner-held copy.
 * @returns {object} Versioned negative-only paper prerequisite certificate.
 */
function publicTrainerNecessaryV3(view,row){
  const prior=publicPrizeTrainerPrerequisite(view,row);
  if(!SPECIAL_PRINTINGS.has(row.printing))return prior;
  assert.equal(prior.knownPrintedPrerequisite,true);
  const opponentHand=view.opponentPublic?.handCount;
  assert.ok(Number.isSafeInteger(opponentHand)&&opponentHand>=0,
    'Public opponent hand count required for Special Red Card proof');
  const blockedReasons=[];
  if(prior.blocked)blockedReasons.push('public-prize-prerequisite-failed');
  if(opponentHand===0)blockedReasons.push('public-opponent-hand-empty');
  const blocked=blockedReasons.length>0;
  return {
    ...prior,version:VERSION,priorVersion:PRIZE_VERSION,
    observedOpponentHandCount:opponentHand,
    checkedNecessaryConditions:[
      'opponent-prize-count-at-most-3','opponent-hand-positive'
    ],
    blocked,blockedReasons,
    reason:blockedReasons[0]??null,
    paperPlayable:blocked?false:null,
    anyPaperPlayCertified:false,
    opponentConcealedInformationUsed:false,
    remainingTargetPaymentAndBenefitUnknown:true
  };
}

/**
 * Produce one owner-visible, copy-index-preserving negative paper screen.
 * The original v2 screen enforces genuine owner hand-index uniqueness.
 *
 * @param {object} view Owner-root actorObservation.
 * @param {object[]} rows Genuine physical owner-hand Trainer copies.
 * @returns {object} Negative screen, never a positive legal-play certificate.
 */
function screenOwnerTrainerPaperNecessitiesV3(view,rows){
  const prior=screenOwnerTrainerPrizePrerequisites(view,rows);
  const examined=rows.map(row=>({
    handIndex:row.handIndex,...publicTrainerNecessaryV3(view,row)
  }));
  const handBlocked=examined.filter(row=>
    row.blockedReasons?.includes('public-opponent-hand-empty')).length;
  const blocked=examined.filter(row=>row.blocked).length;
  return {
    version:VERSION,priorVersion:PRIZE_VERSION,
    actorSeat:prior.actorSeat,globalTurn:prior.globalTurn,
    heldTrainerCopies:examined.length,
    exactPrintedRulesSeen:examined.filter(row=>
      row.knownPrintedPrerequisite).length,
    provenPrizeBlockedCopies:prior.provenPrizeBlockedCopies,
    provenEmptyOpponentHandBlockedCopies:handBlocked,
    provenPaperBlockedCopies:blocked,
    remainingNotDisprovenCopies:examined.length-blocked,
    anyPaperPlayableTrainerCertified:false,
    opponentConcealedInformationUsed:false,
    competitiveGameQualified:false,
    rows:examined
  };
}

module.exports={VERSION,SPECIAL_PRINTINGS,publicTrainerNecessaryV3,
  screenOwnerTrainerPaperNecessitiesV3};
