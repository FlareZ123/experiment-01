'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {probe}=require('../simulation/twinleaf/agent12-thorton-gx-apex-two-own-turns-native.cjs');
for(const seat of [0,1]){
  test('full staged two-turn sequence seat '+seat,()=>{
    const baseline=probe(seat,false);
    const repaired=probe(seat,true);
    console.log('AGENT12_CHAIN '+JSON.stringify({baseline,repaired}));
    assert.ok(baseline.failure);
    assert.equal(baseline.firstGx,null);
    assert.equal(repaired.failure,null);
    assert.equal(repaired.after.sourceActive,'Regidrago VSTAR SIT');
    assert.equal(repaired.wildBlazeHook.correctedWildBlazeEffects,1);
    assert.equal(repaired.qualifiedGames,0);
  });
}
