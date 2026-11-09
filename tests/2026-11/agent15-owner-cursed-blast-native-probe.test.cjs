'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {probeOwnerCursedBlastPrizeConversion:probe}=
  require('../../simulation/twinleaf/agent15/owner-cursed-blast-native-probe.cjs');

for(const seat of [0,1]){
  test('native owner-only Cursed Blast Prize conversion in seat '+seat,()=>{
    const r=probe(seat);
    assert.equal(r.ownerOnlyPlan.sourcePrinting,'Dusclops PRE');
    assert.equal(r.ownerOnlyPlan.hypotheticalNetPrizeAdvantage,1);
    assert.equal(r.sourceDeckComplete,false);
    assert.equal(r.targetChosen,true);
    assert.equal(r.opponentPromotionChosen,true);
    assert.equal(r.abilityNativeAccepted,true);
    assert.equal(r.sourcePrizesBefore-r.sourcePrizesAfter,2);
    assert.equal(r.opponentPrizesBefore-r.opponentPrizesAfter,1);
    assert.equal(r.prizeDelta,1);
    assert.equal(r.sourceSelfKoDiscarded,true);
    assert.equal(r.targetKoDiscarded,true);
    assert.equal(r.competitiveQualified,false);
  });
}
