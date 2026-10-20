'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {assertValidPromptAction}=require('./prompt-integrity.cjs');
const VERSION='agent13-actor-only-select-option-v2-live-state';

/**
 * Provide only the answering actor's detached observation and options
 * visibly presented to that actor by the genuine pending prompt.
 * The prompt's native objects/State never enter the pure decision function.
 * @param {object} state Genuine Store State at an unresolved owner prompt.
 * @param {0|1} seat Actual answering seat.
 * @param {(state:object,seat:0|1)=>object} [observe]
 * @returns {object|null} Frozen detached option decision input.
 */
function actorSelectOptionInput(state,seat,observe=actorObservation){
  assert.ok(seat===0||seat===1);
  const pending=state.prompts.find(p=>p.result===undefined);
  if(!pending||pending.constructor?.name!=='SelectOptionPrompt'||
      pending.playerId!==state.players[seat]?.id)return null;
  const actor=observe(state,seat);
  assert.equal(actor.decisionKind,'owner-prompt');
  const values=[...pending.values];
  const disabled=values.map((_,index)=>pending.options?.disabled?.[index]===true);
  return Object.freeze({
    actor,
    prompt:Object.freeze({
      kind:'SelectOptionPrompt',
      promptId:pending.id,
      values:Object.freeze(values),
      disabled:Object.freeze(disabled),
      defaultValue:pending.options?.defaultValue??0,
      allowCancel:pending.options?.allowCancel===true
    })
  });
}

/**
 * Pure common-seat choice: prefer the actual offered default if enabled,
 * otherwise the first enabled option, otherwise cancel only when permitted.
 * No true native State or concealed card identities may be passed here.
 * @param {object} input Detached actor SelectOption decision input.
 * @returns {{kind:string,optionIndex:number|null}}
 */
function chooseActorSelectOption(input){
  assert.equal(input.actor.decisionKind,'owner-prompt');
  const prompt=input.prompt;
  assert.equal(prompt.kind,'SelectOptionPrompt');
  const enabled=index=>Number.isInteger(index)&&index>=0&&
    index<prompt.values.length&&prompt.disabled[index]!==true;
  if(enabled(prompt.defaultValue)){
    return {kind:'resolve-select-option',optionIndex:prompt.defaultValue};
  }
  const first=prompt.values.findIndex((_,index)=>enabled(index));
  if(first>=0)return {kind:'resolve-select-option',optionIndex:first};
  if(prompt.allowCancel)return {kind:'resolve-select-option',optionIndex:null};
  throw new Error('Actor SelectOption has no enabled response and forbids cancel');
}

/**
 * Versioned, both-seat native option-only hook. It can compose INSIDE an
 * independently installed root-decision hook; unsupported prompts delegate
 * to that hook/native policy and remain explicitly unqualified. Only the
 * owner-visible prompt + actor observation determines selected option.
 * @template T
 * @param {()=>T} execute Synchronous pinned Store execution.
 * @param {object} [deps] Test-injection for pinned classes.
 * @returns {{result:T,audit:object}}
 */
function withActorOnlySelectOption(execute,deps={}){
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??require(path.join(base,'game/store/store')).Store;
  const ResolvePromptAction=deps.ResolvePromptAction??
    require(path.join(base,'game/store/actions/resolve-prompt-action')).ResolvePromptAction;
  const observe=deps.observe??actorSelectOptionInput;
  const validate=deps.validate??assertValidPromptAction;
  const original=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,'decodeNextAction');
  const originalDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  assert.equal(typeof originalDispatch?.value,'function');
  const selected=new WeakMap(),genuineStores=new WeakSet();
  let liveStore=null;
  const audit={
    version:VERSION,decisionOrigin:'actorObservation+visible SelectOption',
    actualStoreInstances:0,
    eligiblePrompts:0,selectedPrompts:0,acceptedPromptActions:0,
    rejectedPromptActions:0,unsupportedPromptDelegations:0,
    nonLiveSpeculativeFallbacks:0,
    selectedIndices:[],competitiveGameQualified:false
  };
  function decide(state){
    if(state!==liveStore?.state){
      audit.nonLiveSpeculativeFallbacks++;
      return original.value.call(this,state);
    }
    const seat=state.players.findIndex(p=>p.id===this.client?.id);
    const input=seat>=0?observe(state,seat):null;
    if(!input){
      if(state.prompts?.some(p=>p.result===undefined&&
          p.playerId===this.client?.id))audit.unsupportedPromptDelegations++;
      return original.value.call(this,state);
    }
    audit.eligiblePrompts++;
    const intent=chooseActorSelectOption(input);
    const action=new ResolvePromptAction(input.prompt.promptId,intent.optionIndex);
    validate(state,action,{enforceSelectOptionLegality:true});
    audit.selectedPrompts++;
    selected.set(action,{
      seat,globalTurn:input.actor.globalTurn,
      promptId:input.prompt.promptId,choice:intent.optionIndex
    });
    if(audit.selectedIndices.length<64)audit.selectedIndices.push({
      seat,globalTurn:input.actor.globalTurn,
      optionIndex:intent.optionIndex,
      offeredOptions:input.prompt.values.length
    });
    return action;
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&
        !genuineStores.has(this)){
      genuineStores.add(this);
      audit.actualStoreInstances++;
    }
    if(action?.constructor?.name==='AddPlayerAction')liveStore=this;
    const proof=genuineStores.has(this)?selected.get(action):undefined;
    if(!proof)return originalDispatch.value.apply(this,[action,...args]);
    try{
      const result=originalDispatch.value.apply(this,[action,...args]);
      audit.acceptedPromptActions++;
      return result;
    }catch(error){
      audit.rejectedPromptActions++;
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{...original,value:decide});
  Object.defineProperty(Store.prototype,'dispatch',{...originalDispatch,value:dispatch});
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',originalDispatch);
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decide);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',original);
  }
}

module.exports={VERSION,actorSelectOptionInput,chooseActorSelectOption,
  withActorOnlySelectOption};
