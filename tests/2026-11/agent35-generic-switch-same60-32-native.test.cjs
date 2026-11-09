'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const reg=require('../../results/aichi-2026/registrations/2026-11/agent35-generic-switch-same60-32-prospective-20261109.json');
const {VERSION,IDS,preflight,receipt,compare,saveAtomic}=
  require('../../simulation/evaluation/2026-11/agent35-generic-switch-same60-32-native.cjs');

test('exact prospective 32 registrations and all policy blob snapshots',()=>{
  assert.deepEqual(preflight(),{
    sameExactSixty:true,registeredGroups:16,registeredGames:32,
    paperQualifiedGames:0
  });
  assert.equal(reg.schema,VERSION);
  assert.equal(reg.comparisonArms[0],IDS[0]);
  assert.deepEqual(Object.keys(reg.treatmentOnlyFlags),['actorGenericTacticalSwitchRoot']);
  assert.equal(reg.nativeAttempts,32);
});
test('actor-only generic Switch is sole intervention between both registered arms',()=>{
  const a=reg.sharedPolicyFlags;
  const b={...a,...reg.treatmentOnlyFlags};
  assert.equal(a.actorOnlyComposition,true);
  assert.equal(b.actorGenericTacticalSwitchRoot,true);
  for(const key of Object.keys(a))assert.equal(b[key],a[key]);
  const unique=new Set(reg.sourceGroups.map(g=>g.seed));
  assert.equal(unique.size,16);
  for(const g of reg.sourceGroups){
    const two=reg.registeredTrials.filter(t=>
      t.rank===g.rank&&t.repeat===g.repeat&&
      t.candidateSlot===g.candidateSlot);
    assert.deepEqual(two.map(t=>t.candidateId),IDS);
    assert.ok(two.every(t=>t.seed===g.seed));
  }
});
test('native root receipt distinguishes accepted Switch from empty intent',()=>{
  const trial=reg.registeredTrials.find(t=>t.candidateSlot==='A');
  const row={trial,finished:true,winner:0,
    rootActionLedger:[
      {playerSlot:0,action:'PlayCardAction',card:'Switch SVI'},
      {playerSlot:0,action:'AttackAction',attack:'Max Geist'},
      {playerSlot:1,action:'PlayCardAction',card:'Switch SVI'}
    ]};
  const r=receipt(row);
  assert.equal(r.switchPlayed,1);
  assert.equal(r.maxGeist,1);
  assert.equal(r.nativeCandidateWin,true);
  assert.equal(r.paperQualified,false);
});
test('censor-safe comparator includes every registered trial',()=>{
  const records=reg.registeredTrials.map(trial=>({
    trialId:trial.id,rank:trial.rank,seed:trial.seed,
    candidateSlot:trial.candidateSlot,candidateId:trial.candidateId,
    candidateSeat:trial.candidateSlot==='A'?0:1,
    sourceDealFingerprint:'source:'+trial.rank+trial.candidateSlot,
    actualStarterSeat:0,physicalDeal:'physical:'+trial.rank+trial.candidateSlot,
    status:'ACTION_CAP',finished:false,nativeCandidateWin:false,
    nativeWinner:null,switchPlayed:0,maxGeist:0
  }));
  const out=compare(records);
  assert.equal(out.summary.attemptedNativeGames,32);
  assert.equal(out.summary.independentlyPaperQualifiedGames,0);
  assert.equal(out.summary.perArm[IDS[0]].actionCaps,16);
  assert.equal(out.summary.perArm[IDS[1]].actionCaps,16);
});
test('artifact writer is atomic and leaves no lock after serialization',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'agent35-switch-'));
  try{
    const p=path.join(dir,'native.json');
    saveAtomic(p,{schema:VERSION});
    assert.equal(JSON.parse(fs.readFileSync(p,'utf8')).schema,VERSION);
    assert.equal(fs.existsSync(p+'.lock'),false);
  }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
