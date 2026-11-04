'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {createHash}=require('node:crypto');
const {auditIssue25Receipt,auditRootLedger,auditAttemptIdentity}=
  require('../simulation/evaluation/agent10-issue25-receipt-independent-audit.cjs');

function validFixture(){
  const ids=[
    '6:0:A:champion-reference',
    '6:0:A:new-moon-lockbreaker-v1',
    '11:2:B:champion-reference',
    '11:2:B:new-moon-lockbreaker-v1'
  ];
  const actions=[{actionOrdinal:0,action:'PassTurnAction',
    turnBefore:1,turnAfter:2,playerSlot:0}];
  const digest=createHash('sha256').update(JSON.stringify(actions))
    .digest('hex');
  const attempts=ids.map((id,i)=>({
    id,actualRawTrialId:id,status:'returned-unqualified',
    sourceDealFingerprint:i<2?'source6':'source11',
    actualStarterSeat:i<2?0:1,
    nativeRootActionCount:1,
    publicRootActionCount:1,
    publicRootActions:structuredClone(actions),
    publicRootActionsTruncated:false,
    publicRootLedgerSha256Reported:digest,
    finished:false
  }));
  return {schema:'agent7-issue25-v3-executed-receipt-v1',
    selectedExecutingManifest:{
      version:'selected-v3',nativeRootActionLimit:48,
      releaseQualified:false,competitiveGamesQualified:0
    },
    registration:{ids,actualReturnedIds:[...ids]},attempts,
    reportedCompetitiveGames:0,
    gate:{overall:'FAIL-development-only',
      fullUntruncatedPublicRootLedger:'PASS',
      observedPublicRootLedgerDigest:'PASS'}
  };
}

test('a complete independent public-root receipt passes custody, never competitive admission',()=>{
  const r=auditIssue25Receipt(validFixture());
  assert.equal(r.evidenceVerdict,'PASS');
  assert.equal(r.identity.verdict,'PASS');
  assert.equal(r.rootCustody,'PASS');
  assert.equal(r.sourceDeals.verdict,'PASS');
  assert.equal(r.competitiveGameQualification,'FAIL-development-only');
  assert.equal(r.competitiveGamesAdmitted,0);
});

test('old native abort VERIFIED assertion cannot replace missing public root actions',()=>{
  const f=validFixture();
  const row=f.attempts[2];
  row.status='engine-error';
  row.nativeRootActionCount=17;
  row.publicRootActions=null;
  row.publicRootActionCount=null;
  row.publicRootLedgerSha256Reported=null;
  row.nativeAbortProvenance={acceptedRootLedgerStatus:'VERIFIED'};
  delete f.gate.fullUntruncatedPublicRootLedger;
  delete f.gate.observedPublicRootLedgerDigest;
  const r=auditIssue25Receipt(f);
  assert.equal(r.rootCustody,'UNRESOLVED');
  assert.equal(r.ledgers[2].verdict,'UNRESOLVED');
  assert.equal(r.ledgers[2].expectedCount,17);
  assert.equal(r.ledgers[2].originalAbortCustodyClaim,'VERIFIED');
  assert.equal(r.evidenceVerdict,'UNRESOLVED');
});

test('a claim of fully captured root actions contradicting a missing abort ledger fails',()=>{
  const f=validFixture();
  f.attempts[2].publicRootActions=null;
  f.attempts[2].publicRootActionCount=null;
  const r=auditIssue25Receipt(f);
  assert.equal(r.contract,'FAIL');
  assert.equal(r.evidenceVerdict,'FAIL');
});

test('equal-length mismatched, duplicated and malformed trial identities are rejected',()=>{
  const f=validFixture();
  f.registration.actualReturnedIds[3]='foreign';
  assert.equal(auditIssue25Receipt(f).identity.verdict,'FAIL');
  f.registration.actualReturnedIds[3]=f.registration.actualReturnedIds[2];
  assert.equal(auditIssue25Receipt(f).identity.verdict,'FAIL');
  assert.equal(auditAttemptIdentity(['x'],['x'],[null]).verdict,'FAIL');
});

