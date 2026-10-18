'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {openingOpportunity} =
  require('../simulation/twinleaf/rank11-autonomous-opener.cjs');

/** @param {string} name */
function pokemon(name) {
  return {name, fullName: name};
}

/** @param {string|null} name @param {string[]} [tools] */
function slot(name, tools = []) {
  return {
    getPokemonCard() { return name ? pokemon(name) : null; },
    tools: tools.map(tool => ({name: tool}))
  };
}

/** @returns {{state:object,player:object}} */
function sourceDeal() {
  const player = {
    usedVSTAR: false,
    active: slot('Oranguru V'),
    bench: [slot('Crobat V')],
    hand: {cards: [
      {name:'Battle VIP Pass'}, {name:'Float Stone'}, {name:'Float Stone'},
      {name:'Quick Ball'}, {name:'Secret Box'}
    ]}
  };
  return {state: {turn:1, activePlayer:0, phase:7}, player};
}

test('source first turn recognizes own-hand and public-board opportunity', () => {
  const {state, player} = sourceDeal();
  Object.defineProperty(player, 'deck', {
    get() { throw new Error('K0 deck illegally accessed'); }
  });
  Object.defineProperty(player, 'prizes', {
    get() { throw new Error('face-down prizes illegally accessed'); }
  });
  assert.equal(openingOpportunity(state, player, 0, 7), true);
  state.activePlayer = 1;
  assert.equal(openingOpportunity(state, player, 1, 7), true,
    'physical B can also qualify when it actually starts first');
});

test('opportunity fails closed on turn, phase, opponent seat and Tool constraints', () => {
  const check = change => {
    const {state, player} = sourceDeal();
    change(state, player);
    assert.equal(openingOpportunity(state, player, 0, 7), false);
  };
  check(state => {state.turn = 2;});
  check(state => {state.activePlayer = 1;});
  check(state => {state.phase = 3;});
  check((state, player) => {player.usedVSTAR = true;});
  check((state, player) => {player.active = slot('Oranguru V', ['Float Stone']);});
  check((state, player) => {player.active = slot('Mega Absol ex');});
  check((state, player) => {player.bench.push(slot('Trubbish'));});
  check((state, player) => {player.bench = Array.from({length:5}, () => slot('Crobat V'));});
});

test('opportunity never presumes hidden search targets or hijacks a held shortcut', () => {
  const check = change => {
    const {state, player} = sourceDeal();
    change(player);
    assert.equal(openingOpportunity(state, player, 0, 7), false);
  };
  check(player => {player.hand.cards = player.hand.cards.filter(c =>
    c.name !== 'Battle VIP Pass');});
  check(player => {player.hand.cards = player.hand.cards.filter(c =>
    c.name !== 'Float Stone');});
  check(player => {player.hand.cards.push({name:'Forest Seal Stone'});});
  check(player => {player.hand.cards.push({name:'Boost Shake'});});
});


test('explicit v2 recognizes the acting source own first turn when it goes second', () => {
  const {state, player}=sourceDeal();
  state.turn=2;
  state.activePlayer=1;
  assert.equal(openingOpportunity(state, player, 1, 7), false,
    'Original first-global-turn profile must remain unchanged');
  assert.equal(openingOpportunity(state, player, 1, 7, true), true);
  state.activePlayer=0;
  assert.equal(openingOpportunity(state, player, 1, 7, true), false);
  state.turn=3;
  state.activePlayer=1;
  assert.equal(openingOpportunity(state, player, 1, 7, true), false,
    'Subsequent turns must not be confused with first personal turn');
});
