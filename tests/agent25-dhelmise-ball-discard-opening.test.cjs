'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {exactOpening,study} = require('../scripts/agent25-dhelmise-ball-discard-opening.cjs');

test('fixed v2 unrestricted: exact historical strict kernel is preserved',()=>{
  const row=exactOpening(8);
  assert.equal(row.denominator,'416717869162795200');
  assert.equal(row.strictWorlds,'57968036494606112');
  assert.equal(row.expandedWorlds,'67013277866565072');
  assert.equal(row.additionallyReachableWorlds,'9045241371958960');
  assert.ok(row.addedProbability>0.0217 && row.addedProbability<0.0218);
  assert.equal(row.initialStates,1335);
});

test('partial lock excludes two donor Ability printings without shrinking 60',()=>{
  const row=exactOpening(6);
  assert.deepEqual(row.counts,[4,6,10,4,1,4,7,24]);
  assert.equal(row.strictWorlds,'52975951633859892');
  assert.equal(row.expandedWorlds,'61947808868633892');
  assert.equal(row.additionallyReachableWorlds,'8971857234774000');
  assert.ok(row.expandedProbability<exactOpening(8).expandedProbability);
});

test('physical probabilities and new-only witnesses stay coherent',()=>{
  const both=study();
  for(const row of [both.unrestricted,both.partialLock]){
    assert.equal(BigInt(row.expandedWorlds)-BigInt(row.strictWorlds),
      BigInt(row.additionallyReachableWorlds));
    assert.ok(BigInt(row.newCompressorBallWorlds)>0n);
    assert.ok(BigInt(row.newCompressorBallWorlds)<=
      BigInt(row.additionallyReachableWorlds));
    assert.ok(row.expandedProbability>row.strictProbability);
    assert.ok(row.conditionalBasicValid>row.expandedProbability);
    assert.equal(row.competitiveQualifiedGames,0);
  }
});

test('unsupported donor counts fail loudly',()=>{
  assert.throws(()=>exactOpening(0),assert.AssertionError);
  assert.throws(()=>exactOpening(10),assert.AssertionError);
});

test('committed Supporter prevents Arven tutor route but retains immutable 60',()=>{
  const a=exactOpening(8,{allowArven:false});
  const b=exactOpening(6,{allowArven:false});
  assert.deepEqual(a.counts,[4,8,10,4,1,4,7,22]);
  assert.deepEqual(b.counts,[4,6,10,4,1,4,7,24]);
  assert.equal(a.strictWorlds,'20880447088729536');
  assert.equal(a.expandedWorlds,'32763579418029936');
  assert.equal(b.strictWorlds,'19245064130982096');
  assert.equal(b.expandedWorlds,'29182502882114016');
  assert.ok(a.expandedProbability<exactOpening(8).expandedProbability);
  assert.ok(b.expandedProbability<exactOpening(6).expandedProbability);
  assert.equal(a.expandedProbability,study().unrestrictedNoArven.expandedProbability);
  assert.equal(b.expandedProbability,study().partialLockNoArven.expandedProbability);
});

test('Supporter availability flag validates type',()=>{
  assert.throws(()=>exactOpening(8,{allowArven:1}),assert.AssertionError);
});
