'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {assertValidPromptAction}=require('./prompt-integrity.cjs');

const VERSION='agent47-actor-hand-discard-v1-bounded';
const MESSAGE='CHOOSE_CARD_TO_DISCARD';

/**
 * Projection for a genuine hand-owned mandatory discard prompt. The native
 * validator generates a bounded menu of legal exact-printing multisets, but
 * the pure chooser receives no State, Card objects, deck order, Prizes, or
 * opponent hand. Optional discards and larger selections remain fallback.
 *
 * @param {object} state Live pinned Store State
 * @param {0|1} seat Answering physical player seat
 * @param {Function} [observe] Owner-only observation provider
 * @returns {object|null}
 */
function actorHandDiscardInput(state,seat,observe=actorObservation){
  assert.ok(seat===0||seat===1);
  const owner=state.players?.[seat];
  const pending=state.prompts?.find(p=>p.result===undefined);
  if(pending?.constructor?.name!=='ChooseCardsPrompt'||
      pending.playerId!==owner?.id||
      pending.cards!==owner.hand||pending.message!==MESSAGE)return null;
  const min=pending.options?.min,max=pending.options?.max;
  const cards=owner.hand.cards;
  if(!Number.isInteger(min)||min<1||min>2||
      !Number.isInteger(max)||max<min||
      !Array.isArray(cards)||cards.length>18)return null;
  if(cards.some(card=>typeof card.fullName!=='string'||!card.fullName))return null;
  const menus=new Map();
  const add=selection=>{
    if(!pending.validate(selection))return;
    const names=selection.map(card=>card.fullName).sort();
    menus.set(JSON.stringify(names),Object.freeze([...names]));
  };
  for(let i=0;i<cards.length;i++){
    if(min===1)add([cards[i]]);
    if(min===2)for(let j=i+1;j<cards.length;j++)add([cards[i],cards[j]]);
  }
  if(menus.size===0)return null;
  const actor=observe(state,seat);
  assert.equal(actor.decisionKind,'owner-prompt');
  const menu=[...menus.values()].sort((a,b)=>
    JSON.stringify(a)<JSON.stringify(b)?-1:
      JSON.stringify(a)>JSON.stringify(b)?1:0);
  return Object.freeze({
    actor,
    prompt:Object.freeze({
      id:pending.id,message:MESSAGE,source:'own-hand',
      requiredCount:min,
      menu:Object.freeze(menu)
    })
  });
}

/**
 * Conservative actor-only default: prefer choices retaining more distinct
 * hand printings and avoid consuming a printing's sole remaining copy.
 * This is a deterministic heuristic, not evidence of optimal discard play.
 * @param {object} input Detached prompt and own-hand projection
 * @returns {{printings:string[]}}
 */
function chooseActorHandDiscard(input){
  assert.equal(input.actor.decisionKind,'owner-prompt');
  const counts=new Map();
  for(const printing of input.actor.ownHand)
    counts.set(printing,(counts.get(printing)??0)+1);
  const score=names=>{
    const chosen=new Map();
    for(const name of names)chosen.set(name,(chosen.get(name)??0)+1);
    let erased=0,unique=0;
    for(const [name,number] of chosen){
      if(counts.get(name)===number)erased++;
      if(counts.get(name)===1)unique++;
    }
    return erased*100+unique*10;
  };
  const menu=input.prompt.menu;
  assert.ok(menu.length>0);
  let best=menu[0],bestScore=score(best);
  for(const candidate of menu.slice(1)){
    const value=score(candidate);
    if(value<bestScore){best=candidate;bestScore=value;}
  }
  return {printings:[...best]};
}

/**
 * Resolve a detached print multiset back to distinct original physical
 * owner-hand card objects, after the pure decision has finished.
 * @param {object} prompt Native ChooseCardsPrompt
 * @param {string[]} names Pure selected printing multiset
 * @returns {object[]|null}
 */
function resolvePhysicalHandCards(prompt,names){
  const chosen=[],used=new Set();
  function visit(index){
    if(index===names.length)return prompt.validate(chosen)?[...chosen]:null;
    for(const card of prompt.cards.cards){
      if(used.has(card)||card.fullName!==names[index])continue;
      used.add(card);chosen.push(card);
      const result=visit(index+1);
      if(result)return result;
      chosen.pop();used.delete(card);
    }
    return null;
  }
  return visit(0);
}

/**
 * Opt-in, synchronous, reversible both-seat adapter for real Store prompts.
 * Unsupported cases retain explicit generic fallback and zero qualification.
 *
 * @template T
 * @param {()=>T} execute Real Store workload
 * @param {object} [deps] Test-injected native classes and pure functions
 * @returns {{result:T,audit:object}}
 */
function withActorHandDiscard(execute,deps={}){
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??
    require(path.join(base,'game/store/store')).Store;
  const ResolvePromptAction=deps.ResolvePromptAction??
    require(path.join(base,'game/store/actions/resolve-prompt-action')).ResolvePromptAction;
  const observe=deps.observe??actorHandDiscardInput;
  const choose=deps.choose??chooseActorHandDiscard;
  const validate=deps.validate??assertValidPromptAction;
  const original=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,'decodeNextAction');
  const originalDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  assert.equal(typeof originalDispatch?.value,'function');
  let liveStore=null;
  const intents=new WeakMap();
  const audit={version:VERSION,eligible:0,selected:0,accepted:0,rejected:0,
    nativePromptPostconditionsConfirmed:0,nativeFallbacks:0,
    nonLiveSpeculativeFallbacks:0,bySeat:{0:0,1:0},
    selections:[],competitiveGameQualified:false};
  function decode(state){
    if(state!==liveStore?.state){
      audit.nonLiveSpeculativeFallbacks++;
      return original.value.call(this,state);
    }
    const seat=state.players.findIndex(player=>player.id===this.client?.id);
    const input=seat>=0?observe(state,seat):null;
    if(!input){
      const pending=state.prompts?.find(prompt=>
        prompt.result===undefined&&prompt.playerId===this.client?.id);
      if(pending?.constructor?.name==='ChooseCardsPrompt'&&
          pending.cards===state.players[seat]?.hand){
        audit.nativeFallbacks++;
      }
      return original.value.call(this,state);
    }
    audit.eligible++;
    const intent=choose(input);
    const pending=state.prompts.find(p=>p.id===input.prompt.id);
    const selected=resolvePhysicalHandCards(pending,intent.printings);
    assert.ok(selected,'Actor-selected discard is not a legal physical multiset');
    const action=new ResolvePromptAction(input.prompt.id,selected);
    validate(state,action);
    const record={seat,turn:input.actor.globalTurn,promptId:input.prompt.id,
      printings:[...intent.printings],requiredCount:input.prompt.requiredCount};
    intents.set(action,record);
    audit.selected++;
    return action;
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction')liveStore=this;
    const record=this===liveStore?intents.get(action):null;
    if(!record)return originalDispatch.value.apply(this,[action,...args]);
    try{
      const result=originalDispatch.value.apply(this,[action,...args]);
      audit.accepted++;
      audit.bySeat[record.seat]++;
      const outstanding=this.state.prompts?.some(p=>p.id===record.promptId&&p.result===undefined);
      if(!outstanding)audit.nativePromptPostconditionsConfirmed++;
      if(audit.selections.length<64)audit.selections.push(record);
      return result;
    }catch(error){
      audit.rejected++;
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{...original,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',{...originalDispatch,value:dispatch});
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',originalDispatch);
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',original);
  }
}

module.exports={VERSION,actorHandDiscardInput,chooseActorHandDiscard,
  resolvePhysicalHandCards,withActorHandDiscard};
