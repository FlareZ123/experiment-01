'use strict';
const assert=require('node:assert/strict');

const CORE=Object.freeze(['Boost Shake','Trubbish','Garbodor','Float Stone',
  'Forest Seal Stone','Secret Box','Battle VIP Pass','Quick Ball','Mega Absol ex']);

/**
 * Read-only K1 snapshot of the acting player's own deck while a true root
 * source search is being resolved. K1 is available to the acting player under
 * the paper deck-search rule; it is never supplied to the bot.
 * @param {any} Store Actual pinned Store class
 * @param {() => any} work One or more real-source games
 */
function withRank11K1SearchAudit(Store,work){
  const old=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof old?.value,'function');
  let root=null,ordinal=0;
  const searches=[];
  function dispatch(action,...args){
    if(root===null&&action?.constructor?.name==='AddPlayerAction')root=this;
    if(this===root){
      const state=this.state;
      if(state?.turn===1&&state?.activePlayer===0&&
          action?.constructor?.name==='ResolvePromptAction'){
        const pending=state.prompts.find(p=>p.result===undefined);
        if(pending?.constructor?.name==='ChooseCardsPrompt'&&
            pending.cards===state.players[0].deck){
          const inDeck=state.players[0].deck.cards;
          const eligibleCounts=Object.fromEntries(CORE.map(name=>[
            name,inDeck.filter(card=>card.name===name).length]));
          searches.push({
            rootOrdinal:ordinal,
            type:'acting-player-own-deck-search',
            promptMessage:pending.message||null,
            cardsRemainingInDeck:inDeck.length,
            eligibleCounts,
            selected:(action.result||[]).map(card=>
              Number.isInteger(card)?inDeck[card]?.fullName||null:card?.fullName||null),
            usedGX:state.players[0].usedGX===true
          });
        }
      }
      ordinal++;
    }
    return old.value.call(this,action,...args);
  }
  Object.defineProperty(Store.prototype,'dispatch',{...old,value:dispatch});
  try{return {result:work(),searches};}
  finally{Object.defineProperty(Store.prototype,'dispatch',old);}
}
module.exports={CORE,withRank11K1SearchAudit};
