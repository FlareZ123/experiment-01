'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {probeSwap}=
  require('../simulation/twinleaf/agent12-thorton-regv-active-native.cjs');

for(const seat of [0,1]){
  test('Native Thorton swaps Active Regidrago V into discard, preserves Double Dragon, seat '+seat,()=>{
    const r=probeSwap(seat,'basic');
    console.log('NATIVE_THORTON_REGV_BASIC '+JSON.stringify(r));
    assert.equal(r.constructedState,true);
    assert.equal(r.qualifiedPaperGame,false);
    assert.equal(r.playError,null);
    assert.equal(r.paperTargetAllowed,true);
    assert.equal(r.targetPromptFound,true);
    assert.equal(r.cardPromptFound,true);
    assert.equal(r.targetChoice.validatorAccepted,true);
    assert.equal(r.targetChoice.error,null);
    assert.equal(r.cardChoice.validatorAccepted,true);
    assert.equal(r.cardChoice.error,null);
    assert.equal(r.after.adpActive,true);
    assert.equal(r.after.regVInDiscard,true);
    assert.equal(r.after.ddeRemains,true);
  });

  test('Audit Thorton Stage1/VSTAR Active negative target on seat '+seat,()=>{
    const r=probeSwap(seat,'evolved');
    assert.equal(r.paperTargetAllowed,false);
    assert.equal(r.constructedState,true);
    assert.equal(r.qualifiedPaperGame,false);
    console.log('NATIVE_THORTON_EVOLVED_TARGET '+JSON.stringify(r));
  });
}
