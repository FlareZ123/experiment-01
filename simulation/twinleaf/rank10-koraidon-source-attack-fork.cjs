'use strict';
const assert=require('node:assert/strict');
const {observableState,hash}=require('./source-state-continuity.cjs');

/**
 * Observe the root decision before it is dispatched. Optionally replace one
 * actual turn-five Koraidon Pass with its printed Retribution Strike, preserving
 * the source 60s and prior choices. No hidden card information selects it.
 *
 * This is an experimental opponent-policy fork. Its resulting game is not
 * evidence of competitive strength or a full paper-rule qualification.
 *
 * @template T
 * @param {{Store:Function,Bot:Function,AttackAction:Function}} types
 * @param {()=>T} work
 * @param {{forceAttack:boolean}} options
 * @returns {{result:T,sourceDecisions:object[]}}
 */
function withRank10SourceKoraidonFork(types,work,options) {
  const {Store,Bot,AttackAction}=types;
  const storeDesc=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const botDesc=Object.getOwnPropertyDescriptor(Bot.prototype,'decodeNextAction');
  assert.equal(typeof storeDesc?.value,'function');
  assert.equal(typeof botDesc?.value,'function');
  let root=null;
  const sourceDecisions=[];
  const dispatch=function(...args) {
    if(root===null && args[0]?.constructor?.name==='AddPlayerAction') root=this;
    return storeDesc.value.apply(this,args);
  };
  const bot=function(state) {
    const action=botDesc.value.call(this,state);
    if(!root || root.state!==state || state.turn!==5 ||
        action?.constructor?.name!=='PassTurnAction' ||
        this.client?.id!==action.clientId) return action;
    const active=state.players[state.activePlayer];
    if(active?.id!==action.clientId ||
       active.active.getPokemonCard()?.fullName!=='Koraidon ex TEF' ||
       !active.active.energies.cards.some(c=>c.fullName==='Double Dragon Energy ROS'))
       return action;
    const event={turn:state.turn,playerId:action.clientId,
      originalAction:action.constructor.name,
      selectedAttack:options.forceAttack===true?'Retribution Strike':null,
      stateDigest:hash(observableState(state)),
      engineRootStoreOnly:true};
    sourceDecisions.push(event);
    if(options.forceAttack!==true) return action;
    if(sourceDecisions.length!==1) throw new Error('Repeated source decision fork');
    return new AttackAction(action.clientId,'Retribution Strike');
  };
  Object.defineProperty(Store.prototype,'dispatch',{...storeDesc,value:dispatch});
  Object.defineProperty(Bot.prototype,'decodeNextAction',{...botDesc,value:bot});
  let result;
  try {result=work();}
  finally {
    Object.defineProperty(Bot.prototype,'decodeNextAction',botDesc);
    Object.defineProperty(Store.prototype,'dispatch',storeDesc);
  }
  return {result,sourceDecisions};
}
module.exports={withRank10SourceKoraidonFork};
