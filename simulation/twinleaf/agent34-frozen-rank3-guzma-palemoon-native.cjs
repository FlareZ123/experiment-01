'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { actorObservation } = require('./actor-observation-contract.cjs');

const VERSION = 'agent34-frozen-skyliner-rank3-turn61-owner-guzma-v1';
const OUTPUT = path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');

/**
 * Owner-visible paper preflight for the originally held Guzma after
 * Pale Moon-GX. The opponent must have a Bench for the first switch,
 * and this player must have a Bench to move the delayed-KO recipient.
 * Deliberately frozen to the registered original turn; not a general bot.
 *
 * @param {object} view Detached, authenticated owner observation.
 * @returns {{kind:string,handIndex:number,printing:string}|null}
 */
function chooseFrozenGuzmaReply(view) {
  if (view?.decisionKind !== 'owner-root' || view.globalTurn !== 61 ||
    view.ownTurnResources?.supporterPlayedTurn !== 0 ||
    view.ownTurnResources?.supporterPlayLocked === true ||
    view.ownPublic?.active?.printing !== 'Rotom V LOR' ||
    view.opponentPublic?.active?.printing !== 'Trevenant & Dusknoir-GX SMP' ||
    !view.ownPublic?.bench?.some(p => p?.printing) ||
    !view.opponentPublic?.bench?.some(p => p?.printing)) {
    return null;
  }
  const handIndex = view.ownHand?.indexOf('Guzma BUS') ?? -1;
  return handIndex < 0 ? null :
    { kind: 'play-frozen-guzma-counterreply', handIndex,
      printing: 'Guzma BUS' };
}

/**
 * Reversible actor-owned exact-root counterfactual. Captures the first real
 * Store on AddPlayerAction and refuses speculative cloned State proposals.
 * A targeted Stage needs actual native Store acceptance and both prompts
 * resolved; proposal alone is never counted as a paid supporter.
 *
 * @template T
 * @param {()=>T} execute Native original-source match.
 * @param {{targetSeat:0|1,targetTurn:number,SimpleTacticsAi?:Function,
 *   Store?:Function,PlayCardAction?:Function,PlayerType?:object,SlotType?:object,
 *   observe?:Function,choose?:Function}} deps Native constructor seams.
 * @returns {{result:T,audit:object}}
 */
function withFrozenRank3GuzmaReply(execute, deps) {
  assert.equal(typeof execute, 'function');
  assert.ok(deps.targetSeat === 0 || deps.targetSeat === 1);
  assert.equal(deps.targetTurn, 61);
  const Tactics = deps.SimpleTacticsAi ??
    require(path.join(OUTPUT, 'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store = deps.Store ??
    require(path.join(OUTPUT, 'game/store/store')).Store;
  const nativeActions = deps.PlayCardAction && deps.PlayerType && deps.SlotType ?
    null : require(path.join(OUTPUT, 'game/store/actions/play-card-action'));
  const PlayCardAction = deps.PlayCardAction ?? nativeActions.PlayCardAction;
  const PlayerType = deps.PlayerType ?? nativeActions.PlayerType;
  const SlotType = deps.SlotType ?? nativeActions.SlotType;
  const observe = deps.observe ?? actorObservation;
  const choose = deps.choose ?? chooseFrozenGuzmaReply;

  const previousTactics = Object.getOwnPropertyDescriptor(Tactics.prototype,
    'decodeNextAction');
  const previousStore = Object.getOwnPropertyDescriptor(Store.prototype,
    'dispatch');
  assert.equal(typeof previousTactics?.value, 'function');
  assert.equal(typeof previousStore?.value, 'function');
  let rootStore = null;
  const audit = {
    version: VERSION,
    targetSeat: deps.targetSeat,
    targetTurn: deps.targetTurn,
    capturedRealStore: false,
    originalPassesAtTarget: 0,
    ownerEligibleOffers: 0,
    proposals: [],
    speculativeStateVetoes: 0,
    storePaymentUnverified: true,
    qualifiedCompetitiveGames: 0
  };

  function dispatch(action, ...args) {
    if (rootStore === null &&
      action?.constructor?.name === 'AddPlayerAction') {
      rootStore = this;
      audit.capturedRealStore = true;
    }
    return previousStore.value.call(this, action, ...args);
  }

  function decode(state, ...args) {
    const original = previousTactics.value.call(this, state, ...args);
    if (original?.constructor?.name !== 'PassTurnAction' ||
      state.turn !== deps.targetTurn ||
      state.activePlayer !== deps.targetSeat ||
      state.prompts?.some(p => p.result === undefined)) {
      return original;
    }
    if (rootStore?.state !== state) {
      audit.speculativeStateVetoes++;
      return original;
    }
    audit.originalPassesAtTarget++;
    const view = observe(state, deps.targetSeat);
    const proposal = choose(view);
    if (!proposal) return original;
    assert.equal(proposal.kind, 'play-frozen-guzma-counterreply');
    assert.equal(view.ownHand[proposal.handIndex], 'Guzma BUS');
    audit.ownerEligibleOffers++;
    audit.proposals.push({
      sourceSeat: deps.targetSeat,
      turn: state.turn,
      ownHandIndex: proposal.handIndex,
      ownCard: proposal.printing,
      ownActive: view.ownPublic.active.printing,
      ownBenchCount: view.ownPublic.bench.filter(Boolean).length,
      otherActive: view.opponentPublic.active.printing,
      otherBenchCount: view.opponentPublic.bench.filter(Boolean).length,
      ownerSupporterQuota: view.ownTurnResources.supporterPlayedTurn,
      storeAcceptance: 'not established by proposal'
    });
    return new PlayCardAction(
      state.players[deps.targetSeat].id,
      proposal.handIndex,
      { player: PlayerType.ANY, slot: SlotType.BOARD, index: 0 }
    );
  }

  Object.defineProperty(Store.prototype, 'dispatch', {
    ...previousStore, value: dispatch
  });
  Object.defineProperty(Tactics.prototype, 'decodeNextAction', {
    ...previousTactics, value: decode
  });
  try {
    return { result: execute(), audit };
  } finally {
    assert.strictEqual(Tactics.prototype.decodeNextAction, decode);
    assert.strictEqual(Store.prototype.dispatch, dispatch);
    Object.defineProperty(Tactics.prototype, 'decodeNextAction',
      previousTactics);
    Object.defineProperty(Store.prototype, 'dispatch', previousStore);
  }
}

module.exports = { VERSION, chooseFrozenGuzmaReply,
  withFrozenRank3GuzmaReply };
