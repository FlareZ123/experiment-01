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
    assert.equal(r.after.damage,0);
    assert.equal(r.after.pokemonPlayedTurn,0);
    assert.equal(r.before.specialConditions.length,1);
    assert.equal(r.after.specialConditions.length,0);
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
    assert.equal(r.after.damage,60);
    assert.equal(r.after.pokemonPlayedTurn,1);
    assert.deepEqual(r.after.specialConditions,r.before.specialConditions);
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

  test('Reversible hook lets same Thorton prompt retry legal Basic Bench, seat '+seat,()=>{
    const r=probeSwap(seat,'evolved',true,true);
    console.log('NATIVE_THORTON_RETRY_LEGAL_BENCH '+JSON.stringify(r));
    assert.equal(r.targetChoice.validatorAccepted,false);
    assert.match(r.targetChoice.error,/PAPER_THORTON_TARGET_MUST_BE_BASIC/);
    assert.equal(r.targetChoice.settled,false);
    assert.equal(r.retryTarget?.validatorAccepted,true);
    assert.equal(r.retryTarget?.error,null);
    assert.equal(r.cardChoice?.validatorAccepted,true);
    assert.equal(r.cardChoice?.error,null);
    assert.equal(r.after.active,'Regidrago VSTAR SIT');
    assert.equal(r.after.bench0,'Arceus & Dialga & Palkia GX CEC');
    assert.equal(r.after.ddeRemains,true);
    assert.equal(r.after.thortonInDiscard,true);
    assert.equal(r.after.thortonInSupporter,false);
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
    assert.ok(r.pending.includes('ChoosePokemonPrompt'));
    assert.equal(r.after.sourceSupporterTurn,1);
    assert.equal(r.after.thortonInSupporter,true);
  });
}
