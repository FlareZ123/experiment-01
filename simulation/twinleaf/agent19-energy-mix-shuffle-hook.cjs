'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent19-mew-energy-mix-paper-shuffle-v1';
const enginePath=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');
const engine=relative=>require(path.join(enginePath,relative));

/**
 * Opt-in, reversible correction for the omitted final shuffle in Mew V FST's
 * printed Energy Mix. Works when Mew VMAX copies the attack through the pinned
 * native delegated-attack session. Uses the engine's own ShuffleDeckPrompt.
 * Never chooses the deck order on behalf of the player or bot.
 *
 * @template T
 * @param {()=>T} execute Synchronous headless Store workload.
 * @param {{MewV?:Function,AttackEffect?:Function,AttachEnergyPrompt?:Function,
 *   ShuffleDeckPrompt?:Function}} [dependencies] Native or test classes.
 * @returns {{result:T,audit:object}}
 */
function withPaperMewEnergyMixShuffle(execute,dependencies={}){
  assert.equal(typeof execute,'function');
  const MewV=dependencies.MewV??
    engine('sets/09-sword-and-shield/set-fusion-strike/mew-v').MewV;
  const AttackEffect=dependencies.AttackEffect??
    engine('game/store/effects/game-effects').AttackEffect;
  const AttachEnergyPrompt=dependencies.AttachEnergyPrompt??
    engine('game/store/prompts/attach-energy-prompt').AttachEnergyPrompt;
  const ShuffleDeckPrompt=dependencies.ShuffleDeckPrompt??
    engine('game/store/prompts/shuffle-prompt').ShuffleDeckPrompt;
  const prototype=MewV.prototype;
  const descriptor=Object.getOwnPropertyDescriptor(prototype,'reduceEffect');
  assert.equal(typeof descriptor?.value,'function');
  const audit={version:VERSION,energyMixEffects:0,attachedPrompts:0,
    shufflePromptsCreated:0,shufflePromptsSettled:0,
    correctedNativeGameQualified:false};
  function patchedReduceEffect(store,state,effect){
    if(!(effect instanceof AttackEffect)||
       effect.attack!==this.attacks?.[0])
      return descriptor.value.call(this,store,state,effect);
    audit.energyMixEffects++;
    const player=effect.player;
    const hadOwn=Object.prototype.hasOwnProperty.call(store,'prompt');
    const storeDescriptor=Object.getOwnPropertyDescriptor(store,'prompt');
    const originalPrompt=store.prompt;
    let intercepted=0;
    function interceptPrompt(nextState,prompt,callback){
      if(prompt instanceof AttachEnergyPrompt&&
         prompt.playerId===player.id&&prompt.cardList===player.deck&&
         prompt.options?.min===0&&prompt.options?.max===1){
        intercepted++;
        audit.attachedPrompts++;
        return originalPrompt.call(store,nextState,prompt,(transfers)=>{
          callback(transfers);
          const shuffle=new ShuffleDeckPrompt(player.id);
          originalPrompt.call(store,nextState,shuffle,order=>{
            player.deck.applyOrder(order);
            audit.shufflePromptsSettled++;
            return nextState;
          });
          audit.shufflePromptsCreated++;
          return nextState;
        });
      }
      return originalPrompt.call(store,nextState,prompt,callback);
    }
    Object.defineProperty(store,'prompt',{
      configurable:true,writable:true,value:interceptPrompt
    });
    try{
      const result=descriptor.value.call(this,store,state,effect);
      if(intercepted!==1){
        const error=new Error('PAPER_MEW_ENERGY_MIX_PROMPT_CAPTURE_FAILED');
        error.code='PAPER_MEW_ENERGY_MIX_PROMPT_CAPTURE_FAILED';
        error.paperMewEnergyMixAudit={...audit};
        throw error;
      }
      return result;
    }finally{
      if(hadOwn)Object.defineProperty(store,'prompt',storeDescriptor);
      else delete store.prompt;
    }
  }
  Object.defineProperty(prototype,'reduceEffect',{
    ...descriptor,value:patchedReduceEffect
  });
  try{return {result:execute(),audit:{...audit}};}
  finally{
    assert.equal(Object.getOwnPropertyDescriptor(prototype,'reduceEffect')
      .value,patchedReduceEffect);
    Object.defineProperty(prototype,'reduceEffect',descriptor);
  }
}

module.exports={VERSION,withPaperMewEnergyMixShuffle};
