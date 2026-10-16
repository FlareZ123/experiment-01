'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {loadDefaultCampaign}=require('../scripts/aichi-comparison-campaign.cjs');
const {auditSeedCoupling,mixSeed,openingOverlap,samePositions}=
  require('../scripts/aichi-v2-seed-coupling-audit.cjs');

test('v2 seat pairs differ by exactly one low bit',()=>{
  const p=loadDefaultCampaign('independent-slots-v2');
  for(const a of p.trials.filter(t=>t.candidateEngineSlot==='A')){
    const b=p.trials.find(t=>t.rank===a.rank&&t.phase===a.phase&&
      t.repeat===a.repeat&&t.candidateId===a.candidateId&&
      t.candidateEngineSlot==='B');
    assert.ok(b);
    assert.equal(a.seed%2,0);
    assert.equal(b.seed,a.seed+1);
    assert.equal(a.seed^b.seed,1);
  }
});

test('first and third xorshift XOR masks fix the high bit',()=>{
  const result=auditSeedCoupling(256);
  assert.equal(result.firstXorMask,'00042021');
  assert.equal(result.thirdXorMask,'9dcca8c5');
  assert.deepEqual(result.exactHighBitRelation.slice(0,5),
    ['same','same','opposite','same','opposite']);
  assert.equal(result.rawCoinAgreement,1);
});

test('a deterministic SHA256-mixed reference removes fixed parity coupling',()=>{
  const x=auditSeedCoupling(2000);
  assert.ok(x.mixedCoinAgreement>0.43&&x.mixedCoinAgreement<0.57);
  assert.ok(x.rawSamePositions>1.5);
  assert.ok(x.rawSamePositions>x.mixedSamePositions);
  assert.ok(x.mixedSamePositions>0.7&&x.mixedSamePositions<1.3);
  assert.equal(mixSeed(101),mixSeed(101));
  assert.notEqual(mixSeed(101),mixSeed(102));
});

test('permutation overlap checks and invalid sample sizes',()=>{
  const p=Array.from({length:60},(_,i)=>i);
  const q=p.slice().reverse();
  assert.equal(samePositions(p,p),60);
  assert.equal(samePositions(p,q),0);
  assert.equal(openingOverlap(p,p),7);
  assert.equal(openingOverlap(p,q),0);
  assert.throws(()=>auditSeedCoupling(0),/Expected/);
});
