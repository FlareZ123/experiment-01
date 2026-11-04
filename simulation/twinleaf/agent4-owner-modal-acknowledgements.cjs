'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {assertValidPromptAction}=require('./prompt-integrity.cjs');
const VERSION='agent4-owner-modal-acknowledgements-v1';
/**
 * Default native in-game modal choice computed from the answering owner's
 * detached observation. ShowCards is acknowledgement; Confirm declines the
 * optional effect. A decline is not a claim of competitive optimality.
 * @param {object} actor
 * @param {{kind:string,message:string|null}} prompt
 * @returns {{kind:string,answer:boolean}}
 */
function chooseOwnerModal(actor,prompt){
  assert.equal(actor.decisionKind,'owner-prompt');
  assert.ok(actor.globalTurn>=1);
  assert.ok([2,3,4,5,6,8].includes(actor.phase));
  assert.ok(['ShowCardsPrompt','ConfirmPrompt'].includes(prompt.kind));
  return Object.freeze({kind:'owner-modal',answer:prompt.kind==='ShowCardsPrompt'});
}
/**
 * Reversible real-Store-only owner modal adapter; unsupported and setup
 * prompts still delegate to previous policy, usually the outer quarantine.
 * @template T
 * @param {()=>T} run
 * @param {object} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerModalAcknowledgements(run,deps={}){
  assert.equal(typeof run,'function');
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Ai=deps.SimpleTacticsAi??require(path.join(output,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??require(path.join(output,'game/store/store')).Store;
  const ResolvePromptAction=deps.ResolvePromptAction??
    require(path.join(output,'game/store/actions/resolve-prompt-action')).ResolvePromptAction;
  const observe=deps.observe??actorObservation;
  const choose=deps.choose??chooseOwnerModal;
  const validate=deps.validate??assertValidPromptAction;
  const bot=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  const store=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof bot?.value,'function');
  assert.equal(typeof store?.value,'function');
  let live=null;
  const selected=new WeakMap();
  const audit={version:VERSION,selected:0,accepted:0,rejected:0,
    settled:0,unsettled:0,bySeat:{0:0,1:0},
    byKind:{ConfirmPrompt:0,ShowCardsPrompt:0},
    events:[],qualifiedGames:0};
  function decode(state){
    if(state!==live?.state)return bot.value.call(this,state);
    const p=state.prompts?.find(v=>v.result===undefined);
    const kind=p?.constructor?.name;
    if(!['ConfirmPrompt','ShowCardsPrompt'].includes(kind)||
       state.turn<1||![2,3,4,5,6,8].includes(state.phase)||
       p.playerId!==this.client?.id)
      return bot.value.call(this,state);
    const seat=state.players.findIndex(v=>v.id===this.client.id);
    assert.ok(seat===0||seat===1);
    const actor=observe(state,seat);
    const choice=choose(actor,{kind,message:p.message??null});
    assert.equal(choice.kind,'owner-modal');
    assert.equal(choice.answer,kind==='ShowCardsPrompt');
    const action=new ResolvePromptAction(p.id,choice.answer);
    validate(state,action);
    selected.set(action,{seat,id:p.id,answer:choice.answer});
    audit.selected++;
    audit.bySeat[seat]++;
    audit.byKind[kind]++;
    if(audit.events.length<24)audit.events.push({
      seat,turn:state.turn,phase:state.phase,kind,
      message:p.message??null,answer:choice.answer
    });
    return action;
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction')live=this;
    const row=this===live?selected.get(action):null;
    if(!row)return store.value.apply(this,[action,...args]);
    try{
      const result=store.value.apply(this,[action,...args]);
      audit.accepted++;
      const after=this.state.prompts?.find(p=>p.id===row.id);
      if(!after||after.result===row.answer)audit.settled++;
      else audit.unsettled++;
      return result;
    }catch(error){audit.rejected++;throw error;}
  }
  Object.defineProperty(Ai.prototype,'decodeNextAction',{...bot,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',{...store,value:dispatch});
  try{return {result:run(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.ownerModalAudit={...audit,events:[...audit.events],aborted:true};
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',store);
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    Object.defineProperty(Ai.prototype,'decodeNextAction',bot);
  }
}
module.exports={VERSION,chooseOwnerModal,withOwnerModalAcknowledgements};
