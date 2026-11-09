'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {
  PHASES,registered,sourceChallengeRootOptions,
  compareGroup,analyze,run
}=require('../../simulation/evaluation/2026-11/agent8-source-challenger-2x2.cjs');

/**
 * Fake only the summary fields exercised by the pure comparison.
 * The real executable remains a mandatory pinned native Store experiment.
 * @param {object} original
 * @param {object} [options]
 */
function summary(original,options={}){
  return {
    id:original.id,rank:original.rank,seed:original.seed,
    sourceSeat:original.candidateSlot==='A'?1:0,
    candidateSeat:original.candidateSlot==='A'?0:1,
    winner:options.winner??(original.candidateSlot==='A'?1:0),
    status:options.status??'native-terminal',
    remainingPrizes:[3,4],
    fullPhysicalDealFingerprint:options.deal??{sha:'same-'+original.id},
    sourceDealFingerprint:options.sourceDeal??{sha:'source-'+original.id},
    rootActionLedger:[]
  };
}

test('registered prospectively generated Aichi original 60s have both seats and unique deals',()=>{
  const rows=registered();
  assert.equal(rows.length,8);
  assert.equal(new Set(rows.map(row=>row.seed)).size,8);
  assert.deepEqual([...new Set(rows.map(row=>row.rank))],[5,11,13,31]);
  assert.deepEqual(rows.filter(row=>row.rank===13)
    .map(row=>row.candidateSlot),['A','B']);
});

test('source challenger is disabled without altering the common prompt bridge',()=>{
  const off=sourceChallengeRootOptions(false);
  const on=sourceChallengeRootOptions(true);
  assert.equal(off.actorGuzmaPromptContinuation,true);
  assert.equal(on.actorGuzmaPromptContinuation,true);
  assert.equal(off.actorSeekerGuzmaNominalKo,false);
  assert.equal(on.actorSeekerGuzmaNominalKo,true);
  assert.equal(on.actorSeekerGuzmaSourceOnly,true);
  assert.equal(on.actorGenericFundedFloatStoneSourceOnly,true);
  assert.equal(on.actorPotentialKoSourceOnly,true);
  assert.equal(on.actorPotentialKoRoot,true);
  assert.deepEqual(PHASES.map(p=>p.id),['P0S0','P1S0','P0S1','P1S1']);
  assert.equal(PHASES.filter(p=>p.pivot).length,2);
  assert.equal(PHASES.filter(p=>p.sourceChallenge).length,2);
});

test('source-only challenge changes winner only when all four native terminals exist',()=>{
  const row=registered()[0];
  const sourceWinner=row.candidateSlot==='A'?1:0;
  const candidateWinner=1-sourceWinner;
  const rows=[
    summary(row,{winner:sourceWinner}),
    summary(row,{winner:candidateWinner}),
    summary(row,{winner:sourceWinner}),
    summary(row,{winner:sourceWinner})
  ];
  const matched=compareGroup(rows,row);
  assert.equal(matched.physicallyMatchedAcrossFour,true);
  assert.equal(matched.fourNativeTerminals,true);
  assert.equal(matched.winnerChangedByPivotBeforeSourceChallenge,true);
  assert.equal(matched.winnerChangedByPivotAfterSourceChallenge,false);
  assert.equal(matched.winnerChangedBySourceChallengeWithPivot,true);
  rows[3]=summary(row,{winner:candidateWinner,status:'root-cap'});
  const capped=compareGroup(rows,row);
  assert.equal(capped.fourNativeTerminals,false);
  assert.equal(capped.winnerChangedBySourceChallengeWithPivot,false);
  assert.equal(capped.P1S1.candidateWin,null);
});

test('missing or changed fingerprints fail the all-four admission',()=>{
  const rows=registered();
  const byPhase=Object.fromEntries(PHASES.map(phase=>[
    phase.id,rows.map(group=>summary(group))
  ]));
  assert.equal(analyze(byPhase,rows).status,'PHYSICAL-MATCHED-DEVELOPMENT-ONLY');
  byPhase.P1S1[2].fullPhysicalDealFingerprint=null;
  const invalid=analyze(byPhase,rows);
  assert.equal(invalid.status,'INVALID-PHYSICAL-MATCH-OR-MISSING-FINGERPRINT');
  assert.equal(invalid.totals.fullPhysicalMatchFourWays,7);
  assert.equal(invalid.qualifiedPaperGames,0);
});

test('main integration callback invokes each phase and preserves every failed attempt',()=>{
  const groups=registered(),calls=[];
  const result=run({runPhase:phase=>{
    calls.push(phase.id);
    return {selected:{rawDevelopment:{rows:groups.map(group=>({
      trial:group,
      finished:phase.id==='P0S0',
      winner:phase.id==='P0S0'?group.candidateSlot==='A'?1:0:null,
      error:phase.id==='P1S1'?'native abort test':null,
      actionCount:0,rootActionLedger:[],
      fullPhysicalDealFingerprint:{sha:group.id},
      sourceDealFingerprint:{sha:'source-'+group.id},
      finalPrizes:[6,6]
    }))}}};
  }});
  assert.deepEqual(calls,['P0S0','P1S0','P0S1','P1S1']);
  assert.equal(result.nativeAttempts,32);
  assert.equal(result.totals.nativeErrors,8);
  assert.equal(result.totals.fourWayNaturalTerminalGroups,0);
  assert.equal(result.totals.winnerChangedBySourceChallengeWithPivot,0);
  assert.equal(result.qualifiedPaperGames,0);
  assert.equal(result.phaseSummaries.P1S1.length,8);
  assert.equal(result.rawNativeRows.P1S1.length,8);
});
