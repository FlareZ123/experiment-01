'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

/**
 * Compare exact physical card objects around a native prompt resolution.
 * Matching names and printing IDs cannot distinguish duplicate copies.
 * @param {object[]} beforeDeck
 * @param {object[]} beforeDiscard
 * @param {object[]} afterDeck
 * @param {object[]} afterDiscard
 * @returns {object[]}
 */
function movedDeckCards(beforeDeck, beforeDiscard, afterDeck, afterDiscard) {
  const originallyInDeck = new Set(beforeDeck);
  const originallyInDiscard = new Set(beforeDiscard);
  const remainsInDeck = new Set(afterDeck);
  return afterDiscard.filter(card => originallyInDeck.has(card) &&
    !originallyInDiscard.has(card) && !remainsInDeck.has(card));
}

/**
 * Inspect only the acting player's own deck and public Trainer/prompt state.
 * @param {object} state
 * @param {0|1} seat
 * @returns {{owner:object,prompt:object}|null}
 */
function ownerCompressorPrompt(state, seat) {
  const owner = state?.players?.[seat];
  if (!owner || state.activePlayer !== seat ||
      !owner.supporter.cards.some(c => c.name === 'Battle Compressor')) {
    return null;
  }
  const prompt = state.prompts?.find(p => p.result === undefined &&
    p.constructor?.name === 'ChooseCardsPrompt' &&
    p.player === owner && p.cards === owner.deck);
  return prompt ? {owner, prompt} : null;
}

/**
 * Reversible observation-only native Store dispatch wrapper. Records cards
 * physically moved from an owner deck to discard while settling the owner's
 * Battle Compressor choice, including genuine no-move or rejected outcomes.
 * It never chooses an action, reads opponent private cards, or mutates state.
 *
 * @template T
 * @param {0|1} seat
 * @param {()=>T} execute
 * @param {{StoreClass?:Function}} [dependencies] Test seam
 * @returns {{result:T,audit:object}}
 */
function withSourceCompressorSettlementAudit(seat, execute, dependencies={}) {
  assert.ok(seat === 0 || seat === 1);
  assert.equal(typeof execute, 'function');
  const StoreClass = dependencies.StoreClass ??
    require(path.resolve(__dirname,
      '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  assert.equal(typeof StoreClass, 'function');
  const original = StoreClass.prototype.dispatch;
  assert.equal(typeof original, 'function');
  const receipts = [];
  let sourcePromptResolutions = 0;
  let physicalMovedCopies = 0;
  let acceptedPositiveResolutions = 0;
  function observe(action, ...args) {
    const pending = action?.constructor?.name === 'ResolvePromptAction' ?
      ownerCompressorPrompt(this.state, seat) : null;
    const beforeDeck = pending ? [...pending.owner.deck.cards] : null;
    const beforeDiscard = pending ? [...pending.owner.discard.cards] : null;
    let outcome;
    try {
      outcome = original.call(this, action, ...args);
    } catch (error) {
      if (pending) {
        sourcePromptResolutions++;
        receipts.push({
          globalTurn:this.state.turn, sourceSeat:seat,
          action:'ResolvePromptAction', nativeDispatchReturned:false,
          paperMinimumMet:false, physicallyMoved:[],
          errorName:error?.constructor?.name??'Error'
        });
      }
      throw error;
    }
    if (pending) {
      sourcePromptResolutions++;
      const moved = movedDeckCards(beforeDeck, beforeDiscard,
        pending.owner.deck.cards, pending.owner.discard.cards);
      const minimum = Math.max(1, pending.prompt.options?.min??0);
      const maximum = pending.prompt.options?.max??3;
      const paperMinimumMet = moved.length >= minimum &&
        moved.length <= maximum;
      if (paperMinimumMet) acceptedPositiveResolutions++;
      physicalMovedCopies += moved.length;
      receipts.push({
        globalTurn:this.state.turn, sourceSeat:seat,
        action:'ResolvePromptAction', nativeDispatchReturned:true,
        paperMinimumMet,
        printedPromptMin:pending.prompt.options?.min??null,
        printedPromptMax:maximum,
        physicallyMoved:moved.map(c=>({name:c.name,fullName:c.fullName,id:c.id})),
        movementIdentity:'same physical card object before in owner deck, after in owner discard'
      });
    }
    return outcome;
  }
  StoreClass.prototype.dispatch = observe;
  try {
    const result = execute();
    return {result,audit:{
      version:'agent3-source-compressor-physical-settlement-readonly-v1',
      sourceSeat:seat,ownerOnlyObservation:true,
      sourcePromptResolutions,acceptedPositiveResolutions,
      physicalMovedCopies,receipts,
      competitiveGameQualified:false
    }};
  } finally {
    assert.strictEqual(StoreClass.prototype.dispatch, observe);
    StoreClass.prototype.dispatch = original;
  }
}

module.exports = {movedDeckCards,ownerCompressorPrompt,
  withSourceCompressorSettlementAudit};
