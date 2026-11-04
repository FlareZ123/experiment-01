'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {assertValidPromptAction}=require('./prompt-integrity.cjs');

const VERSION='agent4-owner-wait-prompt-progress-v1';

/**
 * Resolve native WaitPrompt without consulting game strategy, private cards,
 * animation duration, or bot scoring. The pinned prompt carries no choice.
 * It inherits Prompt.validate, and its callback resumes Store effects.
 *
 * @param {{kind:string}} prompt Detached prompt type.
 * @returns {{kind:string,answer:null}}
 */
function chooseWaitProgress(prompt){
  assert.equal(prompt.kind,'WaitPrompt');
  return Object.freeze({kind:'wait-progress',answer:null});
}

/**
 * Bound to the existing real pinned Store, not detached simulations. The
 * pending WaitPrompt is addressed by its actual player id. A normal native
 * ResolvePromptAction is validated and applied through Store.dispatch, then
 * the original State resumes the paused animation/phase effect.
 *
 * No game-strength or decision-completeness claim is made by this adapter.
 *
 * @template T
 * @param {()=>T} run Synchronous genuine pinned Store game.
 * @param {{SimpleTacticsAi?:Function,Store?:Function,
 *   ResolvePromptAction?:Function,choose?:Function,validate?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerWaitProgress(run,deps={}){
  assert.equal(typeof run,'function');
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Ai=deps.SimpleTacticsAi??
    require(path.join(output,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??
    require(path.join(output,'game/store/store')).Store;
  const ResolvePromptAction=deps.ResolvePromptAction??
    require(path.join(output,'game/store/actions/resolve-prompt-action'))
      .ResolvePromptAction;
  const choose=deps.choose??chooseWaitProgress;
  const validate=deps.validate??assertValidPromptAction;
  const oldBot=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  const oldDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof oldBot?.value,'function');
  assert.equal(typeof oldDispatch?.value,'function');
  let live=null;
  const choices=new WeakMap();
  const audit={
    version:VERSION,stores:0,selected:0,accepted:0,rejected:0,
    bySeat:{0:0,1:0},firstEvents:[],
    nativeScorerUsed:false,qualifiedPaperGames:0
  };
  function decode(state){
    if(state!==live?.state)return oldBot.value.call(this,state);
    const prompt=state.prompts?.find(p=>p.result===undefined)??null;
    if(prompt?.constructor?.name!=='WaitPrompt'||
        prompt.playerId!==this.client?.id){
      return oldBot.value.call(this,state);
    }
    const seat=state.players.findIndex(player=>player.id===this.client.id);
    assert.ok(seat===0||seat===1);
    const answer=choose(Object.freeze({kind:'WaitPrompt'}));
    assert.equal(answer.answer,null);
    const action=new ResolvePromptAction(prompt.id,answer.answer);
    validate(state,action);
    choices.set(action,{seat});
    audit.selected++;
    audit.bySeat[seat]++;
    if(audit.firstEvents.length<16)
      audit.firstEvents.push({seat,turn:state.turn,phase:state.phase,
        duration:prompt.duration??null});
    return action;
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==live){
      live=this;
      audit.stores++;
    }
    const chosen=this===live?choices.get(action):null;
    if(!chosen)return oldDispatch.value.apply(this,[action,...args]);
    try{
      const result=oldDispatch.value.apply(this,[action,...args]);
      audit.accepted++;
      return result;
    }catch(error){
      audit.rejected++;
      throw error;
    }
  }
  Object.defineProperty(Ai.prototype,'decodeNextAction',{
    ...oldBot,value:decode
  });
  Object.defineProperty(Store.prototype,'dispatch',{
    ...oldDispatch,value:dispatch
  });
  try {
    return {result:run(),audit};
  }catch(error){
    if(error&&typeof error==='object')
      error.ownerWaitProgressAudit={...audit,
        firstEvents:[...audit.firstEvents],aborted:true};
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    Object.defineProperty(Ai.prototype,'decodeNextAction',oldBot);
  }
}

module.exports={VERSION,chooseWaitProgress,withOwnerWaitProgress};
