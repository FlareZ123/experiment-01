'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent36-dowsing-pls128-physical-two-card-payment-v1';
const PRINTING = 'Dowsing Machine PLS';

/**
 * Evaluate only the original PLS 128 mandatory discard payment. The card
 * requires two distinct OTHER physical hand cards. No native validator is
 * trusted as the source of paper legality.
 *
 * @param {object} prompt Genuine source-stamped discard prompt.
 * @param {unknown} answer Physical native ResolvePromptAction result.
 * @param {object} owner Physical player with this prompt.
 * @returns {string|null} Independently established invalidity.
 */
function dowsingPaymentNegative(prompt, answer, owner) {
  if (prompt?.message !== 'CHOOSE_CARD_TO_DISCARD' ||
      prompt.options?.min !== 2 || prompt.options?.max !== 2)
    return 'DOWSING_UNEXPECTED_PAYMENT_PROMPT';
  if (!Array.isArray(answer) || answer.length !== 2)
    return 'DOWSING_REQUIRES_EXACTLY_TWO_CARDS';
  if (new Set(answer).size !== 2)
    return 'DOWSING_REQUIRES_DISTINCT_PHYSICAL_CARDS';
  if (!Array.isArray(prompt.cards?.cards) ||
      !Array.isArray(owner?.hand?.cards))
    return 'DOWSING_PAYMENT_SOURCE_NOT_PHYSICALLY_ATTESTED';
  if (answer.some(card => !prompt.cards.cards.includes(card) ||
      !owner.hand.cards.includes(card)))
    return 'DOWSING_SELECTED_CARD_NOT_IN_OWNER_HAND_AND_PROMPT_SOURCE';
  return null;
}

/**
 * Reversible, default-off native Store boundary. A two-card payment is
 * finally credited only if both actual card objects enter the owner's
 * discard and leave the owner's hand. Target recovery and a full turn
 * remain separate evidence; no game is certified by this wrapper.
 *
 * @template T
 * @param {()=>T} run Synchronous native game or prepared Store probe.
 * @param {{Store?:Function}} [deps] Native Store injection for pure tests.
 * @returns {{result:T,audit:object}}
 */
function withDowsingMachinePaperPaymentGuard(run, deps = {}) {
  assert.equal(typeof run, 'function');
  const native = p => require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output', p));
  const Store = deps.Store ?? native('game/store/store').Store;
  const previous = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  assert.equal(typeof previous?.value, 'function');
  const pendingSettlements = [];
  const audit = {
    schema: VERSION, printing: PRINTING, defaultEnabled: false,
    scope: 'Original PLS128 mandatory two-other-card physical payment only',
    inspectedRoots: 0, invalidRoots: 0, inspectedPayments: 0,
    invalidPayments: 0, acceptedPayments: 0,
    settledPhysicalPayments: 0, unsettledPhysicalPayments: 0,
    sourceStampedPayments: [], entireGamePaperQualified: false,
    competitiveQualifiedGames: 0
  };
  function dispatched(action, ...args) {
    const actionType = action?.constructor?.name;
    if (actionType === 'PlayCardAction') {
      const owner = this.state?.players?.find(p => p.id === action.id);
      const played = owner?.hand?.cards?.[action.handIndex];
      if (played?.fullName === PRINTING) {
        audit.inspectedRoots++;
        if (owner.hand.cards.length < 3) {
          audit.invalidRoots++;
          throw new Error('PAPER_ROOT_INVALID:DOWSING_NEEDS_TWO_OTHER_HAND_CARDS');
        }
      }
    }
    if (actionType !== 'ResolvePromptAction')
      return previous.value.call(this, action, ...args);
    const prompt = this.state?.prompts?.find(p =>
      p.id === action.id && p.result === undefined);
    if (prompt?.constructor?.name !== 'ChooseCardsPrompt' ||
        prompt.sourceCard?.fullName !== PRINTING ||
        prompt.message !== 'CHOOSE_CARD_TO_DISCARD')
      return previous.value.call(this, action, ...args);
    audit.inspectedPayments++;
    const owner = this.state?.players?.find(p => p.id === prompt.playerId);
    const reason = dowsingPaymentNegative(prompt, action.result, owner);
    const event = {
      seat: this.state?.players?.indexOf(owner) ?? -1,
      submittedCount: Array.isArray(action.result) ? action.result.length : null,
      reason, nativeAccepted: false, physicallySettled: false
    };
    audit.sourceStampedPayments.push(event);
    if (reason) {
      audit.invalidPayments++;
      throw new Error('PAPER_PROMPT_INVALID:' + reason);
    }
    const accepted = previous.value.call(this, action, ...args);
    event.nativeAccepted = true;
    audit.acceptedPayments++;
    pendingSettlements.push({owner, selected: [...action.result], event});
    return accepted;
  }
  Object.defineProperty(Store.prototype, 'dispatch',
    {...previous, value: dispatched});
  try {
    const result = run();
    return {result, audit};
  } finally {
    for (const {owner, selected, event} of pendingSettlements) {
      event.physicallySettled = selected.every(card =>
        owner.discard?.cards?.includes(card) &&
        !owner.hand?.cards?.includes(card));
      if (event.physicallySettled) audit.settledPhysicalPayments++;
      else audit.unsettledPhysicalPayments++;
    }
    assert.strictEqual(Store.prototype.dispatch, dispatched);
    Object.defineProperty(Store.prototype, 'dispatch', previous);
  }
}

module.exports = {VERSION, PRINTING, dowsingPaymentNegative,
  withDowsingMachinePaperPaymentGuard};
