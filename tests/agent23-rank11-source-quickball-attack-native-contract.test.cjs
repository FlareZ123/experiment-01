'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {TARGET,FACTORS,frozenTrial,physicalSourceRootCensus,run}=
  require('../simulation/evaluation/2026-11/agent23-rank11-source-quickball-vs-attack-native.cjs');

test('one original registered source physical deal and four deterministic factors',()=>{
  const trial=frozenTrial();
  assert.equal(trial.id,TARGET);
  assert.equal(trial.seed,3592222510);
  assert.equal(trial.rank,11);
  assert.equal(trial.candidateSlot,'B');
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

test('four-arm real-root contract requires same source deal and source-owned first change',()=>{
  const base=frozenTrial();
  const observed=[];
  const result=run({
    runFactor:factor=>{
      observed.push(factor.id);
      const action=factor.attackBeforeQuickBall?
        {playerSlot:0,action:'AttackAction',attackName:'Psychic',
          turnBefore:8,ordinal:20}:
        {playerSlot:0,action:'PlayCardAction',card:'Quick Ball',
          turnBefore:8,ordinal:20};
      return {selected:{rawDevelopment:{rows:[{
        trial:base,finished:true,winner:0,
        fullPhysicalDealFingerprint:{public:'same-actual-physical'},
        sourceDealFingerprint:{source:'same'},
        rootActionLedger:[action],finalPrizes:[6,0],actionCount:1
      }]}}};
    }
  });
  assert.deepEqual(observed,FACTORS.map(x=>x.id));
  assert.equal(result.physicalMatchInBothPivotConditions,true);
  assert.equal(result.sourceOnlyFirstDifferenceInBothPivotConditions,true);
  assert.equal(result.pairs.length,2);
  for(const row of result.pairs){
    assert.equal(row.firstDifferentAcceptedRoot.ordinal,0);
    assert.equal(row.firstDifferentAcceptedRoot.baseline.card,'Quick Ball');
    assert.equal(row.firstDifferentAcceptedRoot.treatment.attackName,'Psychic');
    assert.equal(row.payableAttackPriority.sourceAttacks.length,1);
    assert.equal(row.incumbentQuickBallFirst.sourceQuickBalls.length,1);
    assert.equal(row.paperCompetitiveQualifiedGames,0);
  }
  assert.equal(result.qualifiedPaperGames,0);
  assert.equal(result.winRate,null);
});

test('differing source physical deal fails admission without rewriting paper outcome',()=>{
  const base=frozenTrial();
  const result=run({
    runFactor:factor=>({
      selected:{rawDevelopment:{rows:[{
        trial:base,finished:true,winner:0,
        fullPhysicalDealFingerprint:{key:factor.attackBeforeQuickBall?'different':'base'},
        sourceDealFingerprint:{key:'same'},
        rootActionLedger:[],
        finalPrizes:[6,0],actionCount:0
      }]}}
    })
  });
  assert.equal(result.physicalMatchInBothPivotConditions,false);
  assert.equal(result.qualifiedPaperGames,0);
  assert.equal(result.winRate,null);
});
