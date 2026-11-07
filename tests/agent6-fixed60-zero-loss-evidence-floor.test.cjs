'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  allWinsLowerBound,minAllWins,balancedFieldFloor,allMatchupsFloor
}=require('../simulation/evaluation/agent6-fixed60-zero-loss-evidence-floor.cjs');

test('single fixed-policy 99.5% all-wins aggregate requires 598 flawless independent games',()=>{
  assert.equal(minAllWins(),598);
  assert.ok(allWinsLowerBound(597)<0.995);
  assert.ok(allWinsLowerBound(598)>=0.995);
  assert.ok(Math.pow(0.995,598)<=0.05);
  assert.ok(Math.pow(0.995,597)>0.05);
});

test('uniformly balanced 32-opponent target requires 19 unbeaten games per matchup',()=>{
  const x=balancedFieldFloor();
  assert.equal(x.matchesPerOpponent,19);
  assert.equal(x.totalGames,608);
  assert.ok(x.zeroLossLowerBound>=0.995);
  assert.ok(allWinsLowerBound(18*32)<0.995);
  assert.ok(Math.pow(0.995,19*32)<=0.05);
});

test('an equal first/second-seat design rounds 19 to 20 per opponent',()=>{
  const x=balancedFieldFloor({equalSeatCounts:true});
  assert.equal(x.matchesPerOpponent,20);
  assert.equal(x.totalGames,640);
  assert.equal(x.totalGames%64,0);
  assert.ok(x.zeroLossLowerBound>0.995);
});

test('simultaneous 95%-confidence 99.5% floor on every opponent needs 1290 flawless games each',()=>{
  const x=allMatchupsFloor();
  assert.equal(x.opponents,32);
  assert.equal(x.matchesPerOpponent,1290);
  assert.equal(x.totalGames,41280);
  assert.ok(x.familywiseLowerBoundPerOpponent>=0.995);
  assert.ok(Math.pow(0.05/32,1/1289)<0.995);
});

test('explicitly rejects absent games and impossible probabilities',()=>{
  assert.throws(()=>allWinsLowerBound(0));
  assert.throws(()=>allWinsLowerBound(-1));
  assert.throws(()=>minAllWins(1));
  assert.throws(()=>minAllWins(0));
  assert.throws(()=>minAllWins(NaN));
  assert.throws(()=>balancedFieldFloor({opponents:0}));
  assert.throws(()=>allMatchupsFloor({opponents:1.25}));
});
