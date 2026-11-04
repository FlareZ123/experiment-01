'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {choose}=require('../simulation/evaluation/agent1-prize-failure-budget.cjs');
const {openingBenchOccupancyTradeoff}=
  require('../simulation/evaluation/agent50-setup-bench-occupancy-tradeoff.cjs');
const {
  VERSION,noTargetInBonus,sourceMulliganBenchTradeoff,
  original29VsRank26OpeningTradeoff
}=require('../simulation/evaluation/agent7-rank26-mulligan-bench-preservation.cjs');

function permutations(a){
  if(a.length===0)return [[]];
  return a.flatMap((item,index)=>permutations([
    ...a.slice(0,index),...a.slice(index+1)
  ]).map(rest=>[item,...rest]));
}

test('SFT independent 8-card physical opener plus entire 5-card bonus order and geometric tail',()=>{
  // T,T,R,R,R,O,O,O. A valid starting hand has at least one T or R.
  // The source has 2 Basic in 8 with an ordinary source-three opener.
  const category=['T','T','R','R','R','O','O','O'];
  const deckSize=category.length,H=3,sourceBasics=2;
  const bad=Number(choose(8-sourceBasics,3))/Number(choose(8,3));
  let valid=0,greedy=0,strict=0;
  for(let a=0;a<deckSize;a++)
    for(let b=a+1;b<deckSize;b++)
      for(let c=b+1;c<deckSize;c++){
        const selected=[a,b,c];
        const r=selected.filter(i=>category[i]==='R').length;
        const t=selected.filter(i=>category[i]==='T').length;
        if(r+t===0)continue;
        valid++;
        const rest=Array.from({length:deckSize},(_,i)=>i)
          .filter(i=>!selected.includes(i));
        const perms=permutations(rest);
        for(const order of perms){
          let p=1-bad;
          for(let m=0;m<=rest.length;m++){
            const weight=m===rest.length?Math.pow(bad,m):p;
            const bonus=order.slice(0,m).map(i=>category[i]);
            const anyR=bonus.includes('R'),anyBasic=bonus.some(
              item=>item==='R'||item==='T');
            greedy+=weight*Number(r+t===1&&!anyBasic)/perms.length;
            strict+=weight*Number(r<=1&&!anyR)/perms.length;
            p*=bad;
          }
        }
      }
  const result=sourceMulliganBenchTradeoff(5,2,sourceBasics,{
    deckSize:8,openingCards:H,opponentDeckSize:8,
    opponentOpeningCards:H
  });
  assert.equal(valid,Number(choose(8,3)-choose(3,3)));
  assert.ok(Math.abs(result.opponentMulliganFailure-bad)<1e-14);
  assert.ok(Math.abs(result.greedyLoneAfterBonus-greedy/valid)<1e-13);
  assert.ok(Math.abs(result.strictEntryPreservingLoneAfterBonus-
    strict/valid)<1e-13);
  assert.ok(Math.abs(result.necessaryTriggerSacrificeForSecondPokemon-
    (strict-greedy)/valid)<1e-13);
  console.log('AGENT7_SOURCE_MULLIGAN_BRUTE_SFT',JSON.stringify({
    sourceMulliganFailure:bad,validInitialSets:valid,
    greedySolo:result.greedyLoneAfterBonus,
    strictSolo:result.strictEntryPreservingLoneAfterBonus,
    tacticalSacrifice:result.necessaryTriggerSacrificeForSecondPokemon
  }));
});

