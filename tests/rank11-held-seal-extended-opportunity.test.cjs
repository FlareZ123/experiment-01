'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {extendedHeldSealOpportunity}=
  require('../simulation/twinleaf/rank11-held-seal-extended-opportunity.cjs');

/** @param {string|null} name @param {string[]} [tool] */
function slot(name,tool=[]) {
  return {getPokemonCard:()=>name&&{name},tools:tool.map(name=>({name}))};
}
/** @param {string[]} hand @param {string} [active] @param {object[]} [bench] */
function deal(hand,active='Mega Absol ex',bench=[]) {
  const player={hand:{cards:hand.map(name=>({name}))},
    active:slot(active),bench,usedVSTAR:false};
  Object.defineProperty(player,'deck',{get(){throw Error('K0 deck peek');}});
  Object.defineProperty(player,'prizes',{get(){throw Error('K0 Prize peek');}});
  return {state:{turn:1,activePlayer:0,phase:7},player};
}

test('held Seal can establish both held V and Trubbish when two slots remain',()=>{
  const {state,player}=deal(['Forest Seal Stone','Float Stone','Oranguru V','Trubbish']);
  const p=extendedHeldSealOpportunity(state,player,0,7);
  assert.deepEqual([p.vRoute,p.tRoute,p.requiredBenchPlaces,p.needsVip],
    ['hand','hand',2,false]);
});

test('owner VIP search can offer both source Basics without hidden-zone peek',()=>{
  const {state,player}=deal(['Forest Seal Stone','Muscle Band','Battle VIP Pass']);
  const p=extendedHeldSealOpportunity(state,player,0,7);
  assert.deepEqual([p.vRoute,p.tRoute,p.requiredBenchPlaces,p.needsVip],
    ['vip','vip',2,true]);
});

test('Bench fullness and a missing VIP prevent a planned resource line',()=>{
  const {state,player}=deal(['Forest Seal Stone','Float Stone','Battle VIP Pass']);
  player.bench=[slot('Garbodor'),slot('Crobat V',['Float Stone']),
    slot('Trubbish',['Muscle Band']),slot('Mega Absol ex'),
    slot('Oranguru V',['Muscle Band'])];
  assert.equal(extendedHeldSealOpportunity(state,player,0,7),null);
  player.bench=[];
  player.hand.cards=player.hand.cards.filter(card=>card.name!=='Battle VIP Pass');
  assert.equal(extendedHeldSealOpportunity(state,player,0,7),null);
});

test('owner-only K0 guard, already established V, and turn-two start',()=>{
  const {state,player}=deal(['Forest Seal Stone','Float Stone','Trubbish'],'Oranguru V');
  const p=extendedHeldSealOpportunity(state,player,0,7);
  assert.deepEqual([p.vRoute,p.tRoute],['active','hand']);
  player.hand.cards.push({name:'Garbodor'},{name:'Garbodor'});
  assert.equal(extendedHeldSealOpportunity(state,player,0,7),null);
  player.hand.cards.pop();player.hand.cards.pop();
  state.turn=2;state.activePlayer=1;
  assert.ok(extendedHeldSealOpportunity(state,player,1,7));
});
