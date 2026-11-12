'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');

const VERSION = 'agent36-live-paper-root-receipts-v2-attached-energy-custody';
const sha = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const printable = card => card?.fullName ?? [card?.name, card?.set, card?.number]
  .filter(x => x !== undefined && x !== null).join(' ');

/** Snapshot all original physical cards without giving this observer to a bot. */
function physicalView(state, ids) {
  const positions = {};
  const duplicates = [];
  const unregistered = [];
  const players = state.players;
  const place = (cards, zone) => {
    for (const [index, card] of (cards ?? []).entries()) {
      const id = ids.get(card);
      if (id === undefined) {
        unregistered.push({zone, index, printing: printable(card)});
      } else if (Object.hasOwn(positions, id)) {
        duplicates.push({id, first: positions[id], second: zone});
      } else positions[id] = zone + ':' + index;
    }
  };
  for (const [seat, player] of players.entries()) {
    for (const zone of ['deck', 'hand', 'discard', 'lostzone', 'stadium', 'supporter'])
      place(player[zone]?.cards, 's' + seat + '.' + zone);
    for (const [index, prize] of player.prizes.entries())
      place(prize.cards, 's' + seat + '.prizes' + index);
    for (const [position, slot] of [['active', player.active],
      ...player.bench.map((x, i) => ['bench' + i, x])]) {
      place(slot.cards, 's' + seat + '.' + position);
      place(slot.tools, 's' + seat + '.' + position + '.tools');
      // Attached Energy is a distinct physical zone in Twinleaf. Omitting it
      // falsely reports every Energy attachment as a missing card identity.
      place(slot.energies?.cards, 's' + seat + '.' + position + '.energies');
    }
  }
  const promptCustody = [];
  for (const [i, prompt] of (state.prompts ?? []).entries()) {
    if (prompt?.result !== undefined) continue;
    const cards = prompt?.cards?.cards ?? prompt?.cardList?.cards;
    if (!Array.isArray(cards)) continue;
    for (const card of cards) {
      const id = ids.get(card);
      if (id !== undefined && !Object.hasOwn(positions, id))
        promptCustody.push({id, promptIndex: i});
    }
  }
  return {positions, duplicates, unregistered, promptCustody};
}

/** Preserve finite action/prompt options without copying cyclic Store objects. */
function safeValue(value, ids, depth = 0) {
  if (value === null || ['string', 'boolean', 'number'].includes(typeof value))
    return Number.isNaN(value) ? 'NaN' : value;
  if (ids.has(value)) return {physicalId: ids.get(value)};
  if (depth >= 3) return {type: value?.constructor?.name ?? typeof value};
  if (Array.isArray(value)) return value.slice(0, 64)
    .map(item => safeValue(item, ids, depth + 1));
  if (typeof value === 'object') {
    const entries = Object.entries(value).slice(0, 40);
    return Object.fromEntries(entries.map(([k, v]) =>
      [k, safeValue(v, ids, depth + 1)]));
  }
  return {type: typeof value};
}

function promptView(state, ids) {
  return (state.prompts ?? []).filter(p => p?.result === undefined).map(p => ({
    id: p.id ?? null,
    type: p.constructor?.name ?? null,
    playerId: p.playerId ?? p.player?.id ?? null,
    message: typeof p.message === 'string' ? p.message : null,
    availablePhysicalIds: (p.cards?.cards ?? p.cardList?.cards ??
      (Array.isArray(p.cards) ? p.cards : [])).map(card => ids.get(card) ?? null),
    options: safeValue(p.options ?? null, ids)
  }));
}

/**
 * Read-only evidence observer for actual accepted Twinleaf Store root actions.
 * Attach callbacks to runDevelopment options. All private observations stay
 * in the returned postgame evidence packet; no actor receives this object.
 * @param {string} trialId Registered trial ID.
 */
