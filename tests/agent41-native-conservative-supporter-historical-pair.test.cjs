'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {VERSION,selectedTrials,compact,compareAttempts,run}=
  require('../simulation/evaluation/agent41-native-conservative-supporter-historical-pair.cjs');

function row(trial,change={}){
  return {trial,finished:false,status:null,
    fullPhysicalDealFingerprint:'physical-'+trial.id,
    sourceDealFingerprint:'source-'+trial.id,
    actualStarterSeat:trial.candidateSlot==='A'?0:1,
    verifiedFirstTurn:true,rootActionLedgerSha256:'root-'+trial.id,
    ...change};
}

test('historical two physical source seeds stay preregistered and distinct',()=>{
  assert.match(VERSION,/historical-two-seat/);
  const {trials}=selectedTrials();
  assert.equal(trials.length,2);
  assert.notEqual(trials[0].seed,trials[1].seed);
  assert.deepEqual(trials.map(x=>x.candidateSlot),['A','B']);
});

test('paired audit preserves caps and validates physical start',()=>{
  const {trials}=selectedTrials();
  const baseline={rows:trials.map(t=>row(t))};
  const treated={rows:trials.map(t=>row(t))};
  assert.equal(compareAttempts(baseline,treated).allMatched,true);
  assert.equal(compareAttempts(baseline,treated).rows[0]
    .physicalTargetContrast.status,'incomparable');
  assert.equal(compact(baseline.rows[0]).status,'root-capped');
  assert.equal(compareAttempts(baseline,{
    rows:[row(trials[0],{fullPhysicalDealFingerprint:'other'}),row(trials[1])]
  }).allMatched,false);
  assert.equal(compareAttempts(baseline,{
    rows:[row(trials[0],{verifiedFirstTurn:false}),row(trials[1])]
  }).allMatched,false);
});

test('one isolated boolean changes equally for either physical actor seat',()=>{
  const calls=[];
  const fake=options=>{
    calls.push(options);
    return {attempted:2,rows:options.registeredTrials.map(t=>row(t))};
  };
  const settlementAudit=execute=>({
    result:execute(),audit:{supportRoots:0,printedDrawConfirmed:0}
  });
  const outcome=run({runDevelopment:fake,settlementAudit});
  assert.equal(calls.length,2);
  assert.deepEqual(calls.map(x=>x.bilateralConservativeShuffleRoot),
    [false,true]);
  for(const opts of calls){
    assert.equal(opts.actorOnlyComposition,true);
    assert.equal(opts.paperSupporterQuota,true);
    assert.equal(opts.physicalZoneGate,true);
    assert.equal(opts.nativeSetupCoinChoiceReceipt,true);
    assert.deepEqual(opts.registeredTrials.map(t=>t.id),
      ['11:2:A:champion-reference','11:1:B:champion-reference']);
  }
  assert.equal(outcome.nativeAttemptCountVerified,true);
  assert.equal(outcome.matching.allMatched,true);
  assert.equal(outcome.competitivelyQualifiedGames,0);
  assert.equal(outcome.winRateCertified,false);
});
