'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {label}=require('../simulation/evaluation/agent1-frozen-row-audit.cjs');
test('native terminal and action cap differ',()=>{
 assert.equal(label({finished:true,endReason:'engine-game-end',winner:0}),'NATIVE_TERMINAL');
 assert.equal(label({finished:false,endReason:'action-limit'}),'ACTION_CAPPED');
 assert.equal(label({finished:true,endReason:'engine-game-end',winner:null}),'FINISHED_WINNER_UNVERIFIED');
});
