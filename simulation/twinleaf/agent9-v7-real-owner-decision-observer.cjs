'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {actorObservation} = require('./actor-observation-contract.cjs');

const VERSION = 'agent9-v7-real-store-actor-only-decision-observer-v1';

/**
 * Observe only the acting owner's real Store decision and the exposed
 * opponent board. No unopened deck, Prize identity or opponent hand is read.
 * The record is a native bot PROPOSAL, not an accepted Store root. Matching
 * to an actual root ledger is an independent obligation.
 *
 * @template T
 * @param {()=>T} execute Real synchronous native game, unchanged.
 * @param {{trialId?:string, SimpleTacticsAi?:Function, Store?:Function,
 *   observe?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withRealOwnerDecisionObserver(execute, deps = {}) {
  assert.equal(typeof execute, 'function');
  const native = name => require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output', name));
  const Ai = deps.SimpleTacticsAi ??
    native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store = deps.Store ?? native('game/store/store').Store;
  const observe = deps.observe ?? actorObservation;
  const oldDecode = Object.getOwnPropertyDescriptor(Ai.prototype,
    'decodeNextAction');
  const oldDispatch = Object.getOwnPropertyDescriptor(Store.prototype,
    'dispatch');
  assert.equal(typeof oldDecode?.value, 'function');
  assert.equal(typeof oldDispatch?.value, 'function');
  let live = null;
  const audit = {
    schema: VERSION, trialId: deps.trialId ?? null,
    liveStoreRegistrations: 0, actorOwnedRootObservations: 0,
    realStoreRootProposals: [], changedAnyBotSelection: false,
    observedOnlyRealStoreState: true, competitiveGamesQualified: 0
  };
  function dispatch(action, ...args) {
    if (!live && action?.constructor?.name === 'AddPlayerAction') {
      live = this;
      audit.liveStoreRegistrations++;
    }
    return oldDispatch.value.call(this, action, ...args);
  }
  function decode(state, ...args) {
    const seat = state?.activePlayer;
    const owner = state?.players?.[seat];
    const genuine = state === live?.state &&
      (seat === 0 || seat === 1) &&
      owner?.id === this.client?.id &&
      Number.isSafeInteger(state.turn) &&
      !state.prompts?.some(prompt => prompt.result === undefined);
    if (!genuine) return oldDecode.value.call(this, state, ...args);
    const snapshot = observe(state, seat);
    const quotaBefore = owner.supporterTurn;
    const chosen = oldDecode.value.call(this, state, ...args);
    const played = chosen?.constructor?.name === 'PlayCardAction' ?
      snapshot.ownHand[chosen.handIndex] ?? null : null;
    audit.realStoreRootProposals.push({
      seat, globalTurn: snapshot.globalTurn, phase: snapshot.phase,
      decisionKind: snapshot.decisionKind,
      nativeProposedAction: chosen?.constructor?.name ?? null,
      nativeProposedPlayedPrinting: played,
      supporterQuotaBeforeBot: quotaBefore,
      supporterQuotaAfterBot: owner.supporterTurn,
      ownerHand: [...snapshot.ownHand],
      ownerPublic: snapshot.ownPublic,
      opponentPublic: snapshot.opponentPublic,
      ownerResources: snapshot.ownTurnResources,
      provenance: 'actor-only real-Store state before generic bot proposal',
      isAcceptedStoreRoot: false,
      isPaperValidatedAlternative: false
    });
    audit.actorOwnedRootObservations++;
    return chosen;
  }
  Object.defineProperty(Store.prototype, 'dispatch', {...oldDispatch,
    value: dispatch});
  Object.defineProperty(Ai.prototype, 'decodeNextAction', {...oldDecode,
    value: decode});
  try {
    return {result: execute(), audit};
  } catch (error) {
    if (error && typeof error === 'object') {
      error.agent9RealOwnerDecisionAudit = {...audit,
        realStoreRootProposals: [...audit.realStoreRootProposals]};
    }
    throw error;
  } finally {
    assert.strictEqual(Ai.prototype.decodeNextAction, decode);
    assert.strictEqual(Store.prototype.dispatch, dispatch);
    Object.defineProperty(Ai.prototype, 'decodeNextAction', oldDecode);
    Object.defineProperty(Store.prototype, 'dispatch', oldDispatch);
  }
}

module.exports = {VERSION, withRealOwnerDecisionObserver};
