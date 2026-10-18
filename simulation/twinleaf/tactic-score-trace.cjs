'use strict';

const {isDeepStrictEqual}=require('node:util');

/**
 * Capture scores actually returned by each tactical candidate evaluation
 * performed by a fresh detached bot. The bot is scoped to a single cloned
 * world; its instance methods are restored even when evaluation throws.
 *
 * @param {{tactics?:object[]}} bot Fresh cloned-world bot.
 * @param {()=>unknown} work Execute decodeNextAction on the clone.
 * @returns {{result:unknown,trace:Array<{tactic:string,actionType:string|null,actionSignature:string|null,score:number|null,undefinedScore:boolean}>}}
 */
function captureTacticScores(bot,work) {
  const trace=[],restorations=[];
  for (const tactic of bot.tactics??[]) {
    if (typeof tactic.evaluateAction!=='function') continue;
    const own=Object.getOwnPropertyDescriptor(tactic,'evaluateAction');
    const evaluate=tactic.evaluateAction;
    Object.defineProperty(tactic,'evaluateAction',{
      configurable:true,enumerable:own?.enumerable??false,writable:true,
      value:function (...args) {
        const score=evaluate.apply(this,args);
        const action=args[2];
        trace.push({
          tactic:this.constructor.name,
          actionType:action?.constructor?.name??null,
          actionSignature:action===undefined?null:JSON.stringify(action),
          score:typeof score==='number'?score:null,
          undefinedScore:score===undefined
        });
        return score;
      }
    });
    restorations.push(()=>{
      if(own)Object.defineProperty(tactic,'evaluateAction',own);
      else delete tactic.evaluateAction;
    });
  }
  let result;
  try {result=work();}
  finally {for(const restore of restorations.reverse())restore();}
  return {result,trace};
}

/**
 * Report attempts separately from finite candidate valuations. An evaluator
 * can return undefined for a speculative action the engine cannot score.
 *
 * @param {Array<{tactic:string,score:number|null,undefinedScore:boolean}>} trace
 */
function summarizeTacticScores(trace) {
  const attemptsByTactic={},finiteByTactic={};
  let finiteScores=0,undefinedScores=0,otherUnscored=0;
  for(const candidate of trace) {
    const tactic=candidate.tactic;
    attemptsByTactic[tactic]=(attemptsByTactic[tactic]??0)+1;
    if(Number.isFinite(candidate.score)) {
      finiteByTactic[tactic]=(finiteByTactic[tactic]??0)+1;
      finiteScores++;
    } else if(candidate.undefinedScore)undefinedScores++;
    else otherUnscored++;
  }
  return {
    attemptedEvaluations:trace.length,
    finiteScores,undefinedScores,otherUnscored,
    attemptsByTactic,finiteByTactic
  };
}

/**
 * Compare only actual called candidate-score records. Different call counts
 * or action identities make later aligned records uninterpretable as a score
 * delta on the same proposed action.
 *
 * @param {object[]} physical
 * @param {object[]} counterfactual
 * @returns {object}
 */
function compareTacticScores(physical,counterfactual) {
  const length=Math.min(physical.length,counterfactual.length);
  let firstDifference=null;
  for(let i=0;i<length;i++) {
    if(!isDeepStrictEqual(physical[i],counterfactual[i])) {
      const a=physical[i],b=counterfactual[i];
      firstDifference={
        index:i,
        sameTacticAndCandidate:a.tactic===b.tactic&&
          a.actionType===b.actionType&&
          a.actionSignature===b.actionSignature,
        physical:a,counterfactual:b
      };
      break;
    }
  }
  return {
    physicalEvaluations:physical.length,
    counterfactualEvaluations:counterfactual.length,
    physicalScoreSummary:summarizeTacticScores(physical),
    counterfactualScoreSummary:summarizeTacticScores(counterfactual),
    equalScoreTraces:physical.length===counterfactual.length&&
      firstDifference===null,
    firstDifference:firstDifference??(physical.length!==counterfactual.length?
      {index:length,reason:'evaluation-count-mismatch'}:null)
  };
}

module.exports={captureTacticScores,compareTacticScores,summarizeTacticScores};
