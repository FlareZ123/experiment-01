'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent32-owner-confirm-default-false-v1';

/**
 * Reproduce Twinleaf SimpleTacticsAi's ConfirmPromptResolver baseline:
 * Resolve every pending prompt owned by this client with false. The wrapper
 * reads only the owner prompt, client ID, seat index and public turn number.
 *
 * @template T
 * @param {()=>T} run Synchronous native experiment.
 * @param {{SimpleTacticsAi?:Function,Store?:Function,ConfirmPrompt?:Function,
 *   ResolvePromptAction?:Function,assertValidPromptAction?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerConfirmDefaultFalse(run,deps={}){
  assert.equal(typeof run,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const load=name=>require(path.join(base,name));
  const Ai=deps.SimpleTacticsAi??load('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??load('game/store/store').Store;
  const ConfirmPrompt=deps.ConfirmPrompt??load('game/store/prompts/confirm-prompt').ConfirmPrompt;
  const ResolvePromptAction=deps.ResolvePromptAction??
    load('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const validate=deps.assertValidPromptAction??
    require('./prompt-integrity.cjs').assertValidPromptAction;
  const originalBot=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  const originalDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  for(const descriptor of [originalBot,originalDispatch]){
    assert.equal(typeof descriptor?.value,'function');
    assert.equal(descriptor.configurable,true);
  }
  const submitted=new WeakMap();
  const audit={
    version:VERSION,
    confirmOffers:0,
    submitted:0,
    nativeAccepted:0,
    nativeRejected:0,
    nativeUnsettled:0,
    unrelatedDelegated:0,
    bySeat:{0:0,1:0},
    byMessage:{},
    events:[],
    defaultAnswer:false,
    readsOpponentHidden:false,
    readsDeckCards:false,
    readsUnopenedDeck:false,
    readsOnlyOwnerPromptAndPublicTurn:true,
    competitiveGamesQualified:0
  };
  function decodeNextAction(state){
    const ownerId=this.client?.id;
    const prompt=state?.prompts?.find(p=>
      p.playerId===ownerId&&p.result===undefined);
    if(!(prompt instanceof ConfirmPrompt)){
      audit.unrelatedDelegated++;
      return originalBot.value.call(this,state);
    }
    const seat=state.players.findIndex(p=>p.id===ownerId);
    assert.ok(seat===0||seat===1,'Confirm prompt owner is not a registered seat');
    const action=new ResolvePromptAction(prompt.id,false);
    validate(state,action);
    submitted.set(action,{prompt,seat,message:String(prompt.message),turn:state.turn});
    audit.confirmOffers++;
    audit.submitted++;
    return action;
  }
  function dispatch(action,...args){
    const row=submitted.get(action);
    if(!row)return originalDispatch.value.apply(this,[action,...args]);
    let result;
    try{
      result=originalDispatch.value.apply(this,[action,...args]);
    }catch(error){
      audit.nativeRejected++;
      throw error;
    }
    if(row.prompt.result!==false){
      audit.nativeUnsettled++;
      throw new Error('Confirm default-false action returned without settling its owner prompt');
    }
    audit.nativeAccepted++;
    audit.bySeat[row.seat]++;
    audit.byMessage[row.message]=(audit.byMessage[row.message]??0)+1;
    audit.events.push({seat:row.seat,turn:row.turn,message:row.message,answer:false,settled:true});
    return result;
  }
  Object.defineProperty(Ai.prototype,'decodeNextAction',{...originalBot,value:decodeNextAction});
  Object.defineProperty(Store.prototype,'dispatch',{...originalDispatch,value:dispatch});
  try{return {result:run(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.agent32ConfirmDefaultFalseAudit={...audit,aborted:true};
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',originalDispatch);
    assert.strictEqual(Ai.prototype.decodeNextAction,decodeNextAction);
    Object.defineProperty(Ai.prototype,'decodeNextAction',originalBot);
  }
}

module.exports={VERSION,withOwnerConfirmDefaultFalse};
