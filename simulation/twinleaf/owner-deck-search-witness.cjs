'use strict';

const assert=require('node:assert/strict');

/**
 * Observe only a real root Store prompt which legally reveals the acting
 * owner's own deck. No deck.cards iteration occurs before that prompt.
 * Both the card identities and the successful prompt must belong to the
 * named physical seat. Observations never affect Store decisions.
 *
 * @template T
 * @param {Function} Store Actual pinned Store class.
 * @param {0|1} ownerSeat Physical acting seat.
 * @param {string[]} targetNames Printing names to count at legal searches.
 * @param {()=>T} execute Executes the unchanged original Store game.
 * @param {Function} [onAuthenticatedSearch] Optional synchronous owner-only
 *   callback at the live unresolved deck prompt; must remain observational.
 * @returns {{result:T,events:object[]}}
 */
function withOwnerDeckSearchWitness(Store,ownerSeat,targetNames,execute,onAuthenticatedSearch){
  assert.ok(ownerSeat===0||ownerSeat===1);
  assert.ok(Array.isArray(targetNames)&&targetNames.every(x=>
    typeof x==='string'&&x.length>0));
  assert.equal(typeof execute,'function');
  assert.ok(onAuthenticatedSearch===undefined||
    typeof onAuthenticatedSearch==='function');
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.ok(descriptor&&typeof descriptor.value==='function');
  const seen=new Set(),events=[];
  let root=null,ordinal=0;
  function wrapped(...args){
    if(root===null&&args[0]?.constructor?.name==='AddPlayerAction')root=this;
    const output=descriptor.value.apply(this,args);
    if(this!==root)return output;
    ordinal++;
    const state=this.state,owner=state?.players?.[ownerSeat];
    if(!owner)return output;
    for(const prompt of state.prompts??[]){
      // This condition is the complete legal visibility boundary. Never
      // infer hidden deck membership by examining physical deck objects
      // during an ordinary action or the opponent's search.
      if(prompt?.constructor?.name!=='ChooseCardsPrompt'||
          prompt.player!==owner||prompt.cards!==owner.deck||
          prompt.result!==undefined||seen.has(prompt.id))continue;
      seen.add(prompt.id);
      const printings=prompt.cards.cards.map(card=>card.fullName);
      events.push({
        rootActionOrdinal:ordinal,globalTurn:state.turn,ownerSeat,
        promptId:String(prompt.id),
        stagedCardNames:owner.supporter.cards.map(card=>card.name),
        ownerCanInspectDeck:true,deckCount:printings.length,
        targetCounts:Object.fromEntries(targetNames.map(name=>[name,
          printings.filter(value=>value===name).length]))
      });
      if(onAuthenticatedSearch)onAuthenticatedSearch({
        owner,prompt,rootOrdinal:ordinal,globalTurn:state.turn
      });
    }
    return output;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...descriptor,value:wrapped});
  try{return {result:execute(),events};}
  finally{
    assert.equal(Store.prototype.dispatch,wrapped,
      'Root Store observer was replaced during execution');
    Object.defineProperty(Store.prototype,'dispatch',descriptor);
  }
}
module.exports={withOwnerDeckSearchWitness};
