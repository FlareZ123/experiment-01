'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {conditionalSupporterCount}=require(
  '../scripts/agent18-original29-supporter-count-contention.cjs');
const {exactConditionalHeld}=require(
  '../scripts/agent18-original-source-supporter-opening.cjs');

test('independent exact physical toy deck count probability',()=>{
  const result=conditionalSupporterCount(9,2,2,3);
  assert.deepEqual(result.exact.map(x=>
    [x.count,x.numerator,x.denominator]),[
      [0,'50','147'],[1,'80','147'],[2,'17','147']
    ]);
  assert.ok(Math.abs(result.atLeastTwo-17/147)<1e-14);
  assert.equal(result.exact.reduce((p,row)=>p+row.probability,0),1);
  assert.equal(result.atLeastThree,0);
  assert.equal(conditionalSupporterCount(9,2,7,3).atLeastTwo,1);
  assert.equal(conditionalSupporterCount(9,2,0,3).atLeastTwo,0);
  assert.throws(()=>conditionalSupporterCount(9,0,2,3));
  assert.throws(()=>conditionalSupporterCount(9,2,8,3));
});

test('source rank11 differs from four-Basic Iron Thorns Supporter saturation',()=>{
  const rank11=conditionalSupporterCount(60,11,8);
  const rank6=conditionalSupporterCount(60,4,21);
  const rank24=conditionalSupporterCount(60,4,24);
  const rank26=conditionalSupporterCount(60,12,2);
  assert.ok(Math.abs(rank11.atLeastTwo-0.2626206612180899)<1e-14);
  assert.ok(Math.abs(rank6.atLeastTwo-0.804956493113701)<1e-14);
  assert.ok(Math.abs(rank24.atLeastTwo-0.8760002511133027)<1e-14);
  assert.ok(Math.abs(rank26.atLeastTwo-0.01402936631669264)<1e-14);
  assert.equal(rank11.exact[0].numerator,'37944075');
  assert.equal(rank11.exact[0].denominator,'120577544');
});

test('all categories sum and exactly match earlier first-eight access',()=>{
  for(const [b,s] of [[4,0],[4,1],[4,21],[4,24],[11,8],[14,9],
    [12,2],[15,4],[16,5]]){
    const dist=conditionalSupporterCount(60,b,s);
    const sum=dist.exact.reduce((a,x)=>a+x.probability,0);
    assert.ok(Math.abs(sum-1)<1e-14);
    assert.ok(Math.abs((1-dist.exact[0].probability)-
      exactConditionalHeld(60,b,s).probability)<1e-14);
    assert.ok(dist.atLeastTwo>=0&&dist.atLeastTwo<=1);
    assert.ok(dist.atLeastThree>=0&&dist.atLeastThree<=1);
    assert.ok(dist.atLeastThree<=dist.atLeastTwo+1e-14);
  }
});
