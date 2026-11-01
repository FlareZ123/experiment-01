'use strict';
const assert=require('node:assert/strict');
/** Convert an already authenticated owner-public Basic payment plan into physical native prompt transfers. */
function decodePayment(state,prompt,owner,choices,types){
 assert.equal(prompt.constructor.name,'DiscardEnergyPrompt');
 assert.equal(prompt.playerId,owner.id);
 assert.ok(state.players.includes(owner));
 const selected=choices.map(choice=>{
  const list=choice.slot==='active'?owner.active:owner.bench[choice.index];
  assert.ok(list,'Missing native owner Pokémon slot');
  const energy=list.energies.cards[choice.energyIndex];
  assert.ok(energy&&energy.fullName===choice.printing);
  assert.equal(energy.energyType,types.EnergyType.BASIC);
  const index=list.cards.indexOf(energy);
  assert.ok(index>=0,'Energy absent from aggregate physical card list');
  return {from:{player:types.PlayerType.BOTTOM_PLAYER,slot:choice.slot==='active'?types.SlotType.ACTIVE:types.SlotType.BENCH,index:choice.index},index};
 });
 const transfers=prompt.decode(selected,state);
 assert.equal(prompt.validate(transfers),true);
 return transfers;
}
module.exports={decodePayment};
