'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent9-native-trainer-realroot-score-census-v1';

/**
 * Observe *real Store owner roots* whenever the canonical actor wrapper
 * delegates to the pinned native SimpleTacticsAi. Count its inherited tactic
 * score calls without reading any private hidden-zone identities, drawing
 * randomness, changing native actions, or modifying the vendor submodule.
 *
 * Counts are a necessary diagnostic of potential speculative scoring, not
 * proof that a hidden card changed an actual source-root action.
 *
 * Must wrap execution OUTSIDE the canonical actor policy installation:
 *   withNativeTrainerScoreObserver(
 *     () => withCanonicalActorOnlyPolicy(() => runMatch(...), ..., flags))
 *
 * @template T
 * @param {()=>T} execute Synchronous, genuine headless Store game.
 * @returns {{result:T,audit:object}}
 */
function withNativeTrainerScoreObserver(execute){
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const native=p=>require(path.join(base,p));
  const {Store}=native('game/store/store');
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const {SimpleTactic}=native('simple-bot/simple-tactics/simple-tactics');
  const {GamePhase}=native('game/store/state/state');
  const storeProto=Store.prototype,aiProto=SimpleTacticsAi.prototype;
  const tacticsProto=SimpleTactic.prototype;
  const previous={
    dispatch:Object.getOwnPropertyDescriptor(storeProto,'dispatch'),
    decode:Object.getOwnPropertyDescriptor(aiProto,'decodeNextAction'),
    evaluate:Object.getOwnPropertyDescriptor(tacticsProto,'evaluateAction'),
    score:Object.getOwnPropertyDescriptor(tacticsProto,'getStateScore')
  };
  for(const key of Object.keys(previous))
    assert.equal(typeof previous[key]?.value,'function',
      'Pinned native method unavailable: '+key);
  let realStore=null,scoreCalls=0,evalCalls=0;
  const audit={
    version:VERSION,realOwnerNativeDelegations:0,
    tacticEvaluateActionCalls:0,tacticGetStateScoreCalls:0,
    delegationsWithAnyScorerCalls:0,
    delegationsWithoutScorerCalls:0,
    perSeat:{0:0,1:0},
    roots:[],rootsOmitted:0,
    nativeEngineAndSourceUnmodified:true,
    actorObservationNotRead:false,
    hiddenCardIdentityReadByObserver:false,
    observedScoreCallsNotProofOfHiddenDecisionInfluence:true,
    competitiveGamesQualified:0
  };
  function tappedDispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&realStore===null)
      realStore=this;
    return previous.dispatch.value.apply(this,[action,...args]);
  }
  function tappedEvaluate(...args){
    evalCalls++;
    return previous.evaluate.value.apply(this,args);
  }
  function tappedScore(...args){
    scoreCalls++;
    return previous.score.value.apply(this,args);
  }
  function tappedDecode(state,...args){
    const seat=state?.players?.findIndex(p=>p.id===this.client?.id)??-1;
    const root=realStore!==null&&state===realStore.state&&
      state.phase===GamePhase.PLAYER_TURN&&state.activePlayer===seat&&
      (seat===0||seat===1)&&
      state.prompts?.every(prompt=>prompt.result!==undefined);
    const e0=evalCalls,s0=scoreCalls;
    const action=previous.decode.value.apply(this,[state,...args]);
    if(root){
      const deltaEvaluate=evalCalls-e0;
      const deltaScore=scoreCalls-s0;
      const {actorObservation}=
        require('./actor-observation-contract.cjs');
      const view=actorObservation(state,seat);
      const index=Number.isSafeInteger(action?.handIndex)?
        action.handIndex:null;
      const proposedPrinting=index!==null&&index>=0&&
        index<view.ownHand.length?view.ownHand[index]:null;
      const row={
        seat,globalTurn:view.globalTurn,
        class:action?.constructor?.name??null,
        proposedPrinting,
        evaluateActionCalls:deltaEvaluate,
        getStateScoreCalls:deltaScore,
        actorViewObtainedAfterDecision:true,
        informationSafetyCertified:false
      };
      audit.realOwnerNativeDelegations++;
      audit.perSeat[seat]++;
      audit.tacticEvaluateActionCalls+=deltaEvaluate;
      audit.tacticGetStateScoreCalls+=deltaScore;
      if(deltaEvaluate+deltaScore>0)audit.delegationsWithAnyScorerCalls++;
      else audit.delegationsWithoutScorerCalls++;
      if(audit.roots.length<160)audit.roots.push(row);
      else audit.rootsOmitted++;
      audit.actorObservationNotRead=false;
    }
    return action;
  }
  Object.defineProperty(storeProto,'dispatch',{
    ...previous.dispatch,value:tappedDispatch
  });
  Object.defineProperty(tacticsProto,'evaluateAction',{
    ...previous.evaluate,value:tappedEvaluate
  });
  Object.defineProperty(tacticsProto,'getStateScore',{
    ...previous.score,value:tappedScore
  });
  Object.defineProperty(aiProto,'decodeNextAction',{
    ...previous.decode,value:tappedDecode
  });
  try{
    const result=execute();
    return {result,audit};
  }finally{
    assert.strictEqual(storeProto.dispatch,tappedDispatch);
    assert.strictEqual(aiProto.decodeNextAction,tappedDecode);
    assert.strictEqual(tacticsProto.evaluateAction,tappedEvaluate);
    assert.strictEqual(tacticsProto.getStateScore,tappedScore);
    Object.defineProperty(aiProto,'decodeNextAction',previous.decode);
    Object.defineProperty(tacticsProto,'getStateScore',previous.score);
    Object.defineProperty(tacticsProto,'evaluateAction',previous.evaluate);
    Object.defineProperty(storeProto,'dispatch',previous.dispatch);
  }
}

module.exports={VERSION,withNativeTrainerScoreObserver};
