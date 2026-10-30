'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {choose,exactDirectLock}=require('../scripts/agent3-jellicent-lock-opener.cjs');

/** @param {number} actual @param {number} expected */
function near(actual,expected){assert.ok(Math.abs(actual-expected)<1e-12,
  `${actual} did not match independently computed ${expected}`);}

test('integer binomial coefficients',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(53,6),22957480n);
  assert.equal(choose(5,6),0n);
});
test('one through four searchable Jellicent ex copies',()=>{
  const expected=[0.1298338435299927,0.15773474659898634,
    0.16333298156860002,0.16437346841022035];
  for(let j=1;j<=4;j++)near(exactDirectLock({jellicent:j}).unconditional,expected[j-1]);
});
test('additional hood requirement shrinks direct setup access',()=>{
  const expected=[0.01779776177672291,0.033958987566780056,
    0.04860640827041531,0.061855714350490636];
  for(let h=1;h<=4;h++)near(exactDirectLock({stealthyHood:h,requireHood:true}).unconditional,expected[h-1]);
});
test('conditional valid Basic sample and impossible cases',()=>{
  near(exactDirectLock({totalBasics:12}).conditionalValidBasic,0.2030923540187293);
  near(exactDirectLock({totalBasics:12,stealthyHood:4,requireHood:true})
    .conditionalValidBasic,0.07642609697569736);
  assert.equal(exactDirectLock({jellicent:0}).unconditional,0);
  assert.equal(exactDirectLock({boostShake:0}).unconditional,0);
  assert.equal(exactDirectLock({requireHood:true}).unconditional,0);
  assert.throws(()=>exactDirectLock({totalBasics:3}));
});
