'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent3-owner-ko-prize-settlement-evidence-v1';

/**
 * Observe the native Store's ordinary-KO-shaped owner Prize selections without
 * altering the player's decisions. The source-prompt destination must be the
 * owner's hand, and only chosen Prize-slot physical identities are inspected
 * after the choice exists. Card names and concealed faces never enter policy
 * inputs or the returned audit.
 *
 * Source provenance is intentionally bounded: a different card could construct
 * a hand-destination prompt. The native checkState origin remains independently
 * necessary for a full KO certificate.
 *
 * @template T
 * @param {()=>T} execute Existing synchronous real-Store experiment.
 * @param {{Store?:Function,GameMessage?:object,maxRecords?:number}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerKoPrizeSettlementEvidence(execute, deps = {}) {
  assert.equal(typeof execute, 'function');
  const output = path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const Store = deps.Store ??
    require(path.join(output, 'game/store/store')).Store;
  const GameMessage = deps.GameMessage ??
    require(path.join(output, 'game/game-message')).GameMessage;
  const maxRecords = deps.maxRecords ?? 64;
  assert.ok(Number.isSafeInteger(maxRecords) && maxRecords >= 0);
  const previous = Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof previous?.value,'function');
  assert.equal(previous.configurable,true);

  let liveStore = null;
  const audit = {
    version: VERSION,
    observedKoShapedSelections: 0,
    nativeResolved: 0, nativeUnresolved: 0, nativeRejected: 0,
    exactOwnerHandTransfers: 0, exactOwnerLostZoneTransfers: 0,
    otherOrUnverifiedDestinations: 0,
    bySeat: {0: 0, 1: 0},
    records: [], recordsOmitted: 0,
    chosenPrizeFacesReadByPolicy: false,
    knockoutSourceOriginFullyCertified: false,
    opponentPrizeRedirectionPaperCertified: false,
    competitivelyQualifiedGames: 0
  };

  function dispatch(action, ...args) {
    if (action?.constructor?.name === 'AddPlayerAction') liveStore = this;
    const state = this.state;
    const prompt = this === liveStore &&
      action?.constructor?.name === 'ResolvePromptAction'
      ? state.prompts?.find(p =>
        p.id === action.id && p.result === undefined)
      : null;
    const seat = prompt
      ? state.players.findIndex(p => p.id === prompt.playerId)
      : -1;
    const owner = seat >= 0 ? state.players[seat] : null;
    const count = prompt?.options?.count;
    const koShape = (
      prompt?.constructor?.name === 'ChoosePrizePrompt' &&
      prompt.message === GameMessage.CHOOSE_PRIZE_CARD &&
      (seat === 0 || seat === 1) &&
      Array.isArray(owner?.hand?.cards) &&
      Array.isArray(owner?.prizes) &&
      prompt.options.destination === owner.hand &&
      prompt.options.useOpponentPrizes === false &&
      prompt.options.allowCancel === false &&
      Array.isArray(prompt.options.blocked) &&
      prompt.options.blocked.length === 0 &&
      Number.isSafeInteger(count) && count >= 1 &&
      Array.isArray(action.result) &&
      action.result.length > 0 &&
      action.result.length <= count &&
      new Set(action.result).size === action.result.length &&
      action.result.every(slot =>
        owner.prizes.includes(slot) && slot.cards.length > 0)
    );

    if (!koShape) return previous.value.apply(this,[action,...args]);

    // The action has already been chosen using the owner's own information.
    // Store only object identities internally; neither card text nor names are
    // inspected, returned, logged or supplied to a chooser.
    const physical = action.result.flatMap(slot => slot.cards.slice());
    const countCards = player => player.prizes.reduce(
      (total,slot) => total + slot.cards.length, 0);
    const pre = {
      prizes: countCards(owner),
      hand: owner.hand.cards.length,
      lostZone: owner.lostzone?.cards?.length ?? null
    };
    audit.observedKoShapedSelections++;
    audit.bySeat[seat]++;

    let returned;
    try { returned = previous.value.apply(this,[action,...args]); }
    catch(error) { audit.nativeRejected++; throw error; }

    if (prompt.result !== action.result) {
      audit.nativeUnresolved++;
      throw new Error('Native KO-shaped Prize prompt returned without resolution');
    }
    audit.nativeResolved++;
    const stillPrized = physical.some(card =>
      owner.prizes.some(slot => slot.cards.includes(card)));
    const movedToHand = physical.length > 0 && !stillPrized &&
      physical.every(card => owner.hand.cards.includes(card));
    const movedToLostZone = physical.length > 0 && !stillPrized &&
      Array.isArray(owner.lostzone?.cards) &&
      physical.every(card => owner.lostzone.cards.includes(card));
    let destination = 'other-or-unverified';
    if (movedToHand) {
      destination = 'owner-hand';
      audit.exactOwnerHandTransfers++;
    } else if (movedToLostZone) {
      destination = 'owner-lost-zone';
      audit.exactOwnerLostZoneTransfers++;
    } else {
      audit.otherOrUnverifiedDestinations++;
    }
    const record = {
      seat, turn: state.turn, phase: state.phase,
      selectedSlots: action.result.length,
      selectedPhysicalCards: physical.length,
      originalPromptResolved: true,
      destination, prePrizeCards: pre.prizes,
      postPrizeCards: countCards(owner),
      handDelta: owner.hand.cards.length - pre.hand,
      lostZoneDelta: pre.lostZone === null ? null :
        owner.lostzone.cards.length - pre.lostZone
    };
    if (audit.records.length < maxRecords) audit.records.push(record);
    else audit.recordsOmitted++;
    return returned;
  }

  Object.defineProperty(Store.prototype,'dispatch',
    {...previous,value:dispatch});
  try { return {result:execute(),audit}; }
  catch(error) {
    if (error && typeof error === 'object')
      error.agent3KoPrizeSettlementAudit = {
        ...audit,records:[...audit.records],aborted:true
      };
    throw error;
  } finally {
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',previous);
  }
}

module.exports = {VERSION,withOwnerKoPrizeSettlementEvidence};
