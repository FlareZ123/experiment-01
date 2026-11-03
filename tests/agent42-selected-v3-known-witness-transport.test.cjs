'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {preflight,narrow,BLOB}=
  require('../simulation/evaluation/agent42-selected-v3-known-witness-transport.cjs');
test('immutably registered historical positive seed and both-seat A/B/A modes',()=>{
  const m=preflight();
  assert.equal(BLOB,'8b7f7dfd271937fc613d277f03941dda663734ff');
  assert.equal(m.expectedAttempts,12);
  assert.equal(m.trials.length,4);
  assert.equal(m.frozenWitness.originalTrial,'1:0:A:new-moon-lockbreaker-v1');
  assert.deepEqual(m.trials.map(t=>t.candidateSlot),['A','A','B','B']);
  assert.ok(m.restrictions.some(s=>s.includes('no selected deck')));
});
test('native source chain summary does not invent paid Tool or win from printed names',()=>{
  const trial={candidateSlot:'A',id:'1:420:A:champion-reference'};
  const row={trial,status:'action-capped',
    rootActionLedger:[
      {playerSlot:1,action:'PlayCardAction',card:'Float Stone',actionOrdinal:6},
      {playerSlot:1,action:'RetreatAction',actionOrdinal:7},
      {playerSlot:1,action:'AttackAction',attack:'Max Geist',actionOrdinal:8}
    ],rootActionLedgerSha256:'abc',sourceDealFingerprint:'s',
    fullPhysicalDealFingerprint:'f'};
  const result=narrow(row);
  assert.equal(result.sourceFloatStoneRoots,1);
  assert.equal(result.sourceMaxGeistRoots,1);
  assert.equal(result.sourceRetreatRoots,1);
  assert.equal(result.paidToolRetreatAttackChains,0,
    'Missing actual native target and attack settlement must prevent certification');
  assert.equal(result.paperQualifiedGames,0);
});
test('source seat is derived from physical trial and candidate is never source',()=>{
  const x=narrow({trial:{candidateSlot:'B',id:'1:420:B:champion-reference'},
    rootActionLedger:[{playerSlot:0,action:'PassTurnAction'},
      {playerSlot:1,action:'AttackAction',attack:'Max Geist'}]});
  assert.equal(x.sourceSeat,0);
  assert.equal(x.sourceMaxGeistRoots,0);
  assert.equal(x.paperQualifiedGames,0);
});
