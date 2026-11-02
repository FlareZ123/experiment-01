'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {verifyRegistration}=require(
  '../simulation/evaluation/agent6-rank30-skyliner-prospective-native.cjs');

test('source rank30 prospectively registered four previously unobserved groups',()=>{
  const r=verifyRegistration();
  assert.equal(r.registeredGroups.length,4);
  assert.equal(r.registeredArms.length,8);
  assert.deepEqual(r.registeredGroups.map(g=>g.seed),
    [2085196839,438664109,901609735,792997838]);
  assert.deepEqual(r.registeredGroups.map(g=>g.candidateSlot),
    ['A','B','A','B']);
  assert.deepEqual(r.registeredGroups.map(g=>g.repeat),
    [1,1,2,2]);
});

test('all groups mirror exact two registered candidate 60 IDs',()=>{
  const r=verifyRegistration();
  for(const group of r.registeredGroups){
    const matches=r.registeredArms.filter(a=>
      a.repeat===group.repeat&&a.candidateSlot===group.candidateSlot);
    assert.equal(matches.length,2);
    assert.equal(matches[0].seed,matches[1].seed);
    assert.deepEqual(matches.map(a=>a.candidateId),r.candidateIds);
  }
});

test('registered original source 60 and engine reference never modified',()=>{
  const r=verifyRegistration();
  assert.equal(r.vendorPinned,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(r.sourcePrintedSixtyUnmodified,true);
  assert.equal(r.candidatePrintedSixtiesUnmodified,true);
  assert.equal(r.preOutcome,true);
});
