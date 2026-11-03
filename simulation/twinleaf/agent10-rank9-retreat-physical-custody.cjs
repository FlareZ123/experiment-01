'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const VERSION = 'agent10-rank9-retreat-card-reference-custody-v1';

/**
 * Read-only witness around genuine Store dispatches. Tracks object identity
 * for the pre-retreat Electrode Energy cards through the actual payment
 * prompt. This is a narrow historical source receipt, not a paper-game
 * certification or an actor policy.
 *
 * @template T
 * @param {() => T} execute
 * @param {{Store?: Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withRank9RetreatPhysicalCustody(execute, deps = {}) {
  assert.equal(typeof execute, 'function');
  const Store = deps.Store ?? require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const original = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  assert.equal(typeof original?.value, 'function');
  const outstanding = new WeakMap();
  const receipts = [];
  const errors = [];

  function dispatch(action, ...args) {
    const state = this.state;
    const kind = action?.constructor?.name;
    const owner = state?.players?.[1];
    const sourceTurn = state?.turn === 42 && state.activePlayer === 1;
    const originalActive = owner?.active;
    const targetIndex = action?.benchIndex;
    const retreat = sourceTurn && kind === 'RetreatAction' &&
      originalActive?.getPokemonCard?.()?.fullName === 'Electrode-GX CES' &&
      Number.isSafeInteger(targetIndex) &&
      owner.bench?.[targetIndex]?.getPokemonCard?.()?.fullName === 'Mega Absol ex M1L';
    const prompt = sourceTurn && kind === 'ResolvePromptAction' &&
      state.prompts?.some(p => p.result === undefined &&
        p.constructor?.name === 'ChooseEnergyPrompt' &&
        p.playerId === owner.id);
    const before = retreat ? {
      ownerId: owner.id, sourceTurn: state.turn, targetIndex,
      electrode: originalActive,
      energy: [...originalActive.energies.cards],
      discard: [...owner.discard.cards]
    } : null;
    const pending = prompt ? outstanding.get(this) : null;
    try {
      const result = original.value.call(this, action, ...args);
      if (before) {
        outstanding.set(this, before);
      }
      if (pending) {
        outstanding.delete(this);
        const afterOwner = this.state.players[1];
        const benchElectrode = afterOwner.bench.includes(pending.electrode);
        const held = pending.energy.filter(c =>
          pending.electrode.energies.cards.includes(c));
        const discarded = pending.energy.filter(c =>
          afterOwner.discard.cards.includes(c));
        const unaccounted = pending.energy.filter(c =>
          !held.includes(c) && !discarded.includes(c));
        const addedToDiscard = afterOwner.discard.cards.filter(c =>
          !pending.discard.includes(c));
        const identityReceipt = benchElectrode && 
          afterOwner.active.getPokemonCard()?.fullName === 'Mega Absol ex M1L' &&
          pending.energy.length === 2 &&
          held.length === 1 && held[0].fullName === 'Darkness Energy' &&
          discarded.length === 1 && discarded[0].fullName === 'Prism Energy ASC' &&
          unaccounted.length === 0 &&
          addedToDiscard.length === 1 &&
          addedToDiscard[0] === discarded[0];
        receipts.push({
          turn: pending.sourceTurn, ownerSeat: 1,
          energyBefore: pending.energy.map(c => c.fullName),
          energyRetained: held.map(c => c.fullName),
          energyDiscarded: discarded.map(c => c.fullName),
          addedToDiscard: addedToDiscard.map(c => c.fullName),
          unaccounted: unaccounted.map(c => c.fullName),
          originalElectrodeOnBench: benchElectrode,
          samePhysicalCardObject: addedToDiscard.length === 1 &&
            discarded.length === 1 && addedToDiscard[0] === discarded[0],
          nativeDispatchAccepted: true,
          identityReceipt, competitiveQualifiedGame: false
        });
      }
      return result;
    } catch (error) {
      if (before || pending) errors.push({
        sourceTurn: state?.turn ?? null, action: kind,
        message: String(error?.message ?? error)
      });
      throw error;
    }
  }
  Object.defineProperty(Store.prototype, 'dispatch', {...original, value:dispatch});
  try {
    const result = execute();
    return {result, audit:{
      version: VERSION, receipts, errors,
      exactPhysicalPaidRetreatReceipts: receipts.filter(r => r.identityReceipt).length,
      appliedToOriginalSourceOnly: true, policyMutation: false,
      competitiveQualifiedGames: 0
    }};
  } finally {
    assert.strictEqual(Store.prototype.dispatch, dispatch);
    Object.defineProperty(Store.prototype, 'dispatch', original);
  }
}
module.exports = {VERSION, withRank9RetreatPhysicalCustody};
