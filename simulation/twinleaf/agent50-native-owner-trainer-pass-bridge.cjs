'use strict';

const assert=require('node:assert/strict');
const {ownerTrainerOpportunity}=require('./agent5-generic-owner-trainer-opportunity.cjs');

const VERSION='agent50-native-owner-trainer-pass-bridge-v2-printed-temporal-negative';

/**
 * Inspect a native bot's proposed root after a detached actor-only policy
 * would otherwise Pass. This is a candidate filter, never a proof of card-
 * specific paper eligibility, affordability, benefit or prompt resolution.
 *
 * Only the acting owner's detached hand and public board enter the decision.
 * The native candidate is advisory and may have used an unsafe native policy.
 * @param {object} view Actual owner-root actor observation.
 * @param {object|null} action Native root proposal from the existing bot.
 * @param {Map<string,object>} trainerCatalog Public printed Trainer metadata.
 * @param {Function} PlayCardAction Pinned native action class.
 * @returns {object} Deterministic, detached acceptance decision and reason.
 */
function classifyNativeTrainerAfterPass(view,action,trainerCatalog,PlayCardAction){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(trainerCatalog instanceof Map);
  assert.equal(typeof PlayCardAction,'function');
  if(!(action instanceof PlayCardAction))
    return {selected:false,reason:'native-did-not-propose-play-card'};
  const index=action.handIndex;
  if(!Number.isSafeInteger(index)||index<0||index>=view.ownHand.length)
    return {selected:false,reason:'invalid-owner-hand-index'};
  const printing=view.ownHand[index];
  if(!trainerCatalog.has(printing))
    return {selected:false,reason:'proposed-card-not-trainer'};
  const frontier=ownerTrainerOpportunity(view,trainerCatalog);
  const row=frontier.rows.find(x=>x.handIndex===index);
  assert.ok(row,'Public native Trainer catalog and owner frontier disagreed');
  if(row.publicBlocker)
    return {selected:false,reason:'generic-public-rule-block',
      printing,type:row.type,publicBlocker:row.publicBlocker};
  // Native ActionEnumerator may offer Battle VIP Pass on later turns.
  // Printed exact-turn veto is independent of native canPlay/Store acceptance.
  const temporal=require('./agent4-owner-paper-trainer-necessary-screen.cjs')
    .printedTrainerTurnScreen(view,printing);
  if(temporal.blocker)
    return {selected:false,reason:'printed-temporal-rule-block',
      printing,type:row.type,handIndex:index,
      printedTemporalBlocker:temporal.blocker,paperPlayable:false};
  // An explicit fixed-cardinality payment that cannot be made from this
  // physical owner hand cannot produce a paper-legal Trainer resolution.
  // A payable or unmodeled cost stays unresolved at every other gate.
  const payment=require('./agent49-trainer-hand-payment-veto.cjs')
    .necessaryTrainerHandPaymentGate(view,row);
  if(payment.blocked)
    return {selected:false,reason:payment.reason,
      printing,type:row.type,handIndex:index,
      physicalOtherCards:view.ownHand.length-1,
      knownPaymentModes:payment.modeReceipts.map(m=>m.requiredDiscards),
      paperPaymentVerified:false};
  return {selected:true,reason:'native-proposed-generic-unblocked-trainer',
    printing,type:row.type,handIndex:index,
    unresolvedPaperPayment:true,unresolvedPaperTarget:true,
    unresolvedNativePrompt:true,unqualifiedNativeDecision:true};
}

module.exports={VERSION,classifyNativeTrainerAfterPass};
