'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const archived=require('../simulation/evaluation/agent2-alchemy-attacker-lock-joint-first8.cjs');
const sensitivity=require('../simulation/evaluation/agent2-alchemy-2shake-4quick-geometry-sensitivity.cjs');

/** @param {number} actual @param {number} expected */
function near(actual,expected){
  assert.ok(Math.abs(actual-expected)<1e-13,
    'Exact unregistered sensitivity numeric mismatch '+actual+' vs '+expected);
}

test('registered 3/3 and 4/2 frozen BigInt counts remain byte-for-byte identical',()=>{
  for(const [shake,quick] of [[3,3],[4,2]]){
    const historical=archived.attackerLockFirstEight({shake,quick});
    const extended=sensitivity.attackerLockFirstEight({shake,quick});
    assert.deepEqual(extended,historical);
  }
});

test('unregistered 2 Shake / 4 Quick first-eight structural sensitivity',()=>{
  const v2=sensitivity.attackerLockFirstEight({shake:2,quick:4});
  const p=v2.conditional;
  near(v2.basicValidInitialSeven,0.8093533072892635);
  near(p.muk,0.1498242636502363);
  near(p.budew,0.481210271720251);
  near(p.eitherLock,0.5481933198594566);
  near(p.regidrago,0.863900420501072);
  near(p.mukWithRegidrago,0.11107023733944883);
  near(p.budewWithRegidrago,0.3820887067862184);
  near(p.eitherLockWithRegidrago,0.4326059374661882);
  near(p.positionedEitherLockWithRegidrago,0.21525138109171998);
  near(p.budewInitiallyActiveWithRegidrago,0.1175707909921591);
  near(p.eitherLockRegidragoConnectorCollision,0.07997364817866735);
  const v0=archived.attackerLockFirstEight({shake:3,quick:3}).conditional;
  assert.ok(p.eitherLockWithRegidrago>v0.eitherLockWithRegidrago);
  assert.ok(p.positionedEitherLockWithRegidrago<
    v0.positionedEitherLockWithRegidrago);
  assert.ok(p.positionedEitherLockWithRegidrago<
    p.eitherLockWithRegidrago);
  near(p.eitherLockWithRegidrago-p.positionedEitherLockWithRegidrago,
    p.unpositionedBudewOnlyAccessWithRegidrago);
  near(p.mukWithRegidrago+p.budewInitiallyActiveWithRegidrago-
    p.positionedBothAlternativesWithRegidrago,
    p.positionedEitherLockWithRegidrago);
  assert.equal(BigInt(v2.exactCounts.valid),337271985613442880n);
});

test('invalid nonregistered category count and impossible >4 Quick rejected',()=>{
  assert.throws(()=>sensitivity.attackerLockFirstEight({shake:1,quick:5}),
    RangeError);
  assert.throws(()=>sensitivity.attackerLockFirstEight({shake:2,quick:3}),
    RangeError);
});
