'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {seedFrame,seedForRank11Trial}=require('../simulation/twinleaf/rank11-source-seeds.cjs');
const {deriveSlotSeeds}=require('../scripts/aichi-decorrelated-seeds.cjs');
const {seededRandom}=require('../simulation/twinleaf/headless.cjs');

test('historical consecutive frame remains unchanged for source audit',()=>{
  assert.deepEqual(seedFrame(4,'legacy-consecutive-v1'),[
    2026101800,2026101801,2026101802,2026101803]);
});

test('v2 reuses established SHA-256 v3 Aichi label and separates phases',()=>{
  assert.equal(seedForRank11Trial(0,'decorrelated-v2'),
    deriveSlotSeeds(20261018,'pilot',11,0).A);
  assert.equal(seedForRank11Trial(100,'decorrelated-v2'),
    deriveSlotSeeds(20261018,'published-field',11,0).A);
  assert.notEqual(seedForRank11Trial(0,'decorrelated-v2'),
    seedForRank11Trial(100,'decorrelated-v2'));
});

test('all 128 prospective seed values are unique valid unsigned32 and reproducible',()=>{
  const a=seedFrame(128,'decorrelated-v2');
  assert.deepEqual(a,seedFrame(128,'decorrelated-v2'));
  assert.equal(new Set(a).size,128);
  assert.equal(a.every(v=>Number.isInteger(v)&&v>0&&v<=0xffffffff),true);
  assert.notDeepEqual(a,seedFrame(128,'legacy-consecutive-v1'));
});

test('v2 has diverse initial pseudo-random branches unlike consecutive v1',()=>{
  const firstBit=seed=>seededRandom(seed)()<0.5;
  const historical=seedFrame(128,'legacy-consecutive-v1').map(firstBit);
  const current=seedFrame(128,'decorrelated-v2').map(firstBit);
  assert.equal(new Set(historical).size,1,
    'Near-adjacent xorshift seeds unexpectedly vary the opening bit');
  assert.equal(new Set(current).size,2,
    'Hash-decorrelated seeds must exercise both RNG partitions');
});

test('reject invalid seed frame and indexes before invoking simulator',()=>{
  assert.throws(()=>seedFrame(0,'decorrelated-v2'),RangeError);
  assert.throws(()=>seedFrame(129,'decorrelated-v2'),RangeError);
  assert.throws(()=>seedForRank11Trial(-1,'decorrelated-v2'),RangeError);
  assert.throws(()=>seedForRank11Trial(128,'decorrelated-v2'),RangeError);
  assert.throws(()=>seedForRank11Trial(0,'none'),/Unknown rank11/);
});
