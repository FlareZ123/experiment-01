'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  FIRST_SEEDS,EXTENSION_SEEDS,SEEDS,
  seededRandom,shuffle,basicMask,replay,run
}=require('../simulation/evaluation/agent4-bonus-bench-native-seed-replay.cjs');

test('exact pinned unsigned xorshift32 and Fisher-Yates ordering',()=>{
  const random=seededRandom(1);
  assert.ok(Math.abs(random()-0.00006295018829405308)<1e-15);
  assert.ok(Math.abs(random()-0.015747428173199296)<1e-15);
  assert.ok(Math.abs(random()-0.6164041024167091)<1e-15);
  const order=shuffle(Array.from({length:60},(_,i)=>i),seededRandom(20261126));
  assert.equal(order.length,60);
  assert.equal(new Set(order).size,60);
  assert.ok(order.every(i=>Number.isInteger(i)&&i>=0&&i<60));
});

test('exact printed original rank1/rank6 expanded 60-order Basic masks',()=>{
  assert.deepEqual([...basicMask(1)],
    [0,1,2,7,8,9,10,11,12,13,14,15,16,17]);
  assert.deepEqual([...basicMask(6)],[0,1,2,3]);
});

test('pure pinned setup replay exactly reproduces first recorded 16 native min0 opportunities',()=>{
  assert.equal(FIRST_SEEDS.length,8);
  assert.equal(EXTENSION_SEEDS.length,32);
  assert.equal(SEEDS.length,40);
  const original=[0,1].map(seat=>FIRST_SEEDS.map(seed=>
    replay(seed,seat).expectedBonusPrompt));
  assert.deepEqual(original[0],[true,false,true,false,true,false,true,false]);
  assert.deepEqual(original[1],Array(8).fill(false));
  assert.equal(original.flat().filter(Boolean).length,4);
});

test('new 32-seed extension predictions were frozen before native execution',()=>{
  const result=run();
  assert.equal(result.predictions.length,80);
  assert.deepEqual(result.originalEightWitnessPrediction,[4,0]);
  assert.deepEqual(result.extensionWitnessPrediction,[12,16]);
  const expectedExtensionSeat1=[
    20261134,20261137,20261140,20261143,20261145,
    20261149,20261150,20261151,20261153,20261154,
    20261155,20261156,20261157,20261159,20261163,20261165
  ];
  assert.deepEqual(result.predictions.filter(row=>
    row.sourceSeat===1&&EXTENSION_SEEDS.includes(row.seed)&&
    row.expectedBonusPrompt).map(row=>row.seed),expectedExtensionSeat1);
  assert.equal(result.qualifiedGames,0);
});
