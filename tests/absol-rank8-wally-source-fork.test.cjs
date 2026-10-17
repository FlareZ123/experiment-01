'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {sourceWallyIndex}=
  require('../simulation/twinleaf/absol-rank8-wally-source-fork.cjs');

class PassTurnAction {}
class PlayCardAction {}

/** @returns {object} */
function fakeState() {
  return {
    turn:2,activePlayer:0,prompts:[],
    players:[
      {id:101,bench:[
        {getPokemonCard:()=>({name:'Trubbish',fullName:'Trubbish PAR'})}
      ],hand:{cards:[
        {fullName:'Dark Patch ASR'},{fullName:'Wally ROS'}
      ]}},
      {id:202}
    ]
  };
}

test('Wally source replacement requires the true rank8 proposed Pass',()=>{
  assert.equal(sourceWallyIndex(fakeState(),101,new PassTurnAction()),1);
  assert.equal(sourceWallyIndex(fakeState(),101,new PlayCardAction()),-1);
});

test('turn, actor, pending prompt and actual Trubbish are source-locked',()=>{
  for(const mutate of [
    s=>{s.turn=4;},
    s=>{s.activePlayer=1;},
    s=>{s.prompts.push({result:undefined});},
    s=>{s.players[0].bench=[];},
    s=>{s.players[0].hand.cards.pop();}
  ]) {
    const state=fakeState();
    mutate(state);
    assert.equal(sourceWallyIndex(state,101,new PassTurnAction()),-1);
  }
  assert.equal(sourceWallyIndex(fakeState(),202,new PassTurnAction()),-1);
});

test('the decision observer never opens opponent hidden hand, deck or prizes',()=>{
  const state=fakeState();
  for(const field of ['hand','deck','prizes']) {
    Object.defineProperty(state.players[1],field,{
      get(){throw new Error('Read opponent hidden '+field);}
    });
  }
  assert.equal(sourceWallyIndex(state,101,new PassTurnAction()),1);
});
