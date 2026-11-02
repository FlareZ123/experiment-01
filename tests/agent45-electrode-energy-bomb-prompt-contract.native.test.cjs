'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const base=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(base,name));
const {AttachEnergyPrompt}=native('game/store/prompts/attach-energy-prompt');
const {CardList}=native('game/store/state/card-list');
const {SuperType}=native('game/store/card/card-types');
const {PlayerType,SlotType}=native('game/store/actions/play-card-action');

/** Read-only characterization of the pinned target validator. */
test('CES48 AttachEnergyPrompt blockedTo is not checked by native validate',()=>{
 const source=new CardList();
 const energy={superType:SuperType.ENERGY,id:45811};
 source.cards.push(energy);
 const forbidden={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0};
 const prompt=new AttachEnergyPrompt(
  451,0,source,PlayerType.BOTTOM_PLAYER,[SlotType.ACTIVE],
  {superType:SuperType.ENERGY},
  {allowCancel:false,min:0,max:5,blockedTo:[forbidden]});
 const selection=[{to:forbidden,card:energy}];
 assert.equal(prompt.options.blockedTo.length,1);
 assert.equal(prompt.validate(selection),true);
 console.log('PINNED_CES48_BLOCKED_TO_VALIDATOR_GAP',
  JSON.stringify({oneForbiddenTargetAllowed:true,competitiveQualifiedGames:0}));
});

test('CES48 pinned prompt accepts partial five-card transfer',()=>{
 const source=new CardList();
 const energy=Array.from({length:5},(_,i)=>({superType:SuperType.ENERGY,id:45820+i}));
 source.cards.push(...energy);
 const target={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0};
 const prompt=new AttachEnergyPrompt(
  451,0,source,PlayerType.BOTTOM_PLAYER,[SlotType.ACTIVE,SlotType.BENCH],
  {superType:SuperType.ENERGY},{allowCancel:false,min:0,max:5});
 assert.equal(prompt.validate([{to:target,card:energy[0]}]),true);
 assert.equal(prompt.validate(energy.map(card=>({to:target,card}))),true);
 console.log('PINNED_CES48_PARTIAL_TRANSFER_ACCEPTED',
  JSON.stringify({availableEnergy:5,transferCount:1,accepted:true,competitiveQualifiedGames:0}));
});
