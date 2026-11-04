"use strict";

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent1-ghala-paper-payment-v2-physical-prism-custody';
const PRINTING = 'Guzma & Hala CEC';

/**
 * Reversible, default-off native Store wrapper for Guzma & Hala's optional
 * exactly-two-other-card payment. Native prompt acceptance is a weaker claim
 * than actual paper payment. The receipt keeps both observations separate.
 *
 * @template T
 * @param {()=>T} run Synchronous native workload.
 * @param {{Store?:Function,prismStarTag?:number|string}} [deps] Test injection.
 * @returns {{result:T,audit:object}}
 */
function withGuard(run, deps = {}) {
  assert.equal(typeof run, 'function');
  const native = file => require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output', file));
  const Store = deps.Store ?? native('game/store/store').Store;
  const prismStarTag = deps.prismStarTag ??
    native('game/store/card/card-types').CardTag.PRISM_STAR;
  const previous = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  assert.equal(typeof previous?.value, 'function');
  const pendingByStore = new Map();
  const audit = {
    version: VERSION, printing: PRINTING, defaultEnabled: false,
    observedPayments: 0, rejectedPayments: 0, acceptedPayments: 0,
    settledPhysicalPayments: 0, unresolvedPhysicalPayments: 0,
    physicalPaymentReceipts: [], paperQualifiedGames: 0
  };

  /** @param {object} store @param {string|null} actionType */
  function inspectCustody(store, actionType) {
    const pending = pendingByStore.get(store);
    if (!pending?.length) return;
    for (const entry of [...pending]) {
      const {owner, cards, receipt} = entry;
      receipt.cardCustody = cards.map(card => {
        const isPrism = card.tags?.includes(prismStarTag) === true;
        const inHand = owner.hand?.cards?.includes(card) === true;
        const inDiscard = owner.discard?.cards?.includes(card) === true;
        const inLostZone = owner.lostzone?.cards?.includes(card) === true;
        const expectedDestination = isPrism ? 'lostzone' : 'discard';
        const actualDestination = inHand ? 'hand' :
          inDiscard ? 'discard' : inLostZone ? 'lostzone' : 'other';
        return {printing: card.fullName ?? null, expectedDestination,
          actualDestination, paidCorrectly: !inHand && (isPrism ?
            inLostZone && !inDiscard : inDiscard && !inLostZone)};
      });
      if (!receipt.cardCustody.every(row => row.paidCorrectly)) continue;
      receipt.physicallyPaidTwo = true;
      receipt.paymentSettledAfter = actionType;
      audit.settledPhysicalPayments++;
      pending.splice(pending.indexOf(entry), 1);
    }
  }

  function dispatch(action, ...args) {
    const actionType = action?.constructor?.name ?? null;
    const prompt = actionType === 'ResolvePromptAction' ?
      this.state?.prompts?.find(p => p.id === action.id && p.result === undefined) :
      null;
    const isPayment = prompt?.sourceCard?.fullName === PRINTING &&
      prompt.message === 'CHOOSE_CARD_TO_DISCARD';
    if (!isPayment) {
      const result = previous.value.call(this, action, ...args);
      inspectCustody(this, actionType);
      return result;
    }

    audit.observedPayments++;
    const owner = this.state?.players?.find(p => p.id === prompt.playerId);
    const cards = action.result;
    const valid = prompt.options?.min === 2 && prompt.options?.max === 2 &&
      Array.isArray(cards) && cards.length === 2 &&
      new Set(cards).size === 2 && Array.isArray(owner?.hand?.cards) &&
      Array.isArray(prompt.cards?.cards) && cards.every(c =>
        c !== prompt.sourceCard && owner.hand.cards.includes(c) &&
        prompt.cards.cards.includes(c));
    if (!valid) {
      audit.rejectedPayments++;
      throw Error('PAPER_GHALA_INVALID_TWO_OTHER_CARD_PAYMENT');
    }

    const receipt = {
      ownerSeat: this.state.players.indexOf(owner),
      selectedPrintings: cards.map(card => card.fullName ?? null),
      validOwnerHandPayment: true, nativeAccepted: false,
      physicallyPaidTwo: false, paymentSettledAfter: null,
      cardCustody: []
    };
    audit.physicalPaymentReceipts.push(receipt);
    const result = previous.value.call(this, action, ...args);
    receipt.nativeAccepted = true;
    audit.acceptedPayments++;
    const pending = pendingByStore.get(this) ?? [];
    pending.push({owner, cards: [...cards], receipt});
    pendingByStore.set(this, pending);
    inspectCustody(this, actionType);
    return result;
  }

  Object.defineProperty(Store.prototype, 'dispatch', {...previous, value: dispatch});
  try {
    return {result: run(), audit};
  } finally {
    for (const pending of pendingByStore.values())
      audit.unresolvedPhysicalPayments += pending.length;
    assert.strictEqual(Store.prototype.dispatch, dispatch);
    Object.defineProperty(Store.prototype, 'dispatch', previous);
  }
}

module.exports = {VERSION, PRINTING, withGuard};
