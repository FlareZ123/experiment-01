'use strict';

const assert=require('node:assert/strict');

/**
 * Observe ordered genuine or replayed tactic calls and their per-tactic RNG
 * consumption without evaluating extra proposals. A caller may wrap this
 * around a native RNG tape recorder or invoke it inside its strict replay.
 * The same external observation sink remains available when a replay throws.
 *
 * The observer reports tactic class names, action types, owner-hand
 * indices, finite candidate scores, RNG offsets and errors. Evaluations are
 * observed in order without adding any calls. No card identity, hand contents,
 * deck or Prize is logged.
 *
 * @template T
 * @param {object} bot Actual or reconstructed SimpleTacticsAi.
 * @param {()=>T} work Single genuine/clone decision.
 * @param {{steps:object[],rngCalls:number}} observation Mutable output sink.
 * @returns {T} Original decision or recording result, unchanged.
 */
/**
 * Return a stable pinned-engine callsite without card identities or hidden
 * state. Stack inspection is diagnostic only and cannot itself consume RNG.
 * @returns {string}
 */
function nativeEngineRandomCallsite(){
  const stack=new Error().stack??'';
  const match=stack.match(/ptcg-server\/output\/(.+?):(\d+):\d+/);
  return match?match[1].replaceAll('\\\\','/')+':'+match[2]:'unlocated';
}

function observeNativePolicyTacticSequence(bot,work,observation){
  assert.ok(bot&&Array.isArray(bot.tactics));
  assert.equal(typeof work,'function');
  assert.ok(observation&&Array.isArray(observation.steps));
  const previousRandom=Math.random;
  let count=0;
  const restorations=[];
  observation.evaluations??=[];
  Math.random=function countedPolicyRandom(){
    count++;
    return previousRandom();
  };
  try {
    for(const tactic of new Set(bot.tactics)){
      if(typeof tactic.evaluateAction==='function'){
        const ownEvaluation=Object.getOwnPropertyDescriptor(tactic,'evaluateAction');
        const evaluate=tactic.evaluateAction;
        Object.defineProperty(tactic,'evaluateAction',{
          configurable:true,enumerable:ownEvaluation?.enumerable??false,
          writable:true,
          value:function (...args){
            const start=count,action=args[2];
            const traceSites=observation.traceEngineRandomSites===true;
            const previous=traceSites?Math.random:null,sites=[];
            if(traceSites){
              Math.random=function tracedCandidateRng(){
                sites.push(nativeEngineRandomCallsite());
                return previous();
              };
            }
            let score,threw=false;
            try{
              score=evaluate.apply(this,args);
              return score;
            }catch(error){
              threw=true;
              throw error;
            }finally{
              if(traceSites)Math.random=previous;
              observation.evaluations.push({
                tactic:this.constructor?.name??'unknown',
                actionType:action?.constructor?.name??null,
                handIndex:Number.isSafeInteger(action?.handIndex)?
                  action.handIndex:null,
                rngStart:start,rngEnd:count,rngDraws:count-start,
                finiteScore:Number.isFinite(score),
                score:Number.isFinite(score)?score:null,
                undefinedScore:score===undefined,threw,
                ...(traceSites?{rngSites:sites}:{})
              });
            }
          }
        });
        restorations.push(()=>{
          if(ownEvaluation)Object.defineProperty(tactic,'evaluateAction',
            ownEvaluation);
          else delete tactic.evaluateAction;
        });
      }
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
    return observation.traceSimulationZones===true?
      require('./agent23-native-speculative-zone-trace.cjs')
        .observeNativeSpeculativeZoneTrace(bot,work,observation):work();
  }finally{
    observation.rngCalls=count;
    for(const restore of restorations.reverse())restore();
    Math.random=previousRandom;
  }
}

module.exports={observeNativePolicyTacticSequence};
