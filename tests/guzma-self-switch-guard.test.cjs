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

test('ordinary Supporters, other matchups and other Bench structures pass', () => {
  const {state,player,action} = fixture();
  for (const change of [
    () => {player.hand.cards[0].name='Iono';},
    () => {state.players[1].active=slot('Regidrago V');},
    () => {player.active=slot('Shadow Rider Calyrex V');},
    () => {player.bench.push(slot('Tapu Lele-GX'));},
    () => {player.bench[0]=slot('Dialga-GX',['Metal Energy']);}
  ]) {
    const f=fixture();
    const current=f.state, actor=f.player, move=f.action;
    if(change.toString().includes('player.hand')) actor.hand.cards[0].name='Iono';
    else if(change.toString().includes('state.players')) current.players[1].active=slot('Regidrago V');
    else if(change.toString().includes('player.active')) actor.active=slot('Shadow Rider Calyrex V');
    else if(change.toString().includes('player.bench.push')) actor.bench.push(slot('Tapu Lele-GX'));
    else actor.bench[0]=slot('Dialga-GX',['Metal Energy']);
    assert.equal(wouldSelfStrandShadowRider(current,actor,move),false);
  }
  assert.equal(wouldSelfStrandShadowRider(state,player,{type:'PASS_TURN'}),false);
});
