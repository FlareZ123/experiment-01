'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseTurn2PrimeCatcher}=require(
  '../simulation/twinleaf/rank10-v4-turn2-prime-catcher-fork.cjs'
);

class PlayCardAction {
  /** @param {number} handIndex */
  constructor(handIndex){this.handIndex=handIndex;}
}

/** @returns {object} */
function fakeState(){
  return {
    turn:2,activePlayer:0,phase:2,prompts:[],
    players:[
      {
        id:101,
        active:{getPokemonCard:()=>({fullName:'Regidrago V SIT'})},
        hand:{cards:[
          {fullName:'Double Dragon Energy ROS'},
          {fullName:'Prime Catcher TEF'}
        ]}
      },
      {id:202}
    ]
  };
}

test('substitutes Prime Catcher only for a proposed DDE attachment',()=>{
  const state=fakeState();
  assert.deepEqual(chooseTurn2PrimeCatcher(state,101,new PlayCardAction(0)),{
    handIndex:1,target:{player:0,slot:0,index:0}
  });
  assert.equal(chooseTurn2PrimeCatcher(state,101,new PlayCardAction(1)),null);
});

test('blocks wrong turn, acting seat, pending prompt and absent ACE SPEC',()=>{
  for(const mutate of [
    state=>{state.turn=4;},
    state=>{state.activePlayer=1;},
    state=>{state.prompts.push({result:undefined});},
    state=>{state.players[0].hand.cards.pop();},
    state=>{state.players[0].active.getPokemonCard=()=>({fullName:'Budew ASC'});}
  ]){
    const state=fakeState();
    mutate(state);
    assert.equal(chooseTurn2PrimeCatcher(state,101,new PlayCardAction(0)),null);
  }
  assert.equal(chooseTurn2PrimeCatcher(fakeState(),202,new PlayCardAction(0)),null);
});

test('does not read opponent hidden cards or prizes',()=>{
  const state=fakeState();
  for(const property of ['hand','deck','prizes']){
    Object.defineProperty(state.players[1],property,{
      get(){throw Error('Opponent hidden information accessed');}
    });
  }
  assert.equal(chooseTurn2PrimeCatcher(state,101,new PlayCardAction(0)).handIndex,1);
});
