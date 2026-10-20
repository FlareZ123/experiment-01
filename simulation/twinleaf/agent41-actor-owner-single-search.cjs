'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {actorObservation} = require('./actor-observation-contract.cjs');

const VERSION = 'agent41-owner-single-search-actor-v2-order-independent';
const SEARCH_MESSAGES = new Set([
  'CHOOSE_CARD_TO_HAND', 'CHOOSE_CARD_FROM_DECK',
  'CHOOSE_CARD_FROM_DISCARD', 'SEARCH_DECK_FOR_CARD'
]);

/**
 * Project an authenticated owner search into an inert, exact-printing menu.
 * Native filters and card object identity remain inside the game adapter.
 * Setup, opponent hidden zones, arbitrary discards and multi-card mandatory
 * payments are outside this deliberately narrow development component.
 * @param {object} state Genuine native Store.state.
 * @param {0|1} seat Authenticated answering seat.
 * @param {(state:object,seat:number)=>object} [observe]
 * @returns {object|null} Frozen actor-only decision input.
 */
function actorSingleSearchInput(state,seat,observe=actorObservation) {
  assert.ok(seat===0||seat===1);
  const owner=state.players?.[seat];
  const pending=state.prompts?.find(p=>p.result===undefined);
  if(pending?.constructor?.name!=='ChooseCardsPrompt'||
      pending.playerId!==owner?.id||
      !SEARCH_MESSAGES.has(pending.message))return null;
  const source=pending.cards===owner.deck?'own-deck':
    pending.cards===owner.discard?'own-discard':
      pending.cards===owner.hand?'own-hand':null;
  if(source===null)return null;
  const options=pending.options??{};
  if(options.min>1||options.max<1)return null;
  const cards=pending.cards.cards;
  if(!Array.isArray(cards))return null;
  // The live native deck array has a concealed order. The owner may inspect
  // card identities during a real search, but their *sequence* is not a
  // legitimate decision input. Canonicalize the visible multiset before
  // giving the choice menu to the pure policy.
  const sorted=cards.map(card=>({
    printing:card.fullName,
    selectableAlone:pending.validate([card])===true
  })).sort((a,b)=>a.printing<b.printing?-1:
    a.printing>b.printing?1:Number(b.selectableAlone)-Number(a.selectableAlone));
  const offered=sorted.map((entry,index)=>Object.freeze({index,...entry}));
  const canSkip=pending.validate([])===true;
  const canCancel=pending.validate(null)===true;
  // The pure policy can inspect the complete owner's deck only while
  // the genuine owner is performing this explicitly authorized search.
  const actor=observe(state,seat);
  assert.equal(actor.decisionKind,'owner-prompt');
  return Object.freeze({
    actor,
    prompt:Object.freeze({
      id:pending.id,message:pending.message,source,
      offered:Object.freeze(offered),canSkip,canCancel
    })
  });
}

/**
 * Deliberately weak but legal pure policy. The first valid printed card
 * makes single-search decisions reproducible without opponent information.
 * No competitive strength is implied.
 * @param {object} input Detached owner-only search and offered card menu.
 * @returns {{indices:number[]|null}|null}
 */
function chooseActorSingleSearch(input){
  assert.equal(input.actor.decisionKind,'owner-prompt');
  const prompt=input.prompt;
  const first=prompt.offered.find(entry=>entry.selectableAlone);
  if(first)return {indices:[first.index]};
  if(prompt.canSkip)return {indices:[]};
  if(prompt.canCancel)return {indices:null};
  return null;
}

/**
 * Reversible both-seat hook for one-card-legal owner search-to-hand choices.
 * Source objects are resolved only *after* pure decision selection, and
 * Store.dispatch observes the real typed ResolvePromptAction.
 * @template T
 * @param {()=>T} execute Synchronous pinned native Store workload.
 * @param {object} [deps] Injectable native dependencies for unit fixtures.
 * @returns {{result:T,audit:object}}
 */
