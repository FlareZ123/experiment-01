'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {compareSafely}=
  require('../simulation/evaluation/agent31-rank1-prospective-basic-recipient-pair.cjs');

const trial={
  id:'1:0:A:champion-reference',rank:1,repeat:0,
  candidateSlot:'A',candidateId:'champion-reference',seed:1234
};
const row=(sourceDeal='source-full-digest')=>({
  trial,sourceSeat:1,sourceDealFingerprint:sourceDeal,
  fullPhysicalDealFingerprint:'both-full-digest',
  actualStarterSeat:0,rootActionLedgerSha256:'root-ledger',
  status:'capped',finished:false,sourceActuallyFirst:false
});

test('compares original physical setup and reports all exact provenance keys',()=>{
  const comparison=compareSafely([row()],[row()]);
  assert.equal(comparison.length,1);
  assert.equal(comparison[0].id,trial.id);
  assert.equal(comparison[0].sameSeed,true);
  assert.equal(comparison[0].sameSourceDeal,true);
  assert.equal(comparison[0].sameFullDeal,true);
  assert.equal(comparison[0].sameStart,true);
  assert.equal(comparison[0].sourceOriginalOwnedSeat,1);
  assert.equal(comparison[0].candidateOwnedSeat,0);
});

test('false or unavailable source physical fingerprint is never promoted',()=>{
  const changed=compareSafely([row()],[row('other-source-deal')]);
  assert.equal(changed[0].sameSourceDeal,false);
  assert.equal(changed[0].sameFullDeal,true);
  const missing=compareSafely([row()],[]);
  assert.equal(missing[0].sameSourceDeal,false);
  assert.equal(missing[0].sameSeed,false);
  assert.equal(missing[0].treatment,null);
});

test('candidate physical seat B swaps original source seat to A',()=>{
  const b={...trial,id:'1:0:B:champion-reference',candidateSlot:'B'};
  const testRow={...row(),trial:b,sourceSeat:0};
  const comparison=compareSafely([testRow],[testRow]);
  assert.equal(comparison[0].sourceOriginalOwnedSeat,0);
  assert.equal(comparison[0].candidateOwnedSeat,1);
});
