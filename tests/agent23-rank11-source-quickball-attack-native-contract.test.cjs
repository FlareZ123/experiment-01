'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {TARGET,REGISTERED_IDS,FACTORS,frozenTrial,frozenTrials,
  physicalSourceRootCensus,run}=
  require('../simulation/evaluation/2026-11/agent23-rank11-source-quickball-vs-attack-native.cjs');

test('one original registered source physical deal and four deterministic factors',()=>{
  const trial=frozenTrial();
  assert.equal(trial.id,TARGET);
  assert.equal(trial.seed,3592222510);
  assert.equal(trial.rank,11);
  assert.equal(trial.candidateSlot,'B');
  assert.equal(frozenTrials().length,4);
  assert.deepEqual(frozenTrials().map(x=>x.id),REGISTERED_IDS);
  assert.deepEqual(FACTORS.map(x=>x.id),['P0Q0','P0Q1','P1Q0','P1Q1']);
  assert.deepEqual(new Set(FACTORS.map(x=>JSON.stringify([
    x.pivot,x.attackBeforeQuickBall]))).size,4);
});

test('actual source ledger counts exact Quick Ball and attack names but excludes candidate',()=>{
  const trial=frozenTrial();
  const source=physicalSourceRootCensus({trial,rootActionLedger:[
    {playerSlot:0,action:'PlayCardAction',card:'Quick Ball',turnBefore:8,ordinal:4},
    {playerSlot:0,action:'AttackAction',attackName:'Psychic',turnBefore:8,ordinal:5},
    {playerSlot:1,action:'PlayCardAction',card:'Quick Ball',turnBefore:9,ordinal:6},
    {playerSlot:0,action:'PassTurnAction',turnBefore:10}
  ]});
  assert.equal(source.sourceSeat,0);
  assert.equal(source.sourceQuickBalls.length,1);
  assert.equal(source.sourceQuickBalls[0].ordinal,4);
  assert.equal(source.sourceAttacks.length,1);
  assert.equal(source.sourceAttacks[0].name,'Psychic');
  assert.equal(source.sourcePasses,1);
});

test('four-arm selected native contract requires all four source deals with source-owned target change',()=>{
  const trials=frozenTrials(),observed=[];
  const result=run({
    runFactor:factor=>{
      observed.push(factor.id);
      const rows=trials.map(trial=>{
        const sourceSeat=trial.candidateSlot==='A'?1:0;
        const action=factor.attackBeforeQuickBall&&trial.id===TARGET?
          {playerSlot:sourceSeat,action:'AttackAction',
            attackName:'Psychic',turnBefore:8,ordinal:20}:
          {playerSlot:sourceSeat,action:'PlayCardAction',
            card:'Quick Ball',turnBefore:8,ordinal:20};
        return {
          trial,finished:true,winner:sourceSeat,
          fullPhysicalDealFingerprint:{key:trial.id},
          sourceDealFingerprint:{key:trial.id},
          rootActionLedger:[action],finalPrizes:[6,0],actionCount:1
        };
      });
      return {selected:{rawDevelopment:{rows}}};
    }
  });
  assert.deepEqual(observed,FACTORS.map(x=>x.id));
  assert.equal(result.physicalMatchInEveryPivotCondition,true);
  assert.equal(result.rank11SourceFirstDifferences,2);
  assert.equal(result.pairs.length,8);
  assert.equal(result.targetPairByCandidatePivot.length,2);
  for(const row of result.targetPairByCandidatePivot){
    assert.equal(row.firstDifferentAcceptedRoot.ordinal,0);
    assert.equal(row.firstDifferentAcceptedRoot.baseline.card,'Quick Ball');
    assert.equal(row.firstDifferentAcceptedRoot.treatment.attackName,'Psychic');
    assert.equal(row.payableAttackPriority.sourceAttacks.length,1);
    assert.equal(row.incumbentQuickBallFirst.sourceQuickBalls.length,1);
    assert.equal(row.paperCompetitiveQualifiedGames,0);
    assert.equal(row.samePhysicalDeal,true);
  }
  assert.equal(result.qualifiedPaperGames,0);
  assert.equal(result.winRate,null);
});

test('differing physical deal on one source excludes whole aggregate, never invents wins',()=>{
  const trials=frozenTrials();
  const result=run({
    runFactor:factor=>({
      selected:{rawDevelopment:{rows:trials.map(trial=>({
        trial,finished:true,winner:0,
        fullPhysicalDealFingerprint:{
          key:factor.attackBeforeQuickBall&&trial.id===TARGET?
            'different':trial.id
        },
        sourceDealFingerprint:{key:trial.id},
        rootActionLedger:[],finalPrizes:[6,0],actionCount:0
      }))}}
    })
  });
  assert.equal(result.physicalMatchInEveryPivotCondition,false);
  assert.equal(result.pairs.length,8);
  assert.equal(result.qualifiedPaperGames,0);
  assert.equal(result.winRate,null);
});
