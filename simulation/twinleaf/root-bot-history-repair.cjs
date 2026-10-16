'use strict';

const {liveCardDamageSnapshots}=require('./simulator-leak-observer.cjs');

/**
 * Reversible research policy to restore root physical Card damage-history
 * changes made during speculative bot evaluation. Unlike an observer, this
 * deliberately changes the downstream game state.
 * @template T
 * @param {Function} Store
 * @param {Function} Bot
 * @param {Function} Card
 * @param {()=>T} run
 * @returns {object}
 */
function withRootCardHistoryRepair(Store,Bot,Card,run) {
  const a=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const b=Object.getOwnPropertyDescriptor(Bot.prototype,'decodeNextAction');
  let root=null,policyCalls=0;
  const events=[];
  const dispatch=function(...args) {
    if(!root && args[0]?.constructor?.name==='AddPlayerAction') root=this;
    return a.value.apply(this,args);
  };
  const decode=function(...args) {
    const state=args[0];
    if(!root || state!==root.state) return b.value.apply(this,args);
    const before=liveCardDamageSnapshots(state,Card);
    policyCalls++;
    let action;
    try {return (action=b.value.apply(this,args));}
    finally {
      const edits=[];
      for(const [card,prior] of before) {
        if(card.damageTakenLastTurn===prior) continue;
        edits.push({printing:card.fullName,prior,
          changed:card.damageTakenLastTurn});
        card.damageTakenLastTurn=prior;
      }
      if(edits.length) events.push({
        call:policyCalls,turn:state.turn,
        actorId:this.client?.id??null,
        nextAction:action?.constructor?.name??null,edits
      });
    }
  };
  Object.defineProperty(Store.prototype,'dispatch',{...a,value:dispatch});
  Object.defineProperty(Bot.prototype,'decodeNextAction',{...b,value:decode});
  let result;
  try{result=run();}
  finally{
    Object.defineProperty(Bot.prototype,'decodeNextAction',b);
    Object.defineProperty(Store.prototype,'dispatch',a);
  }
  return {result,policyCalls,restorationEvents:events};
}
module.exports={withRootCardHistoryRepair};
