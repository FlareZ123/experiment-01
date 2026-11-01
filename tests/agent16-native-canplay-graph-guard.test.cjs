'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {probeNativeCanPlayGraphReadonly}=
  require('../simulation/twinleaf/agent16-native-canplay-graph-guard.cjs');

/** Build a minimal genuine-shaped Store with separate owner-private zones. */
function fixture(seat=0,canPlay=()=>true){
  const card={fullName:'Team Flare Grunt XY',canPlay};
  const players=[
    {hand:{cards:[]},prizes:{cards:['A']},supporterTurn:0},
    {hand:{cards:[]},prizes:{cards:['B']},supporterTurn:0}
  ];
  players[seat].hand.cards.push(card);
  players[1-seat].hand.cards.push({fullName:'Concealed Opponent Card'});
  const state={activePlayer:seat,turn:3,players,logs:[]};
  return {card,store:{state,promptItems:[],waitItems:[]},
    state,owner:players[seat],opponent:players[1-seat]};
}

test('native canPlay true without mutation certifies exact Store graph for both seats',()=>{
  for(const seat of [0,1]){
    const f=fixture(seat);
    const receipt=probeNativeCanPlayGraphReadonly(
      f.card,f.store,f.state,f.owner);
    assert.equal(receipt.nativePlayable,true);
    assert.equal(receipt.nativeError,null);
    assert.equal(receipt.graphReadonlyVerified,true);
    assert.ok(receipt.graphSchema.startsWith('live-store-own-data'));
    assert.ok(receipt.limitations.some(s=>s.includes('function lexical')));
  }
});

test('negative native canPlay stays a negative without changing the live Store',()=>{
  const f=fixture(0,()=>false);
  const result=probeNativeCanPlayGraphReadonly(
    f.card,f.store,f.state,f.owner);
  assert.equal(result.nativePlayable,false);
  assert.equal(result.graphReadonlyVerified,true);
});

test('native canPlay exception is retained when Store remains unchanged',()=>{
  const f=fixture(0,()=>{throw Error('card rejected by pinned validator');});
  const result=probeNativeCanPlayGraphReadonly(
    f.card,f.store,f.state,f.owner);
  assert.equal(result.nativePlayable,null);
  assert.match(result.nativeError,/card rejected/);
  assert.equal(result.graphReadonlyVerified,true);
});

test('mutating an opponent concealed hand is detected beyond owner observation',()=>{
  const f=fixture(0,(_store,state)=>
    {state.players[1].hand.cards[0].fullName='Secret mutated';return true;});
  assert.throws(()=>probeNativeCanPlayGraphReadonly(
    f.card,f.store,f.state,f.owner),/mutated Store own-data graph/);
});

test('mutation followed by thrown native exception still fails closed',()=>{
  const f=fixture(1,(_store,state)=>{
    state.players[0].prizes.cards[0]='Mutated hidden Prize';
    throw Error('native call failed');
  });
  assert.throws(()=>probeNativeCanPlayGraphReadonly(
    f.card,f.store,f.state,f.owner),/mutated Store own-data graph/);
});

test('mutating non-acting Player quota is detected',()=>{
  const f=fixture(0,(_store,state)=>{
    state.players[1].supporterTurn=2;
    return false;
  });
  assert.throws(()=>probeNativeCanPlayGraphReadonly(
    f.card,f.store,f.state,f.owner),/mutated Store own-data graph/);
});

test('a card from the opposing hand cannot be probed as acting owner',()=>{
  const f=fixture(0);
  assert.throws(()=>probeNativeCanPlayGraphReadonly(
    f.opponent.hand.cards[0],f.store,f.state,f.owner),
  /typeof card.canPlay|physically present card/);
});
