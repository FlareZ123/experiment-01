'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent45-owner-ces48-gx-nominal-ko-payment-v1';
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Choose owner-visible, actual attached cards. Reserve Energy unless a
 * nominal 30+50*n attack would Knock Out the opponent's public Active.
 * This policy ignores Weakness, protection and future tactical value.
 *
 * @param {object} state Actual pinned Store state.
 * @param {object} owner The active attacking player.
 * @param {object} prompt A genuine DiscardEnergyPrompt.
 * @param {object} types Physical target enums.
 * @returns {{transfers:object[],count:number,nominalKo:boolean}|null}
 */
function chooseOwnerCes48GXPayment(state,owner,prompt,types){
  assert.equal(prompt.constructor.name,'DiscardEnergyPrompt');
  if(prompt.playerId!==owner.id ||
     prompt.options.min!==0 ||
     prompt.options.allowCancel!==false ||
     state.players[state.activePlayer]!==owner ||
     owner.active.getPokemonCard?.()?.fullName!=='Electrode-GX CES')
    return null;
  const opponent=state.players.find(p=>p.id!==owner.id);
  const defender=opponent?.active?.getPokemonCard?.();
  if(!defender)return null;
  const physical=[];
  for(const [slot,index,list] of [
    ...owner.bench.map((list,index)=>[types.SlotType.BENCH,index,list]),
    [types.SlotType.ACTIVE,0,owner.active]
  ]){
    for(const card of list.energies.cards){
      const cardIndex=list.cards.indexOf(card);
      assert.ok(cardIndex>=0,'Attached Energy must exist in owner physical list');
      physical.push({from:{player:types.PlayerType.BOTTOM_PLAYER,slot,index},
        index:cardIndex});
    }
  }
  const hp=opponent.active.hp>0?opponent.active.hp:defender.hp;
  const remaining=hp-opponent.active.damage;
  if(!Number.isFinite(remaining)||remaining<=0)return null;
  const needed=Math.max(0,Math.ceil((remaining-30)/50));
  const count=needed<=physical.length?needed:0;
  const transfers=prompt.decode(physical.slice(0,count),state);
  if(!prompt.validate(transfers))return null;
  return {transfers,count,nominalKo:30+count*50>=remaining};
}

/**
 * Reversible, actor-owned pending GX payment override.
 * Only authentic live Store prompts with CES48 and opt-in paper hook's
 * zero-legal minimum are intercepted. Other prompts are unchanged.
 *
 * @template T
 * @param {()=>T} execute Synchronous native match/staged Store.
 * @param {object} [deps] Injected pinned native classes or staged liveStore.
 * @returns {{result:T,audit:object}}
 */
function withOwnerCes48GXPayment(execute,deps={}){
  assert.equal(typeof execute,'function');
  const native=name=>require(path.join(output,name));
  const Bot=deps.Bot??native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??native('game/store/store').Store;
  const ResolvePromptAction=deps.ResolvePromptAction??
    native('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const types=deps.types??native('game/store/actions/play-card-action');
  const prior=Object.getOwnPropertyDescriptor(Bot.prototype,'resolvePrompt');
  const priorDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof prior?.value,'function');
  assert.equal(typeof priorDispatch?.value,'function');
  let liveStore=deps.initialLiveStore??null;
  const pendingActions=new WeakMap();
  const audit={version:VERSION,actorOnly:true,bySeat:{0:0,1:0},
    offered:0,selected:0,accepted:0,rejected:0,plans:[],
    competitiveQualifiedGames:0};
  function resolve(player,state,prompt){
    if(!liveStore || state!==liveStore.state ||
       prompt?.constructor?.name!=='DiscardEnergyPrompt' ||
       player?.id!==this.client?.id)
      return prior.value.call(this,player,state,prompt);
    audit.offered++;
    const plan=chooseOwnerCes48GXPayment(state,player,prompt,types);
    if(!plan)return prior.value.call(this,player,state,prompt);
    const action=new ResolvePromptAction(prompt.id,plan.transfers);
    const seat=state.activePlayer;
    pendingActions.set(action,{seat,turn:state.turn,count:plan.count,
      nominalKo:plan.nominalKo});
    audit.selected++;audit.bySeat[seat]++;
    return action;
  }
  function dispatch(action,...args){
    if(action?.constructor.name==='AddPlayerAction')liveStore=this;
    const receipt=this===liveStore?pendingActions.get(action):null;
    try{
      const result=priorDispatch.value.apply(this,[action,...args]);
      if(receipt){
        audit.accepted++;
        if(audit.plans.length<60)audit.plans.push({...receipt,accepted:true});
      }
      return result;
    }catch(error){
      if(receipt)audit.rejected++;
      throw error;
    }
  }
  Object.defineProperty(Bot.prototype,'resolvePrompt',{...prior,value:resolve});
  Object.defineProperty(Store.prototype,'dispatch',
    {...priorDispatch,value:dispatch});
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    assert.strictEqual(Bot.prototype.resolvePrompt,resolve);
    Object.defineProperty(Store.prototype,'dispatch',priorDispatch);
    Object.defineProperty(Bot.prototype,'resolvePrompt',prior);
  }
}
module.exports={VERSION,chooseOwnerCes48GXPayment,withOwnerCes48GXPayment};
