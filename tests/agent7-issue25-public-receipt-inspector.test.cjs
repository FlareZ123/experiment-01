'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {createHash}=require('node:crypto');
const {buildReceipt}=require('../simulation/evaluation/agent7-issue25-v3-executed-receipt.cjs');
const {inspectIssue25PublicReceipt,VERSION}=
  require('../simulation/evaluation/agent7-issue25-public-receipt-inspector.cjs');

const hash=x=>createHash('sha256').update(x).digest('hex');
const seal=data=>{
  const bytes=Buffer.from(JSON.stringify(data,null,2)+'\n','utf8');
  return {bytes,sidecar:hash(bytes)+'  issue25-v3-executed.json\n'};
};
function fixture(){
  const ids=[
    '6:0:A:champion-reference','6:0:A:new-moon-lockbreaker-v1',
    '11:2:B:champion-reference','11:2:B:new-moon-lockbreaker-v1'
  ];
  const run={
    manifest:{
      policyEntryPoint:
        'simulation/evaluation/agent36-issue25-nightwatch-futuresight-v3.cjs',
      observedRepositoryGitCommit:'a'.repeat(40),
      observedTwinleafGitCommit:'b'.repeat(40),
      runtimeGitAttestationStatus:'VERIFIED',
      releaseQualified:false,competitiveGamesQualified:0
    },
    diagnostic:{
      registered:ids,
      attemptedRows:ids.map((id,index)=>({
        id,status:index===2?'engine-error':'returned-unqualified',
        nativeRootActionCount:1,sourceDealFingerprint:
          index<2?'rank6-matched-physical-deal':'rank11-matched-physical-deal'
      })),
      registeredAttemptReconciliation:{exactUniqueMatch:true},
      rawRowIdentityReconciliation:{exactlyReconciled:true},
      allRegisteredAttemptsReturned:true,
      competitiveGamesQualified:0,
      verdict:'FAIL-development',
      audit:{}
    },
    rawDevelopment:{
      rows:ids.map((id,index)=>({
        trial:{id},
        rootActionLedger:[{
          actionOrdinal:0,turnBefore:1,playerSlot:index%2,
          action:index===0?'AttackAction':'PassTurnAction',
          attack:index===0?'Night Watch':null
        }]
      }))
    }
  };
  return buildReceipt(run);
}

test('SFT independently checks four exact arms and two physical source-deal pairs',()=>{
  const data=fixture();
  const {bytes,sidecar}=seal(data);
  const out=inspectIssue25PublicReceipt(bytes,sidecar);
  assert.equal(out.version,VERSION);
  assert.equal(out.checksumPass,true);
  assert.equal(out.integrity,'PASS-bounded-artifact-custody');
  assert.equal(out.returnedCount,4);
  assert.equal(out.actualReturnedRootSummary[0]
    .rootComposition.meaningfulNonPassRoots,1);
  assert.deepEqual(out.sourcePairedFingerprints.map(x=>x.paired),
    [true,true]);
  assert.equal(out.fullPublicLedgersAvailable,true);
  assert.equal(out.qualifiedGames,0);
  assert.equal(out.qualification,'FAIL-development-only');
  console.log('INSPECTOR_SFT_GOOD',JSON.stringify({
    checksum:out.checksum,
    roots:out.actualReturnedRootSummary.map(x=>({
      id:x.id,meaningful:x.rootComposition.meaningfulNonPassRoots,
      prompts:x.rootComposition.promptRoots,
      passes:x.rootComposition.passRoots
    })),
    qualifiedGames:out.qualifiedGames
  }));
});

test('SFT altered artifact bytes fail detached checksum before decoding',()=>{
  const sealed=seal(fixture());
  const corrupt=Buffer.from(sealed.bytes);
  corrupt[15]^=1;
  const out=inspectIssue25PublicReceipt(corrupt,sealed.sidecar);
  assert.equal(out.integrity,'FAIL-checksum');
  assert.deepEqual(out.failures,['detached-json-sha256-sidecar-mismatch']);
});

test('SFT re-signed duplicated IDs and unmatched source deal fail custody',()=>{
  const data=fixture();
  data.attempts[3].id=data.attempts[2].id;
  data.attempts[1].sourceDealFingerprint='unmatched-other-deal';
  const {bytes,sidecar}=seal(data);
  const out=inspectIssue25PublicReceipt(bytes,sidecar);
  assert.equal(out.integrity,'FAIL-custody');
  assert.ok(out.failures.includes('registered-returned-trial-id-mismatch'));
  assert.ok(out.failures.includes('source-paired-physical-deal-digest-mismatch'));
  assert.equal(out.qualifiedGames,0);
});

test('SFT valid detached checksum cannot excuse altered accepted root ordinal',()=>{
  const data=fixture();
  data.attempts[0].publicRootActions[0].actionOrdinal=41;
  const {bytes,sidecar}=seal(data);
  const out=inspectIssue25PublicReceipt(bytes,sidecar);
  assert.equal(out.integrity,'FAIL-custody');
  assert.ok(out.failures.some(x=>x.includes('noncanonical-root-action-ordinals')));
  assert.equal(out.qualifiedGames,0);
});

test('SFT incomplete public root evidence stays separate from file integrity',()=>{
  const data=fixture();
  data.attempts[2].publicRootActions=null;
  data.attempts[2].publicRootActionCount=null;
  data.attempts[2].publicRootActionsTruncated=null;
  data.attempts[2].publicRootDecisionComposition={
    available:false,nativeAcceptedRoots:null,meaningfulNonPassRoots:null
  };
  const {bytes,sidecar}=seal(data);
  const out=inspectIssue25PublicReceipt(bytes,sidecar);
  assert.equal(out.checksumPass,true);
  assert.equal(out.integrity,'PASS-bounded-artifact-custody');
  assert.equal(out.fullPublicLedgersAvailable,false);
  assert.equal(out.qualification,'FAIL-development-only');
});
