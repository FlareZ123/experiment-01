'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { wouldSelfStrandShadowRider } =
  require('../simulation/twinleaf/guzma-self-switch-guard.cjs');

/** @param {string} name @param {string[]} energy */
function slot(name, energy = []) {
  return {getPokemonCard: () => ({name}),
    energies: {cards: energy.map(name => ({name}))}};
}

/** @returns {{state:object,player:object,action:object}} */
function fixture() {
  const player = {
    id: 101,
    hand: {cards: [{name:'Guzma'}]},
    active: slot('Shadow Rider Calyrex V',['Psychic Energy']),
    bench: [slot('Dialga-GX')]
  };
  return {
    state: {players: [player,
      {id:202,active:slot('Iron Thorns ex')}]},
    player,
    action: {type:'PLAY_CARD_ACTION',handIndex:0}
  };
}

test('rejects the exact powered Shadow Rider to sole unpowered Dialga line', () => {
  const {state,player,action} = fixture();
  assert.equal(wouldSelfStrandShadowRider(state,player,action),true);
});

test('non-matching Supporters, Bench states and opposing decks remain untouched', () => {
  const alterations = [
    ({player}) => { player.hand.cards[0].name = 'Iono'; },
    ({state}) => { state.players[1].active = slot('Regidrago V'); },
    ({player}) => { player.active = slot('Shadow Rider Calyrex V'); },
    ({player}) => { player.bench.push(slot('Tapu Lele-GX')); },
    ({player}) => { player.bench[0] = slot('Dialga-GX',['Metal Energy']); }
  ];
  for (const alter of alterations) {
    const f = fixture();
    alter(f);
    assert.equal(wouldSelfStrandShadowRider(f.state,f.player,f.action), false);
  }
  const f = fixture();
  assert.equal(wouldSelfStrandShadowRider(f.state,f.player,
    {type:'PASS_TURN'}),false);
});
