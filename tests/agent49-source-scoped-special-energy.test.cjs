'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {actorSpecialEnergyEnabled}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

test('global opt-in preserves original both-seat behavior',()=>{
  assert.equal(actorSpecialEnergyEnabled(true,null,0),true);
  assert.equal(actorSpecialEnergyEnabled(true,null,1),true);
  assert.equal(actorSpecialEnergyEnabled(false,null,0),false);
  assert.equal(actorSpecialEnergyEnabled(false,null,1),false);
});

test('source-only option cannot enable a candidate seat',()=>{
  assert.equal(actorSpecialEnergyEnabled(true,0,0),true);
  assert.equal(actorSpecialEnergyEnabled(true,0,1),false);
  assert.equal(actorSpecialEnergyEnabled(true,1,0),false);
  assert.equal(actorSpecialEnergyEnabled(true,1,1),true);
  assert.equal(actorSpecialEnergyEnabled(false,0,0),false);
});

test('a nonsensical root owner seat is rejected',()=>{
  assert.throws(()=>actorSpecialEnergyEnabled(true,2,0));
  assert.throws(()=>actorSpecialEnergyEnabled(true,0,-1));
});
