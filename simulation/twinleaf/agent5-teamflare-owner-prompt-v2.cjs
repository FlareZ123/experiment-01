'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent5-teamflare-one-physical-owner-prompt-v2';
const SOURCE = 'Team Flare Grunt XY';
const MESSAGE = 'CHOOSE_CARD_TO_DISCARD';

/**
 * Read-only original opponent Active and owner identity gate. Only the one
 * native, already-played XY129 Supporter may request this single Energy
 * choice. All other pending prompts retain the previously installed policy.
 *
 * @template T
 * @param {()=>T} execute Frozen native source game.
 * @param {{
 *  seat:0|1, turn:number, Store?:Function, SimpleTacticsAi?:Function,
 *  ResolvePromptAction?:Function, GamePhase?:object
 * }} deps
 * @returns {{result:T,audit:object}}
 */
function withOriginalTeamFlareEnergyPrompt(execute, deps) {
  assert.equal(typeof execute, 'function');
  assert.ok(deps?.seat === 0 || deps?.seat === 1);
  assert.ok(Number.isSafeInteger(deps.turn) && deps.turn > 1);
  const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const Store = deps.Store ?? require(path.join(output, 'game/store/store')).Store;
  const Ai = deps.SimpleTacticsAi ?? require(path.join(output, 'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const ResolvePromptAction = deps.ResolvePromptAction ??
    require(path.join(output, 'game/store/actions/resolve-prompt-action')).ResolvePromptAction;
  const GamePhase = deps.GamePhase ??
    require(path.join(output, 'game/store/state/state')).GamePhase;
  const beforeDecode = Object.getOwnPropertyDescriptor(Ai.prototype, 'decodeNextAction');
  const beforeDispatch = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  assert.equal(typeof beforeDecode?.value, 'function');
  assert.equal(typeof beforeDispatch?.value, 'function');

  let liveStore = null;
  let tracked = null;
  const proposed = new WeakMap();
  const audit = {
    version: VERSION, sourceSeat: deps.seat, globalTurn: deps.turn,
    liveStoreCount: 0, sourceFlareAccepted: 0,
    exactPromptOffers: 0, promptActionsSelected: 0,
    promptActionsAccepted: 0, nativePromptRejected: 0,
    physicallySettledEnergyDiscards: 0,
    unexpectedPending: [], unsupportedChoices: 0,
    rootCardMovedFromHand: false, sourceSupporterTurnBefore: null,
    sourceSupporterTurnAfter: null, physicalEnergyName: null,
    nativeError: null, changesToOtherRoots: false,
    paperQualified: false, competitiveQualified: false
  };

  function eligiblePrompt(state, owner, opponent) {
    const prompt = state.prompts?.find(p => p.result === undefined);
    if (!prompt) return null;
    if (prompt.constructor?.name !== 'ChooseCardsPrompt' ||
        prompt.playerId !== owner.id || prompt.message !== MESSAGE ||
        prompt.cards !== opponent.active || prompt.options?.min !== 1 ||
        prompt.options?.max !== 1 || prompt.options?.allowCancel !== false) {
      if (audit.unexpectedPending.length < 4) {
        audit.unexpectedPending.push({
          type: prompt.constructor?.name ?? null,
          message: prompt.message ?? null,
          ownerPrompt: prompt.playerId === owner.id,
          activeZone: prompt.cards === opponent.active
        });
      }
      return null;
    }
    return prompt;
  }

  function decode(state, ...rest) {
    if (tracked && !tracked.settled && state === liveStore?.state &&
        state.phase === GamePhase.PLAYER_TURN &&
        state.turn === deps.turn && state.activePlayer === deps.seat) {
      const owner = state.players[deps.seat];
      const opponent = state.players[1-deps.seat];
      const prompt = eligiblePrompt(state, owner, opponent);
      if (prompt) {
        audit.exactPromptOffers++;
        const energies = new Set(opponent.active.energies.cards);
        const physical = prompt.cards.cards.filter(c => energies.has(c) &&
          prompt.validate([c], state) === true);
        physical.sort((a,b) => a.fullName.localeCompare(b.fullName));
        if (physical.length > 0) {
          const chosen = physical[0];
          const action = new ResolvePromptAction(prompt.id, [chosen]);
          proposed.set(action, {prompt, chosen, owner, opponent, active: opponent.active});
          audit.promptActionsSelected++;
          return action;
        }
        audit.unsupportedChoices++;
      }
    }
    return beforeDecode.value.call(this, state, ...rest);
  }

  function dispatch(action, ...rest) {
    if (action?.constructor?.name === 'AddPlayerAction' && !liveStore) {
      liveStore = this;
      audit.liveStoreCount++;
    }
    const state = this.state;
    const sameOwner = this === liveStore &&
      state?.turn === deps.turn && state.activePlayer === deps.seat;
    const owner = sameOwner ? state.players[deps.seat] : null;
    const opponent = sameOwner ? state.players[1-deps.seat] : null;
    const playerId = action?.id ?? action?.clientId;
    const physicalCard = owner && action?.constructor?.name === 'PlayCardAction' &&
      playerId === owner.id ? owner.hand.cards[action.handIndex] : null;
    const root = physicalCard?.fullName === SOURCE && !tracked;
    const event = this === liveStore ? proposed.get(action) : null;
    const beforeQuota = root ? owner.supporterTurn : null;
    const originalEnergy = root ? [...opponent.active.energies.cards] : null;

    try {
      const result = beforeDispatch.value.call(this, action, ...rest);
      if (root) {
        audit.sourceFlareAccepted++;
        audit.rootCardMovedFromHand = !owner.hand.cards.includes(physicalCard);
        audit.sourceSupporterTurnBefore = beforeQuota;
        audit.sourceSupporterTurnAfter = owner.supporterTurn;
        tracked = {turn: deps.turn, physicalCard, active: opponent.active,
          originalEnergy, settled: false};
      }
      if (event) {
        const {prompt, chosen, opponent: enemy, active} = event;
        const moved = !active.energies.cards.includes(chosen) &&
          enemy.discard.cards.includes(chosen);
        const nativeResolved = prompt.result !== undefined;
        if (moved && nativeResolved && tracked?.physicalCard &&
            !owner.hand.cards.includes(tracked.physicalCard)) {
          audit.promptActionsAccepted++;
          audit.physicallySettledEnergyDiscards++;
          audit.physicalEnergyName = chosen.fullName;
          tracked.settled = true;
        } else {
          audit.unsupportedChoices++;
        }
      }
      return result;
    } catch (error) {
      if (event) audit.nativePromptRejected++;
      audit.nativeError = String(error?.message ?? error).slice(0, 300);
      throw error;
    }
  }

  Object.defineProperty(Ai.prototype, 'decodeNextAction', {...beforeDecode, value: decode});
  Object.defineProperty(Store.prototype, 'dispatch', {...beforeDispatch, value: dispatch});
  try {
    const result = execute();
    return {result, audit};
  } catch (error) {
    if (error && typeof error === 'object')
      error.agent5TeamFlarePromptAudit = {...audit};
    throw error;
  } finally {
    assert.strictEqual(Store.prototype.dispatch, dispatch);
    assert.strictEqual(Ai.prototype.decodeNextAction, decode);
    Object.defineProperty(Store.prototype, 'dispatch', beforeDispatch);
    Object.defineProperty(Ai.prototype, 'decodeNextAction', beforeDecode);
  }
}

module.exports = {VERSION, SOURCE, MESSAGE, withOriginalTeamFlareEnergyPrompt};
