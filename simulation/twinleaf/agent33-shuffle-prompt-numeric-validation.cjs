'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent33-native-shuffle-numeric-validation-hook-v1';

/** Native ShuffleDeckPrompt.validate uses sort() without a comparator.
 * For deck lengths >=11, lexicographic sorting rejects legal shuffles.
 * Check an exact 0...(n-1) permutation numerically instead.
 * @param {number[]|null} order Real original deck shuffle response.
 * @param {number} length Current owner-deck length.
 */
function numericPermutationValid(order,length){
  if(!Array.isArray(order)||!Number.isSafeInteger(length)||
    length<0||order.length!==length)return false;
  const seen=new Uint8Array(length);
  for(const index of order){
    if(!Number.isInteger(index)||index<0||index>=length||
      seen[index]!==0)return false;
    seen[index]=1;
  }
  return true;
}

/**
 * Reversible research-only hook, preserving source prompt class and State.
 * @template T
 * @param {()=>T} run Actual native Store test or run.
 * @param {{ShuffleDeckPrompt?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withNumericShufflePromptValidation(run,deps={}){
  assert.equal(typeof run,'function');
  const ShuffleDeckPrompt=deps.ShuffleDeckPrompt??
    require(path.join(__dirname,
      '../../vendor/twinleaf/ptcg-server/output/game/store/prompts/shuffle-prompt')).ShuffleDeckPrompt;
  const before=Object.getOwnPropertyDescriptor(
    ShuffleDeckPrompt.prototype,'validate');
  assert.equal(typeof before?.value,'function');
  const audit={version:VERSION,checked:0,rawRejectedCorrected:0,
    correctedAccepted:0,correctedRejected:0};
  function validate(order,state){
    const player=state.players.find(p=>
      p.id===this.getPerspectivePlayerId());
    if(!player)return false;
    audit.checked++;
    const valid=numericPermutationValid(order,
      player.deck.cards.length);
    if(valid) audit.correctedAccepted++;
    else audit.correctedRejected++;
    if(valid&&before.value.call(this,order,state)===false)
      audit.rawRejectedCorrected++;
    return valid;
  }
  Object.defineProperty(ShuffleDeckPrompt.prototype,'validate',{
    ...before,value:validate});
  try{return {result:run(),audit};}
  finally{
    assert.equal(ShuffleDeckPrompt.prototype.validate,validate);
    Object.defineProperty(ShuffleDeckPrompt.prototype,'validate',before);
  }
}

module.exports={VERSION,numericPermutationValid,
  withNumericShufflePromptValidation};
