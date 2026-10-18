'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {directBoostShakeOpportunity, TOOLS} =
  require('../simulation/twinleaf/rank11-direct-opportunity.cjs');

/** @param {string|null} name @param {string[]} [tools] */
function slot(name, tools = []) {
  return {getPokemonCard: () => name && {name},
    tools:tools.map(item => ({name:item}))};
}
function deal(route = 'vip') {
  const hand = [{name:'Boost Shake'}, {name:'Muscle Band'}];
  const bench = [slot('Crobat V')];
  if (route === 'bench') bench.push(slot('Trubbish'));
  if (route === 'hand') hand.push({name:'Trubbish'});
  if (route === 'vip') hand.push({name:'Battle VIP Pass'});
  const player = {hand:{cards:hand},bench};
  Object.defineProperty(player,'deck',{get(){throw new Error('K0 deck peek');}});
  Object.defineProperty(player,'prizes',{get(){throw new Error('Prize peek');}});
  return {state:{turn:1,activePlayer:0,phase:7},player};
}

test('direct rank11 predicate selects each paper-visible route', () => {
  for (const route of ['bench','hand','vip']) {
    const {state,player}=deal(route);
    assert.deepEqual(directBoostShakeOpportunity(state,player,0,7),
      {route,tool:'Muscle Band'});
  }
});

test('any of the three source Tools suffices, with fixed declared priority', () => {
  assert.deepEqual(TOOLS,['Muscle Band','Float Stone','Forest Seal Stone']);
  for (const name of TOOLS) {
    const {state,player}=deal('bench');
    player.hand.cards[1]={name};
    assert.deepEqual(directBoostShakeOpportunity(state,player,0,7),
      {route:'bench',tool:name});
  }
  const {state,player}=deal('bench');
  player.hand.cards.push({name:'Float Stone'});
  assert.equal(directBoostShakeOpportunity(state,player,0,7).tool,'Muscle Band');
});

test('source held route avoids unavailable cards and Bench positions', () => {
  for (const edit of [
    p => p.hand.cards.shift(),
    p => p.hand.cards.splice(1,1),
    p => p.bench.splice(1,1),
    p => {p.bench[1]=slot('Trubbish',['Float Stone']);},
    p => {p.bench=[slot('Crobat V'),slot('Darkrai V'),
      slot('Zoroark V'),slot('Regidrago V'),slot('Galarian Moltres V')];}
  ]) {
    const {state,player}=deal('bench');
    edit(player);
    assert.equal(directBoostShakeOpportunity(state,player,0,7),null);
  }
});

test('legal first personal turn accepts actual second, rejects later turns', () => {
  const {state,player}=deal('hand');
  state.turn=2;
  state.activePlayer=1;
  assert.deepEqual(directBoostShakeOpportunity(state,player,1,7),
    {route:'hand',tool:'Muscle Band'});
  state.turn=3;
  assert.equal(directBoostShakeOpportunity(state,player,1,7),null);
  state.turn=1;
  state.phase=5;
  assert.equal(directBoostShakeOpportunity(state,player,1,7),null);
  state.phase=7;
  state.activePlayer=0;
  assert.equal(directBoostShakeOpportunity(state,player,1,7),null);
});

test('hand Basic outranks VIP, while existing Bench Trubbish outranks both', () => {
  const {state,player}=deal('vip');
  player.hand.cards.push({name:'Trubbish'});
  assert.equal(directBoostShakeOpportunity(state,player,0,7).route,'hand');
  player.bench.push(slot('Trubbish'));
  assert.equal(directBoostShakeOpportunity(state,player,0,7).route,'bench');
});
