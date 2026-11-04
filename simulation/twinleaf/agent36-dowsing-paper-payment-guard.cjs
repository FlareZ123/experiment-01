'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent36-dowsing-pls128-transaction-custody-v5-prism-destination';
const PRINTING = 'Dowsing Machine PLS';

/**
 * Evaluate only the original PLS 128 mandatory discard payment.
 * The two chosen cards must be distinct original physical owner-hand cards.
 * Do not use the native prompt validator as a paper legality oracle.
 * @param {object} prompt Native source-stamped discard prompt.
 * @param {unknown} answer Submitted native physical card objects.
 * @param {object} owner Current physical owner.
 * @returns {string|null} Proven invalid payment or null.
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
 * Explicit opt-in reversible native Store boundary, default off.
 * Pinned Dowsing PLS stores the submitted payment before offering its target
 * recovery prompt. The discard physically occurs only after successful
 * recovery. Therefore inspect each post-dispatch source transaction state,
 * settle at the first observed physical cost transfer, and never reclassify
 * a settled payment because the cards are legitimately recycled later.
 * Prism Star costs go to the Lost Zone instead of the discard pile.
 * An unresolved transaction is distinct from a completed unpaid transaction.
 *
 * @template T
 * @param {()=>T} run Synchronous native test or full game.
 * @param {{Store?:Function,prismStarTag?:number|string,requireLiveStore?:boolean,
 *  currentTrialId?:()=>string|null}} [deps] Store injection and actual-game isolation.
 * @returns {{result:T,audit:object}}
 */
function withDowsingMachinePaperPaymentGuard(run, deps = {}) {
  assert.equal(typeof run, 'function');
  const native = p => require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output', p));
  const Store = deps.Store ?? native('game/store/store').Store;
  const prismStarTag = deps.prismStarTag ??
    (deps.Store ? null : native('game/store/card/card-types').CardTag.PRISM_STAR);
  const previous = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  assert.equal(typeof previous?.value, 'function');
  const pendingByStore = new Map();
  const liveOnly = deps.requireLiveStore === true;
  const trialKey = () => deps.currentTrialId?.() ?? '__single__';
  const liveByTrial = new Map();
  const isLive = store => !liveOnly || liveByTrial.get(trialKey()) === store;
  const audit = {
    schema: VERSION, printing: PRINTING, defaultEnabled: false,
    scope: 'Source-stamped PLS128 mandatory two-other-card physical payment only',
    liveStoreRequired: liveOnly, liveSourceTrialCount: 0,
    excludedAuxiliaryDispatches: 0,
    inspectedRoots: 0, invalidRoots: 0, inspectedPayments: 0,
    invalidPayments: 0, acceptedPayments: 0,
    settledPhysicalPayments: 0, unsettledPhysicalPayments: 0,
    unresolvedPhysicalPayments: 0,
    sourceStampedPayments: [], entireGamePaperQualified: false,
    competitiveQualifiedGames: 0
  };

  /** @param {object} store @param {string} actionType @param {object|null} before */
  function observePaymentCustody(store, actionType, before) {
    const pending = pendingByStore.get(store);
    if (!pending?.length) return;
    for (const entry of [...pending]) {
      const {owner, selected, event} = entry;
      const custody = selected.map(card => {
        const prismStar = card.tags?.includes(prismStarTag) === true;
        const inDiscard = owner.discard?.cards?.includes(card) === true;
        const inLostZone = owner.lostzone?.cards?.includes(card) === true;
        const inHand = owner.hand?.cards?.includes(card) === true;
        return {printing: card.fullName ?? null,
          expectedDestination: prismStar ? 'lostzone' : 'discard',
          actualDestination: inHand ? 'hand' : inDiscard ? 'discard' :
            inLostZone ? 'lostzone' : 'other',
          paidCorrectly: !inHand && (prismStar ? inLostZone && !inDiscard :
            inDiscard && !inLostZone)};
      });
      const settled = custody.every(card => card.paidCorrectly);
      event.paymentCustody = custody;
      const recoveryClosed =
        before?.constructor?.name === 'ChooseCardsPrompt' &&
        before.message === 'CHOOSE_CARD_TO_HAND' &&
        before.playerId === owner.id &&
        before.cards === owner.discard;
      if (!settled && !recoveryClosed) continue;
      event.physicallySettled = settled;
      event.transactionClosed = true;
      event.closureDispatchType = actionType;
      event.closureReason = settled ?
        'EXACT_PHYSICAL_COST_TRANSFER' : 'RECOVERY_CLOSED_WITHOUT_PHYSICAL_COST';
      if (settled) audit.settledPhysicalPayments++;
      else audit.unsettledPhysicalPayments++;
      pending.splice(pending.indexOf(entry), 1);
    }
  }

  function dispatched(action, ...args) {
    const actionType = action?.constructor?.name;
    if (liveOnly && actionType === 'AddPlayerAction' &&
        !liveByTrial.has(trialKey())) {
      liveByTrial.set(trialKey(), this);
      audit.liveSourceTrialCount++;
    }
    if (!isLive(this)) {
      audit.excludedAuxiliaryDispatches++;
      return previous.value.call(this, action, ...args);
    }
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
    const before = actionType === 'ResolvePromptAction' ?
      this.state?.prompts?.find(p => p.id === action.id && p.result === undefined) :
      null;
    const payment = actionType === 'ResolvePromptAction' &&
      before?.constructor?.name === 'ChooseCardsPrompt' &&
      before.sourceCard?.fullName === PRINTING &&
      before.message === 'CHOOSE_CARD_TO_DISCARD';
    if (!payment) {
      const result = previous.value.call(this, action, ...args);
      observePaymentCustody(this, actionType, before);
      return result;
    }
    audit.inspectedPayments++;
    const owner = this.state?.players?.find(p => p.id === before.playerId);
    const reason = dowsingPaymentNegative(before, action.result, owner);
    const event = {
      trialId: trialKey(),
      seat: this.state?.players?.indexOf(owner) ?? -1,
      submittedCount: Array.isArray(action.result) ? action.result.length : null,
      reason, nativeAccepted: false, physicallySettled: false,
      transactionClosed: false, closureDispatchType: null,
      closureReason: null
    };
    audit.sourceStampedPayments.push(event);
    if (reason) {
      audit.invalidPayments++;
      throw new Error('PAPER_PROMPT_INVALID:' + reason);
    }
    const result = previous.value.call(this, action, ...args);
    event.nativeAccepted = true;
    audit.acceptedPayments++;
    const list = pendingByStore.get(this) ?? [];
    list.push({owner, selected: [...action.result], event});
    pendingByStore.set(this, list);
    observePaymentCustody(this, actionType, before);
    return result;
  }

  Object.defineProperty(Store.prototype, 'dispatch',
    {...previous, value: dispatched});
  try {
    return {result: run(), audit};
  } finally {
    for (const pending of pendingByStore.values()) {
      for (const entry of pending) {
        entry.event.closureReason = 'TRANSACTION_UNRESOLVED_AT_RUN_END';
        audit.unresolvedPhysicalPayments++;
      }
    }
    assert.strictEqual(Store.prototype.dispatch, dispatched);
    Object.defineProperty(Store.prototype, 'dispatch', previous);
  }
}

module.exports = {VERSION, PRINTING, dowsingPaymentNegative,
  withDowsingMachinePaperPaymentGuard};
