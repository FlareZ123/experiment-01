'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {ARVEN,chooseMailSelectedArven,chooseArvenSearch}=
  require('../../simulation/twinleaf/agent7/mail-arven-owner-choice.cjs');
const view=()=>({decisionKind:'owner-root',globalTurn:3,
  ownHand:["Trainers' Mail ROS",ARVEN,'Tropical Beach BWP 50'],
  ownTurnResources:{supporterPlayLocked:false,supporterPlayedTurn:0},
  ownPublic:{publicTurnRestrictions:{supporterPlayLocked:false}}});

test('actual receipt-backed Mail-selected Arven on later legal turn',()=>{
  assert.deepEqual(chooseMailSelectedArven(view(),[1]),{
    kind:'play-mail-selected-arven',handIndex:1,printing:ARVEN});
});
test('cannot assert an unselected held Arven',()=>{
  assert.equal(chooseMailSelectedArven(view(),[0]),null);
});
test('turn one, spent Supporter, and owner lock forbid line',()=>{
  const t=view();t.globalTurn=1;
  assert.equal(chooseMailSelectedArven(t,[1]),null);
  t.globalTurn=3;t.ownTurnResources.supporterPlayedTurn=3;
  assert.equal(chooseMailSelectedArven(t,[1]),null);
  t.ownTurnResources.supporterPlayedTurn=0;
  t.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;
  assert.equal(chooseMailSelectedArven(t,[1]),null);
});
test('genuine owner-deck search chooses validated physical Item and Tool',()=>{
  const item={name:'Nest Ball',trainerType:'ITEM'};
  const tool={name:'Float Stone',trainerType:'TOOL'};
  const owner={deck:{cards:[tool,item]}};
  const prompt={constructor:{name:'ChooseCardsPrompt'},cards:owner.deck,
    validate:cards=>cards.length===2&&cards.includes(item)&&cards.includes(tool)};
  assert.deepEqual(chooseArvenSearch(prompt,owner,
    {TrainerType:{ITEM:'ITEM',TOOL:'TOOL'}},{}),[item,tool]);
});
test('cannot search unrelated prompt zone',()=>{
  const owner={deck:{cards:[{name:'Nest Ball',trainerType:'ITEM'}]}};
  const p={constructor:{name:'ChooseCardsPrompt'},cards:{cards:owner.deck.cards},
    validate:()=>true};
  assert.equal(chooseArvenSearch(p,owner,
    {TrainerType:{ITEM:'ITEM',TOOL:'TOOL'}},{}),null);
});
test('search respects validation, one-category fallback and no guessing',()=>{
  const item={name:'Nest Ball',trainerType:'ITEM'};
  const owner={deck:{cards:[item]}};
  const p={constructor:{name:'ChooseCardsPrompt'},cards:owner.deck,
    validate:cards=>cards.length===1&&cards[0]===item};
  assert.deepEqual(chooseArvenSearch(p,owner,
    {TrainerType:{ITEM:'ITEM',TOOL:'TOOL'}},{}),[item]);
  p.validate=()=>false;
  assert.equal(chooseArvenSearch(p,owner,
    {TrainerType:{ITEM:'ITEM',TOOL:'TOOL'}},{}),null);
});