test('SFT no extra cards leaves exactly Agent50 original seven-Basic occupancy',()=>{
  const pairs=[[13,6],[14,3],[11,2],[12,2],[7,2],[4,0]];
  for(const [B,T] of pairs){
    // Source with every card Basic never mulligans, q=0.
    const v=sourceMulliganBenchTradeoff(B,T,60);
    const previous=openingBenchOccupancyTradeoff(B,T);
    assert.equal(v.opponentMulliganFailure,0);
    assert.ok(Math.abs(
      v.additionalLoneFromStrictProtectionWithoutBonus-
      previous.extraSoloActiveSetupProbability)<1e-12);
    assert.ok(Math.abs(
      v.additionalLoneFromStrictProtectionAfterBonus-
      previous.extraSoloActiveSetupProbability)<1e-12);
    assert.ok(Math.abs(v.greedyLoneWithoutBonus-
      (1-previous.greedyAnyBench))<1e-12);
    assert.ok(Math.abs(v.strictEntryPreservingLoneWithoutBonus-
      (1-previous.protectedAnyBench))<1e-12);
  }
});

test('SFT source rank26 12-Basic opponent bonus yields 29 named originals and 4 distinct candidate risk panels',()=>{
  const field=original29VsRank26OpeningTradeoff();
  assert.equal(VERSION,
    'agent7-rank26-opponent-mulligan-bench-preservation-v1');
  assert.equal(field.sourceOpponentRank,26);
  assert.equal(field.sourceOpponentPrintedBasicCount,12);
  assert.equal(field.authenticatedOriginalRows,29);
  assert.deepEqual(field.missingOriginalSourceRanks,[23,25,28]);
  assert.equal(field.proposedCandidateRows,4);
  assert.equal(field.selectedPolicyChanged,false);
  assert.equal(field.competitiveGamesQualified,0);
  const mean=field.equalRankMeans;
  assert.ok(Math.abs(mean.greedyLoneAfterBonus-
    0.449733117981443)<1e-12);
  assert.ok(Math.abs(mean.strictEntryPreservingLoneAfterBonus-
    0.569261995915550)<1e-12);
  assert.ok(Math.abs(mean.necessaryTriggerSacrificeForSecondPokemon-
    0.119528877934107)<1e-12);
  assert.ok(Math.abs(mean.additionalLoneFromStrictProtectionWithoutBonus-
    0.1209133429835215)<1e-12);
  const rank4=field.originalRows.find(x=>x.rank===4);
  assert.ok(Math.abs(rank4.necessaryTriggerSacrificeForSecondPokemon-
    0.3479637691883913)<1e-12);
  assert.ok(rank4.necessaryTriggerSacrificeForSecondPokemon>
    rank4.additionalLoneFromStrictProtectionWithoutBonus,
    'Mulligan bonus can increase relative solo exposure when it draws protected triggers');
  const adp=field.candidates.find(x=>x.candidate.includes('ADP'));
  assert.ok(adp);
  assert.ok(Math.abs(adp.necessaryTriggerSacrificeForSecondPokemon-
    0.1448474990502866)<1e-12);
  assert.ok(field.originalRows.every(x=>
    x.strictEntryPreservingLoneAfterBonus>=
      x.greedyLoneAfterBonus-1e-12));
  console.log('AGENT7_RANK26_MULLIGAN_FIELD29',JSON.stringify({
    sourceOpponentRank:26,knownOriginals:29,
    meanGreedySolo:mean.greedyLoneAfterBonus,
    meanStrictSolo:mean.strictEntryPreservingLoneAfterBonus,
    meanAdaptiveTriggerSacrifice:
      mean.necessaryTriggerSacrificeForSecondPokemon,
    rank4AdditionalSolo:rank4.necessaryTriggerSacrificeForSecondPokemon,
    candidateCases:field.candidates.map(c=>({
      candidate:c.candidate,
      triggerSacrifice:c.necessaryTriggerSacrificeForSecondPokemon
    }))
  }));
});

test('SFT target-free bonus always contains zero targets, and q=0 suppresses all bonus',()=>{
  for(const n of [0,1,7,53]){
    assert.ok(Math.abs(noTargetInBonus(n,0,0.4)-1)<1e-12);
    assert.equal(noTargetInBonus(n,n,0),1);
    if(n>0)
      assert.ok(Math.abs(noTargetInBonus(n,n,0.4)-0.6)<1e-12);
  }
});
