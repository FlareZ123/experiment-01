'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {probeTeamSkull}=require('../simulation/twinleaf/agent12-sidney-opponent-hand-native.cjs');

test('rank24 Team Skull Grunt can illegitimately target non-Energy hand cards in two native seats',()=>{
  for(const seat of [0,1])for(const mode of [
    'legal-two','illegal-pokemon-and-basic-energy','mixed-illegal','no-target']){
    const x=probeTeamSkull(seat,mode);
    console.log('AGENT12_SKULL_GRUNT_NATIVE '+JSON.stringify(x));
    assert.equal(x.printing,'Team Skull Grunt SUM');
    assert.equal(x.sourceRank,24);
    assert.deepEqual(x.originalFieldRanksWithPrinting,[6,24,29]);
    assert.equal(x.error,null,JSON.stringify(x));
    assert.deepEqual([x.nativeBoundaries.min,x.nativeBoundaries.max],[0,2]);
    assert.equal(x.nativeBoundaries.offerSize,6);
    assert.equal(x.nativeBoundaries.sourceOwnerId,411);
    assert.equal(x.validatorAccepted,mode==='legal-two'||mode==='no-target');
    const n=mode==='no-target'?0:2;
    assert.equal(x.after.opponentHand,6-n);
    assert.equal(x.after.opponentDiscard,n);
    assert.deepEqual(x.physicalOpposingHand.map(y=>y.inDiscard),
      x.physicalOpposingHand.map(y=>y.selected));
    assert.equal(x.pending.length,0);
    assert.equal(x.competitiveQualifiedGames,0);
  }
});
