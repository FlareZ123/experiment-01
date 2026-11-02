'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {VERSION,withElectroRainPaperDamage}=require('../simulation/twinleaf/agent1-electro-rain-damage-hook.cjs');

test('reversible hook exposes explicit version and entrypoint',()=>{
  assert.equal(VERSION,'agent1-electro-rain-paper-damage-replacement-v1');
  assert.equal(typeof withElectroRainPaperDamage,'function');
});
