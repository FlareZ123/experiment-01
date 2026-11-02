'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {run}=require('../simulation/twinleaf/agent12-mew-genesect-nextturn-native.cjs');

test('genuine printed source Mew VMAX copying Genesect Techno Blast imposes and releases cooldown on both seats',()=>{
  const result=run();
  assert.equal(result.arms.length,2);
  assert.deepEqual(result.arms.map(a=>a.attackerSeat),[0,1]);
  for(const a of result.arms){
    assert.equal(a.recordedFirstPrintedCopiedAttack,true);
    assert.equal(a.nextOwnerTurn.globalTurn,7);
    assert.equal(a.nextOwnerTurn.attackerActive,'Mew VMAX FST');
    assert.equal(a.nextOwnerTurn.applied,true,
      'Copied Techno Blast must lock the real Mew VMAX next own turn');
    assert.equal(a.nextTurnIllegalAttackRejected,true,
      'Native Store must reject a repeated attack on next own turn');
    assert.equal(a.afterReject.globalTurn,7);
    assert.equal(a.subsequentOwnerTurn.globalTurn,9);
    assert.equal(a.subsequentOwnerTurn.applied,false,
      'Temporary attack lock must expire after one own turn');
    assert.equal(a.subsequentAttackLegal,true,
      'Source copy must attack again on a subsequent allowed turn');
    assert.equal(a.competitivelyQualifiedGames,0);
  }
  assert.equal(result.rank5PrintedCooldownCorrectBothSeats,true);
  assert.equal(result.competitivelyQualifiedGames,0);
});
