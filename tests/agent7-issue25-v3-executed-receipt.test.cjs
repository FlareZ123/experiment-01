'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {buildReceipt,writeReceipt,VERSION}=
  require('../simulation/evaluation/agent7-issue25-v3-executed-receipt.cjs');

function fixture(){
  return {
    manifest:{
      policyEntryPoint:
        'simulation/evaluation/agent36-issue25-nightwatch-futuresight-v3.cjs',
      runtimeGitAttestationStatus:'VERIFIED',
      observedTwinleafGitCommit:'a'.repeat(40),
      observedRepositoryGitCommit:'b'.repeat(40),
      fullDecisionPolicySymmetryCertified:false,
      releaseQualified:false,
      originalSourceRegistration:'original-rank6-rank11',
      originalSourceRanks:[6,11]
    },
    diagnostic:{
      registered:['r1','r2','r3','r4'],
      attemptedRows:[
        {id:'r1',status:'engine-error',sourceDealFingerprint:'d1'},
        {id:'r2',status:'returned-unqualified',finished:false},
        {id:'r3',status:'engine-error',sourceDealFingerprint:'d3'},
        {id:'r4',status:'engine-error',sourceDealFingerprint:'d4'}
      ],
      registeredAttemptReconciliation:{exactUniqueMatch:true},
      rawRowIdentityReconciliation:{exactlyReconciled:true},
      allRegisteredAttemptsReturned:true,
      verdict:'FAIL-development-GetLost-and-root-policy-open',
      competitiveGamesQualified:0,
      audit:{}
    },
    rawDevelopment:{rows:[
      {trial:{id:'r1'},status:'engine-error',
        nativePublicRootArchive:{rootActionLedger:[
          {action:'PassTurnAction',playerSlot:0}]}},
      {trial:{id:'r2'},rootActionLedger:[
        {action:'PlayCardAction',playerSlot:1,card:'source-public-card'}]},
      {trial:{id:'r3'},status:'engine-error'},
      {trial:{id:'r4'},status:'engine-error'}
    ]}
  };
}

test('SFT receipt retains all four registered failure/cap attempts and public root actions',()=>{
  const receipt=buildReceipt(fixture());
  assert.equal(receipt.schema,VERSION);
  assert.equal(receipt.registration.registeredAttemptsReturned,true);
  assert.deepEqual(receipt.attempts.map(row=>row.id),
    ['r1','r2','r3','r4']);
  assert.equal(receipt.attempts[0].publicRootActions[0].action,
    'PassTurnAction');
  assert.equal(receipt.attempts[1].publicRootActions[0].card,
    'source-public-card');
  assert.equal(receipt.attempts[2].publicRootActions,null);
  assert.equal(receipt.gate.overall,'FAIL-development-only');
  assert.equal(receipt.gate.fullPolicyBothSeatSymmetry,'FAIL');
  assert.equal(receipt.reportedCompetitiveGames,0);
  console.log('ISSUE25_RECEIPT_SFT',JSON.stringify({
    statuses:receipt.attempts.map(x=>x.status),
    rootCounts:receipt.attempts.map(x=>x.publicRootActionCount),
    gates:receipt.gate
  }));
});

test('SFT receipt writes locked and atomically with matching SHA-256 sidecar',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'agent7-issue25-'));
  try{
    const result=writeReceipt(fixture(),dir);
    const content=fs.readFileSync(result.file);
    const actual=createHash('sha256').update(content).digest('hex');
    assert.equal(actual,result.sha256);
    assert.equal(result.bytes,content.length);
    const text=fs.readFileSync(path.join(dir,
      'issue25-v3-executed.sha256'),'utf8');
    assert.equal(text,actual+'  issue25-v3-executed.json\n');
    assert.equal(fs.existsSync(path.join(dir,'.issue25-v3-receipt.lock')),false);
    console.log('ISSUE25_RECEIPT_SHA256',actual,
      'bytes',result.bytes);
  }finally{
    fs.rmSync(dir,{recursive:true,force:true});
  }
});
