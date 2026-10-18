'use strict';
const assert=require('node:assert/strict');
/**
 * Read actual archived root231 hand and Supporter status; retain the bot's
 * original Retreat when the held Guzma is legally unavailable.
 * @param {{Store:Function,Bot:Function}} types
 * @param {()=>any} work
 * @param {{forceGuzma:boolean}} options
 */
function withGuzmaFork({Store,Bot},work,{forceGuzma}){
 assert.equal(typeof forceGuzma,'boolean');
 const ds=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
 const db=Object.getOwnPropertyDescriptor(Bot.prototype,'decodeNextAction');
 assert.equal(typeof ds?.value,'function');
 assert.equal(typeof db?.value,'function');
 let root=null,ordinal=0,stage='start';
 const actions=[];
 const dispatch=function(action,...args){
  if(!root&&action?.constructor?.name==='AddPlayerAction')root=this;
  if(this===root)ordinal++;
  return ds.value.call(this,action,...args);
 };
 const decode=function(state,...args){
  const actor=state===root?.state&&state.turn===29&&
   state.activePlayer===0?state.players[0]:null;
  if(stage!=='start'||ordinal!==231||!actor||
     this.client?.id!==actor.id||
     state.prompts.some(p=>p.playerId===actor.id&&p.result===undefined)){
   return db.value.call(this,state,...args);
  }
  const hand=actor.hand.cards.map(c=>c.fullName);
  const proposal=db.value.call(this,state,...args);
  assert.equal(proposal?.constructor?.name,'RetreatAction');
  assert.deepEqual(hand.slice().sort(),[
   'Mysterious Treasure FLI','Budew ASC','Guzma BUS'].sort());
  assert.equal(actor.supporterTurn,1,'Source already consumed a Supporter');
  actions.push({ordinal,original:proposal.constructor.name,
   heldGuzma:true,forced:forceGuzma,supporterTurn:1,
   preventedIllegalSupporter:forceGuzma});
  stage=forceGuzma?'blocked':'control';
  return proposal;
 };
 Object.defineProperty(Store.prototype,'dispatch',{...ds,value:dispatch});
 Object.defineProperty(Bot.prototype,'decodeNextAction',{...db,value:decode});
 try{return {result:work(),stage,actions};}
 finally{
  Object.defineProperty(Bot.prototype,'decodeNextAction',db);
  Object.defineProperty(Store.prototype,'dispatch',ds);
 }
}
module.exports={withGuzmaFork};
