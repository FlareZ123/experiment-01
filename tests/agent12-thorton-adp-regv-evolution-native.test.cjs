'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {probe}=
  require('../simulation/twinleaf/agent12-thorton-adp-regv-evolution-native.cjs');

for(const seat of [0,1]){
  for(const guarded of [false,true]){
    test('Pinned T2 Thorton ADP->RegV->VSTAR evolves with inherited turn; seat '+seat+' guard '+guarded,()=>{
      const r=probe(seat,guarded,1);
      console.log('NATIVE_THORTON_ADP_REGV_EVOLVE '+JSON.stringify(r));
      assert.equal(r.qualifiedGames,0);
      assert.equal(r.evolveError,null);
      assert.equal(r.swapped.active,'Regidrago V SIT');
      assert.equal(r.swapped.originalPlayedTurn,guarded?1:0);
      assert.equal(r.swapped.damage,guarded?40:0);
      assert.equal(r.swapped.adpInDiscard,true);
      assert.equal(r.swapped.regVOnBoard,true);
      assert.equal(r.swapped.supporterInDiscard,true);
      assert.equal(r.swapped.attachedEnergy.includes('Double Dragon Energy ROS'),guarded);
      assert.equal(r.after.vstarFromHand,true);
      assert.equal(r.after.vstarStillHeld,false);
      assert.equal(r.after.active,'Regidrago VSTAR SIT');
      assert.equal(r.after.attachedEnergy.includes('Double Dragon Energy ROS'),guarded);
    });
  }
}

for(const seat of [0,1]){
  test('Same-turn Active ADP Thorton inherits evolution lock; native raw false permission, seat '+seat,()=>{
    const raw=probe(seat,false,3);
    const fixed=probe(seat,true,3);
    console.log('NATIVE_THORTON_SAME_TURN_EVOLVE '+JSON.stringify({raw,fixed}));
    assert.equal(raw.swapped.originalPlayedTurn,0);
    assert.equal(raw.after.vstarFromHand,true);
    assert.equal(raw.evolveError,null);
    assert.equal(fixed.swapped.originalPlayedTurn,3);
    assert.ok(fixed.evolveError);
    assert.equal(fixed.after.vstarFromHand,false);
    assert.equal(fixed.after.vstarStillHeld,true);
    assert.equal(fixed.after.attachedEnergy.includes('Double Dragon Energy ROS'),true);
    assert.equal(fixed.qualifiedGames,0);
  });
}
