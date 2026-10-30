'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {optimize}=require('../scripts/agent3-secretbox-cost-pareto.cjs');

test('copy Pareto enumerates all package sizes while enforcing discard capacity',()=>{
  const x=optimize({baseCheap:12,sourceFirstWeight:0.5});
  assert.equal(x.selected.length,13);
  assert.equal(x.selected[0].namedSlots,13);
  assert.equal(x.selected.at(-1).namedSlots,25);
  assert.equal(x.bestOverall.namedSlots,23);
  assert.ok(Math.abs(x.bestOverall.weighted-0.07650181840468286)<1e-11);
  const best=x.selected.find(item=>item.namedSlots===23);
  assert.deepEqual(
    [best.jellicent,best.boostShake,best.stealthyHood,best.silentLab],
    [2,4,4,4]
  );
  assert.equal(best.cheapDiscards,14);
});

test('copy-sensitive AMR turns unrestricted monotonically larger shell nonoptimal',()=>{
  const x=optimize({baseCheap:12,sourceFirstWeight:0.5});
  const p23=x.selected.find(v=>v.namedSlots===23);
  const p25=x.selected.find(v=>v.namedSlots===25);
  assert.ok(p23.goingSecond>p25.goingSecond);
  assert.ok(p23.weighted>p25.weighted);
  assert.ok(p23.cheapDiscards>p25.cheapDiscards);
});

test('bad source-start weighting and cheap pool must fail fast',()=>{
  assert.throws(()=>optimize({baseCheap:-1}),RangeError);
  assert.throws(()=>optimize({baseCheap:36}),RangeError);
  assert.throws(()=>optimize({sourceFirstWeight:2}),RangeError);
});
