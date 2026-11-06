'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  extractRootLedger,digestRootLedger,firstRootDifference,
  compareRootLedgers
}=require('../simulation/evaluation/agent48-native-root-ledger-reconciliation.cjs');

const ledger=[
  {actionOrdinal:0,action:'ResolvePromptAction',playerSlot:0},
  {actionOrdinal:1,action:'PassTurnAction',playerSlot:1}
];

test('extracts a normal top-level ledger and its reported digest',()=>{
  const sha=digestRootLedger(ledger);
  const row={rootActionLedger:ledger,rootActionLedgerSha256:sha};
  assert.deepEqual(extractRootLedger(row),{
    ledger,source:'row',reportedSha256:sha
  });
});

test('falls back to a complete nested native abort ledger',()=>{
  const sha=digestRootLedger(ledger);
  const row={status:'engine-error',nativeAbortEvidence:{
    rootActionLedger:ledger,rootActionLedgerSha256:sha
  }};
  assert.deepEqual(extractRootLedger(row),{
    ledger,source:'nativeAbortEvidence',reportedSha256:sha
  });
});

test('compares a normal row with an abort row as exact',()=>{
  const sha=digestRootLedger(ledger);
  const normal={rootActionLedger:ledger,rootActionLedgerSha256:sha};
  const aborted={nativeAbortEvidence:{
    rootActionLedger:JSON.parse(JSON.stringify(ledger)),
    rootActionLedgerSha256:sha
  }};
  const result=compareRootLedgers(normal,aborted);
  assert.equal(result.status,'EXACT');
  assert.equal(result.firstDifference,null);
  assert.equal(result.left.rootCount,2);
  assert.equal(result.right.rootCount,2);
  assert.equal(result.left.reportedDigestStatus,'MATCH');
  assert.equal(result.right.reportedDigestStatus,'MATCH');
});

test('reports the first differing root and ordinal',()=>{
  const changed=[
    ledger[0],
    {actionOrdinal:1,action:'PlayCardAction',playerSlot:1}
  ];
  const result=compareRootLedgers(
    {rootActionLedger:ledger},
    {nativeAbortEvidence:{rootActionLedger:changed}}
  );
  assert.equal(result.status,'DIFFERENT');
  assert.equal(result.firstDifference.index,1);
  assert.equal(result.firstDifference.ordinalA,1);
  assert.equal(result.firstDifference.ordinalB,1);
  assert.equal(result.firstDifference.actionA,'PassTurnAction');
  assert.equal(result.firstDifference.actionB,'PlayCardAction');
});

test('treats missing evidence as unavailable rather than an empty exact ledger',()=>{
  const result=compareRootLedgers(
    {},
    {rootActionLedger:[],rootActionLedgerSha256:digestRootLedger([])}
  );
  assert.equal(result.status,'UNAVAILABLE');
  assert.equal(result.left.source,'unavailable');
  assert.equal(result.right.rootCount,0);
});

test('an explicit empty top-level ledger takes precedence over nested evidence',()=>{
  const row={
    rootActionLedger:[],
    nativeAbortEvidence:{
      rootActionLedger:ledger,
      rootActionLedgerSha256:digestRootLedger(ledger)
    }
  };
  const extracted=extractRootLedger(row);
  assert.equal(extracted.source,'row');
  assert.deepEqual(extracted.ledger,[]);
});

test('detects a corrupted reported digest even when arrays match',()=>{
  const result=compareRootLedgers(
    {rootActionLedger:ledger,rootActionLedgerSha256:'0'.repeat(64)},
    {nativeAbortEvidence:{
      rootActionLedger:ledger,
      rootActionLedgerSha256:digestRootLedger(ledger)
    }}
  );
  assert.equal(result.status,'DIGEST_MISMATCH');
  assert.equal(result.firstDifference,null);
  assert.equal(result.left.reportedDigestStatus,'MISMATCH');
  assert.equal(result.right.reportedDigestStatus,'MATCH');
});

test('firstRootDifference returns null only for two present equal arrays',()=>{
  assert.equal(firstRootDifference(ledger,JSON.parse(JSON.stringify(ledger))),null);
  assert.throws(()=>firstRootDifference(undefined,ledger),TypeError);
});
