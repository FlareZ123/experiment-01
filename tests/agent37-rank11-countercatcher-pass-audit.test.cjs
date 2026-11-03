'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {auditTrial,auditArchive}=
  require('../scripts/agent37-rank11-countercatcher-pass-audit.cjs');
/** @returns {object} Synthetic root schema, never treated as a real game. */
function fixture(){
  return {trial:{rank:11,id:'11:0:A:test'},sourceSeat:1,candidateSeat:0,
    sourceDealFingerprint:'fixture',
    rootActionLedger:[
      {actionOrdinal:5,action:'AttackAction',playerSlot:1},
      {actionOrdinal:8,action:'PassTurnAction',playerSlot:0,turnBefore:32}],
    sourceAttackSettlement:{attacks:[{
      actionOrdinal:5,attackName:'Claw of Darkness',prizesAfter:[6,5]}]},
    candidateRepliesAfterSourceAttacks:[{
      sourceAttackOrdinal:5,sourceAttackName:'Claw of Darkness',
      sameEpochCandidateReplyVerified:true,
      candidateReplyTurnFinalPass:{ordinal:8,turn:32,
        ownerHandAfterDecision:['Counter Catcher PAR',
          "Lillie's Determination M1L"],
        publicBoardBeforePass:[{bench:[]},{bench:[{
          name:'Squawkabilly ex',energyCards:[]}]}]}}]};
}
test('actual ordinal, paid-attack and behind-Prizes structural screen',()=>{
  const x=auditTrial(fixture());
  assert.equal(x.count,1);
  assert.equal(x.windows[0].heldLillie,true);
  assert.equal(x.windows[0].nativeCanPlayVerified,false);
  assert.equal(x.competitiveGamesQualified,0);
});
test('both physical seat mappings',()=>{
  const f=fixture();f.sourceSeat=0;f.candidateSeat=1;
  f.rootActionLedger[0].playerSlot=0;
  f.rootActionLedger[1].playerSlot=1;
  f.sourceAttackSettlement.attacks[0].prizesAfter=[5,6];
  f.candidateRepliesAfterSourceAttacks[0]
    .candidateReplyTurnFinalPass.publicBoardBeforePass.reverse();
  assert.equal(auditTrial(f).count,1);
});
for(const [label,mutate] of [
  ['equal Prizes',f=>{f.sourceAttackSettlement.attacks[0].prizesAfter=[5,5];}],
  ['no Catcher',f=>{f.candidateRepliesAfterSourceAttacks[0]
    .candidateReplyTurnFinalPass.ownerHandAfterDecision.shift();}],
  ['empty target Bench',f=>{f.candidateRepliesAfterSourceAttacks[0]
    .candidateReplyTurnFinalPass.publicBoardBeforePass[1].bench=[];}],
  ['absent same-epoch witness',f=>{f.candidateRepliesAfterSourceAttacks[0]
    .sameEpochCandidateReplyVerified=false;}],
  ['different attack',f=>{f.candidateRepliesAfterSourceAttacks[0]
    .sourceAttackName='Terminal Period';}]
])test('excludes '+label,()=>{const f=fixture();mutate(f);
  assert.equal(auditTrial(f).count,0);
});
test('mismatched actual Pass action must fail closed',()=>{
  const f=fixture();f.rootActionLedger[1].actionOrdinal=9;
  assert.throws(()=>auditTrial(f));
});
test('archive retains negative rank11 trial and omits non-rank11',()=>{
  const a=fixture(),b=fixture();b.trial.rank=5;
  const x=auditArchive({cohorts:[{raw:{rows:[a,b]}}]});
  assert.equal(x.attempts,1);assert.equal(x.structuralWindows,1);
  assert.equal(x.competitiveGamesQualified,0);
});
