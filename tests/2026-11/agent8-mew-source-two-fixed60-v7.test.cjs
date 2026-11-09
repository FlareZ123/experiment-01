'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {STAGES,registered,options,run}=
  require('../../simulation/evaluation/2026-11/agent8-mew-source-two-fixed60-v7.cjs');

test('all v7 Mew-source original groups are new and include both unchanged 60s',()=>{
  const trials=registered();
  assert.equal(trials.length,16);
  assert.deepEqual(STAGES.map(s=>s.id),['S0','S1']);
  const seeds=[...new Set(trials.map(t=>t.seed))];
  assert.equal(seeds.length,8);
  assert.equal(trials.filter(t=>t.candidateSlot==='A').length,8);
  assert.equal(trials.filter(t=>t.candidateSlot==='B').length,8);
  assert.ok(trials.every(t=>t.rank===5&&t.repeat>=3700&&t.repeat<=3707));
  for(const seed of seeds)
    assert.deepEqual(trials.filter(t=>t.seed===seed).map(t=>t.candidateId),
      ['champion-reference','new-moon-lockbreaker-v1']);
});

test('source S0/S1 funding toggles only original Mew recipient and preserves rest',()=>{
  const S0=options(false),S1=options(true);
  assert.equal(S0.actorNaturalEvolutionSourceOnly,true);
  assert.equal(S0.actorMewGenesectTechnoBlastSourceOnly,true);
  assert.equal(S0.actorDceMewMobilitySourceOnly,true);
  assert.equal(S0.actorMewDceRecipientRoot,false);
  assert.equal(S1.actorMewDceRecipientRoot,true);
  assert.equal(S0.actorMewDceRecipientSourceOnly,false);
  assert.equal(S1.actorMewDceRecipientSourceOnly,true);
  for(const field of ['actorMewDceRecipientRoot','actorMewDceRecipientSourceOnly']){
    delete S0[field];delete S1[field];
  }
  assert.deepEqual(S0,S1);
});

test('cross-deck results require source opening AND starter equality for every arm',()=>{
  const trials=registered();
  const result=run({runStage:stage=>({
    selected:{rawDevelopment:{rows:trials.map(trial=>({
      trial,rootActionLedger:[],
      sourceDealFingerprint:'source:'+trial.seed,
      fullPhysicalDealFingerprint:trial.candidateId+':'+trial.seed,
      actualStarterSeat:trial.candidateSlot==='A'?0:1,
      finished:true,winner:trial.candidateSlot==='A'?0:1,
      endReason:'simulated-test-terminal'
    }))}}
  })});
  assert.equal(result.totals.attempted,32);
  assert.equal(result.totals.fullSourceFourwayMatched,8);
  assert.equal(result.totals.comparableAcrossFixed60s,8);
  assert.equal(result.totals.fourNaturalTerminal,8);
  assert.equal(result.paperCompetitivelyQualifiedGames,0);
  assert.equal(result.candidateOutcomes['champion-reference'].S0.nativeCandidateWins,8);
});
