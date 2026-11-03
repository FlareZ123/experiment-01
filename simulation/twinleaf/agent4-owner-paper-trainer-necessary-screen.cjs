'use strict';

const assert=require('node:assert/strict');
const {necessaryTrainerHandPaymentGate}=
  require('./agent49-trainer-hand-payment-veto.cjs');
const {PRINT_RULES:PRIZE_RULES,publicPrizeTrainerPrerequisite}=
  require('../evaluation/agent30-public-prize-trainer-necessary.cjs');
const {REMOVAL_PRINTINGS,removalTargetCertificate}=
  require('./agent6-public-removal-target-certificate.cjs');

const VERSION='agent4-owner-paper-trainer-necessary-screen-v7-jp-m4-prize-printing';
const VIP='Battle VIP Pass FST';
/**
 * Exact paper source printings with an exclusive first-owner-turn window.
 * Source identifiers are from the supplied English card database; native
 * fullName uses the set's PTCGO code. Additional going-second restrictions
 * exist on four printings but are deliberately left unverified here.
 * Frozen object prevents treating alternate unrelated printings as eligible.
 */
const FIRST_OWNER_TURN_ONLY=Object.freeze({
  [VIP]:Object.freeze({
    sourceId:'swsh8-225',sourcePrinting:'Battle VIP Pass FST',
    requiresGoingSecond:false
  }),
  'Wait and See Hammer LOT':Object.freeze({
    sourceId:'sm8-192',alsoVariant:'sm8-236',
    sourcePrinting:'Wait and See Hammer LOT',requiresGoingSecond:true
  }),
  'Wait and See Turbo ASR 158':Object.freeze({
    sourceId:'swsh10-158',sourcePrinting:'Wait and See Turbo ASR',
    requiresGoingSecond:true
  }),
  'Helper Bell SSP':Object.freeze({
    sourceId:'sv8-165',sourcePrinting:'Call Bell SSP',
    requiresGoingSecond:true
  }),
  'Chill Teaser Toy SSP':Object.freeze({
    sourceId:'sv8-166',sourcePrinting:'Chill Teaser Toy SSP',
    requiresGoingSecond:true
  })
});


/**
 * Verify a printed first-OWNER-turn restriction against witnessed real owner
 * turns. A global turn above two does not prove both players had a first
 * turn, because additional/skipped turns can break ordinary alternation.
 * When the authentic live-turn record is incomplete, decline uncertain late
 * offers as policy, without falsely classifying them as paper illegal.
 *
 * @param {{decisionKind:string,actorSeat:number,globalTurn:number}} view
 * @param {string} printing Exact native fullName.
 * @param {object|null} [ownerTurnReceipt] Witness from per-game ledger.
 * @returns {object} Independent negative certificate or explicit unknown.
 */
function printedTrainerTurnScreen(view,printing,ownerTurnReceipt=null){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(Number.isSafeInteger(view.globalTurn)&&view.globalTurn>=1);
  assert.equal(typeof printing,'string');
  if(ownerTurnReceipt!==null){
    const {VERSION:LEDGER_VERSION}=
      require('./agent4-owner-turn-ledger.cjs');
    assert.equal(ownerTurnReceipt.version,LEDGER_VERSION);
    assert.equal(ownerTurnReceipt.actorSeat,view.actorSeat);
    assert.equal(ownerTurnReceipt.globalTurn,view.globalTurn);
    assert.equal(ownerTurnReceipt.provenPastFirstOwnerTurn,
      ownerTurnReceipt.distinctObservedOwnerTurns>=2);
    assert.ok(ownerTurnReceipt.openingFirstSeat===null||
      ownerTurnReceipt.openingFirstSeat===0||
      ownerTurnReceipt.openingFirstSeat===1);
  }
  const firstOnly=Object.hasOwn(FIRST_OWNER_TURN_ONLY,printing)?
    FIRST_OWNER_TURN_ONLY[printing]:null;
  if(firstOnly){
    const expired=ownerTurnReceipt?.provenPastFirstOwnerTurn===true;
    const openingFirstSeat=ownerTurnReceipt?.openingFirstSeat??null;
    const goSecondStatus=!firstOnly.requiresGoingSecond?'not-required':
      openingFirstSeat===null?'unverified':
        openingFirstSeat===view.actorSeat?'proven-going-first-ineligible':
          'proven-going-second';
    const goSecondBlocked=goSecondStatus==='proven-going-first-ineligible';
    const conservativeDecline=!expired&&!goSecondBlocked&&view.globalTurn>2;
    const slug=firstOnly.sourcePrinting.replace(/ [A-Z0-9]{2,5}$/,'')
      .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-+$/,'');
    const blocker=expired?slug+'-first-owner-turn-expired':
      goSecondBlocked?slug+'-requires-going-second':null;
    return {
      printing,printedRuleKnown:true,
      sourceCardId:firstOnly.sourceId,
      printedSourceName:firstOnly.sourcePrinting,
      verifiedNativeFullName:printing,
      additionallyRequiresGoingSecond:firstOnly.requiresGoingSecond,
      goingSecondEligibility:goSecondStatus,
      expiryIneligibilityProven:expired,
      status:blocker?'blocked':
        conservativeDecline?'unresolved-owner-turn-history':
          'unresolved-opening-turn',
      blocker,
      conservativeDecline,
      ineligibilityProven:expired||goSecondBlocked,
      positivelyCertified:false
    };
  }
  return {
    printing,printedRuleKnown:false,
    status:'unmodeled-print-specific-turn-rule',
    blocker:null,conservativeDecline:false,
    ineligibilityProven:false,positivelyCertified:false
  };
}

