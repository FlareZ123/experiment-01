'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseRank29TwoPieceCampingSearch,DCE,THUNDER}=
  require('../simulation/twinleaf/agent33-rank29-camping-attackpair-target.cjs');
const {chooseActualCampingGearCard}=
  require('../simulation/twinleaf/agent12-native-campinggear-after-pass.cjs');
const G_AND_H='Guzma & Hala CEC';
const SPEED='Speed Lightning Energy RCL';
const card=fullName=>({fullName});
const deck=[card(THUNDER),card(G_AND_H),card(SPEED)];

function view({ownHand=[],energies=[],stadium=[],opponentStadium=[]}={}){
  return {decisionKind:'owner-prompt',ownHand,
    ownPublic:{active:{name:'Iron Thorns ex',energies},
      stadium},opponentPublic:{stadium:opponentStadium}};
}

class ChooseCardsPrompt{
  constructor(cards){this.cards={cards};}
  validate(cards){return cards.length===1&&
    this.cards.cards.includes(cards[0]);}
}

test('existing fixed DCE-first legacy selector overlooks Thunder if DCE held',()=>{
  const prompt=new ChooseCardsPrompt(deck);
  assert.equal(chooseActualCampingGearCard(prompt,{}).fullName,G_AND_H);
  const planned=chooseRank29TwoPieceCampingSearch(
    view({ownHand:[DCE,'Camping Gear BST']}),
    prompt.cards.cards,selected=>prompt.validate(selected));
  assert.equal(planned?.printing,THUNDER);
  assert.strictEqual(planned?.physical,deck[0]);
});

test('DCE already attached to active counts as public ready',()=>{
  const planned=chooseRank29TwoPieceCampingSearch(
    view({energies:[DCE]}),deck,()=>true);
  assert.equal(planned?.printing,THUNDER);
});

test('Thunder already public in play means seek DCE',()=>{
  const physical=[card(DCE),...deck];
  const planned=chooseRank29TwoPieceCampingSearch(
    view({stadium:[THUNDER]}),physical,()=>true);
  assert.equal(planned?.printing,DCE);
});

test('both missing prioritizes DCE while keeping later Thunder search possible',()=>{
  const physical=[card(DCE),...deck];
  const planned=chooseRank29TwoPieceCampingSearch(
    view(),physical,()=>true);
  assert.equal(planned?.printing,DCE);
});

test('a Prized/unavailable DCE redirects to the still present Thunder',()=>{
  const planned=chooseRank29TwoPieceCampingSearch(view(),deck,()=>true);
  assert.equal(planned?.printing,THUNDER);
});

test('native rejected prompt candidates cannot be selected',()=>{
  const planned=chooseRank29TwoPieceCampingSearch(
    view({ownHand:[DCE]}),deck,()=>false);
  assert.equal(planned,null);
});

test('complete own two-piece resources or wrong Active abstain',()=>{
  assert.equal(chooseRank29TwoPieceCampingSearch(
    view({ownHand:[DCE,THUNDER]}),deck,()=>true),null);
  const notThorns=view({ownHand:[DCE]});
  notThorns.ownPublic.active.name='Shadow Rider Calyrex V';
  assert.equal(chooseRank29TwoPieceCampingSearch(
    notThorns,deck,()=>true),null);
});

test('no early root access to owner search-deck contents',()=>{
  const notPrompt=view();
  notPrompt.decisionKind='owner-root';
  assert.throws(()=>chooseRank29TwoPieceCampingSearch(
    notPrompt,deck,()=>true),/owner-prompt/);
});
