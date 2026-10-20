'use strict';

const assert=require('node:assert/strict');

/**
 * Observe successful native Store Supporter plays without altering decisions.
 * @template T
 * @param {Function} Store Pinned Store class.
 * @param {number|string} supporterType TrainerType.SUPPORTER constant.
 * @param {()=>T} execute Executes one original game.
 * @returns {{result:T,events:object[],repeatPlays:object[]}}
 */
function withNativeSupporterTurnAudit(Store,supporterType,execute){
  assert.equal(typeof execute,'function');
  const prior=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof prior?.value,'function');
  let root=null,ordinal=0;
  const seen=new Map(),events=[],repeatPlays=[];
  function wrapped(...args){
    const action=args[0];
    if(root===null&&action?.constructor?.name==='AddPlayerAction')root=this;
    const belongs=this===root;
    if(belongs)ordinal++;
    const state=this.state;
    const actor=belongs&&action?.constructor?.name==='PlayCardAction'?
      state?.players?.find(p=>p.id===action.id):null;
    const card=actor?.hand?.cards?.[action.handIndex];
    const supporter=card?.trainerType===supporterType;
    const before=supporter?{
      actorId:actor.id,seat:state.players.indexOf(actor),turn:state.turn,
      name:card.fullName,ordinal,supporterTurnBefore:actor.supporterTurn
    }:null;
    const result=prior.value.apply(this,args);
    if(before){
      const key=before.actorId+':'+before.turn;
      const count=(seen.get(key)??0)+1;
      const after=this.state.players.find(p=>p.id===before.actorId);
      const event={...before,count,supporterTurnAfter:after?.supporterTurn??null};
      events.push(event);
      if(count>1)repeatPlays.push(event);
      seen.set(key,count);
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...prior,value:wrapped});
  try{return {result:execute(),events,repeatPlays};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,wrapped);
    Object.defineProperty(Store.prototype,'dispatch',prior);
  }
}
module.exports={withNativeSupporterTurnAudit};
