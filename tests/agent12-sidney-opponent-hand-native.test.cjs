'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {probeSidney,PRINTING}=
  require('../simulation/twinleaf/agent12-sidney-opponent-hand-native.cjs');

test('genuine Sidney FST 241 target-type validator fails to prevent illegal opponent-hand discards in either physical seat',()=>{
  assert.equal(PRINTING,'Sidney FST 241');
  for(const seat of [0,1]){
    for(const mode of ['legal-two','illegal-pokemon-and-basic-energy',
      'mixed-illegal','no-target']){
      const r=probeSidney(seat,mode);
      console.log('AGENT12_SIDNEY_NATIVE '+JSON.stringify(r));
      assert.deepEqual(r.originalFieldRanksWithPrinting,[6,24,29]);
      assert.equal(r.sourceRank,24);
      assert.equal(r.competitiveQualifiedGames,0);
      assert.equal(r.error,null,JSON.stringify(r));
      assert.equal(r.nativeBoundaries.min,0);
      assert.equal(r.nativeBoundaries.max,2);
      assert.equal(r.nativeBoundaries.offerSize,6);
      assert.equal(r.nativeBoundaries.sourceOwnerId,411);
      assert.equal(r.before.opponentHand,6);
      const count=mode==='no-target'?0:2;
      assert.equal(r.after.opponentHand,6-count);
      assert.equal(r.after.opponentDiscard,count);
      assert.deepEqual(r.physicalOpposingHand.map(p=>p.inDiscard),
        r.physicalOpposingHand.map(p=>p.selected));
      assert.equal(r.validatorAccepted,
        mode==='legal-two'||mode==='no-target');
      assert.equal(r.pending.length,0);
    }
  }
});
