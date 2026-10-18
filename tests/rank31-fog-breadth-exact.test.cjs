'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {choose,rank31FogBreadth}=
  require('../scripts/rank31-fog-breadth-exact.cjs');

test('binomial subcounts have the expected finite population',()=>{
  assert.equal(choose(59,7),341149446n);
  assert.equal(choose(40,7)-choose(36,7)>0n,true);
});

test('Fog bridge and no-other-Basic subset have independently reduced exact fractions',()=>{
  const result=rank31FogBreadth();
  assert.deepEqual(result.bridge,{
    numerator:51799174n,denominator:1984053357n
  });
  assert.deepEqual(result.noOtherBasic,{
    numerator:812567n,denominator:233418042n
  });
  assert.deepEqual(result.excluded,{
    numerator:89784709n,denominator:3968106714n
  });
  assert.deepEqual(result.otherBasicShare,{
    numerator:11381n,denominator:13132n
  });
  assert.equal(result.otherBasicShare.numerator<result.otherBasicShare.denominator,true);
});
