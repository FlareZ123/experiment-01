'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const fixture=require('../results/aichi-2026/fixtures/agent4-rank16-native-disposition-projection-20261102.json');
const {SCHEMA,KINDS,classifyNativeAttempt,summarizeNativeAttempts}=
  require('../simulation/evaluation/native-attempt-disposition.cjs');

const rows=fixture.rows;
const ids=rows.map(row=>row.trial.id);

test('fixture is faithful real rank16 archived row projection without synthetic normal status',()=>{
  assert.equal(fixture.source.runId,41507843137);
  assert.equal(fixture.source.artifactId,13171637457);
  assert.equal(fixture.source.fullNativeJsonSha256,
    '9e56a0ae667243b6f003f3f645ed5a34f3c6267077f159b5556044747a36dbdb');
  assert.equal(rows.length,16);
  assert.equal(new Set(ids).size,16);
  assert.ok(rows.every(r=>!Object.hasOwn(r,'status')));
  assert.ok(rows.every(r=>r.qualifiesForCompetitiveInference===false));
});

test('all 16 real native rows classified: 9 engine terminals and 7 caps, zero qualified',()=>{
  const result=summarizeNativeAttempts(rows,ids);
  assert.equal(result.schema,SCHEMA);
  assert.equal(result.registered,16);
  assert.equal(result.observed,16);
  assert.equal(result.counts['engine-terminal'],9);
  assert.equal(result.counts['action-cap'],7);
  assert.equal(result.counts['native-abort'],0);
  assert.equal(result.counts['unknown'],0);
  assert.equal(result.counts['missing-attempt'],0);
  assert.deepEqual(result.missingIds,[]);
  assert.deepEqual(result.unregisteredIds,[]);
  assert.equal(result.competitiveQualifiedByReader,false);
  assert.equal(result.attempts.find(r=>r.trialId===ids[0]).engineReportedWinner,0);
  assert.equal(result.attempts.find(r=>r.trialId===ids[1]).engineReportedWinner,null);
});

test('missing scheduled terminal and cap are never silently excluded',()=>{
  const result=summarizeNativeAttempts(rows.slice(2),ids);
  assert.equal(result.counts['missing-attempt'],2);
  assert.equal(result.counts['engine-terminal'],8);
  assert.equal(result.counts['action-cap'],6);
  assert.deepEqual(result.missingIds,ids.slice(0,2));
  assert.equal(result.observed,14);
  assert.equal(result.registered,16);
});

test('native-error, supporter quota veto and physical invalid are abort, not win',()=>{
  for(const rawStatus of ['engine-error','paper-supporter-quota-veto',
    'engine-physical-invalid']){
    const row={trial:{id:'error'},status:rawStatus,
      error:{message:'native source error'},qualifiesForCompetitiveInference:false};
    const d=classifyNativeAttempt(row);
    assert.equal(d.kind,'native-abort');
    assert.equal(d.rawStatus,rawStatus);
    assert.equal(d.competitiveQualifiedByReader,false);
  }
  assert.equal(classifyNativeAttempt({error:'native exception',trial:{id:'x'}}).kind,
    'native-abort');
});

test('preflight and missing cases remain separate from Store action failures',()=>{
  assert.equal(classifyNativeAttempt({status:'preflight-rejected'}).kind,
    'precheck-rejection');
  assert.equal(classifyNativeAttempt({status:'registration-rejected'}).kind,
    'precheck-rejection');
  assert.equal(classifyNativeAttempt(undefined).kind,'missing-attempt');
  assert.equal(classifyNativeAttempt({status:'engine-game-end'}).kind,'unknown');
});

test('contradictory or uncertain native evidence fails closed',()=>{
  const terminal=rows[0];
  assert.equal(classifyNativeAttempt({...terminal,status:'engine-error',
    error:'late damage exception'}).kind,'unknown');
  assert.equal(classifyNativeAttempt({...terminal,
    endReason:'action-limit'}).kind,'unknown');
  assert.equal(classifyNativeAttempt({finished:false,endReason:'engine-game-end'})
    .kind,'unknown');
  assert.equal(classifyNativeAttempt({finished:false,endReason:'unexplained-pass'})
    .kind,'unknown');
  assert.equal(classifyNativeAttempt({finished:true,endReason:'engine-game-end',
    winner:1,qualifiesForCompetitiveInference:true}).competitiveQualifiedByReader,false);
});

test('unregistered and duplicate native attempts remain visible, not reweighted',()=>{
  const extra={...rows[0],trial:{id:'outside-preregistered-field'}};
  const out=summarizeNativeAttempts([...rows,extra],ids);
  assert.deepEqual(out.unregisteredIds,['outside-preregistered-field']);
  assert.equal(out.counts['engine-terminal'],9);
  assert.throws(()=>summarizeNativeAttempts([...rows,rows[0]],ids),
    /Duplicate real native trial ID/);
  assert.throws(()=>summarizeNativeAttempts(rows,[...ids,ids[0]]),
    /Duplicate preregistered native trial IDs/);
  assert.throws(()=>summarizeNativeAttempts([{trial:null}],ids),
    /Missing real trial ID/);
});

test('all specified classification kinds are stable and mutually exhaustive',()=>{
  assert.deepEqual(KINDS,[
    'engine-terminal','action-cap','native-abort','precheck-rejection',
    'unknown','missing-attempt'
  ]);
});
