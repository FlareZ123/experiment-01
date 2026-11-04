'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const VERSION = 'agent1-radiant-climactic-gate-empty-search-v1';

/**
 * Research-owned, reversible repair of the pinned Radiant Eternatus CRZ
 * Climactic Gate zero-VMAX branch. The printed Ability ends the turn after
 * any affirmative use. The pinned reducer instead returns early on [].
 *
 * The initiating Radiant reducer synchronously makes an owner ConfirmPrompt.
 * Its callback later opens an owner-deck ChooseCardsPrompt. We wrap only this
 * exact callback lineage, leaving unrelated empty-search prompts untouched.
 *
 * @template T
 * @param {()=>T} run Synchronous pinned Store fixture or development match.
 * @returns {{result:T,audit:object}}
 */
function withRadiantZeroGateHook(run){
  assert.equal(typeof run,'function');
  const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  /** @param {string} name @returns {any} */
  const native=name=>require(path.join(root,name));
  const {Store}=native('game/store/store');
  const {RadiantEternatus}=
    native('sets/09-sword-and-shield/set-crown-zenith/radiant-eternatus');
  const {PlayPokemonEffect}=native('game/store/effects/play-card-effects');
  const {EndTurnEffect}=native('game/store/effects/game-phase-effects');
  const {ShuffleDeckPrompt}=native('game/store/prompts/shuffle-prompt');
  const {ConfirmPrompt}=native('game/store/prompts/confirm-prompt');
  const {ChooseCardsPrompt}=native('game/store/prompts/choose-cards-prompt');
  const {GameMessage}=native('game/game-message');
  const oldReducer=Object.getOwnPropertyDescriptor(
    RadiantEternatus.prototype,'reduceEffect');
  const oldPrompt=Object.getOwnPropertyDescriptor(Store.prototype,'prompt');
  assert.equal(typeof oldReducer?.value,'function');
  assert.equal(typeof oldPrompt?.value,'function');
  let entering=null;
  let confirmed=null;
  const audit={
    version:VERSION,printing:'Radiant Eternatus CRZ',
    observedUseConfirmations:0,declinedUses:0,
    observedSearchChoices:0,zeroSelections:0,
    repairedShuffles:0,repairedTurnEnds:0,
    nonzeroNativeSelections:0,paperQualifiedGames:0
  };
  function patchedReducer(store,state,effect){
    if(!(effect instanceof PlayPokemonEffect)||effect.pokemonCard!==this)
      return oldReducer.value.call(this,store,state,effect);
    const previous=entering;
    entering={store,owner:effect.player};
    try{return oldReducer.value.call(this,store,state,effect);}
    finally{entering=previous;}
  }
  function patchedPrompt(state,prompt,callback){
    const entry=entering;
    if(entry?.store===this && prompt instanceof ConfirmPrompt &&
        prompt.playerId===entry.owner.id &&
        prompt.message===GameMessage.WANT_TO_USE_ABILITY){
      audit.observedUseConfirmations++;
      return oldPrompt.value.call(this,state,prompt,function useChoice(want){
        if(!want){
          audit.declinedUses++;
          return callback(want);
        }
        const previous=confirmed;
        confirmed=entry;
        try{return callback(want);}
        finally{confirmed=previous;}
      });
    }
    const selection=confirmed;
    if(selection?.store===this && prompt instanceof ChooseCardsPrompt &&
        prompt.playerId===selection.owner.id &&
        prompt.message===GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH &&
        prompt.cards===selection.owner.deck &&
        prompt.options.min===0 && prompt.options.max<=2){
      audit.observedSearchChoices++;
      return oldPrompt.value.call(this,state,prompt,function gateChoice(cards){
        const result=callback(cards);
        if(!Array.isArray(cards)||cards.length!==0){
          audit.nonzeroNativeSelections++;
          return result;
        }
        audit.zeroSelections++;
        this.prompt(state,new ShuffleDeckPrompt(selection.owner.id),
          order=>selection.owner.deck.applyOrder(order));
        audit.repairedShuffles++;
        this.reduceEffect(state,new EndTurnEffect(selection.owner));
        audit.repairedTurnEnds++;
        return result;
      }.bind(this));
    }
    return oldPrompt.value.call(this,state,prompt,callback);
  }
  Object.defineProperty(RadiantEternatus.prototype,'reduceEffect',
    {...oldReducer,value:patchedReducer});
  Object.defineProperty(Store.prototype,'prompt',
    {...oldPrompt,value:patchedPrompt});
  try{return {result:run(),audit};}
  finally{
    assert.strictEqual(Store.prototype.prompt,patchedPrompt);
    assert.strictEqual(RadiantEternatus.prototype.reduceEffect,patchedReducer);
    Object.defineProperty(Store.prototype,'prompt',oldPrompt);
    Object.defineProperty(RadiantEternatus.prototype,'reduceEffect',oldReducer);
  }
}
module.exports={VERSION,withRadiantZeroGateHook};
