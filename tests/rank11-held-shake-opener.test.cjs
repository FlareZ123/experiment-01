'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {heldShakeOpportunity, TOOLS} =
  require('../simulation/twinleaf/rank11-held-shake-opener.cjs');

/** @param {string|null} name @param {string[]} [tools] */
function slot(name, tools = []) {
  return {getPokemonCard: () => name ? {name} : null,
    tools: tools.map(item => ({name: item}))};
}
/** @param {string[]} names */
function caseFromHand(names) {
  return {
    state: {turn: 1, activePlayer: 0, phase: 7},
    player: {active: slot('Mega Absol ex'), bench: [slot('Crobat V')],
      hand: {cards: names.map(name => ({name}))}}
  };
}

test('recognizes actual first personal turn in either physical seat', () => {
  const {state, player} = caseFromHand([
    'Battle VIP Pass', 'Boost Shake', 'Muscle Band']);
  Object.defineProperty(player, 'deck', {get() {
    throw new Error('K0 attempted to inspect source hidden deck');
  }});
  Object.defineProperty(player, 'prizes', {get() {
    throw new Error('K0 attempted to inspect own face-down Prizes');
  }});
  Object.defineProperty(state, 'opponent', {get() {
    throw new Error('K0 attempted to inspect opponent hidden information');
  }});
  assert.equal(heldShakeOpportunity(state, player, 0, 7), true);
  state.turn = 2;
  state.activePlayer = 1;
  assert.equal(heldShakeOpportunity(state, player, 1, 7), true);
  assert.equal(heldShakeOpportunity(state, player, 0, 7), false);
  state.turn = 3;
  assert.equal(heldShakeOpportunity(state, player, 1, 7), false);
});

test('each source Tool printing qualifies, including non-V Forest Seal Stone', () => {
  assert.deepEqual(TOOLS, ['Float Stone', 'Muscle Band', 'Forest Seal Stone']);
  for (const tool of TOOLS) {
    const {state, player} =
      caseFromHand(['Battle VIP Pass', 'Boost Shake', tool]);
    assert.equal(heldShakeOpportunity(state, player, 0, 7), true, tool);
  }
});

test('rejects absent paid resources and constrained turn/bench', () => {
  const original = ['Battle VIP Pass', 'Boost Shake', 'Float Stone'];
  for (const removed of original) {
    const {state, player} =
      caseFromHand(original.filter(name => name !== removed));
    assert.equal(heldShakeOpportunity(state, player, 0, 7), false, removed);
  }
  const cases = [
    (s, p) => {s.phase = 3;},
    (s, p) => {s.activePlayer = 1;},
    (s, p) => {s.turn = 4;},
    (s, p) => {p.bench.push(slot('Trubbish'));},
    (s, p) => {p.bench = Array.from({length: 5}, () => slot('Crobat V'));}
  ];
  for (const change of cases) {
    const {state, player} = caseFromHand(original);
    change(state, player);
    assert.equal(heldShakeOpportunity(state, player, 0, 7), false);
  }
});

test('v2 K0 guard rejects both held Garbodor without inspecting hidden zones', () => {
  const {state, player} = caseFromHand([
    'Battle VIP Pass', 'Boost Shake', 'Float Stone',
    'Garbodor', 'Garbodor'
  ]);
  Object.defineProperty(player, 'deck', {get() {
    throw new Error('K0 guard illegally inspected deck');
  }});
  Object.defineProperty(player, 'prizes', {get() {
    throw new Error('K0 guard illegally inspected prizes');
  }});
  assert.equal(heldShakeOpportunity(state, player, 0, 7), true);
  assert.equal(heldShakeOpportunity(state, player, 0, 7, true), false);
  player.hand.cards.pop();
  assert.equal(heldShakeOpportunity(state, player, 0, 7, true), true);
});
