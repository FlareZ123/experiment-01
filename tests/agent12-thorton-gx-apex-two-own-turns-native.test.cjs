'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {probe}=require('../simulation/twinleaf/agent12-thorton-gx-apex-two-own-turns-native.cjs');
for(const seat of [0,1]){
  test('Thorton GX Apex copied Wild Blaze KO versus high-HP survivor, native seat '+seat,()=>{
    const baseline=probe(seat,false,'ko');
    const ko=probe(seat,true,'ko');
    const survive=probe(seat,true,'survive');
    console.log('AGENT12_KO_SIDE_EFFECT '+JSON.stringify({baseline,ko,survive}));
    assert.ok(baseline.failure,'Unpatched Thorton loses DDE and bars GX');
    assert.equal(baseline.firstGx,null);
    assert.equal(ko.failure,null);
    assert.equal(survive.failure,null);
    assert.equal(ko.after.sourceActive,'Regidrago VSTAR SIT');
    assert.equal(survive.after.sourceActive,'Regidrago VSTAR SIT');
    assert.equal(ko.after.usedGx,true);
    assert.equal(survive.after.usedGx,true);
    assert.equal(ko.after.sourcePrizes,3,'Two-Prize opponent plus enhanced GX bonus');
    assert.equal(survive.after.sourcePrizes,6,'Surviving 340HP Eternatus VMAX awards zero Prizes');
    assert.equal(survive.after.opponentActiveDamage,330,
      'Enhanced GX must add 30 damage to the 300 printed attack');
    assert.equal(ko.after.sourceDeck,1,
      'A KO must still resolve copied Wild Blaze owner-deck five-card discard');
    assert.equal(ko.wildBlazeHook.correctedWildBlazeEffects,1,
      'Printed donor effect must execute on the KO path as well');
    assert.equal(survive.after.sourceDeck,1,
      'On surviving target, paper hook must mill five of six own cards');
    assert.equal(survive.wildBlazeHook.correctedWildBlazeEffects,1,
      'On surviving target, patched printed Wild Blaze must execute');
    assert.equal(ko.qualifiedGames,0);
    assert.equal(survive.qualifiedGames,0);
  });
}
