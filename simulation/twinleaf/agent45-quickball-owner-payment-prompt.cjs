'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent45-owner-visible-quick-ball-mandatory-payment-v1';
const PRINTINGS=new Set(['Quick Ball FST','Quick Ball SSH']);

/** @param {object} card @param {number} turn @returns {number} */
function discardPriority(card,turn){
  const name=card?.name??'';
  const full=card?.fullName??'';
  if(turn>1&&name==='Battle VIP Pass')return 0;
  if(name==='Quick Ball')return 15;
  if(name==="Trainers' Mail")return 25;
  if(name==='Basic Psychic Energy')return 40;
  if(name.endsWith('Energy'))return 75;
  if(name==='Genesect V'||name==='Mew V'||name==='Mew VMAX')return 85;
  if(full.includes('ACE SPEC')||name==='Computer Search'||name==='Secret Box')
    return 100;
  return 60;
}

/**
 * Choose one physical card displayed in the authentic owner's discard menu.
 * The native validator and external paper mandatory-payment hook remain
 * authoritative. Owner hand and prompt are visible only to the actor;
 * no opponent private zone, disguised clone or future deck draw is consulted.
 *
 * @param {object} prompt Live Quick Ball CHOOSE_CARD_TO_DISCARD.
 * @param {object} owner Authenticated answering physical owner.
 * @param {number} turn Actual global turn.
 * @returns {object[]|null} Exactly one offered owner card, or unsupported.
 */
function chooseQuickBallOwnerPayment(prompt,owner,turn){
  if(!PRINTINGS.has(prompt?.sourceCard?.fullName)||
     prompt?.constructor?.name!=='ChooseCardsPrompt'||
     prompt.message!=='CHOOSE_CARD_TO_DISCARD'||
     !Array.isArray(prompt?.cards?.cards)||
     !Array.isArray(owner?.hand?.cards)||
     !Number.isInteger(turn))return null;
  const hand=new Set(owner.hand.cards);
  const offered=prompt.cards.cards
    .map((card,index)=>({card,index}))
    .filter(({card})=>hand.has(card));
  offered.sort((a,b)=>
    discardPriority(a.card,turn)-discardPriority(b.card,turn)||
    a.index-b.index);
  return offered.length?[offered[0].card]:null;
}

/**
 * Reversible repair for a real BotDecodeFailure at Quick Ball mandatory
 * CHOOSE_CARD_TO_DISCARD. Both players use identical prompt-owner logic.
 * The Store still validates the exact selected physical card, and the
 * separate printed Quick Ball payment guard audits mandatory payment.
 *
 * @template T
 * @param {()=>T} execute Synchronous genuine pinned native matches.
 * @param {object} [deps] Injectable native classes for isolated unit tests.
 * @returns {{result:T,audit:object}}
 */
function withQuickBallOwnerPaymentContinuation(execute,deps={}){
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const native=s=>require(path.join(base,s));
  const Bot=deps.SimpleTacticsAi??
    native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??native('game/store/store').Store;
  const ResolvePromptAction=deps.ResolvePromptAction??
    native('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const botOriginal=Object.getOwnPropertyDescriptor(
    Bot.prototype,'decodeNextAction');
  const storeOriginal=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof botOriginal?.value,'function');
  assert.equal(typeof storeOriginal?.value,'function');
  let liveStore=null;
  const proposals=new WeakMap();
  const audit={version:VERSION,liveStores:0,ownerPrompts:0,
    payablePrompts:0,proposals:0,nativeAccepted:0,nativeRejected:0,
    unsupportedUnpayable:0,nonLiveDelegations:0,
    replays:[],competitivePaperQualifiedGames:0};
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==liveStore){
      liveStore=this;
      audit.liveStores++;
    }
    const proposal=this===liveStore?proposals.get(action):undefined;
    if(!proposal)return storeOriginal.value.apply(this,[action,...args]);
    try{
      const result=storeOriginal.value.apply(this,[action,...args]);
      audit.nativeAccepted++;
      if(audit.replays.length<40)audit.replays.push({...proposal,accepted:true});
      return result;
    }catch(error){
      audit.nativeRejected++;
      if(audit.replays.length<40)audit.replays.push({...proposal,accepted:false});
      throw error;
    }
  }
  function decode(state){
    if(state!==liveStore?.state){
      audit.nonLiveDelegations++;
      return botOriginal.value.call(this,state);
    }
    const pending=state.prompts?.find(p=>p.result===undefined);
    if(!pending||!PRINTINGS.has(pending.sourceCard?.fullName)||
       pending.constructor?.name!=='ChooseCardsPrompt'||
       pending.message!=='CHOOSE_CARD_TO_DISCARD')
      return botOriginal.value.call(this,state);
    const owner=state.players?.find(p=>p.id===this.client?.id);
    if(owner?.id!==pending.playerId)return botOriginal.value.call(this,state);
    audit.ownerPrompts++;
    const answer=chooseQuickBallOwnerPayment(pending,owner,state.turn);
    if(!answer){
      audit.unsupportedUnpayable++;
      return botOriginal.value.call(this,state);
    }
    audit.payablePrompts++;
    if(typeof pending.validate!=='function'||
       pending.validate(answer,state)!==true)
      return botOriginal.value.call(this,state);
    const action=new ResolvePromptAction(pending.id,answer);
    const index=owner.hand.cards.indexOf(answer[0]);
    proposals.set(action,{seat:state.players.indexOf(owner),turn:state.turn,
      physicalOwnerCard:answer[0].fullName,ownerHandIndex:index,
      print:pending.sourceCard.fullName});
    audit.proposals++;
    return action;
  }
  Object.defineProperty(Store.prototype,'dispatch',{
    ...storeOriginal,value:dispatch
  });
  Object.defineProperty(Bot.prototype,'decodeNextAction',{
    ...botOriginal,value:decode
  });
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    assert.strictEqual(Bot.prototype.decodeNextAction,decode);
    Object.defineProperty(Bot.prototype,'decodeNextAction',botOriginal);
    Object.defineProperty(Store.prototype,'dispatch',storeOriginal);
  }
}
module.exports={VERSION,chooseQuickBallOwnerPayment,
  withQuickBallOwnerPaymentContinuation};
