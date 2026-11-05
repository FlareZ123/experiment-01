'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {assertValidPromptAction}=require('./prompt-integrity.cjs');

const VERSION='agent4-owner-setup-confirm-v2-native-settlement';
const SETTLEMENT_CODE='OWNER_SETUP_CONFIRM_UNSETTLED';
const SETUP_PHASE=1;

/**
 * Setup confirmations are presented to the actual answering owner. The pinned
 * native simple-bot resolver answers ConfirmPrompt with false. This isolated
 * policy duplicates that deterministic answer without supplying any raw State
 * or card identities to the decision function.
 *
 * It is a conservative development baseline, not a claim that declining
 * optional setup effects is a strategically good choice in all matchups.
 *
 * @param {object} actor Frozen detached owner-authenticated observation.
 * @param {{kind:string,message:unknown}} prompt Owner-visible prompt metadata.
 * @returns {{kind:string,answer:false}}
 */
function chooseOwnerSetupConfirm(actor,prompt){
  assert.equal(actor.decisionKind,'owner-prompt');
  assert.equal(actor.phase,SETUP_PHASE);
  assert.equal(actor.globalTurn,0);
  assert.equal(prompt.kind,'ConfirmPrompt');
  return Object.freeze({kind:'owner-setup-confirm',answer:false});
}

/**
 * Add a reversible, both-seat, actual-Store-only setup ConfirmPrompt handler.
 * Install AFTER the raw-State fallback quarantine and BEFORE the canonical
 * actor adapters. No native speculative State or other prompt becomes an
 * owner-safe decision. A validated action is dispatched only by normal Store.
 *
 * @template T
 * @param {()=>T} run Synchronous genuine pinned-engine game.
 * @param {{SimpleTacticsAi?:Function,Store?:Function,ResolvePromptAction?:Function,
 *   observe?:Function,choose?:Function,validate?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerSetupConfirm(run,deps={}){
  assert.equal(typeof run,'function');
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Ai=deps.SimpleTacticsAi??
    require(path.join(output,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??
    require(path.join(output,'game/store/store')).Store;
  const ResolvePromptAction=deps.ResolvePromptAction??
    require(path.join(output,'game/store/actions/resolve-prompt-action'))
      .ResolvePromptAction;
  const observe=deps.observe??actorObservation;
  const choose=deps.choose??chooseOwnerSetupConfirm;
  const validate=deps.validate??assertValidPromptAction;
  const oldDecode=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  const oldDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof oldDecode?.value,'function');
  assert.equal(typeof oldDispatch?.value,'function');
  const audit={
    version:VERSION,actualStores:0,
    selected:0,accepted:0,rejected:0,settled:0,unsettled:0,
    returnedWithoutThrow:0,bySeat:{0:0,1:0},
    ownerVisiblePromptMessageCodes:[],
    declinedSetupConfirmOnly:true,nativeRawStateScoringUsed:false,
    competitivePaperGamesQualified:0
  };
  let liveStore=null;
  const ownedActions=new WeakMap();

  function decode(state){
    if(state!==liveStore?.state)return oldDecode.value.call(this,state);
    const pending=state.prompts?.find(p=>p.result===undefined)??null;
    if(pending?.constructor?.name!=='ConfirmPrompt'||
        state.phase!==SETUP_PHASE||state.turn!==0||
        pending.playerId!==this.client?.id)
      return oldDecode.value.call(this,state);
    const seat=state.players.findIndex(p=>p.id===this.client.id);
    assert.ok(seat===0||seat===1);
    const view=observe(state,seat);
    const choice=choose(view,{
      kind:'ConfirmPrompt',message:pending.message??null
    });
    assert.equal(choice.kind,'owner-setup-confirm');
    assert.equal(choice.answer,false);
    const action=new ResolvePromptAction(pending.id,choice.answer);
    validate(state,action);
    ownedActions.set(action,{seat,prompt:pending,answer:choice.answer});
    audit.selected++;
    audit.bySeat[seat]++;
    if(audit.ownerVisiblePromptMessageCodes.length<16)
      audit.ownerVisiblePromptMessageCodes.push({
        seat,turn:state.turn,message:pending.message??null
      });
    return action;
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==liveStore){
      liveStore=this;
      audit.actualStores++;
    }
    const selected=this===liveStore?ownedActions.get(action):null;
    if(!selected)return oldDispatch.value.apply(this,[action,...args]);
    const stillPending=selected.prompt.result===undefined&&
      this.state.prompts?.includes(selected.prompt)===true;
    let result;
    try{
      result=oldDispatch.value.apply(this,[action,...args]);
    }catch(error){
      audit.rejected++;
      throw error;
    }
    audit.returnedWithoutThrow++;
    // A missing or stale prompt can be silently ignored by the native Store.
    // Check the exact prompt object, even if the reducer removes it afterward.
    if(!stillPending||selected.prompt.result!==selected.answer){
      audit.unsettled++;
      const error=new Error(
        'Owner setup Confirm Store returned without resolving its prompt');
      error.code=SETTLEMENT_CODE;
      throw error;
    }
    audit.settled++;
    audit.accepted++;
    return result;
  }
  Object.defineProperty(Ai.prototype,'decodeNextAction',{
    ...oldDecode,value:decode
  });
  Object.defineProperty(Store.prototype,'dispatch',{
    ...oldDispatch,value:dispatch
  });
  try{
    return {result:run(),audit};
  }catch(error){
    if(error&&typeof error==='object')
      error.ownerSetupConfirmAudit={...audit,
        ownerVisiblePromptMessageCodes:[
          ...audit.ownerVisiblePromptMessageCodes
        ],aborted:true};
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    Object.defineProperty(Ai.prototype,'decodeNextAction',oldDecode);
  }
}

module.exports={VERSION,SETUP_PHASE,SETTLEMENT_CODE,chooseOwnerSetupConfirm,
  withOwnerSetupConfirm};
