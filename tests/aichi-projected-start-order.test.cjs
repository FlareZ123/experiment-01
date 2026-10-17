'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {deriveSlotSeeds}=require('../scripts/aichi-decorrelated-seeds.cjs');
const {projectedFirstSlot,selectProjectedSeed,attestActualFirstTurn}=
  require('../scripts/aichi-projected-start-order.cjs');

test('exact projected first slots agree with 16 independently logged engine starts',()=>{
  const observations=[
    {rank:6,seat:'A',first:[0,0,1,1]},
    {rank:6,seat:'B',first:[1,1,1,1]},
    {rank:8,seat:'A',first:[0,0,1,1]},
    {rank:8,seat:'B',first:[1,1,1,1]}
  ];
  let checked=0;
  for(const item of observations) {
    for(let repeat=0;repeat<4;repeat++) {
      const seed=deriveSlotSeeds(20261017,'pilot',item.rank,repeat)[item.seat];
      assert.equal(projectedFirstSlot(seed),item.first[repeat],
        'Mismatch with draw-log-attested 90-action source probe');
      checked++;
    }
  }
  assert.equal(checked,16);
});

test('predict rank-six seat-B repeat-five authentic second-start witness',()=>{
  const seed=deriveSlotSeeds(20261017,'pilot',6,5).B;
  assert.equal(seed,3151173629);
  assert.equal(projectedFirstSlot(seed),0);
  assert.deepEqual(selectProjectedSeed(20261017,'pilot',6,'B','second'),{
    rank:6,phase:'pilot',candidateSeat:'B',desiredActualTurn:'second',
    repeat:5,seed,projectedFirstSlot:0,requiresIndependentDrawLog:true});
});

test('projection generates earliest requested stratum for source-aligned rank six and eight',()=>{
  const examples=[
    [6,'A','first',0,1241828985,0],
    [6,'A','second',2,1037949953,1],
    [6,'B','first',0,1916815920,1],
    [8,'A','second',2,3643660616,1],
    [8,'B','second',4,4006500926,0]
  ];
  for(const [rank,seat,turn,repeat,seed,first] of examples) {
    const p=selectProjectedSeed(20261017,'pilot',rank,seat,turn);
    assert.deepEqual([p.repeat,p.seed,p.projectedFirstSlot],[repeat,seed,first]);
  }
  assert.equal(selectProjectedSeed(20261017,'pilot',6,'B','second',5),null);
});

test('projection cannot replace independently verified engine first draw',()=>{
  const p=selectProjectedSeed(20261017,'pilot',6,'A','second');
  assert.equal(attestActualFirstTurn(p,{firstTurnSlot:1,verifiedByDrawLog:true}),true);
  assert.throws(()=>attestActualFirstTurn(p,{
    firstTurnSlot:1,verifiedByDrawLog:false}),/rejected/);
  assert.throws(()=>attestActualFirstTurn(p,{
    firstTurnSlot:0,verifiedByDrawLog:true}),/rejected/);
  assert.throws(()=>attestActualFirstTurn(p,{
    firstTurnSlot:null,verifiedByDrawLog:true}),/rejected/);
  assert.throws(()=>projectedFirstSlot(-1),/unsigned/);
  assert.throws(()=>selectProjectedSeed(20261017,'pilot',6,'unknown','second'),/Invalid/);
});
