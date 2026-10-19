'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {eligiblePassFarewell}=require(
  '../simulation/twinleaf/newmoon-rank6-farewell-counterfactual.cjs');

const slot=(fullName,attached=false)=>({
  getPokemonCard:()=>fullName?{fullName}:null,
  tools:attached?[{}]:[],
  energies:{cards:attached?[{}]:[]}
});
const own={
  deck:{cards:[{},{}]},
  bench:[slot('Unown AOR'),slot('Latias ex SSP'),slot(null)]
};

test('the post-Pass Farewell predicate is owner-Bench and public-turn limited',()=>{
  assert.equal(eligiblePassFarewell({
    activePlayer:0,turn:3,prompts:[]
  },own,3,0),0);
  assert.equal(eligiblePassFarewell({
    activePlayer:1,turn:3,prompts:[]
  },own,3,0),-1);
  assert.equal(eligiblePassFarewell({
    activePlayer:0,turn:2,prompts:[]
  },own,3,0),-1);
  assert.equal(eligiblePassFarewell({
    activePlayer:0,turn:3,prompts:[{result:undefined}]
  },own,3,0),-1);
});

test('does not draw from empty deck or sacrifice an attached Unown',()=>{
  assert.equal(eligiblePassFarewell({
    activePlayer:0,turn:3,prompts:[]
  },{...own,deck:{cards:[]}},3,0),-1);
  assert.equal(eligiblePassFarewell({
    activePlayer:0,turn:3,prompts:[]
  },{...own,bench:[slot('Unown AOR',true),slot('Latias ex SSP')]},3,0),-1);
});
