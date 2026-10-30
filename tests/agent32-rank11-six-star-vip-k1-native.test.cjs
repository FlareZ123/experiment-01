'use strict';

const assert=require('node:assert/strict');
const {verifyFrame,visibleK1Resources}=
  require('../simulation/twinleaf/agent32-rank11-six-star-vip-k1-native.cjs');

assert.equal(verifyFrame(),true);
const names=[
  'Forest Seal Stone SIT','Float Stone BKT','Battle VIP Pass FST',
  'Trubbish FST','Trubbish FST','Garbodor BKP',
  'Darkness Energy MEE'
];
const deck={cards:names.map(fullName=>({fullName}))};
const player={id:101,deck};
class ChooseCardsPrompt{}
const prompt=new ChooseCardsPrompt();
prompt.playerId=101;
prompt.cards=deck;
assert.deepEqual(visibleK1Resources(prompt,player),{
  forestSealStone:1,floatStone:1,battleVipPass:1,trubbish:2,garbodor:1
});
assert.throws(()=>visibleK1Resources(
  Object.assign(new ChooseCardsPrompt(),{playerId:202,cards:deck}),player));
assert.throws(()=>visibleK1Resources(
  Object.assign(new ChooseCardsPrompt(),{playerId:101,cards:{cards:[]}}),
  player));
const blockedDeck={cards:deck.cards.filter(c=>c.fullName!=='Trubbish FST')};
const b=new ChooseCardsPrompt();
b.cards=blockedDeck;b.playerId=101;
assert.equal(visibleK1Resources(b,{id:101,deck:blockedDeck}).trubbish,0);
console.log('Agent32 six-seed native K1 owner-search boundary controls passed');
