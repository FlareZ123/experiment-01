'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {classifyNativeAttempt,summarizeNativeAttempts,
  classifySourceChain,SOURCE_CHAIN_PHASES}=
  require('../simulation/evaluation/agent41-native-attempt-disposition.cjs');
const archived=require('../results/aichi-2026/agent41-rank16-native-row-schema-v1.json');
const earlierRank6=require('../results/aichi-2026/agent41-rank6-native-row-schema-v1.json');

test('actual archived rank16 Store rows have no status property',()=>{
  assert.equal(archived.schema,'agent41-original-native-row-shape-v1');
  assert.equal(archived.source.workflowRunId,41507843137);
  assert.equal(archived.source.artifactId,13171637457);
  const rows=archived.rows;
  assert.equal(rows.length,16);
  assert.ok(rows.every(row=>row.statusKeyPresent===false));
  const classified=rows.map(row=>classifyNativeAttempt(row));
  assert.equal(classified.filter(row=>row.kind==='ENGINE_TERMINAL').length,9);
  assert.equal(classified.filter(row=>row.kind==='ACTION_CAP').length,7);
  assert.ok(classified.every(row=>row.competitivelyQualified===false));
  const report=summarizeNativeAttempts(rows.map(row=>({
    ...row,trial:{id:row.trialId}
  })));
  assert.equal(report.total,16);
  assert.deepEqual(report.counts,{ENGINE_TERMINAL:9,ACTION_CAP:7});
  assert.equal(report.competitivelyQualifiedGames,0);
});

test('exceptions, aborts and prechecks stay separate from terminals',()=>{
  for(const status of ['engine-error','engine-physical-invalid',
    'paper-supporter-quota-veto']){
    assert.equal(classifyNativeAttempt({status,error:'native Store refused'}).kind,
      'NATIVE_ABORT');
  }
  assert.equal(classifyNativeAttempt({status:'registration-rejected'}).kind,
    'PRECHECK_REJECTED');
  assert.equal(classifyNativeAttempt(null).kind,'MISSING_ROW');
  assert.equal(classifyNativeAttempt(2).kind,'INVALID_ROW');
});

test('synthetic legacy labels never override contradictory native fields',()=>{
  assert.equal(classifyNativeAttempt({status:'engine-terminal'}).kind,
    'CONFLICTING_NATIVE_FIELDS');
  assert.equal(classifyNativeAttempt({status:'action-cap'}).kind,'UNVERIFIED');
  assert.equal(classifyNativeAttempt({finished:true}).kind,'UNVERIFIED');
  assert.equal(classifyNativeAttempt({finished:true,endReason:'action-limit'}).kind,
    'CONFLICTING_NATIVE_FIELDS');
  assert.equal(classifyNativeAttempt({finished:false,endReason:'engine-game-end'}).kind,
    'CONFLICTING_NATIVE_FIELDS');
  assert.equal(classifyNativeAttempt({finished:true,endReason:'engine-game-end',
    status:'engine-error'}).kind,'CONFLICTING_NATIVE_FIELDS');
  assert.equal(classifyNativeAttempt({finished:false,endReason:'action-limit',
    winner:1}).kind,'CONFLICTING_NATIVE_FIELDS');
});

test('game end reason never certifies a paper win',()=>{
  const terminal=classifyNativeAttempt({finished:true,
    endReason:'engine-game-end',winner:1});
  assert.equal(terminal.kind,'ENGINE_TERMINAL');
  assert.equal(terminal.winner,1);
  assert.equal(terminal.competitivelyQualified,false);
});

test('archived reply roots cannot certify the absent characteristic root',()=>{
  assert.ok(archived.rows.every(row=>row.ownerFirstTurnObserved));
  assert.ok(archived.rows.every(row=>row.nextOpponentRootObserved));
  assert.ok(archived.rows.every(row=>row.historicalCompleteTurnAndReplyWitness));
  assert.ok(archived.rows.every(row=>!row.characteristicRootSelected));
  for(const row of archived.rows){
    const gate=classifySourceChain({
      ownerOpportunityObserved:row.ownerFirstTurnObserved,
      characteristicRootSelected:row.characteristicRootSelected
    });
    assert.equal(gate.firstMissingPhase,'CHARACTERISTIC_ROOT_SELECTED');
    assert.equal(gate.competitivelyQualified,false);
  }
});

test('missing payments, effects and opponent choice veto source promotion',()=>{
  const all=Object.fromEntries(SOURCE_CHAIN_PHASES.map(([,key])=>[key,true]));
  for(const [phase,key] of SOURCE_CHAIN_PHASES){
    assert.equal(classifySourceChain({...all,[key]:undefined}).firstMissingPhase,
      phase);
  }
  const passed=classifySourceChain(all);
  assert.equal(passed.firstMissingPhase,null);
  assert.equal(passed.competitivelyQualified,false);
});

test('independent frozen rank6 raw rows recover four native terminals',()=>{
  assert.equal(earlierRank6.schema,'agent41-original-native-row-shape-rank6-v1');
  assert.equal(earlierRank6.source.artifactId,13151571539);
  assert.deepEqual(earlierRank6.originalReporterNativeStatusCounts,{UNREPORTED:4});
  assert.ok(earlierRank6.rows.every(row=>row.statusKeyPresent===false));
  const outcomes=earlierRank6.rows.map(classifyNativeAttempt);
  assert.deepEqual(outcomes.map(x=>x.kind),Array(4).fill('ENGINE_TERMINAL'));
  assert.ok(outcomes.every(x=>!x.competitivelyQualified));
});


test('only actual engine-game-end marker can establish native terminal status',()=>{
  for(const reason of ['unknown-end','bot-shutdown','native-reset','action-limit']){
    const outcome=classifyNativeAttempt({
      finished:true,endReason:reason,winner:1
    });
    assert.equal(outcome.kind,'CONFLICTING_NATIVE_FIELDS',reason);
    assert.equal(outcome.winner,null);
    assert.equal(outcome.competitivelyQualified,false);
  }
  assert.equal(classifyNativeAttempt({
    finished:true,endReason:'engine-game-end',winner:1
  }).kind,'ENGINE_TERMINAL');
});

test('an unrecognized unfinished run reason cannot silently look like an ordinary cap',()=>{
  for(const reason of ['arbitrary-reason','bot-abandoned']){
    const outcome=classifyNativeAttempt({
      finished:false,endReason:reason,winner:null
    });
    assert.equal(outcome.kind,'CONFLICTING_NATIVE_FIELDS');
    assert.equal(outcome.competitivelyQualified,false);
  }
  assert.equal(classifyNativeAttempt({
    finished:false,endReason:'action-limit'
  }).kind,'ACTION_CAP');
});
