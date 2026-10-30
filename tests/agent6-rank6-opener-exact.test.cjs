'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {combination,valid7,count,predicates,run}=
  require('../simulation/evaluation/agent6-rank6-opener-exact.cjs');

test('original rank6 sixty has exact four Basic valid opening denominator',()=>{
  assert.equal(combination(60,7),386206920n);
  assert.equal(combination(56,7),231917400n);
  assert.equal(valid7,154289520n);
});
test('all valid first turns exhaust the entire denominator',()=>{
  const x=count(()=>true);
  assert.equal(x.numerator,x.denominator);
});
test('original valid-first-seven plus first draw has exact DCE+Tag count',()=>{
  assert.deepEqual(count(predicates.dceTag),{
    numerator:199702940n,denominator:8177344560n
  });
});
test('two held Plumeria and DCE+Tag is a rare subcase',()=>{
  assert.deepEqual(count(predicates.dceTagPlumeria2),{
    numerator:7389668n,denominator:8177344560n
  });
});
test('requiring Thunder Mountain to be among the six Prizes',()=>{
  assert.deepEqual(count(predicates.dceTagPlumeria2,true),{
    numerator:41777832n,denominator:425221917120n
  });
  assert.deepEqual(count(predicates.dceTag,true),{
    numerator:1089905544n,denominator:425221917120n
  });
});
test('all fractional results are explicitly conditional and noncompetitive',()=>{
  const x=run();
  assert.equal(x.qualifiedGames,0);
  assert.equal(x.results.length,7);
  assert.ok(x.results.every(y=>y.percent>=0&&y.percent<=100));
});
