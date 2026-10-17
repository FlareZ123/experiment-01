'use strict';

const path=require('node:path');

/**
 * Correct numeric-index permutation validation for the pinned Twinleaf
 * ShuffleDeckPrompt. The upstream validator uses Array.sort() without
 * a numeric comparator, which rejects legal permutations of >=11 cards.
 * This research-side hook is opt-in, reversible, and never edits vendor code.
 *
 * @returns {()=>void} Restore exactly the original prototype descriptor.
 */
function installNumericShuffleValidationHook() {
  const {ShuffleDeckPrompt}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/prompts/shuffle-prompt'));
  const proto=ShuffleDeckPrompt.prototype;
  const prior=Object.getOwnPropertyDescriptor(proto,'validate');
  if(!prior || typeof prior.value!=='function')
    throw new TypeError('Pinned ShuffleDeckPrompt validator was not found');
  Object.defineProperty(proto,'validate',{
    ...prior,
    value:function(result,state) {
      if(!Array.isArray(result))return false;
      const player=state.players.find(p=>p.id===this.getPerspectivePlayerId());
      if(!player || result.length!==player.deck.cards.length)return false;
      const sorted=result.slice().sort((a,b)=>a-b);
      return sorted.every((index,i)=>Number.isInteger(index)&&index===i);
    }
  });
  return ()=>Object.defineProperty(proto,'validate',prior);
}

module.exports={installNumericShuffleValidationHook};
