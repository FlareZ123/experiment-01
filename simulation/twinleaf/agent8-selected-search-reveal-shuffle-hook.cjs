'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const engine=relative=>require(path.join(ROOT,relative));
const VERSION='agent8-selected-search-reveal-shuffle-v1';

/**
 * Printed Jirachi TEU Stellar Wish and Mew CEL Mysterious Tail both require
 * shuffling after a successful Trainer/Item selection. Pinned Twinleaf
 * returns from the ShowCardsPrompt branch before reaching ShuffleDeckPrompt.
 * This opt-in wrapper adds exactly the omitted shuffle, without altering
 * the raw zero-choice path, the reveal, or the status/once-per-turn effects.
 * The repair is confined to genuine PowerEffects for these two printings.
 *
 * @template T
 * @param {()=>T} run Synchronous real native Store work.
 * @returns {{result:T,audit:object}}
 */
function withSelectedSearchRevealShuffleHook(run){
  assert.equal(typeof run,'function');
  const {Jirachi}=engine('sets/08-sun-and-moon/set-team-up/jirachi');
  const {Mew}=engine('sets/09-sword-and-shield/set-celebrations/mew');
  const {PowerEffect}=engine('game/store/effects/game-effects');
  const {ChooseCardsPrompt}=engine('game/store/prompts/choose-cards-prompt');
  const {ShowCardsPrompt}=engine('game/store/prompts/show-cards-prompt');
  const {ShuffleDeckPrompt}=engine('game/store/prompts/shuffle-prompt');
  const {GameMessage}=engine('game/game-message');
  const variants=[
    {type:Jirachi,printing:'Jirachi TEU'},
    {type:Mew,printing:'Mew CEL'}
  ];
  const old=variants.map(({type})=>{
    const descriptor=Object.getOwnPropertyDescriptor(type.prototype,'reduceEffect');
    assert.equal(typeof descriptor?.value,'function');
    assert.equal(descriptor.configurable,true);
    return descriptor;
  });
  const audit={version:VERSION,printedPowerCalls:0,
    eligibleSearchPrompts:0,zeroSelections:0,positiveSelections:0,
    positiveRevealPrompts:0,repairedShuffles:0,
    unmarkedPromptPassThrough:0,competitiveQualifiedGames:0,
    sourcePrints:variants.map(x=>x.printing)};

  /** @param {number} i @returns {Function} */
  function patch(i){
    const original=old[i].value;
    return function repairedReduce(store,state,effect){
      if(!(effect instanceof PowerEffect)||
         effect.card!==this||
         effect.power!==this.powers?.[0])
        return original.call(this,store,state,effect);
      audit.printedPowerCalls++;
      const owner=effect.player;
      const opponent=state.players.find(p=>p.id!==owner.id);
      let positive=false;
      let emitted=false;
      const proxy=new Proxy(store,{
        get(target,property){
          if(property==='prompt'){
            return (nextState,prompt,callback)=>{
              if(prompt instanceof ChooseCardsPrompt&&
                 prompt.playerId===owner.id&&
                 prompt.message===GameMessage.CHOOSE_CARD_TO_HAND&&
                 prompt.options?.min===0&&prompt.options?.max===1){
                audit.eligibleSearchPrompts++;
                return target.prompt(nextState,prompt,selected=>{
                  assert.ok(Array.isArray(selected));
                  positive=selected.length>0;
                  if(positive)audit.positiveSelections++;
                  else audit.zeroSelections++;
                  return callback(selected);
                });
              }
              if(prompt instanceof ShowCardsPrompt&&
                 positive&&!emitted&&opponent&&
                 prompt.playerId===opponent.id&&
                 prompt.message===GameMessage.CARDS_SHOWED_BY_THE_OPPONENT){
                emitted=true;
                audit.positiveRevealPrompts++;
                return target.prompt(nextState,prompt,response=>{
                  const result=callback(response);
                  // Resolve the original mandatory reveal before shuffling.
                  return target.prompt(nextState,
                    new ShuffleDeckPrompt(owner.id),order=>{
                      owner.deck.applyOrder(order);
                      audit.repairedShuffles++;
                      return result;
                    });
                });
              }
              audit.unmarkedPromptPassThrough++;
              return target.prompt(nextState,prompt,callback);
            };
          }
          const value=Reflect.get(target,property,target);
          return typeof value==='function'?value.bind(target):value;
        }
      });
      return original.call(this,proxy,state,effect);
    };
  }
  const patched=variants.map((x,i)=>patch(i));
  for(let i=0;i<variants.length;i++)
    Object.defineProperty(variants[i].type.prototype,'reduceEffect',{
      ...old[i],value:patched[i]});
  try{return {result:run(),audit};}
  finally{
    for(let i=0;i<variants.length;i++){
      assert.strictEqual(variants[i].type.prototype.reduceEffect,patched[i]);
      Object.defineProperty(variants[i].type.prototype,'reduceEffect',old[i]);
    }
  }
}
module.exports={VERSION,withSelectedSearchRevealShuffleHook};
