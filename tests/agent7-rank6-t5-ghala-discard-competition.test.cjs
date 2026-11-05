'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {compareGhalaDiscardPayments}=
  require('../simulation/evaluation/agent7-rank6-t5-ghala-discard-competition.cjs');

test('original source T5 both payment arms can pay G&H using only low-cost cards',()=>{
  const x=compareGhalaDiscardPayments();
  assert.equal(x.sourcePrints,60);
  assert.equal(x.opponentHasOriginalSpecialEnergy,false);
  assert.equal(x.baselineWithinCutoff,true);
  assert.equal(x.alternativeWithinCutoff,true);
  assert.deepEqual(x.baselinePaidHandPrints,
    ['Enhanced Hammer TWM','Enhanced Hammer TWM']);
  assert.deepEqual(x.alternativePaidHandPrints,
    ['Enhanced Hammer TWM',"Trainers' Mail ROS"]);
  assert.ok(x.penalties.hammer<=x.boundedSelectorCutoff);
  assert.ok(x.penalties.mail<=x.boundedSelectorCutoff);
  assert.equal(x.actualNativeGhalaPlayed,false);
  console.log('AGENT7_RANK6_GHALA_DISCARD_FRONTIER '+JSON.stringify(x));
});
