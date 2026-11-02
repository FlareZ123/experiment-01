'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent7-rank6-frozen-turn4-candidate-lillie-same-root-v1';
const LILLIE = "Lillie's Determination M1L";
const SERVER = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');

function native(relative) {
  return require(path.join(SERVER, relative));
}

/**
 * An actual post-choice detached-Store test of held Lillie's Determination,
 * at exactly the state in which a source-visible candidate bot chose Pass.
 * This is an observation and cannot affect the actual game or actor choice.
 *
 * @param {object} state Actual Store state immediately before an accepted Pass.
 * @param {0|1} ownerSeat Actual physical owner seat.
 * @param {object} [deps] Controlled pure-test dependency seam.
 * @returns {object} Native root and prompt closure evidence.
 */
function detachedLillieAtPass(state, ownerSeat, deps = {}) {
  assert.ok(ownerSeat === 0 || ownerSeat === 1);
  const {deepClone} = deps.utils ?? native('utils');
  const {Store} = deps.store ?? native('game/store/store');
  const {PlayCardAction, PlayerType, SlotType} = deps.play ??
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction} = deps.resolve ??
    native('game/store/actions/resolve-prompt-action');

  const source = state.players[ownerSeat];
  assert.ok(source && Array.isArray(source.hand?.cards));
  const heldIndex = source.hand.cards.findIndex(card =>
    card?.fullName === LILLIE);
  const before = {
    physicalSeat: ownerSeat,
    globalTurn: state.turn,
    ownerHandCount: source.hand.cards.length,
    ownerDeckCount: source.deck.cards.length,
    ownerPrizesRemaining: source.prizes.filter(p => p.cards.length).length,
    nativeSupporterQuota: source.supporterTurn,
    heldLillieCount: source.hand.cards.filter(c =>
      c.fullName === LILLIE).length
  };
  const result = {
    schema:VERSION,
    before,
    nativeRootAccepted: false,
    promptsSettled: false,
    namedPromptTypes: [],
    nativeError: null,
    unhandledPrompt: null,
    after: null,
    physicalLillieLeftHand: false,
    physicalLillieEnteredDiscard: false,
    nativeSupporterQuotaUsed: false,
    printedDrawCountVerified: false,
    expectedHandCount: null,
    expectedDeckCount: null,
    outcome: 'UNVERIFIED',
    paperWholeGameQualified: false,
    competitiveGameQualified: false
  };
  if (heldIndex < 0 || state.activePlayer !== ownerSeat ||
      state.prompts.some(p => p.result === undefined)) {
    result.outcome = 'INELIGIBLE_PRECONDITION';
    return result;
  }
  const clone = new Store({onStateChange(){}});
  clone.state = deepClone(state);
  const actor = clone.state.players[ownerSeat];
  const card = actor.hand.cards[heldIndex];
  const action = new PlayCardAction(actor.id, heldIndex, {
    player:PlayerType.ANY, slot:SlotType.BOARD, index:0
  });
  const previousRandom = Math.random;
  Math.random = () => 0.5;
  try {
    clone.dispatch(action);
    result.nativeRootAccepted = true;
    for (let n = 0; n < 12; n++) {
      const pending = clone.state.prompts.find(p => p.result === undefined);
      if (!pending) {
        result.promptsSettled = true;
        break;
      }
      const type = pending.constructor.name;
      result.namedPromptTypes.push(type);
      let answer;
      if (type === 'ShuffleDeckPrompt') {
        const p = clone.state.players.find(p => p.id ===
          pending.getPerspectivePlayerId());
        if (!p) throw Error('Native shuffle prompt has no owner');
        answer = Array.from({length:p.deck.cards.length},(_,i) => i);
      } else if (type === 'WaitPrompt') {
        answer = null;
      } else if (type === 'ShowCardsPrompt') {
        answer = true;
      } else {
        result.unhandledPrompt = type;
        break;
      }
      clone.dispatch(new ResolvePromptAction(pending.id, answer));
    }
    if (!result.unhandledPrompt &&
        !clone.state.prompts.some(p => p.result === undefined))
      result.promptsSettled = true;
    const ownerAfter = clone.state.players[ownerSeat];
    result.after = {
      ownerHandCount: ownerAfter.hand.cards.length,
      ownerDeckCount: ownerAfter.deck.cards.length,
      nativeSupporterQuota: ownerAfter.supporterTurn,
      ownerDiscardCount: ownerAfter.discard.cards.length,
      globalTurn: clone.state.turn
    };
    result.physicalLillieLeftHand = !ownerAfter.hand.cards.includes(card);
    result.physicalLillieEnteredDiscard = ownerAfter.discard.cards.includes(card);
    result.nativeSupporterQuotaUsed =
      ownerAfter.supporterTurn > before.nativeSupporterQuota;
    const draw = Math.min(before.ownerPrizesRemaining === 6 ? 8 : 6,
      before.ownerDeckCount + before.ownerHandCount - 1);
    result.expectedHandCount = draw;
    result.expectedDeckCount =
      before.ownerDeckCount + before.ownerHandCount - 1 - draw;
    result.printedDrawCountVerified = result.promptsSettled &&
      ownerAfter.hand.cards.length === draw &&
      ownerAfter.deck.cards.length === result.expectedDeckCount &&
      result.physicalLillieLeftHand &&
      result.physicalLillieEnteredDiscard &&
      result.nativeSupporterQuotaUsed &&
      clone.state.turn === before.globalTurn;
    result.outcome = !result.promptsSettled ?
      'PROMPT_CHAIN_UNVERIFIED' :
      (result.printedDrawCountVerified ? 'NATIVE_LILLIE_SETTLED' :
        'NATIVE_EFFECT_UNVERIFIED');
  } catch (error) {
    result.nativeError = String(error?.message ?? error);
    result.outcome = result.nativeRootAccepted ?
      'NATIVE_PROMPT_REJECTED' : 'NATIVE_ROOT_REJECTED';
  } finally {
    Math.random = previousRandom;
  }
  return result;
}

