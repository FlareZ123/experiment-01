'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');

const VERSION = 'agent23-native-decision-dispatch-witness-v3-anchored-rng-tape';
const {recordPolicyRandomTape} = require('./native-policy-random-tape.cjs');

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
    let transport='typed';
    let payload;
    if(type==='ResolvePromptAction'){
      if(!prompt||action.id!==prompt.id){
        return {status:'unsupported',type,sha256:null,
          reason:'pending prompt identity unavailable or mismatched'};
      }
      payload=codecs.capturePromptAction(prompt,action,state);
      if(payload)transport='prompt-reference';
      else {
        // Unsupported reference types remain unproved by the existing typed
        // codec. Scalar/plain value prompts have a complete transport and an
        // explicit prompt kind, without any private Card reference.
        transport='prompt-typed-values';
        payload={promptKind:prompt.constructor.name,
          action:codecs.captureAction(action)};
      }
    }else payload=codecs.captureAction(action);
    if(!payload)return {status:'unsupported',type,sha256:null,
      reason:'unportable action input'};
    const envelope={schema:VERSION,transport,type,payload};
    return {status:'captured',type,transport,
      sha256:createHash('sha256').update(JSON.stringify(envelope)).digest('hex')};
  } catch(error) {
    return {status:'unsupported',type,sha256:null,
      reason:error?.constructor?.name??'unportable-input'};
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
 *    tapeOrdinal?:number|null,captureActorViewAtTape?:boolean,
 *    actorViewDigest?:(state:object,seat:number)=>string,
 *    captureAction?:Function,capturePromptAction?:Function}} options
 * @returns {{result:T,audit:object}}
 */
