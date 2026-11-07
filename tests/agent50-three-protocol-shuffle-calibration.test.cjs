'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  sampleSeed,generatePermutations,openingMulligan,runCalibration,
  summary,PROTOCOLS,DIRECTIONS
}=require('../simulation/evaluation/agent50-three-protocol-shuffle-calibration.cjs');

test('seed derivation and independently named shuffling protocols are stable',()=>{
  assert.equal(PROTOCOLS.length,4);
  assert.deepEqual(DIRECTIONS,['leading-seven','trailing-seven']);
  const s=sampleSeed(0);
  assert.ok(Number.isInteger(s)&&s>=0&&s<=0xffffffff);
  assert.equal(sampleSeed(0),s);
  assert.notEqual(sampleSeed(0),sampleSeed(1));
  for(const protocol of PROTOCOLS){
    const a=generatePermutations(s,protocol);
    const b=generatePermutations(s,protocol);
    assert.deepEqual(a,b);
    for(const permutation of a){
      assert.equal(permutation.length,60);
      assert.equal(new Set(permutation).size,60);
      assert.ok(permutation.every(index=>
        Number.isInteger(index)&&index>=0&&index<60));
      assert.equal(typeof openingMulligan(permutation,'leading-seven'),
        'boolean');
      assert.equal(typeof openingMulligan(permutation,'trailing-seven'),
        'boolean');
    }
  }
});

test('2x2 paired-failure accounting includes all four outcome cells',()=>{
  const c={n:32,n00:20,n01:4,n10:5,n11:3};
  const z=summary(c,0.1628440500237541);
  assert.equal(z.seat0Failures,8);
  assert.equal(z.seat1Failures,7);
  assert.equal(z.discordantSeat0Only,5);
  assert.equal(z.discordantSeat1Only,4);
  assert.ok(z.phi>-1&&z.phi<1);
  assert.ok(z.independentBothFailBaseline>0);
});

test('fixed small run is reproducible, complete, and unqualified',()=>{
  const a=runCalibration(64);
  const b=runCalibration(64);
  assert.deepEqual(a,b);
  assert.equal(a.sampleCount,64);
  assert.equal(a.basicLocations.length,13);
  assert.ok(Math.abs(a.exactUniformPaperSingleHandFailure-
    0.1628440500237541)<1e-12);
  for(const p of PROTOCOLS)for(const d of DIRECTIONS){
    const c=a.protocols[p][d];
    assert.equal(c.n,64);
    assert.equal(c.n00+c.n01+c.n10+c.n11,64);
    assert.ok(c.seat0Failures>=0&&c.seat0Failures<=64);
    assert.ok(c.seat1Failures>=0&&c.seat1Failures<=64);
  }
  assert.equal(a.qualification.competitiveGamesQualified,0);
  assert.equal(a.qualification.physicalPaperShuffleCertified,false);
});
