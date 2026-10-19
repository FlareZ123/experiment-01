'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {DOMAIN,REPEATS_PER_SEAT,exclusiveTrialSeed,exclusiveSeedFrame,seedFrameDigest}=
  require('../simulation/twinleaf/rank11-exclusive-prospective-seeds.cjs');

test('registered rank11 seed frame is complete, collision-free and stable',()=>{
  assert.equal(DOMAIN,'aichi-rank11-exclusive-lockbreak-20261019-v1');
  assert.equal(REPEATS_PER_SEAT,64);
  const frame=exclusiveSeedFrame();
  assert.equal(frame.length,128);
  assert.equal(frame.filter(r=>r.sourceSeat===0).length,64);
  assert.equal(frame.filter(r=>r.sourceSeat===1).length,64);
  assert.equal(new Set(frame.map(r=>r.seed)).size,128);
  assert.equal(frame[0].seed,498913316);
  assert.equal(frame[1].seed,2491518926);
  assert.equal(frame[127].seed,1525599535);
  assert.equal(seedFrameDigest(frame),
    'a8d3110f98fb8407161ec8e57a9544c000ce7ee4258bd69a0ccc85a199440d08');
  assert.equal(exclusiveTrialSeed(1,63),frame[127].seed);
});

test('seed function rejects out-of-frame indices and seats',()=>{
  for(const [seat,index] of [[-1,0],[2,0],[0,-1],[1,64],[0,1.5]]) {
    assert.throws(()=>exclusiveTrialSeed(seat,index),RangeError);
  }
});
