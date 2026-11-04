'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {describeRootDisposition}=
  require('../simulation/evaluation/agent3-native-root-disposition.cjs');
const c=(row,limit=48)=>describeRootDisposition(row,limit).kind;

test('genuine 48-root nonterminal development attempt is a horizon cap',()=>{
  assert.equal(c({nativeRootActionCount:48,finished:false}),
    'native-root-horizon-exhausted-unqualified');
});
test('47-root unfinished attempt cannot be called the 48-root cap',()=>{
  assert.equal(c({nativeRootActionCount:47,finished:false}),
    'native-nonterminal-early-return-unqualified');
});
test('actual finished at action 48 is terminal unqualified, not capped',()=>{
  assert.equal(c({nativeRootActionCount:48,finished:true}),
    'native-terminal-unqualified');
});
test('native engine error stays exact even at 48 root horizon',()=>{
  assert.equal(c({status:'engine-error',nativeRootActionCount:48,
    finished:false}),'engine-error');
});
test('overrun is reported as anomaly, not accepted finish',()=>{
  assert.equal(c({nativeRootActionCount:49,finished:false}),
    'native-root-limit-overrun-anomaly');
});
test('missing finished state or root count is not fabricated',()=>{
  assert.equal(c({rootActionCount:48}),
    'native-disposition-unobserved');
  assert.equal(c({finished:false}),
    'native-disposition-unobserved');
  assert.equal(c({rootActionCount:-1,finished:false}),
    'native-disposition-unobserved');
});
test('rootActionCount compatibility and paper qualification always false',()=>{
  const out=describeRootDisposition({rootActionCount:48,finished:false},48);
  assert.equal(out.kind,'native-root-horizon-exhausted-unqualified');
  assert.equal(out.paperQualified,false);
});
test('malformed rows and invalid registered caps are rejected',()=>{
  assert.throws(()=>c(null),TypeError);
  assert.throws(()=>c({},0),RangeError);
  assert.throws(()=>c({},1.5),RangeError);
});
