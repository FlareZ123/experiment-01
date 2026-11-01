'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {scheduledArms,VERSION}=
  require('../simulation/evaluation/agent41-nine-ready-ranks-native-scout.cjs');
const registration=require(
  '../results/aichi-2026/registrations/agent41-nine-ready-ranks-18seeds-20261101.json');

test('nine distinct authentic source ranks cover eighteen unscreened seed cells',()=>{
  const arms=scheduledArms();
  assert.equal(arms.length,36);
  const ranks=[...new Set(arms.map(row=>row.rank))].sort((a,b)=>a-b);
  assert.deepEqual(ranks,[3,4,6,7,10,11,21,24,29]);
  const grouped=new Map();
  for(const arm of arms){
    const key=[arm.rank,arm.repeat,arm.candidateSlot].join(':');
    if(!grouped.has(key))grouped.set(key,[]);
    grouped.get(key).push(arm);
    assert.equal(arm.id,key+':'+arm.candidateId);
    assert.ok(Number.isSafeInteger(arm.seed)&&
      arm.seed>=0&&arm.seed<=0xffffffff);
  }
  assert.equal(grouped.size,18);
  for(const pair of grouped.values()){
    assert.equal(pair[0].seed,pair[1].seed);
    assert.deepEqual(pair.map(x=>x.candidateId).sort(),
      ['champion-reference','new-moon-lockbreaker-v1']);
  }
  for(const rank of ranks)
    assert.equal(arms.filter(x=>x.rank===rank).length,4);
});

test('research registration is frozen and explicitly development-only',()=>{
  assert.equal(VERSION,'agent41-nine-ready-ranks-frozen-public-special-scout-v1');
  assert.equal(registration.registeredUtc,'2026-11-01T06:11:32Z');
  assert.equal(registration.seeds.length,18);
  assert.equal(registration.nativeAttempts,36);
  assert.equal(registration.caveats.length,4);
});
