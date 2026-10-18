'use strict';
const assert=require('node:assert/strict');

/**
 * One observation-compatible Prize/deck exchange in a detached State.
 * The actor's knowledge and actual whole-deck search history must be checked
 * separately; this isolated helper never claims competitive policy validity.
 * @param {object} state Actual source State (read only).
 * @param {number} actorId ID of the acting player.
 * @param {(s:object)=>object} clone Independent deep clone.
 * @param {(s:object)=>object|null} choose Equal-RNG independent policy action.
 * @param {(s:object)=>object|string} fingerprint Stable live-State digest.
 * @returns {object}
 */
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
  const inventory=p=>[
    ...p.deck.cards,...p.prizes.flatMap(slot=>slot.cards)
  ].map(c=>JSON.stringify([c.id,c.fullName])).sort();
  const originalInventory=inventory(player);
  const card=player.deck.cards[deckIndex];
  player.deck.cards[deckIndex]=prize;
  player.prizes[prizeIndex].cards[0]=card;
  assert.deepEqual(inventory(player),originalInventory,
    'Exact physical deck-plus-Prize card copies must be preserved');
  const originalAction=choose(worldA),swappedAction=choose(worldB);
  assert.deepEqual(fingerprint(state),before);
  return {exposed:true,prizeIndex,deckIndex,originalAction,swappedAction,
    sourceStatePreserved:true,physicalCardInventoryPreserved:true,
    actionChanged:JSON.stringify(originalAction)!==JSON.stringify(swappedAction)};
}
module.exports={swapHiddenPrize};
