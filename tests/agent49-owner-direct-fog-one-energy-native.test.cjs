'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {rank31Original60,probeRank31DirectFogOneEnergy}=
  require('../simulation/twinleaf/agent49-owner-direct-fog-one-energy-native.cjs');

const original60=rank31Original60();

test('rank31 K0 direct-Fog proposal is backed by the registered 60',()=>{
  assert.equal(original60.length,60);
  assert.equal(original60.filter(name=>name==='Fog Crystal CRE').length,4);
  assert.equal(original60.filter(name=>name==='Unown AOR').length,3);
  assert.equal(original60.filter(name=>name==='Psychic Energy MEE 13').length,2);
  assert.equal(original60.filter(name=>name==='Secret Box TWM').length,0);
});

for(const seat of [0,1]){
  test(`native rank31 direct Fog → Hidden Power one-Prize KO settles for seat ${seat}`,()=>{
    const result=probeRank31DirectFogOneEnergy(seat);
    assert.equal(result.source60K0,true);
    assert.equal(result.sourceDeckPhysicalComplete,false);
    assert.equal(result.opponentDeckPhysicalComplete,false);
    assert.equal(result.fogPromptOwner,true);
    assert.equal(result.fogPromptDeckBound,true);
    assert.equal(result.basicPhysicallyAttached,true);
    assert.equal(result.fogPhysicallyDiscarded,true);
    assert.equal(result.attackAccepted,true);
    assert.equal(result.targetKnockedOut,true);
    assert.equal(result.sourcePrizeCountBefore-result.sourcePrizeCountAfter,1);
    assert.equal(result.opponentPrizeCountAfter,result.opponentPrizeCountBefore);
    assert.equal(result.opponentPromotedPrinting.length>0,true);
    assert.equal(result.qualifiedGame,false);
    assert.equal(result.competitiveResult,false);
  });
}
