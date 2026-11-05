'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent8-owner-telepathic-psychic-bench-search-v1';
const TELEPATH = 'Telepath [P] Energy M3';

/**
 * Select only physically present Basic Psychic cards after the authentic
 * owner-deck search has opened. Deck iteration order does not affect choice.
 * @param {object} prompt Genuine native owner ChooseCardsPrompt.
 * @param {object} owner Current player, identified by prompt.playerId.
 * @param {{Stage:object,CardType:object,SuperType:object,GameMessage:object}} types Pinned native enums.
 * @param {object} state Actual native State for validate().
 * @returns {object[]|null} Store-valid physical card instances, or null.
 */
function chooseTelepathicBasics(prompt, owner, types, state) {
  const {Stage, CardType, SuperType, GameMessage} = types;
  if (prompt?.constructor?.name !== 'ChooseCardsPrompt' ||
      prompt.result !== undefined || prompt.playerId !== owner?.id ||
      prompt.cards !== owner.deck ||
      prompt.message !== GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH ||
      prompt.filter?.stage !== Stage.BASIC ||
      !prompt.filter?.cardType?.includes(CardType.PSYCHIC) ||
      prompt.options?.min !== 0 ||
      !Number.isInteger(prompt.options?.max) ||
      prompt.options.max < 1 || prompt.options.max > 2) return null;
  const open = owner.bench.filter(slot => slot.cards.length === 0).length;
  if (open === 0) return null;
  const pool = owner.deck.cards.filter(card =>
    card.superType === SuperType.POKEMON &&
    card.stage === Stage.BASIC &&
    card.cardType?.includes(CardType.PSYCHIC));
  pool.sort((a, b) => a.fullName.localeCompare(b.fullName) || a.id - b.id);
  const limit = Math.min(prompt.options.max, open, pool.length);
  for (let count = limit; count >= 0; count--) {
    const chosen = pool.slice(0, count);
    if (prompt.validate(chosen, state) === true) return chosen;
  }
  return null;
}

/**
 * Reversible both-seat continuation for a genuinely attached Telepathic
 * Psychic Energy. Tracks the exact printed hand card, genuine new native
 * owner-deck prompt, settled answer, physical deck-to-Bench transfers and
 * mandatory native shuffle follow-up. Does not inspect a deck at K0.
 * @template T
 * @param {()=>T} run Native synchronous experiment.
 * @param {object} [deps] Compiled native classes or pure-test seams.
 * @returns {{result:T,audit:object}}
 */
