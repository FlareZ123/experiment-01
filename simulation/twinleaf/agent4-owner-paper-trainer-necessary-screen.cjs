'use strict';

const assert=require('node:assert/strict');
const {necessaryTrainerHandPaymentGate}=
  require('./agent49-trainer-hand-payment-veto.cjs');

const VERSION='agent4-owner-paper-trainer-necessary-screen-v1';
const VIP='Battle VIP Pass FST';

/**
 * Independently screen one exact printed Trainer for a known negative
 * turn restriction. Searching for a card and playing it are distinct:
 * a late VIP is a legal possible search result, but is unusable from hand.
 *
 * The ordinary game begins with global turns 1 and 2, one per owner.
 * A global turn > 2 necessarily comes after both opening turns. Within
 * turns 1 and 2 this routine intentionally declines to certify turn
 * eligibility, since the complete turn-ownership ledger is unavailable.
 *
 * @param {{decisionKind:string,globalTurn:number}} view
 * @param {string} printing Exact native fullName, including set suffix.
 * @returns {{printing:string,status:string,blocker:string|null,
 *   positivelyCertified:boolean,printedRuleKnown:boolean}}
 */
function printedTrainerTurnScreen(view,printing){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(Number.isSafeInteger(view.globalTurn)&&view.globalTurn>=1);
  assert.equal(typeof printing,'string');
  if(printing===VIP){
    const expired=view.globalTurn>2;
    return {
      printing,printedRuleKnown:true,
      status:expired?'blocked':'unresolved-opening-turn',
      blocker:expired?'battle-vip-pass-first-turn-expired':null,
      positivelyCertified:false
    };
  }
  return {
    printing,printedRuleKnown:false,
    status:'unmodeled-print-specific-turn-rule',
    blocker:null,positivelyCertified:false
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
 * @returns {object} Owner-private, read-only necessary-condition screen.
 */
function screenOwnerTrainerPaperNecessity(view,rows){
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
    const temporal=printedTrainerTurnScreen(view,row.printing);
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
