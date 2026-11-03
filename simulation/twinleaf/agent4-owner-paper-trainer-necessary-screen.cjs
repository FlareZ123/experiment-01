'use strict';

const assert=require('node:assert/strict');
const {necessaryTrainerHandPaymentGate}=
  require('./agent49-trainer-hand-payment-veto.cjs');

const VERSION='agent4-owner-paper-trainer-necessary-screen-v2-owner-turn-provenance';
const VIP='Battle VIP Pass FST';

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
  }
  if(printing===VIP){
    const expired=ownerTurnReceipt?.provenPastFirstOwnerTurn===true;
    const conservativeDecline=!expired&&view.globalTurn>2;
    return {
      printing,printedRuleKnown:true,
      status:expired?'blocked':
        conservativeDecline?'unresolved-owner-turn-history':
          'unresolved-opening-turn',
      blocker:expired?'battle-vip-pass-first-owner-turn-expired':null,
      conservativeDecline,
      ineligibilityProven:expired,
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
 * mandatory owner-hand payment and unresolved target/settlement states.
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
    const blockers=[
      ...(publicBlocker?['generic-public:'+publicBlocker]:[]),
      ...(temporal.blocker?['printed-temporal:'+temporal.blocker]:[]),
      ...(payment.blocked?['printed-hand-payment:'+payment.reason]:[])
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
      printedMandatoryHandCostKnown:payment.knownPrintedCost,
      printedMandatoryHandPayment:
        payment.blocked?'physically-impossible':
          payment.knownPrintedCost?'physically-possible-unpaid':
            'unmodeled-printing',
      printedHandPaymentModes:payment.modeReceipts,
      exactTargetEligibility:'unverified',
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
    gameCompetenceOrWinRateCertified:false,
    rows:examined
  };
}

module.exports={
  VERSION,VIP,printedTrainerTurnScreen,screenOwnerTrainerPaperNecessity
};
