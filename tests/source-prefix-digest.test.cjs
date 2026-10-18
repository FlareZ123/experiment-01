'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {createSourcePrefixAudit}=
  require('../simulation/twinleaf/source-prefix-digest.cjs');

const before='a'.repeat(64),after='b'.repeat(64);
const row=[0,'AddPlayerAction',before,before,before,after,after,after];

test('fixed historical digest matches a single immutable root step',()=>{
  const expected=crypto.createHash('sha256').update(JSON.stringify(row)+'\n').digest('hex');
  const audit=createSourcePrefixAudit({1:expected});
  audit.record(row);
  const result=audit.finish();
  assert.equal(result.steps,1);
  assert.equal(result.sha256,expected);
  assert.equal(result.allMatched,true);
  assert.equal(result.checkpoints[0].afterActions,1);
});

test('changed action or any State projection fails archived comparison',()=>{
  const expected=crypto.createHash('sha256').update(JSON.stringify(row)+'\n').digest('hex');
  const audit=createSourcePrefixAudit({1:expected});
  audit.record([...row.slice(0,7),'c'.repeat(64)]);
  const result=audit.finish();
  assert.equal(result.allMatched,false);
  assert.notEqual(result.sha256,expected);
});

test('wrong action ordinal and incomplete prefix fail closed',()=>{
  const audit=createSourcePrefixAudit({1:before,2:after});
  assert.throws(()=>audit.record([1,...row.slice(1)]),/ordinal/);
  audit.record(row);
  assert.throws(()=>audit.finish(),/not reached/);
});
