'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {auditNativeSourceDecisions}=require(
  '../simulation/evaluation/agent3-issue25-native-source-decision-census.cjs');

const sha256=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

function action(index,seat,kind,turnBefore,turnAfter,extras={}){
  return {actionOrdinal:index,playerSlot:seat,action:kind,
    turnBefore,turnAfter,...extras};
}
function attempt(id,sourceSeat,roots){
  const digest=sha256(roots);
  return {id,status:'returned-unqualified',
    actualRawTrialId:id,originalSourceSeat:sourceSeat,
    candidateSeat:1-sourceSeat,actualFirstPlayer:0,
    nativeRootActionCount:roots.length,
    publicRootActionCount:roots.length,
    publicRootActions:roots,publicRootActionsTruncated:false,
    publicRootLedgerSha256Reported:digest,
    publicRootLedgerSha256Computed:digest,nativeAbortProvenance:null};
}
function receipt(rows){
  const ids=rows.map(row=>row.id);
  return {actuallyExecutingManifest:{nativeRootActionLimit:48,
    observedTwinleafGitCommit:'a'.repeat(40),
    observedRepositoryGitCommit:'b'.repeat(40)},
    registration:{expectedIds:ids,exactJoinedByTrialId:true},
    attempts:rows};
}

test('zero source actions remain zero despite prompts and candidate attacks',()=>{
  const rows=[attempt('6:100:A:champion-reference',1,[
    action(0,0,'ResolvePromptAction',0,0,{pendingPrompt:'ChooseCardsPrompt'}),
    action(1,1,'PassTurnAction',1,1),
    action(2,0,'AttackAction',2,2,{attack:'Shadow Mist'}),
    action(3,0,'ResolvePromptAction',2,3,{pendingPrompt:'WaitPrompt'})
  ])];
  const r=auditNativeSourceDecisions(receipt(rows));
  assert.equal(r.totalAttempts,1);
  assert.equal(r.totalNativeRoots,4);
  assert.equal(r.totalSourceNonPassNonPrompt,0);
  assert.equal(r.totalSourceAttacks,0);
  assert.equal(r.totalCandidateAttacks,1);
  assert.equal(r.totalSetupRoots,1);
  assert.equal(r.totalWaitPromptRoots,1);
  assert.equal(r.perRank[0].attemptsWithZeroSourceNonPass,1);
  assert.equal(r.qualifiedGames,0);
});

test('native abort source seat is attributed explicitly without promoting games',()=>{
  const row=attempt('11:102:A:champion-reference',1,[
    action(0,1,'PlayCardAction',1,1,{card:'Darkness Energy'}),
    action(1,1,'AttackAction',1,1,{attack:'Get Lost'}),
    action(2,0,'PassTurnAction',1,2)
  ]);
  row.originalSourceSeat=null;
  row.candidateSeat=null;
  row.nativeAbortProvenance={sourceSeat:1};
  row.status='engine-error';
  const r=auditNativeSourceDecisions(receipt([row]));
  assert.equal(r.totalSourceNonPassNonPrompt,2);
  assert.equal(r.totalSourceAttacks,1);
  assert.equal(r.observed[0].sourceSeatProvenance,
    'independently-attested-native-abort');
  assert.equal(r.observed[0].nativeDisposition,'engine-error');
});

test('reversed physical seats are rejected',()=>{
  const a=attempt('6:100:A:champion-reference',1,[]);
  a.candidateSeat=1;
  assert.throws(()=>auditNativeSourceDecisions(receipt([a])));
});

test('contradicting independent abort seat is rejected',()=>{
  const a=attempt('6:100:A:champion-reference',1,[]);
  a.nativeAbortProvenance={sourceSeat:0};
  assert.throws(()=>auditNativeSourceDecisions(receipt([a])));
});

test('mismatched stored native action hash is rejected',()=>{
  const a=attempt('6:100:A:champion-reference',1,[
    action(0,1,'PassTurnAction',1,2)
  ]);
  a.publicRootLedgerSha256Reported='0'.repeat(64);
  assert.throws(()=>auditNativeSourceDecisions(receipt([a])));
});

test('duplicate native attempt identity is rejected',()=>{
  const a=attempt('6:100:A:champion-reference',1,[]);
  assert.throws(()=>auditNativeSourceDecisions(receipt([a,a])));
});
