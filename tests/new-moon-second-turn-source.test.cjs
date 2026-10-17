'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {sourceSecondTurn}=require('../simulation/twinleaf/new-moon-ace-night-watch.cjs');
test('source staged Cursed Blast self-KO grants a Prize and Ace Trainer compresses into random Night Watch',()=>{
  const result=sourceSecondTurn();
  assert.deepEqual(result.prizes,[6,5]);
  assert.equal(result.opponentHand,1);
  assert.equal(result.damage,200);
  assert.equal(result.usedGX,true);
});
