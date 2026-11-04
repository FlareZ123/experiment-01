'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(OUTPUT,name));
const VERSION='agent8-lele-gri-wonder-tag-zero-shuffle-v1';

/**
 * Exact-printing opt-in paper-fidelity correction for Tapu Lele-GX GRI 60.
 * Pinned source only schedules ShuffleDeckPrompt when the Wonder Tag
 * Supporter selection is nonempty. Its restricted search permits choosing
 * zero cards, and printed Wonder Tag still requires the deck to be shuffled.
 *
 * This adapter delegates every printed effect unchanged, except scheduling
 * the omitted shuffle after a confirmed Ability's zero Supporter selection.
 * It neither inspects deck-card identities nor modifies vendor code.
 *
 * @template T
 * @param {()=>T} run Synchronous native Store experiment.
 * @returns {{result:T,audit:object}}
 */
function withWonderTagZeroShuffleHook(run){
  assert.equal(typeof run,'function');
  const {TapuLeleGX}=load('sets/08-sun-and-moon/set-guardians-rising/tapu-lele-gx');
  const {PlayPokemonEffect}=load('game/store/effects/play-card-effects');
  const {ChooseCardsPrompt}=load('game/store/prompts/choose-cards-prompt');
  const {ShuffleDeckPrompt}=load('game/store/prompts/shuffle-prompt');
  const {GameMessage}=load('game/game-message');
  const {SuperType,TrainerType}=load('game/store/card/card-types');
  const previous=Object.getOwnPropertyDescriptor(TapuLeleGX.prototype,'reduceEffect');
  assert.equal(typeof previous?.value,'function');
  assert.equal(previous.configurable,true);
  const audit={version:VERSION,printedEntrances:0,
    interceptedSupporterSearches:0,zeroSelections:0,
    nonzeroNativeSelections:0,repairedShuffles:0,
    unrelatedPromptsDelegated:0,competitiveQualifiedGames:0};
  function scopedReduce(store,state,effect){
    if(!(effect instanceof PlayPokemonEffect)||
       effect.pokemonCard!==this||
       this.fullName!=='Tapu Lele-GX GRI')
      return previous.value.call(this,store,state,effect);
    audit.printedEntrances++;
    const actor=effect.player;
    const proxy=new Proxy(store,{
      get(target,property){
        if(property==='prompt')return (nextState,prompt,callback)=>{
          if(prompt instanceof ChooseCardsPrompt&&
             prompt.playerId===actor.id&&
             prompt.cards===actor.deck&&
             prompt.message===GameMessage.CHOOSE_CARD_TO_HAND&&
             prompt.filter?.superType===SuperType.TRAINER&&
             prompt.filter?.trainerType===TrainerType.SUPPORTER&&
             prompt.options?.min===0&&prompt.options?.max===1&&
             prompt.options?.allowCancel===false){
            audit.interceptedSupporterSearches++;
            return target.prompt(nextState,prompt,selected=>{
              const originalResult=callback(selected);
              assert.ok(Array.isArray(selected));
              if(selected.length>0){
                audit.nonzeroNativeSelections++;
                return originalResult;
              }
              audit.zeroSelections++;
              return target.prompt(nextState,
                new ShuffleDeckPrompt(actor.id),order=>{
                  actor.deck.applyOrder(order);
                  audit.repairedShuffles++;
                  return originalResult;
                });
            });
          }
          audit.unrelatedPromptsDelegated++;
          return target.prompt(nextState,prompt,callback);
        };
        const value=Reflect.get(target,property,target);
        return typeof value==='function'?value.bind(target):value;
      }
    });
    return previous.value.call(this,proxy,state,effect);
  }
  Object.defineProperty(TapuLeleGX.prototype,'reduceEffect',{
    ...previous,value:scopedReduce});
  try{return {result:run(),audit};}
  finally{
    assert.strictEqual(TapuLeleGX.prototype.reduceEffect,scopedReduce);
    Object.defineProperty(TapuLeleGX.prototype,'reduceEffect',previous);
  }
}
module.exports={VERSION,withWonderTagZeroShuffleHook};
