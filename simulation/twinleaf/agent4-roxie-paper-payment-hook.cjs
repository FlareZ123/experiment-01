'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath @returns {any} */
const native=modulePath=>require(path.join(output,modulePath));

/**
 * Paper Roxie CEC payment preflight for genuine Store ChooseCardsPrompt
 * instances sourced by Roxie. The pinned Store calls no prompt validator,
 * and the pinned Roxie validator can have stale blocked card indexes after
 * the Supporter moves from hand to discard. Validate the selected physical
 * cards against printed Roxie eligibility instead.
 *
 * This deliberately does not enforce unrelated Trainers' prompt contracts.
 * Installed only for the synchronous native experiment; originals restored
 * even if it throws. No vendor changes.
 *
 * @template T
 * @param {()=>T} execute
 * @returns {T}
 */
function withPaperRoxiePayment(execute){
  assert.equal(typeof execute,'function');
  const {Store}=native('game/store/store');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {ChooseCardsPrompt}=
    native('game/store/prompts/choose-cards-prompt');
  const {PokemonCard}=native('game/store/card/pokemon-card');
  const {CardTag}=native('game/store/card/card-types');
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  function paperDispatch(action,...args){
    if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts.find(p=>
        p.id===action.id&&p.result===undefined);
      if(prompt instanceof ChooseCardsPrompt&&
         prompt.sourceCard?.fullName==='Roxie CEC'){
        const chosen=action.result;
        const eligible=chosen===null&&prompt.options.allowCancel===true||
          Array.isArray(chosen)&&chosen.length<=2&&
          new Set(chosen).size===chosen.length&&
          chosen.every(card=>
            prompt.cards.cards.includes(card)&&
            card instanceof PokemonCard&&
            !card.hasTag(CardTag.POKEMON_GX)&&
            !card.hasTag(CardTag.POKEMON_EX));
        if(!eligible)throw new Error(
          'PAPER_ROXIE_REJECTED:NON_ELIGIBLE_PHYSICAL_DISCARD');
      }
    }
    return descriptor.value.apply(this,[action,...args]);
  }
  Object.defineProperty(Store.prototype,'dispatch',
    {...descriptor,value:paperDispatch});
  try{return execute();}
  finally{
    assert.strictEqual(Store.prototype.dispatch,paperDispatch);
    Object.defineProperty(Store.prototype,'dispatch',descriptor);
  }
}
module.exports={withPaperRoxiePayment};
