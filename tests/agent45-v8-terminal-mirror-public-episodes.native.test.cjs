'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {writeAtomicLocked}=
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');
const {runIssue25V8WithTelepathAndDefaultConfirmFalse}=
  require('../simulation/evaluation/agent32-issue25-v8-telepath-confirm-default-false.cjs');
const {VERSION,TARGET,auditOriginalV8MirrorTerminal}=
  require('../simulation/evaluation/agent45-v8-terminal-mirror-public-episodes.cjs');

test('original rank1 same-60 mirror: actual 110-root native winner episodes and opposing decisions',()=>{
  const originalRoster=require('../results/aichi-2026/full-decklists.json');
  const originalRank1=originalRoster.decks.find(d=>d.rank===1);
  assert.ok(originalRank1);
  assert.equal(originalRank1.cards.reduce((sum,c)=>sum+c.count,0),60);
  // The shared source/candidate loader's reference is the exact same rank1
  // roster object (agent41-bilateral-v2-development.cjs). No substitution.
  const executed=runIssue25V8WithTelepathAndDefaultConfirmFalse();
  const audited=auditOriginalV8MirrorTerminal(executed);
  assert.equal(audited.schema,VERSION);
  assert.equal(audited.registeredTrialId,TARGET);
  assert.equal(audited.rootCount,110);
  assert.equal(audited.nativeActionCount,110);
  assert.equal(audited.nativeFinished,true);
  assert.equal(audited.nativeWinner,audited.candidateSeat);
  assert.deepEqual(audited.finalPrizes,[6,0]);
  assert.equal(audited.sourceSeat,0);
  assert.equal(audited.candidateSeat,1);
  assert.equal(audited.fullOriginalEightDispositions.length,8);
  assert.equal(new Set(audited.fullOriginalEightDispositions.map(r=>r.id)).size,8);
  assert.equal(audited.clockResetsInRootTape,0);
  assert.equal(audited.perTurnPublicActions.length>0,true);
  assert.equal(audited.paperGamesQualified,0);
  assert.equal(audited.competitiveWinRate,null);
  const compact={
    schema:VERSION,
    sourceCandidateSameOriginal60:true,
    originalRank1PrintedCount:60,
    target:TARGET,seed:audited.originalSeed,
    actorSeats:{source:audited.sourceSeat,candidate:audited.candidateSeat},
    firstSeat:audited.actualStarterSeat,
    native: {finished:audited.nativeFinished,winner:audited.nativeWinner,
      actionCount:audited.nativeActionCount,
      endReason:audited.nativeEndReason,
      finalPrizes:audited.finalPrizes},
    publicRootSha256:audited.publicRootLedgerSha256,
    rootCount:audited.rootCount,
    roleCounts:audited.byRole,
    distinctAttackTurns:{
      source:audited.distinctSourceAttackTurns,
      candidate:audited.distinctCandidateAttackTurns
    },
    sourceAttackPayoffs:audited.sourceSettledAttacks.attacks,
    candidateAttackPayoffs:audited.candidateSettledAttacks.attacks,
    sourcePrizesFromSettledAttacks:audited.prizesFromSettledSourceAttacks,
    candidatePrizesFromSettledAttacks:audited.prizesFromSettledCandidateAttacks,
    lastEightOwnerTurns:audited.perTurnPublicActions.slice(-8),
    originalEightStatuses:audited.fullOriginalEightDispositions,
    paperQualified:0
  };
  console.log('AGENT45_V8_NATIVE_MIRROR_EPISODE',JSON.stringify(compact));
  const dir=process.env.AGENT45_V8_MIRROR_EPISODE_DIR;
  if(dir){
    fs.mkdirSync(dir,{recursive:true});
    const file=path.join(dir,'agent45-v8-mirror-public-episodes.json');
    const bytes=JSON.stringify(audited,null,2)+'\n';
    writeAtomicLocked(file,bytes);
    writeAtomicLocked(file+'.sha256',createHash('sha256')
      .update(bytes).digest('hex')+'  '+path.basename(file)+'\n');
  }
});
