'use strict';

const assert=require('node:assert/strict');

/**
 * Observe ordered genuine or replayed tactic calls and their per-tactic RNG
 * consumption without evaluating extra proposals. A caller may wrap this
 * around a native RNG tape recorder or invoke it inside its strict replay.
 * The same external observation sink remains available when a replay throws.
 *
 * The observer reports only tactic class names, action *types*, RNG offsets
 * and thrown/error flags. No card identity, hand, deck or Prize is logged.
 *
 * @template T
 * @param {object} bot Actual or reconstructed SimpleTacticsAi.
 * @param {()=>T} work Single genuine/clone decision.
 * @param {{steps:object[],rngCalls:number}} observation Mutable output sink.
 * @returns {T} Original decision or recording result, unchanged.
 */
function observeNativePolicyTacticSequence(bot,work,observation){
  assert.ok(bot&&Array.isArray(bot.tactics));
  assert.equal(typeof work,'function');
  assert.ok(observation&&Array.isArray(observation.steps));
  const previousRandom=Math.random;
  let count=0;
  const restorations=[];
  Math.random=function countedPolicyRandom(){
    count++;
    return previousRandom();
  };
  try {
    for(const tactic of new Set(bot.tactics)){
      if(typeof tactic.useTactic!=='function')continue;
      const own=Object.getOwnPropertyDescriptor(tactic,'useTactic');
      const use=tactic.useTactic;
      Object.defineProperty(tactic,'useTactic',{
        configurable:true,enumerable:own?.enumerable??false,writable:true,
        value:function (...args){
          const start=count;
          let actionType=null,threw=false;
          try {
            const result=use.apply(this,args);
            actionType=result?.constructor?.name??null;
            return result;
          }catch(error){
            threw=true;
            throw error;
          }finally{
            observation.steps.push({
              tactic:this.constructor?.name??'unknown',
              rngStart:start,rngEnd:count,
              rngDraws:count-start,actionType,threw
            });
          }
        }
      });
      restorations.push(()=>{
        if(own)Object.defineProperty(tactic,'useTactic',own);
        else delete tactic.useTactic;
      });
    }
    return work();
  }finally{
    observation.rngCalls=count;
    for(const restore of restorations.reverse())restore();
    Math.random=previousRandom;
  }
}

module.exports={observeNativePolicyTacticSequence};
