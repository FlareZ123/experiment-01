'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {test}=require('node:test');
const {buildNativePublicReceipt,writeNativePublicReceipt,SCHEMA}=
  require('../simulation/evaluation/agent46-issue25-native-public-artifact.cjs');

/** @returns {object} Genuine-schema synthetic control with two different outcomes. */
function sample(){
  return {
    manifest:{
      policyEntryPoint:'simulation/evaluation/agent36-issue25-selected-v0.cjs',
      observedTwinleafGitCommit:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      runtimeGitAttestationStatus:'VERIFIED',
      competitiveGamesQualified:0
    },
    diagnostic:{
      registered:['6:0:A:reference','11:2:B:reference'],
      registeredAttemptReconciliation:{exactUniqueMatch:true},
      rawRowIdentityReconciliation:{exactlyReconciled:true},
      attemptedRows:[
        {id:'6:0:A:reference',status:'engine-error',
          sourceDealFingerprint:'physical-original-r6'},
        {id:'11:2:B:reference',status:'returned-unqualified',
          sourceDealFingerprint:'physical-original-r11'}
      ],
      competitiveGamesQualified:0
    },
    rawDevelopment:{rows:[
      {trial:{id:'6:0:A:reference'},status:'engine-error',
        rootActionLedger:[{actionOrdinal:0,action:'ResolvePromptAction',
          turnBefore:0,playerSlot:0}],
        rootActionLedgerProtocol:'actual-store-root-action-ledger-v1',
        secretOpponentHand:['Do not expose this private per-step input']},
      {trial:{id:'11:2:B:reference'},status:'returned-unqualified',
        rootActionLedger:[{actionOrdinal:0,action:'AttackAction',
          attack:'Get Lost',turnBefore:1,playerSlot:1}],
        endReason:'action-limit',
        secretOpponentDeck:['No hidden deck extraction']}
    ]}
  };
}

test('machine receipt preserves both source-backed error and cap without a winner',()=>{
  const receipt=buildNativePublicReceipt(sample());
  assert.equal(receipt.schema,SCHEMA);
  assert.deepEqual(receipt.registeredIds,
    ['6:0:A:reference','11:2:B:reference']);
  assert.equal(receipt.attempts.length,2);
  assert.deepEqual(receipt.attempts.map(x=>x.status),
    ['engine-error','returned-unqualified']);
  assert.deepEqual(receipt.attempts.map(x=>x.actualNativeRootLedger[0].action),
    ['ResolvePromptAction','AttackAction']);
  assert.equal(receipt.qualifiedCompetitiveGames,0);
  assert.equal(receipt.releaseQualified,false);
  assert.equal(receipt.actualPublicLedgersArchived,2);
  assert.doesNotMatch(JSON.stringify(receipt),
    /Do not expose|No hidden deck extraction/);
});

test('missing native payload remains explicit rather than inventing games',()=>{
  const source=sample();
  source.rawDevelopment=null;
  const receipt=buildNativePublicReceipt(source);
  assert.equal(receipt.rawNativeRowsFound,0);
  assert.equal(receipt.actualPublicLedgersArchived,0);
  assert.equal(receipt.attempts[0].nativeRowPresent,false);
  assert.equal(receipt.attempts[1].actualNativeRootLedger,null);
  assert.equal(receipt.qualifiedCompetitiveGames,0);
});

test('two physical files are atomically written with independently verifiable digest',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'agent46-issue25-evidence-'));
  try{
    const dest=path.join(dir,'actual-native-v0.json');
    const written=writeNativePublicReceipt(sample(),dest);
    assert.equal(written.path,dest);
    const bytes=fs.readFileSync(dest);
    const digest=createHash('sha256').update(bytes).digest('hex');
    assert.equal(digest,written.sha256);
    assert.equal(fs.readFileSync(dest+'.sha256','utf8'),
      digest+'  actual-native-v0.json\n');
    const payload=JSON.parse(bytes);
    assert.equal(payload.actualPublicLedgersArchived,2);
    assert.deepEqual(fs.readdirSync(dir).sort(),
      ['actual-native-v0.json','actual-native-v0.json.sha256']);
  }finally{
    fs.rmSync(dir,{recursive:true,force:true});
  }
});