/**
 * Read-only native observer around an unchanged registered four-game canary.
 * Associates each new real Store instance with the exact registered row order.
 * No alternate action is dispatched into the genuine Store.
 *
 * @template T
 * @param {()=>T} execute Existing selected frozen four-arm experiment.
 * @param {object[]} trials Externally fixed immutable registered trial order.
 * @param {object} [deps] Test dependency seam.
 * @returns {{result:T,audit:object}}
 */
function withFrozenCandidateLilliePassProbe(execute, trials, deps = {}) {
  assert.equal(typeof execute, 'function');
  assert.ok(Array.isArray(trials) && trials.length === 4);
  const {Store} = deps.store ?? native('game/store/store');
  const probe = deps.probe ?? detachedLillieAtPass;
  const old = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  assert.equal(typeof old?.value, 'function');

  const liveStores = new WeakMap();
  const events = [];
  let gameOrdinal = 0;
  function observed(action, ...args) {
    const kind = action?.constructor?.name;
    if (kind === 'AddPlayerAction' && !liveStores.has(this)) {
      liveStores.set(this, gameOrdinal++);
    }
    const index = liveStores.get(this);
    const trial = index === undefined ? null : trials[index];
    const candidateSeat = trial?.candidateSlot === 'A' ? 0 : 1;
    const candidateId = this.state?.players?.[candidateSeat]?.id;
    const ownerId = action?.clientId ?? action?.id;
    const targeted = trial?.candidateSlot === 'A' &&
      kind === 'PassTurnAction' &&
      this.state?.turn === 4 &&
      this.state?.activePlayer === candidateSeat &&
      ownerId === candidateId &&
      !events.some(e => e.trialId === trial.id);
    let pending = null;
    if (targeted) {
      pending = {
        trialId:trial.id,
        candidateId:trial.candidateId,
        sourceRank:trial.rank,
        actualCandidateSeat:candidateSeat,
        nativeRootWasPass:true,
        observation:probe(this.state, candidateSeat)
      };
    }
    try {
      const response = old.value.call(this, action, ...args);
      if (pending) events.push({...pending, nativePassAccepted:true});
      return response;
    } catch (error) {
      if (pending) events.push({...pending, nativePassAccepted:false,
        nativePassError:String(error?.message ?? error)});
      throw error;
    }
  }

  Object.defineProperty(Store.prototype,'dispatch',{...old,value:observed});
  try {
    return {result:execute(),audit:{
      schema:VERSION,
      observedGameCount:gameOrdinal,
      requestedFrozenTrials:trials.map(t => t.id),
      sourceGameActionsChanged:false,
      boundedNativePasses:events,
      competitiveGameQualified:false,
      caveat:'Post-choice Store clone only; no alternate action was selected in the real game. Native Lillie settlement does not prove that this line is strategically superior.'
    }};
  } finally {
    assert.strictEqual(Store.prototype.dispatch,observed);
    Object.defineProperty(Store.prototype,'dispatch',old);
  }
}

module.exports = {
  VERSION, LILLIE, detachedLillieAtPass,
  withFrozenCandidateLilliePassProbe
};
