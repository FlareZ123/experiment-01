'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {createFullPhysicalDealObserver:createObserver}=
  require('../simulation/evaluation/full-physical-deal-fingerprint.cjs');

/** @param {string[]} cards */
const zone=cards=>({cards:cards.map(fullName=>({fullName,id:8}))});
const slot=(pokemon,energy=[])=>({
  ...zone([pokemon]),tools:[],energies:zone(energy)
});
function player(prefix) {
  return {
    hand:zone([prefix+'-own-hand']),
    deck:zone([prefix+'-first-deck',prefix+'-second-deck']),
    prizes:[zone([prefix+'-prize-0']),zone([prefix+'-prize-1'])],
    active:slot(prefix+'-active',[prefix+'-energy']),
    bench:[slot(prefix+'-bench')],
    discard:zone([]),lostzone:zone([]),stadium:zone([]),supporter:zone([])
  };
}
function fixture(){
  return {turn:1,phase:2,prompts:[],players:[player('A'),player('B')]};
}

test('captures first settled Store board after setup, never before',()=>{
  const state=fixture(),observer=createObserver();
  state.phase=1;
  observer.observe(state);
  assert.equal(observer.result(),null);
  state.phase=2;
  state.prompts.push({result:undefined});
  observer.observe(state);
  assert.equal(observer.result(),null);
  state.prompts.pop();
  observer.observe(state);
  const snapshot=observer.result();
  assert.match(snapshot.digestSha256,/^[0-9a-f]{64}$/);
  assert.equal(snapshot.schema,'initial-full-physical-deal-sha256-v1');
  assert.equal(JSON.stringify(snapshot).includes('A-own-hand'),false);
  assert.ok(Object.isFrozen(snapshot));
});

test('source OR candidate change changes full physical deal, including hidden prizes',()=>{
  const base=fixture();
  const reference=createObserver();
  reference.observe(base);
  for(const seat of [0,1]){
    const other=structuredClone(base);
    other.players[seat].prizes.reverse();
    const observer=createObserver();
    observer.observe(other);
    assert.notEqual(observer.result().digestSha256,
      reference.result().digestSha256);
  }
});

test('same physical deal under differing runtime object ids matches',()=>{
  const a=fixture(),b=structuredClone(a);
  b.players[0].deck.cards[0].id=888;
  b.players[1].prizes[1].cards[0].id=987;
  const x=createObserver(),y=createObserver();
  x.observe(a);
  y.observe(b);
  assert.equal(x.result().digestSha256,y.result().digestSha256);
});

test('first stable state digest remains fixed after game moves',()=>{
  const state=fixture(),observer=createObserver();
  observer.observe(state);
  const digest=observer.result().digestSha256;
  state.turn=6;
  state.players[0].hand.cards.reverse();
  state.players[1].deck.cards.reverse();
  observer.observe(state);
  assert.equal(observer.result().digestSha256,digest);
});

test('cannot silently digest a late first stable game root',()=>{
  const state=fixture(),observer=createObserver();
  state.turn=2;
  assert.throws(()=>observer.observe(state),/already past turn 1/);
});

test('postsetup mulligan compensation is part of the fingerprint',()=>{
  const base=fixture(),compensated=structuredClone(base);
  compensated.players[1].hand.cards.push({fullName:'source-bonus-draw',id:3});
  const x=createObserver(),y=createObserver();
  x.observe(base);
  y.observe(compensated);
  assert.notEqual(x.result().digestSha256,y.result().digestSha256);
});