function withOwnerTelepathicBenchSearch(run, deps = {}) {
  assert.equal(typeof run, 'function');
  const base = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const load = name => require(path.join(base, name));
  const Ai = deps.SimpleTacticsAi ?? load('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store = deps.Store ?? load('game/store/store').Store;
  const ResolvePromptAction = deps.ResolvePromptAction ??
    load('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const nativeTypes = deps.types ?? load('game/store/card/card-types');
  const GameMessage = deps.GameMessage ?? load('game/game-message').GameMessage;
  const types = {...nativeTypes, GameMessage};
  const validate = deps.assertValidPromptAction ??
    require('./prompt-integrity.cjs').assertValidPromptAction;
  const oldAi = Object.getOwnPropertyDescriptor(Ai.prototype, 'decodeNextAction');
  const oldStore = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  assert.equal(typeof oldAi?.value, 'function');
  assert.equal(typeof oldStore?.value, 'function');
  assert.equal(oldAi.configurable, true);
  assert.equal(oldStore.configurable, true);
  let live = null;
  const pendingByOwner = new Map();
  const submitted = new WeakMap();
  const audit = {
    version: VERSION, physicalStores: 0, telepathRootAttempts: 0,
    actualAttachments: 0, matchingOwnerSearches: 0,
    offered: 0, submitted: 0, settled: 0, unsettled: 0,
    custodyFailures: 0, shuffleMissing: 0, physicallyBenched: 0,
    emptySearches: 0, nativeRejected: 0, unrelatedDelegated: 0,
    events: [], readsUnopenedDeck: false, readsOpponentHidden: false,
    paperGameQualified: false, competitiveGamesQualified: 0
  };
  function dispatch(action, ...args) {
    const kind = action?.constructor?.name;
    if (kind === 'AddPlayerAction') {
      if (this !== live) {
        live = this;
        audit.physicalStores++;
        pendingByOwner.clear();
      }
    }
    const state = this.state;
    const owner = kind === 'PlayCardAction' ?
      state?.players?.find(p => p.id === action.id) : null;
    const card = owner?.hand?.cards?.[action.handIndex];
    const track = card?.fullName === TELEPATH;
    if (track) {
      if (live === null) {
        live = this;
        audit.physicalStores++;
      }
      if (this === live) audit.telepathRootAttempts++;
    }
    const existing = track ? new Set(state.prompts) : null;
    const beforeAttached = track && owner ?
      [owner.active, ...owner.bench].some(slot =>
        slot.energies.cards.includes(card)) : false;
    const record = submitted.get(action);
    let result;
    try {
      result = oldStore.value.apply(this, [action, ...args]);
    } catch (error) {
      if (record) audit.nativeRejected++;
      throw error;
    }
    if (track && this === live && !beforeAttached) {
      const current = this.state.players.find(p => p.id === owner.id);
      const attached = !!current &&
        !current.hand.cards.includes(card) &&
        [current.active, ...current.bench].some(slot =>
          slot.energies.cards.includes(card));
      if (attached) {
        audit.actualAttachments++;
        const fresh = this.state.prompts.filter(p =>
          !existing.has(p) && p.result === undefined &&
          p.playerId === owner.id && p.cards === current.deck &&
          p.constructor?.name === 'ChooseCardsPrompt' &&
          p.message === GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH &&
          p.filter?.stage === types.Stage.BASIC &&
          p.filter?.cardType?.includes(types.CardType.PSYCHIC) &&
          p.options?.min === 0 &&
          Number.isInteger(p.options?.max) &&
          p.options.max >= 1 && p.options.max <= 2);
        if (fresh.length === 1) {
          pendingByOwner.set(owner.id, {prompt: fresh[0], store: this});
          audit.matchingOwnerSearches++;
        }
      }
    }
    if (record) {
      const prompt = record.prompt;
      if (prompt.result !== action.result) {
        audit.unsettled++;
        throw new Error('Telepathic native prompt returned without settlement');
      }
      const after = this.state.players.find(p => p.id === record.ownerId);
      const countAfter = after.bench.filter(s => s.cards.length > 0).length;
      const transferred = record.cards.every(c =>
        record.deckBefore.has(c) && !after.deck.cards.includes(c) &&
        after.bench.some(slot => slot.cards.includes(c)));
      if (!transferred || countAfter - record.benchBefore !== record.cards.length) {
        audit.custodyFailures++;
        throw new Error('Telepathic native search lacked physical deck-to-Bench custody');
      }
      const shuffle = this.state.prompts.some(p =>
        !record.promptsBefore.has(p) &&
        p.result === undefined && p.playerId === record.ownerId &&
        p.constructor?.name === 'ShuffleDeckPrompt');
      if (!shuffle) {
        audit.shuffleMissing++;
        throw new Error('Telepathic native search lacked mandatory shuffle follow-up');
      }
      audit.settled++;
      audit.physicallyBenched += record.cards.length;
      if (record.cards.length === 0) audit.emptySearches++;
      if (audit.events.length < 24) audit.events.push({
        turn: record.turn, seat: record.seat,
        cards: record.cards.map(c => c.fullName),
        settled: true, physicalCustody: true, shuffleOffered: true
      });
      pendingByOwner.delete(record.ownerId);
    }
    return result;
  }
  function decode(state) {
    if (state !== live?.state) {
      audit.unrelatedDelegated++;
      return oldAi.value.call(this, state);
    }
    const owner = state.players.find(p => p.id === this.client?.id);
    const pending = pendingByOwner.get(owner?.id);
    const prompt = pending?.prompt;
    if (!owner || pending?.store !== live || !prompt ||
        prompt.result !== undefined ||
        !state.prompts.includes(prompt) || prompt.playerId !== owner.id) {
      audit.unrelatedDelegated++;
      return oldAi.value.call(this, state);
    }
    audit.offered++;
    const cards = chooseTelepathicBasics(prompt, owner, types, state);
    if (cards === null) return oldAi.value.call(this, state);
    const action = new ResolvePromptAction(prompt.id, cards);
    validate(state, action);
    const seat = state.players.findIndex(p => p.id === owner.id);
    submitted.set(action, {
      prompt, cards, ownerId: owner.id, seat, turn: state.turn,
      deckBefore: new Set(owner.deck.cards),
      promptsBefore: new Set(state.prompts),
      benchBefore: owner.bench.filter(s => s.cards.length > 0).length
    });
    audit.submitted++;
    return action;
  }
  Object.defineProperty(Store.prototype, 'dispatch', {...oldStore, value: dispatch});
  Object.defineProperty(Ai.prototype, 'decodeNextAction', {...oldAi, value: decode});
  try {
    return {result: run(), audit};
  } catch (error) {
    if (error && typeof error === 'object')
      error.ownerTelepathicAudit = {...audit, events: [...audit.events]};
    throw error;
  } finally {
    assert.strictEqual(Ai.prototype.decodeNextAction, decode);
    Object.defineProperty(Ai.prototype, 'decodeNextAction', oldAi);
    assert.strictEqual(Store.prototype.dispatch, dispatch);
    Object.defineProperty(Store.prototype, 'dispatch', oldStore);
  }
}

module.exports = {VERSION, TELEPATH, chooseTelepathicBasics,
  withOwnerTelepathicBenchSearch};
