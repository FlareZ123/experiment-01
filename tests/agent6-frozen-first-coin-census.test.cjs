'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {firstCoinValue,sourceFirstFromSeed,frozenStartCensus}=
  require('../scripts/agent6-frozen-first-coin-census.cjs');

const plan=JSON.parse(fs.readFileSync(path.resolve(__dirname,
  '../results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json'),'utf8'));

test('pinned seeded RNG produces exact first coin direction',()=>{
  assert.ok(Math.abs(firstCoinValue(1460221882)-0.3055367)<1e-6);
  assert.ok(Math.abs(firstCoinValue(861838028)-0.8785736)<1e-6);
  assert.deepEqual(sourceFirstFromSeed('A',1460221882),{
    coinWinner:0,sourceSeat:1,firstSeat:1,sourceFirst:true});
  assert.deepEqual(sourceFirstFromSeed('B',861838028),{
    coinWinner:1,sourceSeat:0,firstSeat:0,sourceFirst:true});
});

test('four frozen rank/physical-seat cells reproduce 26/32 actual starters',()=>{
  const r=frozenStartCensus(plan);
  assert.deepEqual(r.cells.map(x=>x.sourceFirstSeeds),[3,4,2,4]);
  assert.equal(r.sourceFirstArms,26);
  assert.equal(r.cells[0].sourceFirstSeeds*2+
    r.cells[1].sourceFirstSeeds*2,14);
  assert.equal(r.cells[2].sourceFirstSeeds*2+
    r.cells[3].sourceFirstSeeds*2,12);
});
