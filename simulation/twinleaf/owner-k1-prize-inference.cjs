'use strict';
const assert=require('node:assert/strict');
const {observedOwnerZones,visiblePrinting}=
  require('./owner-k0-observable-inventory.cjs');
const {strictK0Belief}=require('./strict-k0-unknown.cjs');

/**
 * Reconstruct the owner's remaining Prizes by subtraction only after a real
 * unresolved own-deck search. No Prize card identity or opposing zone is read.
 * A caller must authenticate the actual native Store prompt before invoking.
 *
 * @param {{owner:object,prompt:object,registered:string[]}} input
 * @returns {{prizeCount:number,ownerVisibleDeckCount:number,
 *   ownerVisibleZoneCounts:Record<string,number>,
 *   inferredPrizePrintings:{printing:string,copies:number}[],
 *   source:'native-owner-search-and-own-visible-zones'}}
 */
function inferOwnerPrizesAtSearch({owner,prompt,registered}){
  assert.ok(owner&&prompt);
  assert.equal(prompt.constructor.name,'ChooseCardsPrompt');
  assert.equal(prompt.player,owner);
  assert.equal(prompt.playerId,owner.id);
  assert.equal(prompt.cards,owner.deck);
  assert.equal(prompt.result,undefined);
  const own=observedOwnerZones(owner);
  const deck=prompt.cards.cards.map(visiblePrinting);
  const prizeCount=owner.prizes.reduce((sum,slot)=>{
    assert.ok(Array.isArray(slot?.cards));
    return sum+slot.cards.length;
  },0);
  const belief=strictK0Belief({
    registered,known:[...own.printings,...deck],
    deckCount:0,unseenPrizeCount:prizeCount
  });
  const counts=new Map();
  for(const printing of belief.pool)
    counts.set(printing,(counts.get(printing)??0)+1);
  return {
    prizeCount,ownerVisibleDeckCount:deck.length,
    ownerVisibleZoneCounts:own.zoneCounts,
    inferredPrizePrintings:[...counts.entries()].map(
      ([printing,copies])=>({printing,copies})),
    source:'native-owner-search-and-own-visible-zones'
  };
}
module.exports={inferOwnerPrizesAtSearch};
