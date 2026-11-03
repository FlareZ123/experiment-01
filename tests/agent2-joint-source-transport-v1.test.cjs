'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {compare}=require('../simulation/evaluation/agent2-joint-source-transport-v1.cjs');
const profile=require('../simulation/evaluation/agent41-joint-source-r5-r11-v1.json');
const registration=require('../results/aichi-2026/registrations/agent2-joint-rank5-rank11-transport-v1-20261103.json');

test('selected joint source transport has intact two-candidate paired deals and four independent factor labels',()=>{
  assert.equal(registration.immutableParentGitCommit,
    '20d095b3126a767ac60b40f048fa4579b3a04c99');
  assert.equal(registration.registeredNativeAttemptCount,32);
  assert.deepEqual(registration.registeredTrialIds,profile.registeredTrials.map(x=>x.id));
  assert.deepEqual(Object.keys(registration.factors),[
    'baseline','searchOnly','discardOnly','searchAndDiscard'
  ]);
  for(const [name,toggles] of Object.entries(registration.factors)){
    assert.equal(toggles.actorOnlySingleSearch,
      ['searchOnly','searchAndDiscard'].includes(name));
    assert.equal(toggles.actorHandDiscard,
      ['discardOnly','searchAndDiscard'].includes(name));
  }
  const groups=new Map();
  for(const t of profile.registeredTrials){
    const key=[t.rank,t.candidateSlot,t.repeat].join(':');
    const known=groups.get(key)??{seed:t.seed,candidates:[]};
    assert.equal(known.seed,t.seed);
    known.candidates.push(t.candidateId);
    groups.set(key,known);
  }
  assert.equal(groups.size,4);
  for(const g of groups.values())assert.deepEqual(g.candidates,
    ['champion-reference','new-moon-lockbreaker-v1']);
});

test('a changed root with the same printed source and exactly same dealt cards is detected',()=>{
  const row={
    trial:{id:'5:0:A:champion-reference'},
    sourceSeat:1,sourceDeckFingerprint:'s',candidateDeckFingerprint:'c',
    sourceDealFingerprint:'s1',fullPhysicalDealFingerprint:'s2',
    actualStarterSeat:1,
    rootActionLedger:[
      {action:'PlayCardAction',playerSlot:1,card:'Quick Ball'},
      {action:'PassTurnAction',playerSlot:1}
    ]
  };
  const alt={...row,rootActionLedger:[
    {action:'PlayCardAction',playerSlot:1,card:'Quick Ball'},
    {action:'PlayCardAction',playerSlot:1,card:'Battle VIP Pass'}
  ]};
  const got=compare(row,alt);
  assert.equal(got.firstGlobalDifferentOrdinal,1);
  assert.equal(got.firstSourceRelativeDifference,1);
  assert.equal(got.baselineFirstDifferentRoot.action,'PassTurnAction');
  assert.equal(got.treatmentFirstDifferentRoot.action,'PlayCardAction');
  assert.ok(Object.values(got.exactOriginalCandidateAndDealParity).every(Boolean));
});

test('source/candidate printed roster or full-deal mismatch fails comparison closed',()=>{
  const base={
    trial:{id:'11:0:A:new-moon-lockbreaker-v1'},sourceSeat:1,
    sourceDeckFingerprint:'s',candidateDeckFingerprint:'c',
    sourceDealFingerprint:'d',fullPhysicalDealFingerprint:'two',
    actualStarterSeat:0,rootActionLedger:[]
  };
  for(const [field,value] of [
    ['sourceDeckFingerprint','unknown'],
    ['candidateDeckFingerprint','changed'],
    ['sourceDealFingerprint','new-deal'],
    ['fullPhysicalDealFingerprint','mismatch'],
    ['actualStarterSeat',1]
  ]){
    assert.throws(()=>compare(base,{...base,[field]:value}),/parity failure/);
  }
});
