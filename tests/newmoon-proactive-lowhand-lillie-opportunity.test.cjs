'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {lowHandLillieOpportunity}=
  require('../simulation/twinleaf/newmoon-garbotoxin-blower-autonomy.cjs');

function fixture() {
  const state={turn:2,activePlayer:1,phase:7,prompts:[]};
  const own={
    supporterTurn:1,
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
  own.supporterTurn=state.turn;
  assert.equal(lowHandLillieOpportunity(state,own,1,7),false);
  own.supporterTurn=1;
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
