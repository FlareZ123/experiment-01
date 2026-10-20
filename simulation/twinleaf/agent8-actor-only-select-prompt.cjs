'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {assertValidPromptAction}=require('./prompt-integrity.cjs');

const VERSION='agent8-actor-only-select-prompt-v1';

/**
 * The pending SelectPrompt displays its options to the answering player.
 * Project only that choice and the detached actor observation. In particular,
 * never supply the live State or either player's concealed zones to the policy.
 *
 * @param {object} state Native Store State.
 * @param {0|1} seat Authenticated answering physical seat.
 * @param {Function} [observe]
 * @returns {object|null}
 */
function actorSelectPromptInput(state,seat,observe=actorObservation){
  assert.ok(seat===0||seat===1);
  const pending=state.prompts?.find(p=>p.result===undefined);
  if(pending?.constructor?.name!=='SelectPrompt'||
      pending.playerId!==state.players?.[seat]?.id)return null;
  const actor=observe(state,seat);
  assert.equal(actor.decisionKind,'owner-prompt');
  const values=Object.freeze([...pending.values]);
  return Object.freeze({
    actor,
    prompt:Object.freeze({
      kind:'SelectPrompt',
      id:pending.id,
      message:pending.message??null,
      values,
      defaultValue:pending.options?.defaultValue??0,
      allowCancel:pending.options?.allowCancel===true
    })
  });
}

/**
 * Deterministic baseline for a genuine offered owner choice. The native
 * printed-message semantics may call for a stronger strategy; this fallback
 * earns decision-execution coverage only, never competitive competence.
 *
 * @param {object} input Detached SelectPrompt input.
 * @returns {{kind:'resolve-select',optionIndex:number|null}}
 */
function chooseActorSelectPrompt(input){
  assert.equal(input.actor?.decisionKind,'owner-prompt');
  const p=input.prompt;
  assert.equal(p.kind,'SelectPrompt');
  const valid=index=>Number.isInteger(index)&&index>=0&&index<p.values.length;
  if(valid(p.defaultValue))
    return {kind:'resolve-select',optionIndex:p.defaultValue};
  if(p.values.length>0)return {kind:'resolve-select',optionIndex:0};
  if(p.allowCancel)return {kind:'resolve-select',optionIndex:null};
  throw new Error('Mandatory native SelectPrompt has no offered option');
}

/**
 * Reversible, both-seat adapter invoked on the original live Store.
 * Neither a detached Simulator clone nor any unsupported prompt may acquire
 * an actor-only decision label. The original native policy handles these
 * unsupported cases and remains unqualified.
 *
 * @template T
 * @param {()=>T} execute Existing canonical synchronous game runner.
 * @param {object} [deps] Injectable native classes for tests.
 * @returns {{result:T,audit:object}}
 */
function withActorOnlySelectPrompt(execute,deps={}){
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??
    require(path.join(base,'game/store/store')).Store;
  const ResolvePromptAction=deps.ResolvePromptAction??
    require(path.join(base,'game/store/actions/resolve-prompt-action')).ResolvePromptAction;
  const observe=deps.observe??actorSelectPromptInput;
  const choose=deps.choose??chooseActorSelectPrompt;
  const validate=deps.validate??assertValidPromptAction;

  const original=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const originalDispatch=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  assert.equal(typeof originalDispatch?.value,'function');

  let realStore=null;
  const chosen=new WeakMap();
  const audit={
    version:VERSION,
    decisionOrigin:'detached-owner-observation-and-offered-SelectPrompt',
    liveStores:0,selected:0,accepted:0,rejected:0,
    unsupportedPromptFallbacks:0,nonLiveFallbacks:0,
    bySeat:{0:0,1:0},boundedSelections:[],
    competitiveGameQualified:false
  };

  function decode(state){
    if(state!==realStore?.state){
      audit.nonLiveFallbacks++;
      return original.value.call(this,state);
    }
    const seat=state.players?.findIndex(p=>p.id===this.client?.id)??-1;
    const input=seat>=0?observe(state,seat):null;
    if(!input){
      const prompt=state.prompts?.find(p=>p.result===undefined);
      if(prompt?.playerId===this.client?.id)
        audit.unsupportedPromptFallbacks++;
      return original.value.call(this,state);
    }
    const intent=choose(input);
    assert.equal(intent.kind,'resolve-select');
    const action=new ResolvePromptAction(input.prompt.id,intent.optionIndex);
    validate(state,action,{enforceSelectOptionLegality:true});
    chosen.set(action,{seat,turn:input.actor.globalTurn,
      promptId:input.prompt.id,optionIndex:intent.optionIndex,
      offeredOptions:input.prompt.values.length});
    audit.selected++;
    audit.bySeat[seat]++;
    if(audit.boundedSelections.length<64)
      audit.boundedSelections.push({
        seat,turn:input.actor.globalTurn,
        promptMessage:input.prompt.message,
        optionIndex:intent.optionIndex,
        offeredOptions:input.prompt.values.length
      });
    return action;
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!realStore){
      realStore=this;
      audit.liveStores++;
    }
    const choice=this===realStore?chosen.get(action):undefined;
    if(!choice)return originalDispatch.value.apply(this,[action,...args]);
    try{
      const result=originalDispatch.value.apply(this,[action,...args]);
      audit.accepted++;
      return result;
    }catch(error){
      audit.rejected++;
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...original,value:decode
  });
  Object.defineProperty(Store.prototype,'dispatch',{
    ...originalDispatch,value:dispatch
  });
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',originalDispatch);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',original);
  }
}
module.exports={VERSION,actorSelectPromptInput,chooseActorSelectPrompt,
  withActorOnlySelectPrompt};