/**
 * Separate physically held/enum-offered, generic-public, printed-temporal,
 * mandatory owner-hand payment, exact public Prize predicates, and public
 * removal-target evidence, with unresolved payment/settlement states.
 * This is a negative-certificate upper-bound census, never a list of
 * paper-legal available moves. Each repeated held-copy/root is retained.
 *
 * @param {object} view Detached owner-only actor observation.
 * @param {object[]} rows Agent5 actual-owner generic frontier rows.
 * @param {object|null} [ownerTurnReceipt] Real live-owner turn witness.
 * @returns {object} Owner-private, read-only necessary-condition screen.
 */
function screenOwnerTrainerPaperNecessity(view,rows,ownerTurnReceipt=null){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(Array.isArray(view.ownHand));
  assert.ok(Array.isArray(rows));
  const seen=new Set();
  const examined=rows.map(row=>{
    assert.ok(Number.isSafeInteger(row.handIndex)&&
      row.handIndex>=0&&row.handIndex<view.ownHand.length);
    assert.equal(row.printing,view.ownHand[row.handIndex]);
    assert.ok(!seen.has(row.handIndex),'Duplicate physical owner-hand index');
    seen.add(row.handIndex);
    const temporal=printedTrainerTurnScreen(view,row.printing,ownerTurnReceipt);
    const payment=necessaryTrainerHandPaymentGate(view,row);
    const publicBlocker=row.publicBlocker??null;
    const knownPrizeRule=Object.hasOwn(PRIZE_RULES,row.printing);
    const publicPrizeCountsAvailable=
      Number.isSafeInteger(view.ownPublic?.prizeCount)&&
      Number.isSafeInteger(view.opponentPublic?.prizeCount);
    // Native actorObservation supplies public counts. Pure legacy fixtures
    // lacking those counts remain UNKNOWN rather than a fabricated veto.
    const prize=knownPrizeRule&&publicPrizeCountsAvailable?
      publicPrizeTrainerPrerequisite(view,row):null;
    const removal=Object.hasOwn(REMOVAL_PRINTINGS,row.printing)?
      removalTargetCertificate(view,row.handIndex):null;
    const blockers=[
      ...(publicBlocker?['generic-public:'+publicBlocker]:[]),
      ...(temporal.blocker?['printed-temporal:'+temporal.blocker]:[]),
      ...(payment.blocked?['printed-hand-payment:'+payment.reason]:[]),
      ...(prize?.blocked?['printed-prize:'+prize.reason]:[]),
      ...(removal?.blockers??[]).map(x=>'printed-removal-target:'+x)
    ];
    return {
      handIndex:row.handIndex,printing:row.printing,type:row.type,
      physicallyHeld:true,
      nativeEnumeratorOffered:typeof row.nativeEnumeratorOffered==='boolean'?
        row.nativeEnumeratorOffered:null,
      genericPublicBlocker:publicBlocker,
      printedTemporalStatus:temporal.status,
      printedTemporalBlocker:temporal.blocker,
      printedTemporalConservativeDecline:temporal.conservativeDecline,
      printedTemporalIneligibilityProven:temporal.ineligibilityProven,
      printedOwnerTurnExpiryProven:temporal.expiryIneligibilityProven??false,
      printedGoingSecondEligibility:temporal.goingSecondEligibility??null,
      printedMandatoryHandCostKnown:payment.knownPrintedCost,
      printedMandatoryHandPayment:
        payment.blocked?'physically-impossible':
          payment.knownPrintedCost?'physically-possible-unpaid':
            'unmodeled-printing',
      printedHandPaymentModes:payment.modeReceipts,
      printedPrizePrerequisite:!knownPrizeRule?'not-modeled':
        !publicPrizeCountsAvailable?'public-prize-count-unavailable':
        prize.blocked?'proven-ineligible':
          'public-prize-predicate-satisfied-other-conditions-unknown',
      printedPrizeCertificate:prize,
      exactTargetEligibility:removal?
        removal.eligibleTargetCount>0?'public-target-present':
        removal.protectedStadiums.length>0?
          'prism-star-stadium-protection-unresolved':
          'proven-no-public-target':'unverified',
      removalTargetCertificate:removal,
      nativeStoreAcceptance:'unverified',
      physicalCustodySettlement:'unverified',
      discreteStrategicBenefit:'unassessed',
      necessaryBlockers:blockers,
      paperPlayable: blockers.length>0?false:null
    };
  });
  const ruledOut=examined.filter(row=>row.paperPlayable===false).length;
  return {
    version:VERSION,actorSeat:view.actorSeat,
    globalTurn:view.globalTurn,
    heldTrainerCopies:examined.length,
    enumeratorOfferedCopies:examined.filter(
      row=>row.nativeEnumeratorOffered===true).length,
    provenNecessaryConditionFailures:ruledOut,
    conservativeTemporalDeclines:examined.filter(row=>
      row.printedTemporalConservativeDecline).length,
    remainingUnresolvedCopies:examined.length-ruledOut,
    allRemainingArePaperLegal:false,
    independentOfNativeEnumerator:true,
    opponentConcealedInformationUsed:false,
    negativeProofFamilies:['generic-public','printed-temporal',
      'printed-hand-payment','printed-prize','printed-removal-target'],
    publicPrizePredicatePositiveIsNotPaperLegality:true,
    publicTargetPositiveIsNotPaperLegality:true,
    gameCompetenceOrWinRateCertified:false,
    rows:examined
  };
}

module.exports={
  VERSION,VIP,FIRST_OWNER_TURN_ONLY,printedTrainerTurnScreen,
  screenOwnerTrainerPaperNecessity
};
