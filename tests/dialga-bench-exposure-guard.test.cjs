'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { wouldExposeDialgaToGust } =
  require('../simulation/twinleaf/dialga-bench-exposure-guard.cjs');

/** @param {string} name */
function slot(name) {
  return {getPokemonCard:() => name ? {name} : null};
}
function fixture() {
  const player = {
    id:101,hand:{cards:[{name:'Dialga-GX'}]},
    active:slot('Shadow Rider Calyrex V'),
    bench:[slot(null),slot(null)]
  };
  return {
    state:{players:[player,{id:202,active:slot('Iron Thorns ex')}]},
    player,action:{type:'PLAY_CARD_ACTION',handIndex:0}
  };
}
test('unpowered sole gust payload is deferred in source rank-6 context', () => {
  const f=fixture();
  assert.equal(wouldExposeDialgaToGust(f.state,f.player,f.action),true);
});
test('other cards, established Bench and other matchups stay available', () => {
  const mutations=[
    f=>{f.player.hand.cards[0].name='Shadow Rider Calyrex V';},
    f=>{f.player.active=slot('Radiant Eternatus');},
    f=>{f.player.bench[0]=slot('Mimikyu');},
    f=>{f.state.players[1].active=slot('Regidrago V');}
  ];
  for(const change of mutations) {
    const f=fixture();
    change(f);
    assert.equal(wouldExposeDialgaToGust(f.state,f.player,f.action),false);
  }
  const f=fixture();
  assert.equal(wouldExposeDialgaToGust(f.state,f.player,{type:'PASS_TURN'}),false);
});
