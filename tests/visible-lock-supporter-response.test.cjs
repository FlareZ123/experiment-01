'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {heldLillieResponseIndex}=
  require('../simulation/twinleaf/visible-lock-supporter-response.cjs');

const hand=[{name:'Thunder Mountain Prism Star'},
  {name:'Double Colorless Energy'},
  {name:"Lillie's Determination"}];

test('finds only the held Lillie after a prohibited card proposal',()=>{
  assert.equal(heldLillieResponseIndex({
    supporterTurn:0,cannotPlaySupporterCards:false,hand:{cards:hand}
  },3),2);
});

test('does not propose a second Supporter during the same turn',()=>{
  assert.equal(heldLillieResponseIndex({
    supporterTurn:1,hand:{cards:hand}
  },3),-1);
});

test('obeys an active Supporter lock',()=>{
  assert.equal(heldLillieResponseIndex({
    cannotPlaySupporterCards:true,hand:{cards:hand}
  },3),-1);
});

test('cannot invent a Supporter absent from the actors hand',()=>{
  assert.equal(heldLillieResponseIndex({
    supporterTurn:0,hand:{cards:hand.slice(0,2)}
  },3),-1);
});
