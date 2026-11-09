'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {probe,VERSION}=
  require('../../simulation/twinleaf/2026-11/agent22-temple-paid-native-fixture.cjs');
const {CardType}=require('../../vendor/twinleaf/ptcg-server/output/game/store/card/card-types');

for(const seat of [0,1]){
  test('actual Store pays held Temple and reduces visible DDE for physical seat '+seat,()=>{
    const result=probe(seat);
    assert.equal(result.schema,VERSION);
    assert.equal(result.intent.kind,'play-temple-dde-denial');
    assert.equal(result.nativePaid,true);
    assert.equal(result.nativeWitness,'confirmed-public-effect');
    assert.equal(result.templeInHandAfter,false);
    assert.equal(result.stadium.includes('Temple of Sinnoh ASR'),true);
    assert.equal(result.sourceEnergyBefore.length,1);
    assert.equal(result.sourceEnergyBefore[0].length,2);
    assert.deepEqual(result.sourceEnergyAfter,[[CardType.COLORLESS]]);
    assert.equal(result.paperCompetitiveQualifiedGames,0);
    console.log('AGENT22_NATIVE_TEMPLE_PAID',JSON.stringify(result));
  });
}
