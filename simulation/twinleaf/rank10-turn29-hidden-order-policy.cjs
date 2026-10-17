'use strict';
const assert=require('node:assert/strict');
const {countPolicyRandomDraws}=require('./policy-random-draw-audit.cjs');
const {stateGraphFingerprint}=require('./rank10-live-decision-noninterference.cjs');

/** Compare bot decisions under temporary reordering of its unseen deck. */
function withTurn29DeckOrderProbe(Store,Bot,work,opts){
 const store=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
 const bot=Object.getOwnPropertyDescriptor(Bot.prototype,'decodeNextAction');
 assert.equal(typeof store.value,'function');
 assert.equal(typeof bot.value,'function');
 let root,ordinal=0;
 const decisions=[];
 function dispatch(action,...args){
  if(!root&&action?.constructor.name==='AddPlayerAction')root=this;
  if(this===root)ordinal++;
  return store.value.call(this,action,...args);
 }
 function decide(state,...args){
  const player=state.players[0];
  if(!(state===root?.state&&ordinal===231&&state.turn===29&&
       state.activePlayer===0&&this.client?.id===player.id&&
       decisions.length===0))return bot.value.call(this,state,...args);
  const pre=stateGraphFingerprint(state),zonePre=opts.digest(state);
  const deck=player.deck.cards,order=deck.slice();
  if(opts.reverse)deck.reverse();
  let result;
  try{result=countPolicyRandomDraws(()=>bot.value.call(this,state,...args));}
  finally{if(opts.reverse)deck.reverse();}
  const post=stateGraphFingerprint(state),zonePost=opts.digest(state);
  decisions.push({rootOrdinal:231,
   changedOrder:order.some((card,i)=>deck[opts.reverse?deck.length-i-1:i]!==card),
   action:result.result?.constructor.name,
   actionParameters:Object.fromEntries(Object.entries(result.result||{})
      .filter(([,v])=>['number','string','boolean'].includes(typeof v))),
   rngDraws:result.draws,sourceZoneBefore:zonePre,sourceZoneAfter:zonePost,
   sourceGraphUnchanged:pre.digest===post.digest,
   sourceZoneUnchanged:zonePre===zonePost});
  return result.result;
 }
 Object.defineProperty(Store.prototype,'dispatch',{...store,value:dispatch});
 Object.defineProperty(Bot.prototype,'decodeNextAction',{...bot,value:decide});
 try{return {result:work(),decisions};}
 finally{
  Object.defineProperty(Bot.prototype,'decodeNextAction',bot);
  Object.defineProperty(Store.prototype,'dispatch',store);
 }
}
module.exports={withTurn29DeckOrderProbe};
