'use strict';

const assert=require('node:assert/strict');

const VERSION='agent18-pinned-wally-non-pokemon-ex-prompt-guard-v1';
const PAPER_DENIAL='PAPER_WALLY_EX_TARGET_FORBIDDEN';

/**
 * A temporary research-owned Store boundary for pinned Twinleaf Wally ROS.
 *
 * Pinned Wally's target-generation code excludes an unrelated non-EX Pokemon
 * but accidentally leaves unrelated Pokemon-EX eligible because its boolean
 * predicate is "(different evolvesFrom && !POKEMON_EX)". The native
 * ChoosePokemonPrompt.validate is insufficient to exclude an EX target.
 *
 * This scope restores Store.prototype.dispatch in a finally block. It
 * checks only prompts whose exact source card is Wally ROS and whose
 * message is CHOOSE_POKEMON_TO_EVOLVE; all other actions are unchanged.
 * The hook does not inspect hidden opponent identities or card order.
 *
 * @template T
 * @param {{Store:Function,ResolvePromptAction:Function,CardTag:object,GameMessage:object}} native
 * @param {()=>T} execute Synchronous Store-backed experiment.
 * @returns {{result:T,audit:{version:string,scopedPrompts:number,approved:number,denied:number}}}
 */
function withWallyPaperRecipientGuard(native,execute){
  assert.equal(typeof execute,'function');
  const {Store,ResolvePromptAction,CardTag,GameMessage}=native;
  assert.equal(typeof Store,'function');
  assert.equal(typeof ResolvePromptAction,'function');
  assert.equal(typeof CardTag,'object');
  assert.equal(typeof GameMessage,'object');
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  const original=descriptor.value;
  const audit={version:VERSION,scopedPrompts:0,approved:0,denied:0};

  function guardedDispatch(action,...args){
    if(action instanceof ResolvePromptAction){
      const state=this.state;
      const prompt=state?.prompts?.find(p=>p.id===action.id&&p.result===undefined);
      const trainer=prompt?.sourceCard ??
        this.trainerPromptSources?.get(prompt?.id)?.trainerCard;
      if(prompt?.constructor?.name==='ChoosePokemonPrompt'&&
          prompt.message===GameMessage.CHOOSE_POKEMON_TO_EVOLVE&&
          trainer?.fullName==='Wally ROS'){
        audit.scopedPrompts++;
        const selected=action.result;
        const slot=Array.isArray(selected)&&selected.length===1?selected[0]:null;
        const pokemon=slot?.getPokemonCard?.();
        if(!pokemon||pokemon.hasTag(CardTag.POKEMON_EX)||
            !prompt.validate(selected,state)){
          audit.denied++;
          const error=new Error(PAPER_DENIAL);
          error.code=PAPER_DENIAL;
          throw error;
        }
        audit.approved++;
      }
    }
    return original.call(this,action,...args);
  }
  Object.defineProperty(Store.prototype,'dispatch',{
    ...descriptor,value:guardedDispatch
  });
  try {
    const result=execute();
    return {result,audit:{...audit}};
  } finally {
    Object.defineProperty(Store.prototype,'dispatch',descriptor);
  }
}

module.exports={VERSION,PAPER_DENIAL,withWallyPaperRecipientGuard};
