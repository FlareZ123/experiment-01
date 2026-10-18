'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {heldSealOpportunity} =
  require('../simulation/twinleaf/rank11-held-seal-opportunity.cjs');

/** @param {string|null} name @param {string[]} [tools] */
function slot(name, tools = []) {
  return {getPokemonCard: () => name && {name},
    tools:tools.map(tool => ({name:tool}))};
}
/** @param {'bench'|'hand'|'vip'} [route] @returns {object} */
function stateAndPlayer(route = 'bench') {
  const hand = [{name:'Forest Seal Stone'}, {name:'Float Stone'}];
  if (route === 'hand') hand.push({name:'Trubbish'});
  if (route === 'vip') hand.push({name:'Battle VIP Pass'});
  const player = {hand:{cards:hand},active:slot('Oranguru V'),
    bench:route==='bench'?[slot('Trubbish')]:[],usedVSTAR:false};
  Object.defineProperty(player,'deck',{get(){throw Error('K0 deck peek');}});
  Object.defineProperty(player,'prizes',{get(){throw Error('K0 Prize peek');}});
  return {state:{turn:1,activePlayer:0,phase:7},player};
}

test('held-Seal is disjoint from held Boost Shake and needs a separate Tool',()=>{
  const {state,player}=stateAndPlayer();
  const value={route:'bench',tool:'Float Stone',vTarget:{slot:'active',index:0}};
  assert.deepEqual(heldSealOpportunity(state,player,0,7),value);
  player.hand.cards.push({name:'Boost Shake'});
  assert.equal(heldSealOpportunity(state,player,0,7),null);
  player.hand.cards.pop();
  player.hand.cards.pop();
  assert.equal(heldSealOpportunity(state,player,0,7),null);
  player.hand.cards.push({name:'Forest Seal Stone'});
  assert.deepEqual(heldSealOpportunity(state,player,0,7),
    {...value,tool:'Forest Seal Stone'});
});

test('supports three Trubbish acquisition routes and independent Tools',()=>{
  for (const route of ['bench','hand','vip']) {
    const {state,player}=stateAndPlayer(route);
    assert.equal(heldSealOpportunity(state,player,0,7)?.route,route);
  }
  const {state,player}=stateAndPlayer();
  player.hand.cards[1]={name:'Muscle Band'};
  assert.equal(heldSealOpportunity(state,player,0,7).tool,'Muscle Band');
  player.hand.cards.push({name:'Float Stone'});
  assert.equal(heldSealOpportunity(state,player,0,7).tool,'Muscle Band');
});

test('requires Tool-free own V Active or on Bench',()=>{
  const {state,player}=stateAndPlayer();
  player.active=slot('Mega Absol ex');
  assert.equal(heldSealOpportunity(state,player,0,7),null);
  player.bench.push(slot('Crobat V'));
  assert.deepEqual(heldSealOpportunity(state,player,0,7).vTarget,
    {slot:'bench',index:1});
  player.bench[1]=slot('Crobat V',['Muscle Band']);
  assert.equal(heldSealOpportunity(state,player,0,7),null);
});

test('K0 access guard and true first-own-turn only',()=>{
  const {state,player}=stateAndPlayer();
  player.hand.cards.push({name:'Garbodor'}, {name:'Garbodor'});
  assert.ok(heldSealOpportunity(state,player,0,7));
  assert.equal(heldSealOpportunity(state,player,0,7,true),null);
  player.hand.cards.pop();
  assert.ok(heldSealOpportunity(state,player,0,7,true));
  player.usedVSTAR=true;
  assert.equal(heldSealOpportunity(state,player,0,7),null);
  player.usedVSTAR=false;
  state.turn=2;state.activePlayer=1;
  assert.ok(heldSealOpportunity(state,player,1,7));
  state.turn=3;
  assert.equal(heldSealOpportunity(state,player,1,7),null);
  state.turn=2;state.phase=4;
  assert.equal(heldSealOpportunity(state,player,1,7),null);
});

test('filled Bench with only equipped Trubbish rejects unavailable route',()=>{
  const {state,player}=stateAndPlayer('hand');
  player.bench=[slot('Crobat V'),slot('Mega Absol ex'),slot('Trubbish',['Float Stone']),
    slot('Trubbish',['Float Stone']),slot('Crobat V')];
  assert.equal(heldSealOpportunity(state,player,0,7),null);
});
