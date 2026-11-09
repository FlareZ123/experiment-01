'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {VERSION, likelyMultiPrizeBasic, choosePrizeAwareNestBasic} =
  require('../../simulation/twinleaf/agent38-mail-nest-prize-aware-basic-choice.cjs');

const types = {SuperType:{POKEMON:'POKEMON'},Stage:{BASIC:'BASIC'}};
const basic = fullName => ({fullName,superType:'POKEMON',stage:'BASIC'});
const promptFor = (deck, allowed=deck.cards) => ({
  constructor:{name:'ChooseCardsPrompt'},
  cards:deck,playerId:'owner',sourceCard:{fullName:'Nest Ball SVI'},
  validate(cards){return cards.length===0 || (
    cards.length===1 && allowed.includes(cards[0]));}
});

test('printed-name prizes recognize GX, EX, V, VMAX, VSTAR and ex', () => {
  assert.equal(VERSION,'agent38-mail-nest-prize-aware-basic-choice-v1');
  for(const name of [
    'Articuno-GX CES','Tapu Lele-GX GRI','Mewtwo-EX BKT',
    'Rotom V SSH','Shadow Rider Calyrex VMAX CRE',
    'Regidrago VSTAR SIT','Mew ex MEW'
  ]) assert.equal(likelyMultiPrizeBasic(name),true,name);
  for(const name of [
    'Bunnelby PRC','Galarian Stunfisk SSH','Snorlax PGO',
    'Radiant Greninja ASR'
  ]) assert.equal(likelyMultiPrizeBasic(name),false,name);
});

test('prioritizes eligible one-Prize Basic regardless of native deck order', () => {
  const premium=basic('Articuno-GX CES');
  const safe=basic('Bunnelby PRC');
  const owner={id:'owner',deck:{cards:[premium,safe]}};
  const prompt=promptFor(owner.deck);
  assert.deepEqual(choosePrizeAwareNestBasic(prompt,owner,types,{}),[safe]);
  assert.deepEqual(owner.deck.cards,[premium,safe]);
});

test('does not exclude an otherwise sole eligible premium Basic', () => {
  const premium=basic('Articuno-GX CES');
  const other=basic('Galarian Stunfisk SSH');
  const owner={id:'owner',deck:{cards:[premium,other]}};
  const prompt=promptFor(owner.deck,[premium]);
  assert.deepEqual(choosePrizeAwareNestBasic(prompt,owner,types,{}),[premium]);
});

test('respects prompt ownership, source printing, card type and no-target case', () => {
  const item={fullName:'Nest Ball SVI',superType:'TRAINER',stage:null};
  const owner={id:'owner',deck:{cards:[item]}};
  const prompt=promptFor(owner.deck);
  assert.deepEqual(choosePrizeAwareNestBasic(prompt,owner,types,{}),[]);
  assert.equal(choosePrizeAwareNestBasic({...prompt,playerId:'opponent'},owner,types,{}),null);
  assert.equal(choosePrizeAwareNestBasic({...prompt,sourceCard:{fullName:'Quick Ball SSH'}},owner,types,{}),null);
});
