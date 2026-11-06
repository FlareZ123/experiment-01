'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent15-tapu-cure-bench-only-no-damage-native-hook-v1';

/**
 * Install a default-off paper correction on the first real Store. Keeps the
 * exact printed Tapu Lele-GX GRI attack, other attacks and detached Stores
 * unchanged, and restores both prototypes on synchronous exit.
 *
 * @template T
 * @param {()=>T} execute
 * @param {object} [deps] Native compiled dependencies or unit-test doubles.
 * @returns {{result:T,audit:object}}
 */
function withPaperTapuCure(execute,deps={}){
  assert.equal(typeof execute,'function');
  const out=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const native=modulePath=>require(path.join(out,modulePath));
  const Store=deps.Store??native('game/store/store').Store;
  const TapuLeleGX=deps.TapuLeleGX??native('sets/08-sun-and-moon/set-guardians-rising/tapu-lele-gx').TapuLeleGX;
  const {WAS_ATTACK_USED,BLOCK_IF_GX_ATTACK_USED}=deps.prefabs??native('game/store/prefabs/prefabs');
  const ChoosePokemonPrompt=deps.ChoosePokemonPrompt??native('game/store/prompts/choose-pokemon-prompt').ChoosePokemonPrompt;
  const HealEffect=deps.HealEffect??native('game/store/effects/game-effects').HealEffect;
  const GameMessage=deps.GameMessage??native('game/game-message').GameMessage;
  const {PlayerType,SlotType}=deps.targetTypes??native('game/store/actions/play-card-action');
  const dispatchBefore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const reducerBefore=Object.getOwnPropertyDescriptor(TapuLeleGX.prototype,'reduceEffect');
  assert.equal(typeof dispatchBefore?.value,'function');
  assert.equal(typeof reducerBefore?.value,'function');
  const createdPrompts=new WeakMap();
  const audit={schema:VERSION,firstActualStoreCaptured:false,
    correctedAttackDeclarations:0,expectedBenchTargetCounts:[],
    validatedTargetReplies:0,rejectedTargetReplies:0,
    ownerHiddenInformationUsed:false,paperGameQualified:false};
  let realStore=null;

  function paperReducer(store,state,effect){
    const owner=effect?.player;
    const isActual=realStore!==null&&store===realStore&&
      this.fullName==='Tapu Lele-GX GRI'&&
      owner?.active?.getPokemonCard?.()===this&&
      WAS_ATTACK_USED(effect,1,this);
    if(!isActual)return reducerBefore.value.call(this,store,state,effect);
    BLOCK_IF_GX_ATTACK_USED(owner);
    const bench=owner.bench.filter(slot=>slot.getPokemonCard());
    const required=Math.min(2,bench.length);
    audit.correctedAttackDeclarations++;
    audit.expectedBenchTargetCounts.push(required);
    if(required===0){owner.usedGX=true;return state;}
    const prompt=new ChoosePokemonPrompt(owner.id,
      GameMessage.CHOOSE_POKEMON_TO_HEAL,
      PlayerType.BOTTOM_PLAYER,[SlotType.BENCH],
      {min:required,max:required,allowCancel:false,blocked:[]});
    createdPrompts.set(prompt,{owner,required});
    return store.prompt(state,prompt,selected=>{
      owner.usedGX=true;
      for(const target of selected){
        store.reduceEffect(state,new HealEffect(owner,target,999));
      }
      return state;
    });
  }

  function guardedDispatch(action,...args){
    if(realStore===null&&action?.constructor?.name==='AddPlayerAction'){
      realStore=this;
      audit.firstActualStoreCaptured=true;
    }
    if(this===realStore&&action?.constructor?.name==='ResolvePromptAction'){
      const pending=this.state?.prompts?.find(p=>p.id===action.id&&p.result===undefined);
      const metadata=pending&&createdPrompts.get(pending);
      if(metadata){
        const {owner,required}=metadata;
        const picked=action.result;
        const eligible=owner.bench.filter(slot=>slot.getPokemonCard());
        if(!Array.isArray(picked)||picked.length!==required||
          new Set(picked).size!==required||
          picked.some(target=>!eligible.includes(target))){
          audit.rejectedTargetReplies++;
          throw new Error('PAPER_TAPU_CURE_INVALID_BENCH_TARGETS');
        }
        audit.validatedTargetReplies++;
      }
    }
    return dispatchBefore.value.call(this,action,...args);
  }

  Object.defineProperty(TapuLeleGX.prototype,'reduceEffect',
    {...reducerBefore,value:paperReducer});
  Object.defineProperty(Store.prototype,'dispatch',
    {...dispatchBefore,value:guardedDispatch});
  try{return {result:execute(),audit};}
  catch(error){
    if(error&&typeof error==='object')error.agent15TapuCurePaperAudit=audit;
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,guardedDispatch);
    assert.strictEqual(TapuLeleGX.prototype.reduceEffect,paperReducer);
    Object.defineProperty(Store.prototype,'dispatch',dispatchBefore);
    Object.defineProperty(TapuLeleGX.prototype,'reduceEffect',reducerBefore);
  }
}
module.exports={VERSION,withPaperTapuCure};
