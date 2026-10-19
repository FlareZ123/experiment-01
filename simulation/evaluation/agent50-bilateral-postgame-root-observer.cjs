'use strict';

const assert=require('node:assert/strict');
const {isDeepStrictEqual}=require('node:util');
const {
  actionSignature,compareHiddenDeckOrders
}=require('../twinleaf/rank10-hidden-order-live-probe.cjs');

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
 * @param {{turn:number,seat:number,makeRandom:()=>()=>number}} target
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
      const eligible=!captured&&state.turn===target.turn&&
        state.activePlayer===target.seat&&
        state.prompts.every(prompt=>prompt.result!==undefined)&&
        this.client?.id===actorId;
      if(!eligible)return descriptor.value.call(this,state);
      // Snapshot the complete physical decision root. The bot's tactic and
      // resolver constructor arrays may be spliced back out of global defs
      // after the match; freeze their identities *now* for detached replay.
      let snapshot=null;
      let options=null;
      let captureError=null;
      try {
        snapshot=cloneDetached(state);
        assert.equal(typeof this.tactics?.[0]?.options,'object');
        options={...this.tactics[0].options,
          tactics:this.tactics.map(tactic=>tactic.constructor),
          promptResolvers:this.resolvers.map(resolver=>resolver.constructor)};
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
      assert.equal(BotClass.prototype.decodeNextAction,observeActualAction,
        'Candidate policy replaced the innermost read-only observer');
      Object.defineProperty(BotClass.prototype,'decodeNextAction',descriptor);
    }
  }
  headless.runMatch=wrappedRunMatch;
  let result;
  try {result=execute();}
  finally{
    assert.equal(headless.runMatch,wrappedRunMatch,
      'The headless runner changed during the observational test');
    headless.runMatch=originalRunMatch;
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
    comparison=compare(
      captured.state,actorId,
      ()=>new BotClass({id:actorId},captured.options,null),
      cloneDetached,target.makeRandom
    );
  } catch(error) {
    return {result:frozenResult,events:[{
      originalSourceAction:captured.realAction,
      baselineActionMatchedActual:false,liveStatePreserved:true,
      auditError:String(error?.stack||error)
    }]};
  }
  return {result:frozenResult,events:[{
    ...comparison,
    originalSourceAction:captured.realAction,
    baselineActionMatchedActual:isDeepStrictEqual(
      comparison.physicalOrder,captured.realAction),
    sourceDecisionSensitivityInterpretable:isDeepStrictEqual(
      comparison.physicalOrder,captured.realAction),
    sourceMatchExecutions:innerRunCalls,
    comparedAfterRealGameFinished:true
  }]};
}

module.exports={withPostgameRootOrderProbe};
