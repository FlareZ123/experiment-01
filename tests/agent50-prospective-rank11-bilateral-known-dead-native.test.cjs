'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {preflight,plannedTrials,starterEvidence,gameOutcomeSummary}=
  require('../simulation/evaluation/agent50-prospective-rank11-bilateral-known-dead-native.cjs');
const {seededRandom}=require('../simulation/twinleaf/headless.cjs');

test('committed manifest and original executable dependencies remain pinned',()=>{
  const {registration,profile,blobs}=preflight();
  assert.equal(profile.pinnedVendorRevision,registration.nativeEnginePin);
  assert.equal(Object.keys(blobs).length,5);
  assert.equal(registration.attemptedDraws,12);
  assert.equal(registration.selectedGroups,8);
});

test('all 12 original cryptographic draws reproduce 8 accepted precommitted coin-stratified groups',()=>{
  const {registration}=preflight();
  const trials=plannedTrials(registration,seededRandom);
  assert.equal(trials.length,16);
  assert.equal(new Set(trials.map(x=>x.id)).size,16);
  assert.equal(new Set(trials.map(x=>x.seed)).size,8);
  for(const seat of ['A','B']){
    const t=trials.filter(x=>x.candidateSlot===seat);
    assert.equal(t.length,8);
    assert.equal(t.filter(x=>x.projectedNativeFirstSeat===0).length,4);
    assert.equal(t.filter(x=>x.projectedNativeFirstSeat===1).length,4);
    for(const candidate of registration.candidateIds)
      assert.equal(t.filter(x=>x.candidateId===candidate).length,4);
  }
});

test('changed seed, missing attempt or divergent coin-heads invalidates prereg',()=>{
  const {registration}=preflight();
  const clone=()=>JSON.parse(JSON.stringify(registration));
  const changed=clone();changed.seedAttempts[0].seed++;
  assert.throws(()=>plannedTrials(changed,seededRandom));
  const absent=clone();absent.seedAttempts.pop();
  assert.throws(()=>plannedTrials(absent,seededRandom));
  const heads=clone();heads.seedAttempts[0].projectedFirstCoinHeads=true;
  assert.throws(()=>plannedTrials(heads,seededRandom));
});

test('native accepted first-player receipt must agree with exogenous prediction',()=>{
  const {registration}=preflight();
  const trials=plannedTrials(registration,seededRandom);
  const rows=trials.map(trial=>({trial,verifiedFirstTurn:true,
    actualStarterSeat:trial.projectedNativeFirstSeat,
    nativeSetupCoinChoiceReceipt:{status:'consistent-accepted-native-setup-and-first-draw'}}));
  let evidence=starterEvidence(rows);
  assert.equal(evidence.allMatched,true);
  assert.equal(evidence.matched,16);
  rows[0].actualStarterSeat=1-rows[0].actualStarterSeat;
  evidence=starterEvidence(rows);
  assert.equal(evidence.allMatched,false);
  assert.equal(evidence.matched,15);
});

test('source, candidate, cap and native abort remain distinct outcomes',()=>{
  const rows=[
    {trial:{candidateSlot:'A'},finished:true,winner:1},
    {trial:{candidateSlot:'B'},finished:true,winner:1},
    {trial:{candidateSlot:'A'},finished:false,status:null},
    {trial:{candidateSlot:'A'},finished:false,status:'engine-error'}
  ];
  assert.deepEqual(gameOutcomeSummary(rows),{attempts:4,
    sourceEngineWins:1,candidateEngineWins:1,caps:1,errors:1});
});
