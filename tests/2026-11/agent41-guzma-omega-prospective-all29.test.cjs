'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {
  preregistered,synopsis,compare,saveAtomic
}=require('../../simulation/evaluation/2026-11/agent41-guzma-omega-prospective-all29.cjs');
const registration=require('../../results/aichi-2026/registrations/agent41-prospective-guzma-omega-all29-20261109.json');

test('58 unobserved exact original physical deals frozen for all 29 source ranks',()=>{
  const groups=preregistered();
  assert.equal(registration.status,'FROZEN BEFORE FIRST NATIVE GAME');
  assert.equal(groups.length,58);
  assert.equal(new Set(groups.map(g=>g.seed)).size,58);
  assert.equal(new Set(groups.map(g=>g.id)).size,58);
  assert.deepEqual(registration.missingOriginalRanks,[23,25,28]);
  assert.equal(groups.every(g=>g.candidateId==='champion-reference'),true);
  for(const rank of registration.exactOriginalRanks)
    assert.deepEqual(groups.filter(g=>g.rank===rank).map(g=>g.candidateSlot),
      ['A','B']);
});

test('every one of 58 pairs requires matching original and full physical deals',()=>{
  const groups=preregistered();
  const rows=groups.map(g=>({
    trial:g,sourceDealFingerprint:{sha:g.seed},
    fullPhysicalDealFingerprint:{sha:'full-'+g.seed},
    rootActionLedger:[],finished:false,finalPrizes:[6,6]
  }));
  assert.equal(compare({rows},{rows:rows.map(r=>({...r}))}).length,58);
  const shifted=rows.map(r=>({...r}));
  shifted[1]={...shifted[1],
    fullPhysicalDealFingerprint:{sha:'not-the-same-physical-game'}};
  assert.throws(()=>compare({rows},{rows:shifted}),/Two-player deal drift/);
  const missing=rows.map(r=>({...r}));
  missing[1]={...missing[1],sourceDealFingerprint:null};
  assert.throws(()=>compare({rows},{rows:missing}),/assert|source|truthy/i);
});

test('native error is explicitly censored rather than counted as opponent victory',()=>{
  const group=preregistered()[0];
  const row=synopsis({trial:group,error:'injected engine error',
    rootActionLedger:[],sourceDealFingerprint:{sha:1},
    fullPhysicalDealFingerprint:{sha:2}});
  assert.equal(row.status,'engine-error');
  assert.equal(row.winner,null);
});

test('prospective artifact writer uses exclusive lock and rename-atomic output',()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'agent41-omega-'));
  const target=path.join(directory,'report.json');
  try{
    saveAtomic(target,{version:1});
    assert.deepEqual(JSON.parse(fs.readFileSync(target,'utf8')),{version:1});
    assert.equal(fs.existsSync(target+'.lock'),false);
    assert.equal(fs.readdirSync(directory).length,1);
    fs.writeFileSync(target+'.lock','occupied');
    assert.throws(()=>saveAtomic(target,{version:2}),/EEXIST/);
    assert.equal(JSON.parse(fs.readFileSync(target,'utf8')).version,1);
  }finally{
    fs.rmSync(directory,{recursive:true,force:true});
  }
});
