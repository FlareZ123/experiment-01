'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {TOTAL_REPEATS,PARTITION_SIZE,PARTITION_COUNT,scheduledRepeats}=
  require('../simulation/twinleaf/newmoon-payload-partition-plan.cjs');

test('four disjoint three-repeat partitions recover the frozen twelve-repeat cohort',()=>{
  assert.equal(TOTAL_REPEATS,12);
  assert.equal(PARTITION_SIZE,3);
  assert.equal(PARTITION_COUNT,4);
  const partitions=Array.from({length:PARTITION_COUNT},(_,i)=>
    scheduledRepeats(i));
  assert.deepEqual(partitions,[
    [0,1,2],[3,4,5],[6,7,8],[9,10,11]
  ]);
  const flattened=partitions.flat();
  assert.equal(new Set(flattened).size,TOTAL_REPEATS);
  assert.deepEqual(flattened,scheduledRepeats(null));
  assert.deepEqual(flattened,scheduledRepeats());
});

test('invalid partition requests reject rather than silently select a subset',()=>{
  for(const value of [-1,4,1.5,NaN,'1',undefined]){
    if(value===undefined)continue;
    assert.throws(()=>scheduledRepeats(value),RangeError);
  }
});
