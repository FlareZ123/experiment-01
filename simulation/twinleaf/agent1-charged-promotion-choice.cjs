'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent1-actor-owned-charged-promotion-v1';

/**
 * Conservative generic Pokémon prompt refinement. Only an exclusive menu
 * of the acting player's own Benched Pokémon is ranked. It is therefore
 * applicable to opponent-forced Rope switches and voluntary promotions.
 * When the menu includes an opponent's Pokémon or Active-target choices,
 * preserve the preexisting first-eligible baseline.
 *
 * Attached Energy *card count* is a deliberately weak proxy; DCE and other
 * multi-unit or type-restricted Energy, damage, locks, future turns, and
 * exact attack affordability are not evaluated. A real native Store prompt
 * validator remains responsible for legal target selection.
 *
 * @param {object} input Detached actor-only ChoosePokemon input.
 * @returns {{index:number|null}|null}
 */
function chooseChargedOwnPromotion(input) {
  assert.equal(input.actor?.decisionKind, 'owner-prompt');
  assert.equal(input.prompt?.kind, 'ChoosePokemonPrompt');
  const offered=input.prompt.offered;
  assert.ok(Array.isArray(offered));
  if(offered.length===0)return input.prompt.allowCancel?{index:null}:null;
  if(!offered.every(choice=>
    choice.side==='own'&&choice.zone==='bench'&&
    Number.isSafeInteger(choice.attachedEnergyCount)&&
    choice.attachedEnergyCount>=0))return {index:0};
  let best=0;
  for(let i=1;i<offered.length;i++){
    if(offered[i].attachedEnergyCount>
       offered[best].attachedEnergyCount)best=i;
  }
  return {index:best};
}

module.exports={VERSION,chooseChargedOwnPromotion};
