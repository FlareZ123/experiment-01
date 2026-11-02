'use strict';

const assert = require('node:assert/strict');
const {auditQuickBallPayment} = require(
  './agent41-quickball-payment-contract.cjs');

const VERSION = 'agent41-quickball-owner-transaction-v3';


/** @param {string[]|null} a @param {string[]} b @returns {boolean} */
function samePrintedHand(a, b) {
  if (!Array.isArray(a) || a.length !== b.length) return false;
  const aa=[...a].sort(),bb=[...b].sort();
  return aa.every((x,i)=>x===bb[i]);
}

/**
 * Read only accepted native Store decisions. The headless runner records
 * decisionHandBefore from the ACTING physical seat, after the bot has already
 * decided and before Store.dispatch. Accepted choices appear in decisionTrace.
 *
 * Payment identity needs more evidence than its position after a Quick Ball:
 * bind to the root ordinal, owner, compulsory 1-card nondeck selection, accepted
 * printed root identity and the exact pre-root hand/handIndex. An "unclassified"
 * sourceZone can still be a hand selection; count agreement is mandatory.
 *
 * @param {{decisionTrace:object[],rootActionLedger:object[],
 *  nativeAcceptedTargetSidecar:{events:object[]}}} evidence
 * @returns {{version:string,rows:object[],competitiveQualified:false}}
 */
function reconcileQuickBallOwnerTransactions(evidence) {
  assert.ok(Array.isArray(evidence?.decisionTrace));
  assert.ok(Array.isArray(evidence.rootActionLedger));
  assert.ok(Array.isArray(evidence.nativeAcceptedTargetSidecar?.events));
  const byOrdinal = new Map(evidence.decisionTrace.map(x => [x.actionOrdinal, x]));
  const rows = [];
  for (const root of evidence.rootActionLedger) {
    if (root.pendingPrompt !== null || root.action !== 'PlayCardAction' ||
        root.card !== 'Quick Ball') continue;
    const seat = root.playerSlot;
    const accepted = evidence.nativeAcceptedTargetSidecar.events.find(x =>
      x.rootActionOrdinal === root.actionOrdinal && x.storeAccepted === true &&
      x.playerSlot === seat && x.action === 'PlayCardAction' &&
      /^Quick Ball /.test(x.declared?.ownerHandPrinting ?? ''));
    const before = byOrdinal.get(root.actionOrdinal);
    const ownHand = before?.decisionHandBefore?.perspectiveSeat === seat &&
      Array.isArray(before.decisionHandBefore.ownHandPrintings) ?
      before.decisionHandBefore.ownHandPrintings : null;
    const all = evidence.rootActionLedger.filter(x =>
      x.initiatingRootActionOrdinal === root.actionOrdinal &&
      x.action === 'ResolvePromptAction' &&
      x.pendingPrompt === 'ChooseCardsPrompt' && x.playerSlot === seat);
    const selections = all.map(x => byOrdinal.get(x.actionOrdinal))
      .filter(x => x?.cardSelection);
    const payment = selections.find(x =>
      (x.cardSelection.sourceZone === 'hand' &&
        x.cardSelection.sourcePlayerSlot === seat ||
        x.cardSelection.sourceZone === 'unclassified' &&
        x.cardSelection.sourcePlayerSlot === -1) &&
      x.cardSelection.nativePromptMin === 1 &&
      x.cardSelection.nativePromptMax === 1 &&
      x.cardSelection.selectedCards?.length === 1);
    const search = selections.find(x =>
      x.cardSelection.sourceZone === 'deck');
    const ownerPrinting = accepted?.declared?.ownerHandPrinting ?? null;
    const rootIndex = accepted?.declared?.handIndex;
    let status = null;
    if (!accepted || !before || !ownHand) status = 'ROOT_PROVENANCE_UNVERIFIED';
    else if (!Number.isInteger(rootIndex) || ownHand[rootIndex] !== ownerPrinting)
      status = 'PRINTED_ROOT_HAND_INDEX_CONFLICT';
    else if (!payment) status = 'PAYMENT_PROMPT_UNVERIFIED';
    else if (!samePrintedHand(payment.decisionHandBefore?.ownHandPrintings,
      ownHand.filter((_,index)=>index!==rootIndex)))
      status = 'PAYMENT_HAND_PRESTATE_CONFLICT';
    else if (payment.cardSelection.sourceZoneCardCountBefore !== ownHand.length - 1)
      status = 'PAYMENT_HAND_SIZE_CONFLICT';
    else if (payment.playerSlot !== seat ||
      payment.decisionHandBefore?.perspectiveSeat !== seat)
      status = 'PAYMENT_OWNER_CONFLICT';
    const base = status === null ? auditQuickBallPayment({
      ownerSeat:seat, paymentSeat:seat, playedPrinting:ownerPrinting,
      paidPrinting:payment.cardSelection.selectedCards[0], handBefore:ownHand,
      rootAccepted:true, paymentAccepted:true
    }) : null;
    rows.push({
      rootOrdinal:root.actionOrdinal,seat,globalTurn:root.turnBefore,
      ownerPrinting,
      status:status ?? base.status,
      rootPreHandCount:ownHand?.length ?? null,
      // A successful Store.dispatch is evidence of an accepted prompt choice,
      // not independently proof that the card reached the discard zone.
      nativePaymentChoiceAccepted:status === null,
      publicDiscardPostconditionVerified:false,
      paymentSelection:payment?.cardSelection.selectedCards[0] ?? null,
      paymentSourceZone:payment?.cardSelection.sourceZone ?? null,
      searchedPrintings:search?.cardSelection.selectedCards ?? null,
      duplicateOtherAvailable:base?.duplicateOtherAvailable ?? null,
      paymentCopiesBefore:base?.paidCopiesBefore ?? null,
      paymentCopiesAfter:base?.paidCopiesAfter ?? null
    });
  }
  return {version:VERSION,rows,competitiveQualified:false};
}
module.exports={VERSION,reconcileQuickBallOwnerTransactions};
