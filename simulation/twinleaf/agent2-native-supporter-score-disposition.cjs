'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent2-native-supporter-score-disposition-v1';

/**
 * Observe real pinned bot Supporter scoring and rejected candidate valuations.
 * All intercepted native functions execute exactly once with their original
 * arguments. The observer never calls simulateAction or changes an action.
 *
 * @template T
 * @param {()=>T} execute Synchronous native game.
 * @param {{SimpleTacticsAi?:Function,PlaySupporterTactic?:Function,
 *   SimpleTactic?:Function,supporterType?:number|string,
 *   maxDecisions?:number}} [deps] Engine/test dependencies.
 * @returns {{result:T,audit:object}}
 */
function withNativeSupporterScoreDisposition(execute,deps={}){
  assert.equal(typeof execute,'function');
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Ai=deps.SimpleTacticsAi??require(path.join(output,
    'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Support=deps.PlaySupporterTactic??require(path.join(output,
    'simple-bot/simple-tactics/play-supporter-tactic')).PlaySupporterTactic;
  const Tactic=deps.SimpleTactic??require(path.join(output,
    'simple-bot/simple-tactics/simple-tactics')).SimpleTactic;
  const supporterType=deps.supporterType??require(path.join(output,
    'game/store/card/card-types')).TrainerType.SUPPORTER;
  const max=deps.maxDecisions??512;
  assert.ok(Number.isSafeInteger(max)&&max>=1);
  const orig={
    decode:Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction'),
    use:Object.getOwnPropertyDescriptor(Support.prototype,'useTactic'),
    eval:Object.getOwnPropertyDescriptor(Tactic.prototype,'evaluateAction'),
    score:Object.getOwnPropertyDescriptor(Tactic.prototype,'getStateScore')
  };
  for(const value of Object.values(orig))
    assert.equal(typeof value?.value,'function','Native method unavailable');
  let current=null,active=null,decisionCount=0,useCount=0,dropped=0;
  const events=[];
  function serialScore(v){
    return v===undefined?'undefined':
      (typeof v==='number'&&Number.isFinite(v)?v:'nonfinite');
  }
  function watchedScore(...args){
    const value=orig.score.value.apply(this,args);
    if(active?.instance===this)active.baseline=serialScore(value);
    return value;
  }
  function watchedEval(...args){
    const score=orig.eval.value.apply(this,args);
    if(active?.instance===this){
      const action=args[2],i=action?.handIndex;
      active.evaluations.push({
        handIndex:Number.isSafeInteger(i)?i:null,
        printing:Number.isSafeInteger(i)?
          active.owner.hand.cards[i]?.fullName??null:null,
        score:serialScore(score)
      });
    }
    return score;
  }
  function watchedUse(state,owner){
    useCount++;
    const observation={
      instance:this,owner,seat:state.players.indexOf(owner),turn:state.turn,
      quotaBefore:owner.supporterTurn,
      supporterZoneSize:owner.supporter?.cards?.length??null,
      heldSupporterPrintings:owner.hand.cards.filter(c=>
        c.trainerType===supporterType).map(c=>c.fullName),
      supporterBonus:this.options?.scores?.tactics?.supporterBonus??null,
      baseline:null,evaluations:[],returnAction:null,
      returnPrinting:null,quotaAfter:null
    };
    const prior=active;active=observation;
    try{
      const result=orig.use.value.call(this,state,owner);
      observation.returnAction=result?.constructor?.name??'undefined';
      observation.returnPrinting=Number.isSafeInteger(result?.handIndex)?
        owner.hand.cards[result.handIndex]?.fullName??null:null;
      return result;
    }finally{
      observation.quotaAfter=owner.supporterTurn;
      if(current)current.tactics.push({
        seat:observation.seat,turn:observation.turn,
        quotaBefore:observation.quotaBefore,
        quotaAfter:observation.quotaAfter,
        supporterZoneSize:observation.supporterZoneSize,
        heldSupporterPrintings:observation.heldSupporterPrintings,
        supporterBonus:observation.supporterBonus,
        baseline:observation.baseline,
        evaluations:observation.evaluations,
        returnAction:observation.returnAction,
        returnPrinting:observation.returnPrinting
      });
      active=prior;
    }
  }
  function watchedDecode(state){
    const prior=current;
    const ordinal=++decisionCount;
    const owner=state.players?.find(p=>p.id===this.client?.id);
    const event={ordinal,turn:state.turn,
      seat:owner?state.players.indexOf(owner):null,
      nativeFinalAction:null,tactics:[]};
    current=event;
    try{
      const result=orig.decode.value.call(this,state);
      event.nativeFinalAction=result?.constructor?.name??'undefined';
      return result;
    }finally{
      if(event.tactics.length){
        if(events.length<max)events.push(event);
        else dropped++;
      }
      current=prior;
    }
  }
  Object.defineProperty(Tactic.prototype,'getStateScore',
    {...orig.score,value:watchedScore});
  Object.defineProperty(Tactic.prototype,'evaluateAction',
    {...orig.eval,value:watchedEval});
  Object.defineProperty(Support.prototype,'useTactic',
    {...orig.use,value:watchedUse});
  Object.defineProperty(Ai.prototype,'decodeNextAction',
    {...orig.decode,value:watchedDecode});
  function audit(){
    const passes=events.filter(e=>e.nativeFinalAction==='PassTurnAction');
    return {version:VERSION,ownerOnly:true,decisionsChanged:false,
      nativeDecisions:decisionCount,supporterTacticCalls:useCount,
      storedTacticDecisionEvents:events.length,dropped,
      storedPasses:passes.length,
      storedPassesHoldingSupporters:passes.filter(e=>
        e.tactics.some(t=>t.heldSupporterPrintings.length>0)).length,
      storedPassesWithEvaluations:passes.filter(e=>
        e.tactics.some(t=>t.evaluations.length>0)).length,
      storedPassesAllEvaluationsUndefined:passes.filter(e=>
        e.tactics.some(t=>t.evaluations.length>0&&
          t.evaluations.every(s=>s.score==='undefined'))).length,
      events,competitiveGameQualified:false,
      limitation:'Native scores from existing speculative Simulator calls. This observer does not establish paper legality, target affordability, hidden-information safety or tactical benefit.'};
  }
  try{return {result:execute(),audit:audit()};}
  catch(error){
    if(error&&typeof error==='object')
      error.agent2SupporterScoreEvidence=audit();
    throw error;
  }finally{
    assert.strictEqual(Ai.prototype.decodeNextAction,watchedDecode);
    assert.strictEqual(Support.prototype.useTactic,watchedUse);
    assert.strictEqual(Tactic.prototype.evaluateAction,watchedEval);
    assert.strictEqual(Tactic.prototype.getStateScore,watchedScore);
    Object.defineProperty(Ai.prototype,'decodeNextAction',orig.decode);
    Object.defineProperty(Support.prototype,'useTactic',orig.use);
    Object.defineProperty(Tactic.prototype,'evaluateAction',orig.eval);
    Object.defineProperty(Tactic.prototype,'getStateScore',orig.score);
  }
}

module.exports={VERSION,withNativeSupporterScoreDisposition};
