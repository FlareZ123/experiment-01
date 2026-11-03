'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent7-ghala-native-owner-zone-lineage-v1';
const PRINTING = 'Guzma & Hala CEC';
const PAYMENT_MESSAGE = 'CHOOSE_CARD_TO_DISCARD';

/**
 * Observe actual native Store hand-to-discard movement for the physical
 * two-card optional Guzma & Hala payment. A prompt choice alone is
 * insufficient evidence that the selected cards changed zones.
 *
 * Recording is strictly post-choice and never changes either player's
 * actions. Invalid payment is observed rather than repaired, so this
 * observer must be composed with a separate mandatory paper-payment guard.
 *
 * @template T
 * @param {()=>T} run Synchronous genuine Store execution.
 * @param {{Store?:Function}} [dependencies] Unit-test injection only.
 * @returns {{result:T,audit:object}}
 */
function withGuzmaHalaOwnerZoneLineage(run, dependencies = {}) {
  assert.equal(typeof run, 'function');
  const Store = dependencies.Store ?? require(path.resolve(
    __dirname, '../../vendor/twinleaf/ptcg-server/output/game/store/store'
  )).Store;
  const old = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  assert.equal(typeof old?.value, 'function');

  const events = [];
  const dispatchCounts = new WeakMap();
  const liveStoreOrdinals = new WeakMap();
  let nativeGameCount = 0;
  const audit = {
    schema: VERSION,
    printing: PRINTING,
    paymentMessage: PAYMENT_MESSAGE,
    liveOnly:dependencies.liveOnly === true,
    observedPaymentPrompts: 0,
    paperTwoCardZoneWitnesses: 0,
    rejectedOrUnverifiedPayments: 0,
    events,
    wholeGamePaperQualified: false,
    competitiveGameQualified: false
  };

  function dispatch(action, ...args) {
    if(action?.constructor?.name === 'AddPlayerAction' &&
        !liveStoreOrdinals.has(this))
      liveStoreOrdinals.set(this,nativeGameCount++);
    const count = (dispatchCounts.get(this) ?? 0) + 1;
    dispatchCounts.set(this, count);
    const isResolution = action?.constructor?.name === 'ResolvePromptAction';
    const prompt = isResolution ? this.state?.prompts?.find(p =>
      p.id === action.id && p.result === undefined
    ) : null;
    const observe = prompt?.sourceCard?.fullName === PRINTING &&
      prompt.message === PAYMENT_MESSAGE;
    if (!observe || (dependencies.liveOnly === true &&
        !liveStoreOrdinals.has(this)))
      return old.value.call(this, action, ...args);

    const ownerBefore = this.state?.players?.find(p =>
      p.id === prompt.playerId
    );
    const handBefore = ownerBefore?.hand?.cards;
    const discardBefore = ownerBefore?.discard?.cards;
    const selected = action.result;
    const validSelection = Array.isArray(selected) &&
      selected.length === 2 && new Set(selected).size === 2 &&
      Array.isArray(handBefore) && Array.isArray(discardBefore) &&
      Array.isArray(prompt.cards?.cards) &&
      selected.every(card => handBefore.includes(card) &&
        prompt.cards.cards.includes(card));
    const priorDiscard = Array.isArray(discardBefore) ?
      new Set(discardBefore) : null;
    const witness = {
      storeDispatchOrdinal: count,
      gameOrdinal:liveStoreOrdinals.get(this) ?? null,
      globalTurnBefore:this.state?.turn ?? null,
      playerId: prompt.playerId ?? null,
      ownerSeat: Array.isArray(this.state?.players) ?
        this.state.players.indexOf(ownerBefore) : null,
      promptId: prompt.id,
      requestedCount: Array.isArray(selected) ? selected.length : null,
      distinctSelected: Array.isArray(selected) ?
        new Set(selected).size : null,
      selectedPrintings:Array.isArray(selected) ?
        selected.map(card => card?.fullName ?? null) : null,
      nativePromptMin: prompt.options?.min ?? null,
      nativePromptMax: prompt.options?.max ?? null,
      handCountBefore: Array.isArray(handBefore) ? handBefore.length : null,
      discardCountBefore: Array.isArray(discardBefore) ?
        discardBefore.length : null,
      validPhysicalSelectionBefore: validSelection,
      nativeDispatchCompleted: false,
      actualSelectedCardMovementToDiscard: false,
      selectedStillInHand: null,
      ownerHandCountAfter: null,
      ownerDiscardCountAfter: null,
      paperTwoCardZoneWitness: false,
      nativeError: null
    };

    let output;
    try {
      output = old.value.call(this, action, ...args);
      witness.nativeDispatchCompleted = true;
    } catch (error) {
      witness.nativeError = String(error?.message ?? error);
      throw error;
    } finally {
      const ownerAfter = this.state?.players?.find(p =>
        p.id === prompt.playerId
      );
      const handAfter = ownerAfter?.hand?.cards;
      const discardAfter = ownerAfter?.discard?.cards;
      witness.ownerHandCountAfter = Array.isArray(handAfter) ?
        handAfter.length : null;
      witness.ownerDiscardCountAfter = Array.isArray(discardAfter) ?
        discardAfter.length : null;
      witness.selectedStillInHand = Array.isArray(selected) &&
        Array.isArray(handAfter) ?
        selected.some(card => handAfter.includes(card)) : null;
      witness.actualSelectedCardMovementToDiscard =
        validSelection && Array.isArray(discardAfter) &&
        selected.every(card => discardAfter.includes(card) &&
          !priorDiscard.has(card)) &&
        Array.isArray(handAfter) &&
        selected.every(card => !handAfter.includes(card));
      witness.paperTwoCardZoneWitness =
        witness.nativeDispatchCompleted &&
        witness.actualSelectedCardMovementToDiscard;
      events.push(witness);
      audit.observedPaymentPrompts++;
      if (witness.paperTwoCardZoneWitness)
        audit.paperTwoCardZoneWitnesses++;
      else
        audit.rejectedOrUnverifiedPayments++;
    }
    return output;
  }

  Object.defineProperty(Store.prototype, 'dispatch', {
    ...old, value: dispatch
  });
  try {
    return {result: run(), audit};
  } finally {
    assert.strictEqual(Store.prototype.dispatch, dispatch);
    Object.defineProperty(Store.prototype, 'dispatch', old);
  }
}

module.exports = {VERSION, PRINTING, withGuzmaHalaOwnerZoneLineage};
