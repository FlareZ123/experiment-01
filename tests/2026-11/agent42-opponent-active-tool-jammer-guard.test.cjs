'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {opponentActiveToolJammerDisablesHood}=require('../../simulation/twinleaf/agent42-public-two-unit-paid-retreat-proposal-v2.cjs');

const JAMMER='Tool Jammer BST 136';

test('opponent Active Tool Jammer disables the planned Stealthy Hood line',()=>{
  assert.equal(opponentActiveToolJammerDisablesHood({
    opponentPublic:{active:{tools:[JAMMER]},bench:[]}
  }),true);
});

test('Tool Jammer on the opponent Bench does not disable Hood now',()=>{
  assert.equal(opponentActiveToolJammerDisablesHood({
    opponentPublic:{active:{tools:[]},bench:[{tools:[JAMMER]}]}
  }),false);
});

test('an empty opponent Active Tool list permits the modeled Hood line',()=>{
  assert.equal(opponentActiveToolJammerDisablesHood({
    opponentPublic:{active:{tools:[]},bench:[]}
  }),false);
});

test('missing or malformed Active Tool metadata fails closed',()=>{
  assert.equal(opponentActiveToolJammerDisablesHood({
    opponentPublic:{active:{},bench:[]}
  }),null);
  assert.equal(opponentActiveToolJammerDisablesHood({
    opponentPublic:{active:{tools:[null]},bench:[]}
  }),null);
  assert.equal(opponentActiveToolJammerDisablesHood({}),null);
});
