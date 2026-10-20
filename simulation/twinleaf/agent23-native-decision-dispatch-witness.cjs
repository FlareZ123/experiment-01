'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');

const VERSION = 'agent23-native-decision-dispatch-witness-v1';

/**
 * Capture typed action identity without evaluating mutable game-state getters.
 * Unsupported references are explicitly unproved. The payload is hashed rather
 * than retained, so hidden card names cannot accidentally enter reports.
 *
 * @param {object|null} action
 * @param {object} state Live original Store State at this boundary.
 * @param {{captureAction:Function,capturePromptAction:Function}} codecs
 * @returns {object}
 */
function actionIdentity(action, state, codecs) {
  if (!action) return {status:'no-action',type:null,sha256:null};
  const type=action.constructor?.name??null;
  try {
    const prompt=state?.prompts?.find(p=>p.result===undefined)??null;
    const transport=type==='ResolvePromptAction'?'prompt-reference':'typed';
    const payload=transport==='prompt-reference'?
      codecs.capturePromptAction(prompt,action,state):codecs.captureAction(action);
    if (!payload) return {status:'unsupported',type,sha256:null,
      reason:'unsupported prompt reference'};
    const envelope={schema:VERSION,transport,type,payload};
    return {status:'captured',type,transport,
      sha256:createHash('sha256').update(JSON.stringify(envelope)).digest('hex')};
  } catch(error) {
    return {status:'unsupported',type,sha256:null,
      reason:error?.message??'unknown capture error'};
  }
}

/**
 * Link native SimpleTacticsAi outputs to the exact object passed to the real
 * Store.dispatch. The action reference must match and its complete portable
 * input digest must be unchanged. This wrapper does not replay or modify play.
 *
 * @template T
 * @param {()=>T} execute Synchronous original Store game.
 * @param {{SimpleTacticsAi:Function,Store:Function,maxRecords?:number,
 *    captureAction?:Function,capturePromptAction?:Function}} options
 * @returns {{result:T,audit:object}}
 */
function withNativeDecisionDispatchWitness(execute,options) {
  assert.equal(typeof execute,'function');
  assert.equal(typeof options?.SimpleTacticsAi,'function');
  assert.equal(typeof options?.Store,'function');
  const maxRecords=options.maxRecords??256;
  assert.ok(Number.isSafeInteger(maxRecords)&&maxRecords>=1);
  const codecs={
    captureAction:options.captureAction??
      require('./source-action-value-codec.cjs').captureAction,
    capturePromptAction:options.capturePromptAction??
      require('./source-prompt-action-codec.cjs').capturePromptAction
  };
  const bot=options.SimpleTacticsAi.prototype;
  const store=options.Store.prototype;
  const decode=Object.getOwnPropertyDescriptor(bot,'decodeNextAction');
  const dispatch=Object.getOwnPropertyDescriptor(store,'dispatch');
  assert.equal(typeof decode?.value,'function');
  assert.equal(typeof dispatch?.value,'function');
  let liveStore=null,seenDecisions=0,selectedActions=0,
    matchedDispatches=0,unmatchedDispatches=0,rejectedDispatches=0,
    unsupportedProposals=0,changedBetweenChoiceAndDispatch=0,
    droppedRecords=0;
  const records=[];
  const proposals=new WeakMap();
  const append=row=>{
    if(records.length<maxRecords)records.push(row);
    else droppedRecords++;
  };
  const report=()=>({
    version:VERSION,observedLiveStore:Boolean(liveStore),
    originalLiveDecisions:seenDecisions,
    selectedActionObjects:selectedActions,
    matchedObjectDispatches:matchedDispatches,
    unmatchedLiveDispatches:unmatchedDispatches,
    rejectedMatchedDispatches:rejectedDispatches,
    unsupportedProposalInputs:unsupportedProposals,
    changedChoiceToDispatch:changedBetweenChoiceAndDispatch,
    boundedRecords:records.slice(),droppedRecords,
    fullyLinked:false,
    competitiveGameQualified:false,
    limitation:'Exact chosen-object/portable-input linkage only; action legality, full result settlement, decision competence, player information safety, and paper game clock unverified.'
  });
  function observedDecode(state,...args) {
    const action=decode.value.apply(this,[state,...args]);
    if (!liveStore || state!==liveStore.state ||
        !Array.isArray(state?.players)) return action;
    const seat=state.players.findIndex(p=>p.id===this.client?.id);
    if(seat<0) return action;
    const original=actionIdentity(action,state,codecs);
    const ordinal=++seenDecisions;
    if(action&&typeof action==='object'){
      selectedActions++;
      if(original.status!=='captured')unsupportedProposals++;
      proposals.set(action,{ordinal,seat,turn:state.turn,original,dispatched:false});
    }else append({ordinal,seat,turn:state.turn,
      proposal:original,status:'no-selected-object'});
    return action;
  }
  function observedDispatch(action,...args) {
    if(!liveStore&&action?.constructor?.name==='AddPlayerAction')liveStore=this;
    if(this!==liveStore)return dispatch.value.apply(this,[action,...args]);
    const found=action&&typeof action==='object'?proposals.get(action):null;
    if(!found){
      unmatchedDispatches++;
      return dispatch.value.apply(this,[action,...args]);
    }
    const current=actionIdentity(action,this.state,codecs);
    const identityVerified=!found.dispatched&&
      found.original.status==='captured'&&current.status==='captured'&&
      found.original.sha256===current.sha256;
    if(!identityVerified)changedBetweenChoiceAndDispatch++;
    found.dispatched=true;
    matchedDispatches++;
    const entry={ordinal:found.ordinal,seat:found.seat,turn:found.turn,
      proposal:found.original,dispatch:current,
      sameActionReference:true,unchangedPortableInput:identityVerified,
      dispatchReturnedWithoutThrow:false};
    try{
      const result=dispatch.value.apply(this,[action,...args]);
      entry.dispatchReturnedWithoutThrow=true;
      return result;
    }catch(error){
      rejectedDispatches++;
      entry.dispatchError=error?.constructor?.name??'Error';
      throw error;
    }finally{append(entry);}
  }
  Object.defineProperty(bot,'decodeNextAction',{...decode,value:observedDecode});
  Object.defineProperty(store,'dispatch',{...dispatch,value:observedDispatch});
  try{return {result:execute(),audit:report()};}
  catch(error){
    if(error&&typeof error==='object')error.nativeDecisionDispatchEvidence={
      ...report(),interrupted:true
    };
    throw error;
  }finally{
    assert.strictEqual(store.dispatch,observedDispatch);
    Object.defineProperty(store,'dispatch',dispatch);
    assert.strictEqual(bot.decodeNextAction,observedDecode);
    Object.defineProperty(bot,'decodeNextAction',decode);
  }
}

module.exports={VERSION,actionIdentity,withNativeDecisionDispatchWitness};
