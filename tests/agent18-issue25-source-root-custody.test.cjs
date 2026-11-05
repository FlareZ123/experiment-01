'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {summarizeSourceRoots,summarizeSourcePanel}=
  require('../simulation/evaluation/agent18-issue25-source-root-custody.cjs');

const sha=roots=>createHash('sha256').update(JSON.stringify(roots))
  .digest('hex');
const roots=[
  {actionOrdinal:1,turnBefore:1,playerSlot:1,action:'PlayCardAction',card:'X'},
  {actionOrdinal:2,turnBefore:1,playerSlot:1,action:'ResolvePromptAction'},
  {actionOrdinal:3,turnBefore:1,playerSlot:0,action:'PassTurnAction'},
  {actionOrdinal:4,turnBefore:2,playerSlot:1,action:'AttackAction',attack:'A'},
  {actionOrdinal:5,turnBefore:2,playerSlot:1,action:'PassTurnAction'}
];

function returned(){
  return {trial:{id:'6:0:A:test'},sourceSeat:1,rootActionLedger:roots,
    rootActionCount:roots.length,rootActionLedgerSha256:sha(roots)};
}
function aborted(){
  return {trial:{id:'6:0:A:test'},status:'engine-error',
    sourceSeat:null,candidateSeat:null,
    nativeAbortProvenance:{
      sourceSeat:1,sourceDealStatus:'VERIFIED',
      acceptedRootLedgerStatus:'VERIFIED'
    },
    nativeAbortEvidence:{rootActionLedger:roots,rootActionCount:roots.length,
      rootActionLedgerSha256:sha(roots)}};
}

test('native returned root actions are attributed to verified source seat',()=>{
  const result=summarizeSourceRoots(returned());
  assert.equal(result.status,'VERIFIED_NATIVE_ACTIONS_NOT_PAPER_GAME');
  assert.equal(result.sourceSeat,1);
  assert.equal(result.sourceAcceptedRootCount,4);
  assert.equal(result.sourceSelectedNonPassNonPromptRoots,2);
  assert.equal(result.observedSourceAttacks,1);
  assert.equal(result.observedSourcePasses,1);
  assert.deepEqual(result.selectedSourceExamples.map(e=>e.action),
    ['PlayCardAction','AttackAction']);
});
test('verified aborted provenance rescues owner action attribution',()=>{
  const result=summarizeSourceRoots(aborted());
  assert.equal(result.sourceSeat,1);
  assert.equal(result.disposition,'engine-error');
  assert.equal(result.sourceAcceptedRootCount,4);
  assert.equal(result.observedSourceAttacks,1);
});
test('unverified source physical seat prevents attribution',()=>{
  const row=aborted();
  row.nativeAbortProvenance.sourceDealStatus='SOURCE_SEAT_MISMATCH';
  const out=summarizeSourceRoots(row);
  assert.equal(out.status,'NO_VERIFIED_SOURCE_ROOT_LEDGER');
  assert.equal(out.sourceSeat,null);
});
test('tampered accepted root ledger fails closed',()=>{
  const row=aborted();
  row.nativeAbortEvidence.rootActionLedger=[...roots,{playerSlot:1,action:'AttackAction'}];
  assert.equal(summarizeSourceRoots(row).observedSourceAttacks,undefined);
});
test('missing or wrong ledger digest fails closed',()=>{
  const row=returned();
  row.rootActionLedgerSha256='bad';
  assert.equal(summarizeSourceRoots(row).sourceAcceptedRootCount,null);
});
test('entire registered denominator and paper-game veto retained',()=>{
  const result=summarizeSourcePanel([returned(),aborted(),{}]);
  assert.equal(result.registeredAttempts,3);
  assert.equal(result.observedAttempts,2);
  assert.equal(result.competitiveGamesQualified,0);
  assert.equal(result.paperGameQualified,false);
  assert.equal(result.attempts[2].status,'NO_VERIFIED_SOURCE_ROOT_LEDGER');
});
