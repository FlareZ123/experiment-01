'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {analyzeSourcePassAttackContext}=
  require('../simulation/evaluation/agent18-steward-source-pass-attack-context.cjs');

/** @param {object[]} tape @param {'A'|'B'} [slot] */
function row(tape,slot='A') {
  const digest=createHash('sha256').update(JSON.stringify(tape)).digest('hex');
  return {id:'6:100:'+slot+':fixture',status:'returned-unqualified',
    originalSourceSeat:slot==='A'?1:0,
    sourceDealFingerprint:'a'.repeat(64),
    fullPhysicalDealFingerprint:'b'.repeat(64),
    publicRootActions:tape,publicRootActionCount:tape.length,
    publicRootActionsTruncated:false,publicRootLedgerSha256Computed:digest,
    publicRootLedgerSha256Reported:digest,
    publicRootLedgerDigestConsistent:true};
}
const pass={action:'PassTurnAction',playerSlot:1,turnBefore:3,actionOrdinal:5};
test('Shadow Mist attribution requires exact immediately previous turn',()=>{
  const prior={action:'AttackAction',playerSlot:0,turnBefore:2,
    actionOrdinal:4,attack:'Shadow Mist'};
  const r=analyzeSourcePassAttackContext({attempts:[row([prior,pass])]});
  assert.equal(r.categories.SHADOW_MIST_PRIOR_TURN,1);
  assert.equal(r.paperLegalOpportunitiesCertified,0);
  const outside=analyzeSourcePassAttackContext({attempts:[row([
    {...prior,turnBefore:1},pass])]});
  assert.equal(outside.categories.NO_RECORDED_OPPONENT_ATTACK_PRIOR_TURN,1);
});
test('other attack does not become a Special Energy lock assertion',()=>{
  const r=analyzeSourcePassAttackContext({attempts:[row([
    {action:'AttackAction',playerSlot:0,turnBefore:2,attack:'Energy Drive'},
    pass])]});
  assert.equal(r.categories.OTHER_OPPONENT_ATTACK_PRIOR_TURN,1);
});
test('source seat B is not mistaken for opponent seat',()=>{
  const r=analyzeSourcePassAttackContext({attempts:[row([
    {action:'AttackAction',playerSlot:1,turnBefore:5,attack:'Shadow Mist'},
    {action:'PassTurnAction',playerSlot:0,turnBefore:6,actionOrdinal:8}
  ],'B')]});
  assert.equal(r.verifiedAttemptTapes,1);
  assert.equal(r.categories.SHADOW_MIST_PRIOR_TURN,1);
});
test('bad digest, incorrect seat and missing physical deal each fail closed',()=>{
  const original=row([pass]);
  const broken=[{...original,publicRootLedgerSha256Reported:'0'.repeat(64)},
    {...original,originalSourceSeat:0},
    {...original,sourceDealFingerprint:null}];
  const r=analyzeSourcePassAttackContext({attempts:broken});
  assert.equal(r.registeredAttempts,3);
  assert.equal(r.unverifiableAttempts,3);
  assert.equal(r.classifiedSourcePasses,0);
  assert.ok(r.attempts.every(x=>x.totalSourcePasses===null));
});
test('aborted arms retained and not invented as zero-source-pass matches',()=>{
  const r=analyzeSourcePassAttackContext({attempts:[row([pass]),{
    id:'11:102:A:fixture',status:'engine-error',
    publicRootActions:[],publicRootActionsTruncated:false,
    publicRootActionCount:0}]});
  assert.equal(r.registeredAttempts,2);
  assert.equal(r.verifiedAttemptTapes,1);
  assert.equal(r.unverifiableAttempts,1);
  assert.equal(r.classifiedSourcePasses,1);
  assert.equal(r.competitivelyQualifiedGames,0);
});
