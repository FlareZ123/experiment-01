'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

/**
 * Native ShuffleDeckPrompt.validate in pin a9905a76 uses Array.sort()
 * without a numeric comparator. It rejects EVERY legal shuffle permutation
 * on decks with 11 or more cards. Correct only this pinned validation seam.
 *
 * @param {object} prompt Native ShuffleDeckPrompt with owner id.
 * @param {number[]|null} order Requested permutation of deck positions.
 * @param {object} state Actual Store State.
 * @returns {boolean}
 */
function validateNumericShuffle(prompt,order,state){
  if(!Array.isArray(order))return false;
  const player=state.players.find(item=>
    item.id===prompt.getPerspectivePlayerId());
  if(!player||order.length!==player.deck.cards.length)return false;
  return order.slice().sort((a,b)=>a-b).every((value,i)=>value===i);
}

/**
 * Scope a reversible research-owned prototype hook to one synchronous native
 * experiment. No upstream/vendor source files or hidden player cards change.
 * Retain a separate policy version when using this hook in comparisons.
 *
 * @template T
 * @param {()=>T} work One synchronous experiment.
 * @param {object} [deps] Injected fake/native ShuffleDeckPrompt class for tests.
 * @returns {T}
 */
function withNumericShuffleValidator(work,deps={}){
  assert.equal(typeof work,'function');
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const ShuffleDeckPrompt=deps.ShuffleDeckPrompt??
    require(path.join(output,'game/store/prompts/shuffle-prompt'))
      .ShuffleDeckPrompt;
  const prototype=ShuffleDeckPrompt.prototype;
  const descriptor=Object.getOwnPropertyDescriptor(prototype,'validate');
  assert.equal(typeof descriptor?.value,'function');
  Object.defineProperty(prototype,'validate',{
    ...descriptor,
    value:function(order,state){
      return validateNumericShuffle(this,order,state);
    }
  });
  try{
    return work();
  }finally{
    Object.defineProperty(prototype,'validate',descriptor);
  }
}

module.exports={validateNumericShuffle,withNumericShuffleValidator};
