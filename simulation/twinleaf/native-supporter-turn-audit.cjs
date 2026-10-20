'use strict';

const assert=require('node:assert/strict');

/**
 * Read-only native Store Supporter postcondition audit. A successful dispatch
 * return alone does not establish that an announced Supporter settled.
 * @template T
 * @param {Function} Store Actual pinned engine Store class.
 * @param {number|string} supporterType Actual TrainerType.SUPPORTER.
 * @param {()=>T} execute Original synchronous game.
 * @param {{playSupporterLogMessage?:number|string}} [options]
 * @returns {{result:T,events:object[],repeatPlays:object[],unsettledPlays:object[]}}
 */
function withNativeSupporterTurnAudit(Store,supporterType,execute,options={}) {
  assert.equal(typeof execute,'function');
  const prior=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof prior?.value,'function');
  let root=null,ordinal=0;
  const events=[],repeatPlays=[],unsettledPlays=[];

  function wrapped(...args) {
    const action=args[0];
    if(root===null&&action?.constructor?.name==='AddPlayerAction') root=this;
    const belongs=this===root;
    if(belongs) ordinal++;
    const state=this.state;
    const actor=belongs&&action?.constructor?.name==='PlayCardAction'?
      state?.players?.find(p=>p.id===action.id):null;
    const card=actor?.hand?.cards?.[action.handIndex];
    const supporter=card?.trainerType===supporterType;
    const before=supporter?{
      actorId:actor.id,actorName:actor.name??null,
      seat:state.players.indexOf(actor),turn:state.turn,
      name:card.fullName,cardName:card.name,
      ordinal,supporterTurnBefore:actor.supporterTurn,
      handCountBefore:actor.hand.cards.length,
      supporterZoneBefore:actor.supporter.cards.length,
      logCountBefore:state.logs.length
    }:null;

    const result=prior.value.apply(this,args);
    if(before){
      const after=this.state.players.find(p=>p.id===before.actorId);
      const later=this.state;
      const ownLogs=later.logs.slice(before.logCountBefore);
      const printedLog=options.playSupporterLogMessage===undefined?
        null:ownLogs.some(log=>
          log.message===options.playSupporterLogMessage&&
          log.params?.card===before.cardName&&
          log.params?.name===before.actorName);
      const cardInHand=after.hand.cards.includes(card);
      const cardZones=['supporter','discard','lostzone','deck','stadium']
        .filter(zone=>after[zone]?.cards?.includes(card));
      const supporterTurnAfter=after.supporterTurn;
      const stateTurnAfter=later.turn;
      const quotaAdvanced=Number.isInteger(before.supporterTurnBefore)&&
        Number.isInteger(supporterTurnAfter)&&
        supporterTurnAfter>before.supporterTurnBefore;
      const settled=stateTurnAfter===before.turn&&!cardInHand&&quotaAdvanced&&
        (options.playSupporterLogMessage===undefined||printedLog===true);
      const event={
        ...before,stateTurnAfter,supporterTurnAfter,
        cardInHandAfter:cardInHand,cardZonesAfter:cardZones,
        handCountAfter:after.hand.cards.length,
        supporterZoneAfter:after.supporter.cards.length,
        supporterLogMatched:printedLog,
        quotaAdvanced,settled,
        repeatOnSameTurn:settled&&before.supporterTurnBefore>=1,
        evidenceType:'native-Store-dispatch-postcondition-v1'
      };
      events.push(event);
      if(event.repeatOnSameTurn) repeatPlays.push(event);
      if(!settled) unsettledPlays.push(event);
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...prior,value:wrapped});
  try{return {result:execute(),events,repeatPlays,unsettledPlays};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,wrapped);
    Object.defineProperty(Store.prototype,'dispatch',prior);
  }
}
module.exports={withNativeSupporterTurnAudit};