function withActorOwnerSingleSearch(execute,deps={}){
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??
    require(path.join(base,'game/store/store')).Store;
  const ResolvePromptAction=deps.ResolvePromptAction??
    require(path.join(base,'game/store/actions/resolve-prompt-action')).ResolvePromptAction;
  const GamePhase=deps.GamePhase??
    require(path.join(base,'game/store/state/state')).GamePhase;
  const observe=deps.observe??actorSingleSearchInput;
  const choose=deps.choose??chooseActorSingleSearch;
  const original=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,'decodeNextAction');
  const originalDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  assert.equal(typeof originalDispatch?.value,'function');
  const decisions=new WeakMap();
  let liveStore=null;
  const audit={
    version:VERSION,decisionOrigin:'detached-actor-owned-single-search',
    authenticatedStores:0,selected:0,accepted:0,rejected:0,
    nativePromptPostconditionsConfirmed:0,nativePromptPostconditionsUnverified:0,
    nativeFallbacks:0,nonLiveSpeculativeFallbacks:0,
    unsupportedPromptMessages:{},bySeat:{0:0,1:0},
    boundedSelections:[],competitiveGameQualified:false
  };

  function decode(state){
    if(state!==liveStore?.state){
      audit.nonLiveSpeculativeFallbacks++;
      return original.value.call(this,state);
    }
    if(state.phase!==GamePhase.PLAYER_TURN)
      return original.value.call(this,state);
    const seat=state.players?.findIndex(p=>p.id===this.client?.id)??-1;
    const pending=state.prompts?.find(p=>p.result===undefined);
    const player=state.players?.[seat];
    const canSearch=seat>=0&&
      pending?.constructor?.name==='ChooseCardsPrompt'&&
      pending.playerId===player?.id&&
      SEARCH_MESSAGES.has(pending.message)&&
      (pending.cards===player.deck||pending.cards===player.hand||
        pending.cards===player.discard);
    const input=canSearch?observe(state,seat):null;
    if(!input){
      if(pending?.playerId===this.client?.id &&
          pending.constructor?.name==='ChooseCardsPrompt'){
        const label=pending.message??'unknown';
        audit.unsupportedPromptMessages[label]=
          (audit.unsupportedPromptMessages[label]??0)+1;
        audit.nativeFallbacks++;
      }
      return original.value.call(this,state);
    }
    const intent=choose(input);
    if(intent===null){
      audit.nativeFallbacks++;
      return original.value.call(this,state);
    }
    const physical=state.prompts.find(p=>p.id===input.prompt.id);
    // The integer is a canonical menu index. Resolve it back to the exact
    // physical native card only *after* the detached choice is finished.
    const selected=intent.indices===null?null:intent.indices.map(index=>{
      const row=input.prompt.offered[index];
      assert.ok(row?.selectableAlone,'Invalid detached search menu index');
      const card=physical.cards.cards.find(physicalCard=>
        physicalCard.fullName===row.printing&&
        physical.validate([physicalCard])===true);
      assert.ok(card,'Chosen printing is no longer legal in native prompt');
      return card;
    });
    assert.ok(physical.validate(selected),
      'Owner-selected search card rejected by native prompt validator');
    const action=new ResolvePromptAction(input.prompt.id,selected);
    const record={
      seat,turn:input.actor.globalTurn,
      promptId:input.prompt.id,source:input.prompt.source,
      message:input.prompt.message,indices:intent.indices,
      printings:selected?.map(card=>card.fullName)??null
    };
    decisions.set(action,record);
    audit.selected++;
    audit.bySeat[seat]++;
    if(audit.boundedSelections.length<64)audit.boundedSelections.push(record);
    return action;
  }

  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==liveStore){
      liveStore=this;
      audit.authenticatedStores++;
    }
    const record=this===liveStore?decisions.get(action):undefined;
    if(!record)return originalDispatch.value.apply(this,[action,...args]);
    const before=this.state.prompts?.find(p=>
      p.id===record.promptId&&p.result===undefined);
    try{
      const result=originalDispatch.value.apply(this,[action,...args]);
      audit.accepted++;
      const after=this.state.prompts?.find(p=>p.id===record.promptId);
      const resolved=Boolean(before &&
        (after===undefined||after.result!==undefined));
      if(resolved)audit.nativePromptPostconditionsConfirmed++;
      else audit.nativePromptPostconditionsUnverified++;
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

module.exports={VERSION,actorSingleSearchInput,
  chooseActorSingleSearch,withActorOwnerSingleSearch};
