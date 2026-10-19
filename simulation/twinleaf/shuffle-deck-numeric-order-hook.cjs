'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
let active=null;

/**
 * The pinned ShuffleDeckPrompt uses Array#sort() without a numeric comparator.
 * For a valid permutation with 11+ indexes, that lexicographic sort causes
 * validate() to reject a legal full-deck order.
 * This scoped, reversible research adapter preserves the printed shuffle rule.
 *
 * @returns {()=>void} Restore the exact upstream validator.
 */
function installNumericShuffleOrderHook(){
  if(active)return active;
  const {ShuffleDeckPrompt}=require(path.join(output,'game/store/prompts/shuffle-prompt'));
  const prior=Object.getOwnPropertyDescriptor(ShuffleDeckPrompt.prototype,'validate');
  assert.equal(typeof prior?.value,'function');
  const corrected=function(result,state){
    if(!Array.isArray(result))return false;
    const player=state.players.find(p=>p.id===this.getPerspectivePlayerId());
    if(!player||result.length!==player.deck.cards.length)return false;
    const seen=new Uint8Array(result.length);
    for(const index of result){
      if(!Number.isInteger(index)||index<0||index>=result.length||seen[index])return false;
      seen[index]=1;
    }
    return true;
  };
  Object.defineProperty(ShuffleDeckPrompt.prototype,'validate',
    {...prior,value:corrected});
  const restore=()=>{
    if(ShuffleDeckPrompt.prototype.validate===corrected)
      Object.defineProperty(ShuffleDeckPrompt.prototype,'validate',prior);
    if(active===restore)active=null;
  };
  active=restore;
  return restore;
}
module.exports={installNumericShuffleOrderHook};
