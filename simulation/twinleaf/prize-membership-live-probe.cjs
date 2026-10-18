'use strict';
const assert=require('node:assert/strict');

function swapHiddenPrize(state,actorId,clone,choose,fingerprint){
  const before=fingerprint(state);
  const worldA=clone(state),worldB=clone(state);
  const player=worldB.players.find(p=>p.id===actorId);
  assert.ok(player);
  const prizeIndex=player.prizes.findIndex(s=>s.isSecret===true && s.cards.length===1);
  if(prizeIndex<0)return {exposed:false,reason:'no facedown prize slot'};
  const prize=player.prizes[prizeIndex].cards[0];
  const deckIndex=player.deck.cards.findIndex(c=>c.fullName!==prize.fullName);
  if(deckIndex<0)return {exposed:false,reason:'no different deck printing'};
  const card=player.deck.cards[deckIndex];
  player.deck.cards[deckIndex]=prize;
  player.prizes[prizeIndex].cards[0]=card;
  const originalAction=choose(worldA),swappedAction=choose(worldB);
  assert.deepEqual(fingerprint(state),before);
  return {exposed:true,prizeIndex,deckIndex,originalAction,swappedAction,
    sourceStatePreserved:true,
    actionChanged:JSON.stringify(originalAction)!==JSON.stringify(swappedAction)};
}
module.exports={swapHiddenPrize};
