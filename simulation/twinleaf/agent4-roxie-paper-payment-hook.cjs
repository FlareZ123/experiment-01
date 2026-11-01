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
 * cards against printed Roxie eligibility instead. Rulebook D-05 requires
 * a Trainer's 'up to two' payment to select at least one eligible card.
 * Before playing, an all-ineligible owner hand cannot legally use Roxie.
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
  const {PlayCardAction}=
    native('game/store/actions/play-card-action');
  const {ChooseCardsPrompt}=
    native('game/store/prompts/choose-cards-prompt');
  const {PokemonCard}=native('game/store/card/pokemon-card');
  const {CardTag}=native('game/store/card/card-types');
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  const isRoxiePaymentCard=card=>card instanceof PokemonCard&&
    !card.hasTag(CardTag.POKEMON_GX)&&
    !card.hasTag(CardTag.POKEMON_EX);
  function paperDispatch(action,...args){
    if(action instanceof PlayCardAction){
      const owner=this.state.players.find(p=>p.id===action.id);
      const played=owner?.hand.cards[action.handIndex];
      if(played?.fullName==='Roxie CEC'&&
         !owner.hand.cards.some(card=>card!==played&&
           isRoxiePaymentCard(card))){
        throw new Error('PAPER_ROXIE_REJECTED:NO_ELIGIBLE_SOURCE_POKEMON');
      }
    }
    if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts.find(p=>
        p.id===action.id&&p.result===undefined);
      if(prompt instanceof ChooseCardsPrompt&&
         prompt.sourceCard?.fullName==='Roxie CEC'){
        const chosen=action.result;
        const eligible=Array.isArray(chosen)&&
          chosen.length>=1&&chosen.length<=2&&
          new Set(chosen).size===chosen.length&&
          chosen.every(card=>prompt.cards.cards.includes(card)&&
            isRoxiePaymentCard(card));
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
