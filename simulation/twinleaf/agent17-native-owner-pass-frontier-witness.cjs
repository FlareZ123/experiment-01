'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {actorObservation} = require('./actor-observation-contract.cjs');

const VERSION = 'agent17-native-owner-pass-frontier-witness-v2-pass-transition-attested';
const digest = value => createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * Link real Store dispatch-returning Pass roots with archived ordinals and
 * actual direct or WaitPrompt-mediated native turn transitions. A no-throw
 * dispatch alone never proves a Pass settled; fail closed on missing evidence.
 *
 * @param {object[]} events Post-accepted owner-only snapshots.
 * @param {object|null} result Actual completed or capped native match result.
 * @returns {object} Registered root and disclosure checks, developmental only.
 */
function ownerPassFrontierAudit(events,result) {
  const roots = result?.rootActionLedger?.filter(row =>
    row.action === 'PassTurnAction') ?? null;
  const linked = roots === null ? null : events.map(row => {
    const matches = roots.filter(root =>
      root.turnBefore === row.globalTurn &&
      root.playerSlot === row.actorSeat);
    return matches.length === 1 ? matches[0].actionOrdinal : null;
  });
  const rootOrdinalLinked = linked !== null &&
    linked.every(ordinal => Number.isSafeInteger(ordinal));
  const ledger = result?.rootActionLedger ?? null;
  const recorded = events.map((row,index) => {
    const ordinal = rootOrdinalLinked ? linked[index] : null;
    const direct = row.nativeImmediateTurnAfter > row.globalTurn;
    const continuations = ordinal === null ? [] : ledger.filter(action =>
      action.action === 'ResolvePromptAction' &&
      action.initiatingRootActionOrdinal === ordinal &&
      action.turnBefore === row.globalTurn &&
      action.turnAfter > row.globalTurn);
    const deferred = continuations.length === 1;
    return {
      ...row,
      rootActionOrdinal:ordinal,
      nativePassTransitionVerdict:direct?'immediate-native-turn-advanced':
        deferred?'linked-prompt-advanced-turn':
          'turn-transition-unverified',
      nativePassTransitionVerified:direct||deferred
    };
  });
  return {
    version:VERSION,
    count:recorded.length,
    rootOrdinalLinked,
    status:rootOrdinalLinked &&
      recorded.every(row=>row.nativePassTransitionVerified) ?
      'source-owned-verified-pass-turn-transitions' :
      'pass-dispatch-observed-turn-transition-unverified',
    verifiedNativeTurnTransitions:recorded.filter(row =>
      row.nativePassTransitionVerified).length,
    events:recorded,
    eventsSha256:digest(recorded),
    postDecisionObserverOnly:true,
    opponentHiddenCardsExposedToPolicy:false,
    cardPlayabilityCertified:false,
    competitivelyQualifiedGames:0
  };
}

/**
 * Capture detached actor-visible owner evidence when a genuine Store root
 * Pass dispatch returns without throwing; settlement is independently verified. This observer executes AFTER bot decisions, so
 * it cannot influence the policy's current choice. It restores the Store
 * dispatch method after success or failure.
 *
 * @template T
 * @param {()=>T} execute Real native match, or a test double.
 * @param {{Store?:Function,observe?:Function,onlySeat?:0|1|null,
 *   onlyTurns?:number[]|null}} [deps] Owner scope and native seams.
 * @returns {{result:T,audit:object}}
 */
function withNativeOwnerPassFrontier(execute,deps={}) {
  assert.equal(typeof execute,'function');
  const Store = deps.Store ?? require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const observe = deps.observe ?? actorObservation;
  const onlySeat = deps.onlySeat ?? null;
  const onlyTurns = deps.onlyTurns ?? null;
  assert.ok(onlySeat === null || onlySeat === 0 || onlySeat === 1);
  assert.ok(onlyTurns === null || (Array.isArray(onlyTurns) &&
    onlyTurns.every(turn => Number.isSafeInteger(turn) && turn >= 0)));
  const proto = Store.prototype;
  const old = Object.getOwnPropertyDescriptor(proto,'dispatch');
  assert.equal(typeof old?.value,'function');
  let live = null;
  const events = [];

  function capture(action,...args) {
    if (!live && action?.constructor?.name === 'AddPlayerAction')
      live = this;
    if (this !== live)
      return old.value.call(this,action,...args);
    const state = this.state;
    const eligible = action?.constructor?.name === 'PassTurnAction' &&
      (state?.activePlayer === 0 || state?.activePlayer === 1) &&
      !state.prompts?.some(prompt => prompt.result === undefined) &&
      (onlySeat === null || state.activePlayer === onlySeat) &&
      (onlyTurns === null || onlyTurns.includes(state.turn));
    const before = eligible ? observe(state,state.activePlayer) : null;
    if (before) {
      assert.equal(before.decisionKind,'owner-root');
      assert.equal(before.actorSeat,state.activePlayer);
      assert.ok(Array.isArray(before.ownHand));
      assert.equal(before.opponentPublic?.handCount >= 0,true);
      assert.equal(Object.hasOwn(before.opponentPublic,'hand'),false);
    }
    const answer = old.value.call(this,action,...args);
    if (before) {
      events.push({
        actorSeat:before.actorSeat,
        globalTurn:before.globalTurn,
        actorHandPrintings:[...before.ownHand],
        actorHandSize:before.ownHand.length,
        actorPublic:before.ownPublic,
        opponentPublic:before.opponentPublic,
        actorTurnResources:before.ownTurnResources,
        actorK1:before.ownerK1,
        opportunityAssessment:'unverified',
        nativeStoreAcceptedPass:true,
        nativeStoreDispatchReturned:true,
        nativeStoreAcceptedPassMeaning:
          'dispatch-return-only; see nativePassTransitionVerdict',
        nativeImmediateTurnAfter:this.state?.turn??null,
        nativeImmediateActiveSeatAfter:this.state?.activePlayer??null
      });
    }
    return answer;
  }
  Object.defineProperty(proto,'dispatch',{...old,value:capture});
  try {
    const result = execute();
    return {result,audit:ownerPassFrontierAudit(events,result)};
  } catch (error) {
    if (error && typeof error === 'object')
      error.ownerPassFrontierEvidence =
        ownerPassFrontierAudit(events,null);
    throw error;
  } finally {
    assert.strictEqual(proto.dispatch,capture);
    Object.defineProperty(proto,'dispatch',old);
  }
}

module.exports = {VERSION,ownerPassFrontierAudit,
  withNativeOwnerPassFrontier};
