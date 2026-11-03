'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {probeSwap}=
  require('../simulation/twinleaf/agent12-thorton-regv-active-native.cjs');

for(const seat of [0,1]){
  test('Pinned raw Thorton Basic swap loses DDE (paper-invalid evidence), seat '+seat,()=>{
    const r=probeSwap(seat,'basic');
    console.log('NATIVE_THORTON_RAW_BASIC '+JSON.stringify(r));
    assert.equal(r.qualifiedPaperGame,false);
    assert.equal(r.playError,null);
    assert.equal(r.targetChoice.validatorAccepted,true);
    assert.equal(r.cardChoice.validatorAccepted,true);
    assert.equal(r.after.adpActive,true);
    assert.equal(r.after.regVInDiscard,true);
    assert.equal(r.after.ddeRemains,false);
    assert.ok(r.after.discard.includes('Double Dragon Energy ROS'));
  });

  test('Reversible paper hook retains DDE, RegV discard, Thorton discard, seat '+seat,()=>{
    const r=probeSwap(seat,'basic',true);
    console.log('NATIVE_THORTON_GUARDED_BASIC '+JSON.stringify(r));
    assert.equal(r.guarded,true);
    assert.equal(r.qualifiedPaperGame,false);
    assert.equal(r.playError,null);
    assert.equal(r.targetChoice.validatorAccepted,true);
    assert.equal(r.targetChoice.error,null);
    assert.equal(r.cardChoice.validatorAccepted,true);
    assert.equal(r.cardChoice.error,null);
    assert.equal(r.after.adpActive,true);
    assert.equal(r.after.regVInDiscard,true);
    assert.equal(r.after.ddeRemains,true);
    assert.equal(r.after.thortonInDiscard,true);
    assert.equal(r.after.thortonInSupporter,false);
    assert.equal(r.after.discard.includes('Double Dragon Energy ROS'),false);
  });

  test('Pinned raw Thorton wrongly accepts evolved Active target, seat '+seat,()=>{
    const r=probeSwap(seat,'evolved');
    console.log('NATIVE_THORTON_RAW_EVOLVED '+JSON.stringify(r));
    assert.equal(r.paperTargetAllowed,false);
    assert.equal(r.qualifiedPaperGame,false);
    assert.equal(r.targetChoice.validatorAccepted,true);
    assert.equal(r.after.adpActive,true);
    assert.equal(r.after.activeCards.includes('Regidrago VSTAR SIT'),true);
    assert.equal(r.after.regVInDiscard,true);
  });

  test('Reversible paper hook rejects evolved Active target, seat '+seat,()=>{
    const r=probeSwap(seat,'evolved',true);
    console.log('NATIVE_THORTON_GUARDED_EVOLVED '+JSON.stringify(r));
    assert.equal(r.guarded,true);
    assert.equal(r.paperTargetAllowed,false);
    assert.equal(r.qualifiedPaperGame,false);
    assert.ok(r.targetChoice.error ||
      r.targetChoice.validatorAccepted===false);
    assert.equal(r.after.adpActive,false);
    assert.equal(r.after.regVInDiscard,false);
    assert.equal(r.after.active,'Regidrago VSTAR SIT');
  });
}
