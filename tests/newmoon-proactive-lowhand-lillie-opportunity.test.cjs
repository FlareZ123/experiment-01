'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {lowHandLillieOpportunity}=
  require('../simulation/twinleaf/newmoon-garbotoxin-blower-autonomy.cjs');

function fixture() {
  const state={turn:2,activePlayer:1,phase:7,prompts:[]};
  const own={
    supporterTurn:0,
    hand:{cards:[
      {fullName:"Lillie's Determination M1L"},
      {fullName:'Psychic Energy SVE'}
    ]},
    prizes:Array.from({length:6},()=>({cards:[{name:'unrevealed'}]}))
  };
  return {state,own};
}

test('real own two-card hand, unspent Supporter and six Prizes qualifies',()=>{
  const {state,own}=fixture();
  assert.equal(lowHandLillieOpportunity(state,own,1,7),true);
});

test('a hand of three, no held Lillie, or no hand cannot qualify',()=>{
  const {state,own}=fixture();
  own.hand.cards.push({fullName:'Fog Crystal CRE'});
  assert.equal(lowHandLillieOpportunity(state,own,1,7),false);
  own.hand.cards=[{fullName:'Psychic Energy SVE'}];
  assert.equal(lowHandLillieOpportunity(state,own,1,7),false);
  own.hand.cards=[];
  assert.equal(lowHandLillieOpportunity(state,own,1,7),false);
});

test('a spent Supporter or fewer than six Prizes refuses',()=>{
  const {state,own}=fixture();
  own.supporterTurn=1;
  state.turn=9;
  assert.equal(lowHandLillieOpportunity(state,own,1,7),false,
    'supporterTurn is a per-turn used counter, not a global turn number');
  own.supporterTurn=0;
  own.prizes[0].cards=[];
  assert.equal(lowHandLillieOpportunity(state,own,1,7),false);
});

test('out-of-turn actions, wrong phase and pending prompts refuse',()=>{
  const {state,own}=fixture();
  assert.equal(lowHandLillieOpportunity(state,own,0,7),false);
  assert.equal(lowHandLillieOpportunity(state,own,1,8),false);
  state.prompts=[{result:undefined}];
  assert.equal(lowHandLillieOpportunity(state,own,1,7),false);
});


test('pinned turn-local Supporter counter stays legal across later global turns',()=>{
  const {state,own}=fixture();
  for(const turn of [1,2,5,9]){
    state.turn=turn;
    own.supporterTurn=0;
    assert.equal(lowHandLillieOpportunity(state,own,1,7),true,
      'No Supporter played this turn remains eligible on turn '+turn);
    own.supporterTurn=1;
    assert.equal(lowHandLillieOpportunity(state,own,1,7),false,
      'A spent Supporter prevents another even on global turn '+turn);
  }
});
