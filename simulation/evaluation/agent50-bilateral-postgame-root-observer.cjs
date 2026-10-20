'use strict';

const assert=require('node:assert/strict');
const {isDeepStrictEqual}=require('node:util');
const {stateGraphFingerprint}=
  require('../twinleaf/rank10-live-decision-noninterference.cjs');
const {
  actionSignature,compareHiddenDeckOrders
}=require('../twinleaf/rank10-hidden-order-live-probe.cjs');

/**
 * Snapshot the complete actual SimpleBotOptions at the owner-decision
 * boundary, while preserving tactic/resolver constructor references. The
 * pinned engine uses class constructors in these two arrays and plain data
 * for scores/arbiter. A shallow copy keeps mutable nested score weights
 * shared with the live bot and between hypothetical worlds.
 *
 * @param {object} options Actual pinned bot options plus chosen constructors.
 * @returns {object} Detached mutable option data; constructor identities kept.
 */
function cloneBotOptions(options) {
  assert.ok(options&&typeof options==='object');
  assert.ok(Array.isArray(options.tactics));
  assert.ok(Array.isArray(options.promptResolvers));
  const copy={};
  for(const [name,value] of Object.entries(options)) {
    if(name==='tactics'||name==='promptResolvers') continue;
    copy[name]=structuredClone(value);
  }
  copy.tactics=options.tactics.slice();
  copy.promptResolvers=options.promptResolvers.slice();
  return copy;
}

/**
 * Test a reconstructed bot's proposed PlayCard action only in an independently
 * cloned pinned Store after the authentic game has ended. Preserve the raw
 * numeric board target and acting owner's resource state. A returned dispatch
 * does not alone prove final effect settlement or legality in paper Expanded.
 *
 * @param {object} snapshot Complete genuine native root State.
 * @param {{type:string,data:string}} signature Reconstructed fresh action.
 * @param {(state:object)=>object} clone Detached source State copier.
 * @param {{Store:Function,PlayCardAction:Function,makeRandom?:()=>()=>number}} deps
 * @returns {object}
 */
function probeFreshPlayCardInClonedStore(snapshot,signature,clone,deps) {
  assert.equal(signature.type,'PlayCardAction');
  const data=JSON.parse(signature.data);
  assert.ok(Number.isSafeInteger(data.id));
  assert.ok(Number.isSafeInteger(data.handIndex)&&data.handIndex>=0);
  const prior=stateGraphFingerprint(snapshot);
  const detached=new deps.Store({onStateChange(){}});
  detached.state=clone(snapshot);
  const owner=detached.state.players.find(p=>p.id===data.id);
  assert.ok(owner,'Fresh action owner must exist on the source root');
  const handAtRoot=owner.hand.cards.map(card=>card.fullName);
  const beforeHand=handAtRoot.length;
  const energyPlayedTurn=owner.energyPlayedTurn??null;
  const supporterTurn=owner.supporterTurn??null;
  let returned=false,rejection=null;
  const previousRandom=Math.random;
  Math.random=deps.makeRandom?deps.makeRandom():()=>0.5;
  try {
    const action=new deps.PlayCardAction(data.id,data.handIndex,data.target);
    detached.dispatch(action);
    returned=true;
  } catch(error) {
    rejection=String(error?.stack||error);
  } finally {
    Math.random=previousRandom;
  }
  assert.deepEqual(stateGraphFingerprint(snapshot),prior,
    'Fresh cloned Store proposal mutated the historical State');
  return {
    proposedHandIndex:data.handIndex,
    proposedCardPrinting:handAtRoot[data.handIndex]??null,
    proposedTarget:data.target??null,
    handSizeBefore:beforeHand,
    handSizeAfter:detached.state.players.find(p=>p.id===data.id)?.hand.cards.length??null,
    energyPlayedTurn,supporterTurn,
    dispatchReturnedWithoutThrow:returned,
    ...(rejection?{dispatchRejection:rejection}:{}),
    originalStoreUnchanged:true,
    caveat:'Hypothetical clone-only one-step Store dispatch; unresolved prompts and paper legality remain unqualified'
  };
}

