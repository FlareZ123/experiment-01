'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Correct a specific pinned Twinleaf ShuffleDeckPrompt validator defect:
 * its `result.slice().sort()` compares integer card indices as strings,
 * making any shuffle of >= 11 cards fail. Do not edit the vendor submodule.
 *
 * This temporarily patches only the explicit passed class's prototype and
 * restores it in finally, even if the native Store or caller throws.
 * It does not manipulate a deck, a shuffle result, or either actor's state.
 *
 * @template T
 * @param {()=>T} work Synchronous native research operation.
 * @param {{ShuffleDeckPrompt?:Function}} [types] Pinned type or test double.
 * @returns {{result:T,audit:{version:string,correctedValidations:number,
 * rejectedValidations:number,restored:boolean}}}
 */
function withNumericShuffleIndexValidation(work,types={}) {
  assert.equal(typeof work,'function');
  const ShuffleDeckPrompt=types.ShuffleDeckPrompt??
    require(path.join(ROOT,'game/store/prompts/shuffle-prompt')).ShuffleDeckPrompt;
  const proto=ShuffleDeckPrompt.prototype;
  const original=proto.validate;
  assert.equal(typeof original,'function');
  // Fail loudly if a new vendor revision changes the implementation;
  // otherwise a compatibility hook could obscure an upstream fix.
  assert.ok(original.toString().includes('.sort()'),
    'Pinned lexicographic shuffle validator no longer matches: re-audit hook');
  const audit={version:'agent43-twinleaf-a9905-numeric-shuffle-validation-v1',
    correctedValidations:0,rejectedValidations:0,restored:false};
  proto.validate=function(result,state) {
    const player=state.players.find(p=>p.id===this.getPerspectivePlayerId());
    if(!Array.isArray(result)||!player||
       result.length!==player.deck.cards.length) {
      audit.rejectedValidations++;
      return false;
    }
    const sorted=result.slice().sort((a,b)=>a-b);
    for(let i=0;i<sorted.length;i++) {
      if(sorted[i]!==i) {
        audit.rejectedValidations++;
        return false;
      }
    }
    audit.correctedValidations++;
    return true;
  };
  try {
    return {result:work(),audit};
  }finally{
    proto.validate=original;
    audit.restored=true;
  }
}

module.exports={withNumericShuffleIndexValidation};
