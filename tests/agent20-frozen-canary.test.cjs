'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {test} = require('node:test');
const {checkProfile, declaredOptions, assertEnvironment,
  writeAtomicLocked, disposition} =
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');

const root=path.resolve(__dirname,'..');
const profile=JSON.parse(fs.readFileSync(path.join(root,
  'simulation/evaluation/agent20-frozen-rank6-canary-v1.json'),'utf8'));
const runnerSource=fs.readFileSync(path.join(root,
  'simulation/evaluation/agent41-bilateral-v2-development.cjs'),'utf8');

test('frozen profile has every actual runner option and exact 4-arm registration',()=>{
  checkProfile(profile,runnerSource);
  assert.equal(declaredOptions(runnerSource).length,86);
  assert.equal(profile.registeredTrials.length,4);
});

test('future runner options and unregistered source cards fail closed',()=>{
  const changed={...profile,policyOptions:{...profile.policyOptions}};
  delete changed.policyOptions.paperSecretBoxPayment;
  assert.throws(()=>checkProfile(changed,runnerSource),/option schema changed/);
  const newRunner=runnerSource.replace('registeredTrials=null,',
    'unreviewedNovelFlag=false,registeredTrials=null,');
  assert.throws(()=>checkProfile(profile,newRunner),/option schema changed/);
});

test('ambient AGENT switches and source-visible settings are rejected',()=>{
  const closure={keys:['AGENT7_EXPERIMENT_DEV','CI','CONTEXT_OVERRIDE']};
  assert.doesNotThrow(()=>assertEnvironment(profile,closure,{CI:'true'}));
  assert.throws(()=>assertEnvironment(profile,closure,
    {CI:'true',AGENT7_EXPERIMENT_DEV:'true'}),/Unreviewed/);
  assert.throws(()=>assertEnvironment(profile,closure,
    {CONTEXT_OVERRIDE:'1'}),/Unreviewed/);
  assert.throws(()=>assertEnvironment(profile,closure,
    {AGENT4_NATIVE_PAYMENT_RECEIPT_DEV:'true'}),/injected only/);
});

test('disposition archives every arm without upgrading engine terminals',()=>{
  const rows=profile.registeredTrials.map(trial=>({trial,
    status:'completed',gameFinished:true,verifiedFirstTurn:true,
    sourceDealFingerprint:'registered-deal-'+trial.id,
    rootActionLedger:[{action:'PassTurnAction'}]}));
  const out=disposition({rows},profile);
  assert.equal(out.attempts.length,4);
  assert.equal(out.stages.BOTH_SEATS_EXECUTED,true);
  assert.equal(out.stages.PAPER_PAYMENT_VERIFIED,false);
  assert.equal(out.stages.COMPETITIVE_GAME_QUALIFIED,false);
  assert.equal(out.firstBlocker,'PAPER_PAYMENT_UNVERIFIED');
  out.attempts[0].rootActionCount=undefined;
  const censored=disposition({rows:rows.slice(0,3)},profile);
  assert.equal(censored.stages.BOTH_SEATS_EXECUTED,false);
});

test('artifact writer locks and atomically replaces the intended file',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'agent20-freeze-'));
  const out=path.join(dir,'result.json');
  try {
    writeAtomicLocked(out,'{"a":1}\n');
    assert.equal(fs.readFileSync(out,'utf8'),'{"a":1}\n');
    fs.writeFileSync(out+'.lock','someone-else',{flag:'wx'});
    assert.throws(()=>writeAtomicLocked(out,'{"a":2}\n'),/EEXIST/);
    assert.equal(fs.readFileSync(out,'utf8'),'{"a":1}\n');
    fs.unlinkSync(out+'.lock');
    writeAtomicLocked(out,'{"a":2}\n');
    assert.equal(fs.readFileSync(out,'utf8'),'{"a":2}\n');
  } finally {
    fs.rmSync(dir,{recursive:true,force:true});
  }
});