/**
 * Capture a single actual source-dealt candidate decision under *all* common
 * outer policy hooks, preserving the real Store action. Compare the
 * counterfactual unseen deck orders only after the match and all reversible
 * gameplay hooks have finished. In particular, the New Moon Field Blower
 * wrapper installs decodeNextAction inside the common policy; a normal outer
 * prototype wrapper would be overwritten and silently collect no root.
 *
 * No speculative tactic call may take place while the live engine is running.
 *
 * @template T
 * @param {Function} BotClass Pinned SimpleTacticsAi.
 * @param {()=>T} execute Existing authentic game runner.
 * @param {(state:object)=>object} cloneDetached Whole-State detached clone.
 * @param {{turn:number,seat:number,makeRandom:()=>()=>number,firstFiniteScoredRoot?:boolean,probeFreshStoreLegality?:boolean}} target
 * @param {{headless?:object,compare?:Function,signature?:Function}} [dependencies]
 * @returns {{result:T,events:object[]}}
 */
function withPostgameRootOrderProbe(
  BotClass,execute,cloneDetached,target,dependencies={}
) {
  assert.equal(typeof execute,'function');
  assert.equal(typeof cloneDetached,'function');
  assert.ok(target&&Number.isSafeInteger(target.turn)&&target.turn>=1);
  assert.ok([0,1].includes(target.seat));
  assert.equal(typeof target.makeRandom,'function');
  const headless=dependencies.headless??require('../twinleaf/headless.cjs');
  const compare=dependencies.compare??compareHiddenDeckOrders;
  const signature=dependencies.signature??actionSignature;
  const originalRunMatch=headless.runMatch;
  assert.equal(typeof originalRunMatch,'function');
  const actorId=target.seat===0?101:202;
  let captured=null;
  let innerRunCalls=0;

  function wrappedRunMatch(request) {
    innerRunCalls++;
    // Observe after the source and common-candidate hooks are installed.
    const descriptor=Object.getOwnPropertyDescriptor(
      BotClass.prototype,'decodeNextAction');
    assert.ok(descriptor&&typeof descriptor.value==='function');
    function observeActualAction(state) {
      const eligible=!captured&&
        (target.firstFiniteScoredRoot===true?
          state.turn>=target.turn:state.turn===target.turn)&&
        state.activePlayer===target.seat&&
        state.prompts.every(prompt=>prompt.result!==undefined)&&
        this.client?.id===actorId;
      if(!eligible)return descriptor.value.call(this,state);
      if(target.firstFiniteScoredRoot===true) {
        // Profile the actual owner's evaluations read-only. Capture a full
        // physical State only on the first generic tactic evaluation, before
        // its speculative score can run; preserve the Store decision.
        let attemptCount=0,finiteScoreCount=0,pending=null;
        const restorations=[];
        const ownerBot=this;
        const captureAtScore=()=>{
          if(pending)return;
          let snapshot=null,options=null,captureError=null;
          try {
            const before=stateGraphFingerprint(state);
            snapshot=cloneDetached(state);
            const commonOptions=ownerBot.tactics?.[0]?.options;
            assert.ok(commonOptions&&typeof commonOptions==='object');
            assert.ok(ownerBot.tactics.every(t=>t.options===commonOptions));
            assert.ok(ownerBot.resolvers.every(r=>r.options===commonOptions));
            options=cloneBotOptions({...commonOptions,
              tactics:ownerBot.tactics.map(t=>t.constructor),
              promptResolvers:ownerBot.resolvers.map(r=>r.constructor)});
            assert.deepEqual(stateGraphFingerprint(state),before,
              'First finite-score root observer changed live State');
          } catch(error) {
            captureError=String(error?.stack||error);
          }
          const owner=state.players.find(player=>player.id===actorId);
          pending={state:snapshot,options,captureError,
            ownerRootVisible:{
              turn:state.turn,
              ownHandPrintings:owner?.hand?.cards?.map(card=>
                card.fullName??null)??null,
              ownActivePrinting:owner?.active?.getPokemonCard?.()?.fullName??null,
              energyPlayedTurn:owner?.energyPlayedTurn??null,
              supporterPlayedTurn:owner?.supporterTurn??null,
              stadiumPlayedTurn:owner?.stadiumPlayedTurn??null
            }};
        };
        try {
          for(const tactic of new Set(this.tactics)) {
            if(typeof tactic.evaluateAction!=='function')continue;
            const own=Object.getOwnPropertyDescriptor(tactic,'evaluateAction');
            const evaluate=tactic.evaluateAction;
            Object.defineProperty(tactic,'evaluateAction',{
              configurable:true,enumerable:own?.enumerable??false,writable:true,
              value:function (...args){
                captureAtScore();
                const score=evaluate.apply(this,args);
                attemptCount++;
                if(Number.isFinite(score))finiteScoreCount++;
                return score;
              }
            });
            restorations.push(()=>{
              if(own)Object.defineProperty(tactic,'evaluateAction',own);
              else delete tactic.evaluateAction;
            });
          }
          const action=descriptor.value.call(this,state);
          if(finiteScoreCount>0) {
            captured={...pending,realAction:signature(action),
              chosenRootTurn:state.turn,
              actualScorerAttempts:attemptCount,
              actualFiniteScores:finiteScoreCount};
          }
          return action;
        } finally {
          for(const restore of restorations.reverse())restore();
        }
      }
      // Snapshot the complete physical decision root. The bot's tactic and
      // resolver constructor arrays may be spliced back out of global defs
      // after the match; freeze their identities *now* for detached replay.
      let snapshot=null;
      let options=null;
      let captureError=null;
      try {
        const sourceBefore=stateGraphFingerprint(state);
        snapshot=cloneDetached(state);
        const commonOptions=this.tactics?.[0]?.options;
        assert.ok(commonOptions&&typeof commonOptions==='object',
          'Pinned tactic option source is missing');
        assert.ok(this.tactics.every(t=>t.options===commonOptions),
          'Live tactic options differ; one reconstructed config is incomplete');
        assert.ok(this.resolvers.every(r=>r.options===commonOptions),
          'Live resolver options differ; one reconstructed config is incomplete');
        options=cloneBotOptions({...commonOptions,
          tactics:this.tactics.map(tactic=>tactic.constructor),
          promptResolvers:this.resolvers.map(resolver=>resolver.constructor)});
        assert.deepEqual(stateGraphFingerprint(state),sourceBefore,
          'Detached root capture mutated the actual Store State graph');
      } catch(error) {
        captureError=String(error?.stack||error);
      }
      const action=descriptor.value.call(this,state);
      captured={state:snapshot,options,realAction:signature(action),
        captureError};
      return action;
    }
    Object.defineProperty(BotClass.prototype,'decodeNextAction',{
      ...descriptor,value:observeActualAction
    });
    try{return originalRunMatch(request);}
    finally{
      const preserved=BotClass.prototype.decodeNextAction===observeActualAction;
      Object.defineProperty(BotClass.prototype,'decodeNextAction',descriptor);
      assert.ok(preserved,
        'Candidate policy replaced the innermost read-only observer');
    }
  }
  headless.runMatch=wrappedRunMatch;
  let result;
  try {result=execute();}
  finally{
    const preserved=headless.runMatch===wrappedRunMatch;
    headless.runMatch=originalRunMatch;
    assert.ok(preserved,
      'The headless runner changed during the observational test');
  }
  assert.equal(innerRunCalls,1,'Expected one physical match per trial');
  // After the live match: copy the returned game-row evidence before any
  // captured tactic constructor can append to a historical closure's log.
  // The runner returns only JSON-like evidence, not Card object instances.
  const frozenResult=structuredClone(result);
  if(!captured)return {result:frozenResult,events:[]};
  if(captured.captureError){
    return {result:frozenResult,events:[{
      originalSourceAction:captured.realAction,
      baselineActionMatchedActual:false,liveStatePreserved:false,
      auditError:captured.captureError
    }]};
  }
  let comparison;
  try {
    const detachedBot=()=>{
      const bot=new BotClass({id:actorId},cloneBotOptions(captured.options),null);
      if(target.isolateReplayPolicyPerWorld===true) {
        // Each world receives a fresh transient Field Blower policy state.
        // The actual scorer's historical closure is still not reconstructed.
        bot.decodeNextAction=function (world) {
          const applyPolicy=dependencies.replayPolicy??
            require('./agent41-bilateral-common-policy.cjs')
              .withBilateralCommonCandidatePolicy;
          return applyPolicy(target.seat,()=>
            BotClass.prototype.decodeNextAction.call(this,world)).result;
        };
      }
      return bot;
    };
    const compareWorlds=()=>compare(
      captured.state,actorId,detachedBot,cloneDetached,target.makeRandom
    );
    // The actual game has Field Blower, Stone-recipient and Star Alchemy
    // adapters around the bot. An unwrapped fresh bot is a different policy.
    // Apply identical adapters only to detached postgame counterfactuals.
    if(target.replayCommonPolicy===true &&
        target.isolateReplayPolicyPerWorld!==true) {
      const applyPolicy=dependencies.replayPolicy??
        require('./agent41-bilateral-common-policy.cjs')
          .withBilateralCommonCandidatePolicy;
      comparison=applyPolicy(target.seat,compareWorlds).result;
    } else {
      comparison=compareWorlds();
    }
  } catch(error) {
    return {result:frozenResult,events:[{
      originalSourceAction:captured.realAction,
      baselineActionMatchedActual:false,liveStatePreserved:true,
      auditError:String(error?.stack||error)
    }]};
  }
  let freshPlayCardStoreProbe=null;
  if(target.probeFreshStoreLegality===true &&
    !isDeepStrictEqual(comparison.physicalOrder,captured.realAction) &&
    comparison.physicalOrder?.type==='PlayCardAction') {
    try {
      const path=require('node:path');
      const output=path.resolve(__dirname,
        '../../vendor/twinleaf/ptcg-server/output');
      const {Store}=require(path.join(output,'game/store/store'));
      const {PlayCardAction}=
        require(path.join(output,'game/store/actions/play-card-action'));
      freshPlayCardStoreProbe=probeFreshPlayCardInClonedStore(
        captured.state,comparison.physicalOrder,cloneDetached,
        {Store,PlayCardAction,makeRandom:target.makeRandom});
    } catch(error) {
      freshPlayCardStoreProbe={auditError:String(error?.stack||error)};
    }
  }
  return {result:frozenResult,events:[{
    ...comparison,
    ...(freshPlayCardStoreProbe?{freshPlayCardStoreProbe}:{}),
    originalSourceAction:captured.realAction,
    baselineActionMatchedActual:isDeepStrictEqual(
      comparison.physicalOrder,captured.realAction),
    sourceDecisionSensitivityInterpretable:isDeepStrictEqual(
      comparison.physicalOrder,captured.realAction),
    sourceMatchExecutions:innerRunCalls,
    ...(target.firstFiniteScoredRoot===true?{
      chosenRootTurn:captured.chosenRootTurn,
      actualScorerAttempts:captured.actualScorerAttempts,
      actualFiniteScores:captured.actualFiniteScores,
      ownerRootVisible:captured.ownerRootVisible
    }:{}),
    replayCommonPolicy:target.replayCommonPolicy===true,
    isolatedReplayPolicyPerWorld:target.isolateReplayPolicyPerWorld===true,
    comparedAfterRealGameFinished:true
  }]};
}

module.exports={cloneBotOptions,probeFreshPlayCardInClonedStore,
  withPostgameRootOrderProbe};