function createLivePaperRootReceipts(trialId) {
  assert.equal(typeof trialId, 'string');
  assert.ok(trialId.length > 0);
  let store = null;
  let restore = null;
  let ids = null;
  let cards = null;
  let depth = 0;
  const pending = new WeakMap();
  const receipts = [];
  const rejected = [];

  function view() {
    return {
      turn: store.state.turn,
      phase: store.state.phase,
      activePlayer: store.state.activePlayer,
      physical: physicalView(store.state, ids),
      prompts: promptView(store.state, ids)
    };
  }

  /** The actual headless callback precedes both AddPlayerAction dispatches. */
  function capturePhysicalSixties() {
    if (ids !== null || store.state.players?.length !== 2) return;
    const players = store.state.players;
    if (!players.every(p => p.deck?.cards?.length === 60)) return;
    ids = new Map();
    cards = [];
    for (const [seat, player] of players.entries()) {
      for (const [index, card] of player.deck.cards.entries()) {
        assert.ok(!ids.has(card), 'Physical card was shared across decks');
        const id = seat + ':' + index;
        ids.set(card, id);
        cards.push({id, originalSeat: seat, printing: printable(card)});
      }
    }
  }

  function onRootStoreCreated(liveStore) {
    assert.equal(store, null, 'One native root Store per registered trial');
    assert.ok(liveStore?.state && Array.isArray(liveStore.state.players));
    store = liveStore;
    capturePhysicalSixties();
    const originalOwn = Object.getOwnPropertyDescriptor(store, 'dispatch');
    assert.equal(typeof store.dispatch, 'function');
    // Late native correction hooks replace prototype dispatch during a match.
    // Always resolve the current prototype rather than retaining a stale method.
    const callUnderlying = (self, action, args) => {
      const method = originalOwn?.value ?? Reflect.get(
        Object.getPrototypeOf(self), 'dispatch', self);
      return method.call(self, action, ...args);
    };
    const wrapped = function(action, ...args) {
      if (depth > 0) return callUnderlying(this, action, args);
      assert.strictEqual(this, store, 'Real Store dispatch scope changed');
      // Pre-game native AddPlayer dispatches are engine initialization,
      // never accepted player root actions and have no meaningful owner ID.
      if (ids === null) {
        const value = callUnderlying(this, action, args);
        capturePhysicalSixties();
        return value;
      }
      depth++;
      const before = view();
      try {
        const value = callUnderlying(this, action, args);
        pending.set(action, {before, after: view()});
        return value;
      } catch (error) {
        rejected.push({action: action?.constructor?.name ?? null,
          turn: before.turn, beforeDigest: sha(before),
          errorCode: typeof error?.code === 'string' ? error.code : null});
        throw error;
      } finally {
        depth--;
      }
    };
    store.dispatch = wrapped;
    restore = () => {
      assert.strictEqual(store.dispatch, wrapped,
        'Live Store.dispatch overwritten by another hook');
      if (originalOwn) Object.defineProperty(store, 'dispatch', originalOwn);
      else delete store.dispatch;
    };
  }

  function onRootActionDispatched(actualStore, action, ordinal, seat, turnBefore) {
    assert.strictEqual(actualStore, store, 'Speculative Store cannot certify root');
    assert.ok(Number.isSafeInteger(ordinal) && ordinal >= 0);
    assert.ok(seat === 0 || seat === 1);
    const sample = pending.get(action);
    assert.ok(sample, 'Accepted action lacks matching exact Store dispatch');
    pending.delete(action);
    assert.equal(sample.before.turn, turnBefore);
    const from = sample.before.physical.positions;
    const to = sample.after.physical.positions;
    const movement = cards.flatMap(card =>
      from[card.id] === to[card.id] ? [] : [{id: card.id,
        printing: card.printing, from: from[card.id] ?? null,
        to: to[card.id] ?? null}]);
    receipts.push({trialId, actionOrdinal: ordinal, seat, turnBefore,
      turnAfter: sample.after.turn, action: action?.constructor?.name ?? null,
      selected: safeValue(action?.result ?? null, ids),
      declaredCard: typeof action?.card?.fullName === 'string' ?
        action.card.fullName : null,
      beforePrompts: sample.before.prompts, afterPrompts: sample.after.prompts,
      beforePhysicalSha256: sha(sample.before.physical),
      afterPhysicalSha256: sha(sample.after.physical),
      movement,
      beforePositions: from,
      afterPositions: to,
      activePlayerBefore: sample.before.activePlayer,
      activePlayerAfter: sample.after.activePlayer,
      phaseBefore: sample.before.phase,
      phaseAfter: sample.after.phase,
      anomalies: {
        beforeDuplicates: sample.before.physical.duplicates,
        afterDuplicates: sample.after.physical.duplicates,
        afterUnregistered: sample.after.physical.unregistered,
        afterPromptCustody: sample.after.physical.promptCustody,
        missingOriginalPhysicalIds: cards.filter(card =>
          !Object.hasOwn(to, card.id) &&
          !sample.after.physical.promptCustody.some(p => p.id === card.id))
          .map(card => card.id)
      }
    });
  }

  function result() {
    const ordinalUnique = new Set(receipts.map(r => r.actionOrdinal)).size ===
      receipts.length;
    return {schema: VERSION, trialId, originalPhysicalCards: cards,
      acceptedStoreRootCount: receipts.length, rootOrdinalsUnique: ordinalUnique,
      receipts: receipts.slice(), rejectedDispatches: rejected.slice(),
      settledPhysicalIdentityClean: cards !== null && ordinalUnique &&
        receipts.every(r => r.anomalies.beforeDuplicates.length === 0 &&
          r.anomalies.afterDuplicates.length === 0 &&
          r.anomalies.afterUnregistered.length === 0 &&
          r.anomalies.missingOriginalPhysicalIds.length === 0),
      paperPaymentReviewed: false, clockReviewed: false,
      competitiveGameQualified: false};
  }

  return {onRootStoreCreated, onRootActionDispatched, result,
    close: () => { if (restore) restore(); }};
}

module.exports = {VERSION, printable, physicalView, safeValue, promptView,
  createLivePaperRootReceipts};