test('raw trial identity mismatch is independently disqualifying',()=>{
  const f=validFixture();
  f.attempts[1].actualRawTrialId='other';
  const r=auditIssue25Receipt(f);
  assert.equal(r.identity.rawRowIdentityMatches,false);
  assert.equal(r.evidenceVerdict,'FAIL');
});

test('tampered public action ordinals and report digest independently fail custody',()=>{
  const f=validFixture();
  f.attempts[0].publicRootActions[0].actionOrdinal=17;
  assert.equal(auditIssue25Receipt(f).ledgers[0].verdict,'FAIL');
  const f2=validFixture();
  f2.attempts[0].publicRootLedgerSha256Reported='0'.repeat(64);
  assert.equal(auditIssue25Receipt(f2).ledgers[0].hashCheck,'FAIL');
  assert.equal(auditIssue25Receipt(f2).evidenceVerdict,'FAIL');
});

test('missing SHA testimony remains unresolved even with a complete downloaded action list',()=>{
  const f=validFixture();
  for(const a of f.attempts)delete a.publicRootLedgerSha256Reported;
  delete f.gate.observedPublicRootLedgerDigest;
  const r=auditIssue25Receipt(f);
  assert.equal(r.rootCustody,'UNRESOLVED');
  assert.equal(r.ledgers[0].ordinalChain,true);
  assert.equal(r.ledgers[0].downloadedCount,1);
});

test('source pair fingerprint and starter mismatch must not be considered matched deals',()=>{
  const f=validFixture();
  f.attempts[1].sourceDealFingerprint='different';
  assert.equal(auditIssue25Receipt(f).sourceDeals.verdict,'FAIL');
  const f2=validFixture();
  f2.attempts[3].actualStarterSeat=0;
  assert.equal(auditIssue25Receipt(f2).sourceDeals.verdict,'FAIL');
});

test('one candidate per source group never certifies matched cross-candidate input',()=>{
  const f=validFixture();
  f.attempts.pop();f.registration.ids.pop();f.registration.actualReturnedIds.pop();
  const r=auditIssue25Receipt(f);
  assert.equal(r.identity.verdict,'PASS');
  assert.equal(r.sourceDeals.verdict,'UNRESOLVED');
});

test('truncated root history and impossible action counts fail closed appropriately',()=>{
  const f=validFixture();
  f.attempts[0].publicRootActionsTruncated=true;
  assert.equal(auditIssue25Receipt(f).ledgers[0].verdict,'UNRESOLVED');
  const f2=validFixture();
  f2.attempts[0].nativeRootActionCount=49;
  assert.equal(auditIssue25Receipt(f2).ledgers[0].verdict,'FAIL');
  const empty=auditRootLedger({id:'empty',nativeRootActionCount:0,
    publicRootActionCount:0,publicRootActions:[],
    publicRootLedgerSha256Reported:createHash('sha256')
      .update('[]').digest('hex')},48);
  assert.equal(empty.verdict,'PASS');
});

test('a purportedly qualified game contradicts the declared development-only receipt',()=>{
  const f=validFixture();
  f.reportedCompetitiveGames=1;
  const r=auditIssue25Receipt(f);
  assert.equal(r.contract,'FAIL');
  assert.equal(r.competitiveGamesAdmitted,0);
});

test('empty evidence cannot pass by vacuous truth',()=>{
  const f=validFixture();
  f.registration.ids=[];f.registration.actualReturnedIds=[];f.attempts=[];
  const r=auditIssue25Receipt(f);
  assert.equal(r.identity.verdict,'FAIL');
  assert.equal(r.sourceDeals.verdict,'UNRESOLVED');
  assert.equal(r.evidenceVerdict,'FAIL');
});
