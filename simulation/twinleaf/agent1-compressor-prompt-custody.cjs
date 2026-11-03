'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent1-source-owned-compressor-prompt-custody-v1';

/**
 * Read-only original Store observer for source-owned Battle Compressor.
 * Owner deck contents are inspected only during an actual ChooseCardsPrompt
 * whose cards point at that owner's deck. The observer makes no bot decisions.
 * @template T
 * @param {()=>T} run
 * @param {0|1} sourceSeat
 * @param {{Store?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerCompressorPromptCustody(run, sourceSeat, deps = {}) {
  assert.equal(typeof run, 'function');
  assert.ok(sourceSeat === 0 || sourceSeat === 1);
  const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
  const Store = deps.Store ?? require(path.join(root, 'game/store/store')).Store;
  const prior = Object.getOwnPropertyDescriptor(Store.prototype, 'dispatch');
  assert.equal(typeof prior?.value, 'function');
  let nativeStore;
  const queued = new Map();
  const audit = {version:VERSION, sourceSeat, selectedSourceCompressor:0,
    ownerPromptSeen:0, ownerPromptResolved:0, verifiedPhysicalSelections:0,
    completeNonemptyMoves:0, rejected:0, events:[],
    observesOpponentPrivateCards:false, policyChanged:false};

  function observedDispatch(action, ...args) {
    if (action?.constructor?.name === 'AddPlayerAction' && !nativeStore) {
      nativeStore = this;
    }
    const isReal = this === nativeStore;
    const state = isReal ? this.state : null;
    const source = state?.players?.[sourceSeat];
    const actorId = source?.id;
    const actionKind = action?.constructor?.name;
    const isSourceCompressor = Boolean(source &&
      actionKind === 'PlayCardAction' && action.id === actorId &&
      source.hand.cards[action.handIndex]?.name === 'Battle Compressor');

    const entry = isSourceCompressor ? {
      ownerSeat:sourceSeat, turn:state.turn,
      printedCompressor:source.hand.cards[action.handIndex].fullName,
      ownerVisibleHeldCard:true, nativeRootAccepted:false,
      promptOwnerDeck:false, promptId:null, selectedCards:null,
      promptResolved:false, nativeValidation:null,
      allChosenRemovedFromDeck:null, allChosenInOwnDiscard:null,
      ownerDeckBefore:null, ownerDeckAfter:null,
      ownerDiscardBefore:null, ownerDiscardAfter:null
    } : null;
    const pending = isReal && actionKind === 'ResolvePromptAction' ?
      state.prompts.find(prompt => prompt.id === action.id &&
        prompt.result === undefined) : null;
    const receipt = pending && queued.get(pending.id);
    const sourcePrompt = Boolean(receipt && pending?.constructor?.name ===
      'ChooseCardsPrompt' && pending.player?.id === actorId &&
      pending.cards === source.deck);

    const cards = sourcePrompt && Array.isArray(action.result) ?
      [...action.result] : null;
    const beforeDeck = sourcePrompt ? [...source.deck.cards] : null;
    const deckCount = beforeDeck?.length ?? null;
    const discardCount = sourcePrompt ? source.discard.cards.length : null;
    const nativeValid = sourcePrompt && cards !== null ?
      pending.validate(cards, state) : null;
    const selectedFromOwner = sourcePrompt && cards !== null ?
      cards.every(card => beforeDeck.includes(card)) : null;

    try {
      const result = prior.value.call(this, action, ...args);
      if (entry) {
        entry.nativeRootAccepted = true;
        audit.selectedSourceCompressor++;
        const prompt = this.state.prompts.find(p => p.result === undefined &&
          p.constructor?.name === 'ChooseCardsPrompt' &&
          p.player?.id === actorId && p.cards === this.state.players[sourceSeat].deck);
        if (prompt) {
          entry.promptOwnerDeck = true;
          entry.promptId = prompt.id;
          queued.set(prompt.id, entry);
          audit.ownerPromptSeen++;
        }
        audit.events.push(entry);
      }
      if (sourcePrompt) {
        const after = this.state.players[sourceSeat];
        receipt.promptResolved = true;
        receipt.nativeValidation = nativeValid;
        receipt.selectedCards = cards?.map(card => ({
          name:card.name, fullName:card.fullName, id:card.id
        })) ?? null;
        receipt.selectedFromOwnerDeck = selectedFromOwner;
        receipt.ownerDeckBefore = deckCount;
        receipt.ownerDeckAfter = after.deck.cards.length;
        receipt.ownerDiscardBefore = discardCount;
        receipt.ownerDiscardAfter = after.discard.cards.length;
        receipt.allChosenRemovedFromDeck = cards?.every(card =>
          !after.deck.cards.includes(card)) ?? null;
        receipt.allChosenInOwnDiscard = cards?.every(card =>
          after.discard.cards.includes(card)) ?? null;
        receipt.nativeChosenCount = cards?.length ?? null;
        audit.ownerPromptResolved++;
        if (cards !== null && cards.length > 0 && nativeValid &&
          selectedFromOwner && receipt.allChosenRemovedFromDeck &&
          receipt.allChosenInOwnDiscard &&
          deckCount - after.deck.cards.length === cards.length) {
          audit.verifiedPhysicalSelections++;
          audit.completeNonemptyMoves++;
        }
        queued.delete(pending.id);
      }
      return result;
    } catch (error) {
      if (entry) {entry.error = String(error);audit.events.push(entry);}
      audit.rejected++;
      throw error;
    }
  }
  Object.defineProperty(Store.prototype, 'dispatch', {...prior, value:observedDispatch});
  try {return {result:run(), audit};}
  finally {Object.defineProperty(Store.prototype, 'dispatch', prior);}
}
module.exports = {VERSION, withOwnerCompressorPromptCustody};