function withNativeDecisionDispatchWitness(execute,options) {
  assert.equal(typeof execute,'function');
  assert.equal(typeof options?.SimpleTacticsAi,'function');
  assert.equal(typeof options?.Store,'function');
  const maxRecords=options.maxRecords??256;
  const tapeOrdinal=options.tapeOrdinal??null;
  const captureActorViewAtTape=options.captureActorViewAtTape===true;
  const digestActorView=options.actorViewDigest??((state,seat)=>{
    const {actorObservation}=require('./actor-observation-contract.cjs');
    return createHash('sha256')
      .update(JSON.stringify(actorObservation(state,seat))).digest('hex');
  });
  assert.ok(Number.isSafeInteger(maxRecords)&&maxRecords>=1);
  assert.ok(tapeOrdinal===null||
    (Number.isSafeInteger(tapeOrdinal)&&tapeOrdinal>=1));
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
  let liveStore=null,observedLiveStores=0,seenDecisions=0,selectedActions=0,
    matchedDispatches=0,unmatchedDispatches=0,rejectedDispatches=0,
    unsupportedProposals=0,unsupportedInputComparisons=0,
    changedBetweenChoiceAndDispatch=0,repeatedChosenObjects=0,
    verifiedUnchangedInputs=0,droppedRecords=0;
  const records=[];
  const nativePolicyTapes=[];
  const proposals=new WeakMap();
  function safeActorView(state,seat){
    try{
      const sha256=digestActorView(state,seat);
      assert.match(sha256,/^[0-9a-f]{64}$/);
      return {sha256,error:null};
    }catch(error){return {sha256:null,
      error:error?.constructor?.name??'Error'};}
  }
  const append=row=>{
    if(records.length<maxRecords)records.push(row);
    else droppedRecords++;
  };
  const report=()=>({
    version:VERSION,observedLiveStore:Boolean(liveStore),
    observedLiveStores,
    originalLiveDecisions:seenDecisions,
    selectedActionObjects:selectedActions,
    matchedObjectDispatches:matchedDispatches,
    unmatchedLiveDispatches:unmatchedDispatches,
    rejectedMatchedDispatches:rejectedDispatches,
    unsupportedProposalInputs:unsupportedProposals,
    unsupportedInputComparisons,
    changedChoiceToDispatch:changedBetweenChoiceAndDispatch,
    repeatedChosenObjectDispatches:repeatedChosenObjects,
    verifiedUnchangedInputs,
    boundedRecords:records.slice(),droppedRecords,
    tapeOrdinalRequested:tapeOrdinal,
    nativePolicyTapes:nativePolicyTapes.map(t=>({...t,values:t.values.slice()})),
    sameWorldDecisionReplayQualified:false,
    fullyLinked:false,
    competitiveGameQualified:false,
    limitation:'Exact chosen-object/portable-input linkage only; action legality, full result settlement, decision competence, player information safety, and paper game clock unverified.'
  });
  function actingSeat(state,actor){
    if(!liveStore||state!==liveStore.state||
       !Array.isArray(state?.players))return -1;
    const seat=state.players.findIndex(p=>p.id===actor.client?.id);
    if(seat<0)return -1;
    const pending=state.prompts?.find(p=>p.result===undefined)??null;
    return (pending?pending.playerId===actor.client.id:
      state.activePlayer===seat)?seat:-1;
  }
  function observedDecode(state,...args) {
    const beforeSeat=actingSeat(state,this);
    const captureTape=tapeOrdinal!==null&&beforeSeat>=0&&
      seenDecisions+1===tapeOrdinal;
    const ownerViewBefore=captureTape&&captureActorViewAtTape?
      safeActorView(state,beforeSeat):null;
    const observed=captureTape?
      recordPolicyRandomTape(()=>decode.value.apply(this,[state,...args])):
      null;
    const action=observed?observed.result:
      decode.value.apply(this,[state,...args]);
    const seat=actingSeat(state,this);
    const ownerViewAfter=observed&&captureActorViewAtTape&&seat>=0?
      safeActorView(state,seat):null;
    const ownerViewPreserved=Boolean(ownerViewBefore?.sha256&&
      ownerViewBefore.sha256===ownerViewAfter?.sha256);
    if(seat<0){
      if(observed)nativePolicyTapes.push({
        ordinal:seenDecisions+1,gameIndex:observedLiveStores,
        seat:beforeSeat,turn:state?.turn??null,
        status:'unattributed-state-owner-after-selection',
        sha256:observed.sha256,values:observed.tape,
        ownerObservationBeforeSha256:ownerViewBefore?.sha256??null,
        ownerObservationAfterSha256:null,
        ownerObservationPreserved:false,
        ownerViewError:ownerViewBefore?.error??null,
        ownerK1HistoryAuthenticated:false,
        selectedAction:null,dispatchAction:null,
        unchangedPortableInput:false,dispatchReturnedWithoutThrow:null
      });
      return action;
    }
    const original=actionIdentity(action,state,codecs);
    const ordinal=++seenDecisions;
    const tapeRecord=observed?{
      ordinal,gameIndex:observedLiveStores,seat,turn:state.turn,
      status:'original-live-decision',
      sha256:observed.sha256,values:observed.tape,
      ownerObservationBeforeSha256:ownerViewBefore?.sha256??null,
      ownerObservationAfterSha256:ownerViewAfter?.sha256??null,
      ownerObservationPreserved:ownerViewPreserved,
      ownerViewError:ownerViewBefore?.error??ownerViewAfter?.error??null,
      ownerK1HistoryAuthenticated:false,
      selectedAction:original,dispatchAction:null,
      unchangedPortableInput:false,dispatchReturnedWithoutThrow:null
    }:null;
    if(tapeRecord)nativePolicyTapes.push(tapeRecord);
    if(action&&typeof action==='object'){
      selectedActions++;
      if(original.status!=='captured')unsupportedProposals++;
      proposals.set(action,{ordinal,gameIndex:observedLiveStores,
        seat,turn:state.turn,original,tapeRecord,dispatched:false});
    }else append({ordinal,seat,turn:state.turn,
      proposal:original,status:'no-selected-object'});
    return action;
  }
  function observedDispatch(action,...args) {
    if(action?.constructor?.name==='AddPlayerAction'&&this!==liveStore){
      liveStore=this;
      observedLiveStores++;
    }
    if(this!==liveStore)return dispatch.value.apply(this,[action,...args]);
    const found=action&&typeof action==='object'?proposals.get(action):null;
    if(!found){
      unmatchedDispatches++;
      return dispatch.value.apply(this,[action,...args]);
    }
    const current=actionIdentity(action,this.state,codecs);
    const bothPortable=found.original.status==='captured'&&
      current.status==='captured';
    const portableEqual=bothPortable&&
      found.original.sha256===current.sha256;
    if(!bothPortable)unsupportedInputComparisons++;
    else if(!portableEqual)changedBetweenChoiceAndDispatch++;
    if(found.dispatched)repeatedChosenObjects++;
    const identityVerified=!found.dispatched&&portableEqual;
    if(identityVerified)verifiedUnchangedInputs++;
    if(found.tapeRecord){
      found.tapeRecord.dispatchAction=current;
      found.tapeRecord.unchangedPortableInput=identityVerified;
    }
    found.dispatched=true;
    matchedDispatches++;
    const entry={ordinal:found.ordinal,gameIndex:found.gameIndex,
      seat:found.seat,turn:found.turn,
      proposal:found.original,dispatch:current,
      sameActionReference:true,unchangedPortableInput:identityVerified,
      dispatchReturnedWithoutThrow:false};
    try{
      const result=dispatch.value.apply(this,[action,...args]);
      entry.dispatchReturnedWithoutThrow=true;
      if(found.tapeRecord)found.tapeRecord.dispatchReturnedWithoutThrow=true;
      return result;
    }catch(error){
      rejectedDispatches++;
      entry.dispatchError=error?.constructor?.name??'Error';
      if(found.tapeRecord)found.tapeRecord.dispatchReturnedWithoutThrow=false;
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
    const stillOwnedStore=store.dispatch===observedDispatch;
    const stillOwnedDecision=bot.decodeNextAction===observedDecode;
    Object.defineProperty(store,'dispatch',dispatch);
    Object.defineProperty(bot,'decodeNextAction',decode);
    assert.ok(stillOwnedStore&&stillOwnedDecision,
      'Nested policy hook ownership changed during the witness lifetime');
  }
}

module.exports={VERSION,actionIdentity,withNativeDecisionDispatchWitness};
