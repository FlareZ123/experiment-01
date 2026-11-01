'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const registration=require('../results/aichi-2026/registrations/agent17-original-rank5-mew-genesect-20261101.json');
const {VERSION,scheduledArms,preflight}=
  require('../simulation/evaluation/agent17-original-rank5-mew-genesect-development.cjs');

test('rank5 unconditioned physical seed groups pair two immutable sixties',()=>{
  const rows=scheduledArms();
  assert.equal(rows.length,8);
  const groups=new Map();
  for(const row of rows){
    assert.equal(row.rank,5);
    assert.ok(row.seed>=0&&row.seed<=0xffffffff);
    const key=[row.rank,row.repeat,row.candidateSlot].join(':');
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push(row);
    assert.equal(row.id,key+':'+row.candidateId);
  }
  assert.deepEqual([...groups.keys()].sort(),['5:0:A','5:0:B','5:1:A','5:1:B']);
  assert.equal(new Set([...groups.values()].map(x=>x[0].seed)).size,4);
  for(const pair of groups.values()){
    assert.equal(pair.length,2);
    assert.equal(pair[0].seed,pair[1].seed);
    assert.deepEqual(pair.map(x=>x.candidateId),
      ['champion-reference','new-moon-lockbreaker-v1']);
  }
});

test('frozen paper-source and v2 policy files pass before native runtime',()=>{
  const p=preflight();
  assert.equal(p.version,VERSION);
  assert.equal(p.originalRank,5);
  assert.equal(p.originalArchetype,'Mew Genesect');
  assert.equal(p.attemptedNativeArms,8);
  assert.equal(p.registrationBlobSha,'6b7cb6f919cc0d2ac76f8b3bf3ec1032f467c60c');
  assert.equal(p.paperQualified,false);
  assert.equal(p.competitiveQualified,false);
});

test('registration never qualifies source deck or results as winning',()=>{
  assert.equal(registration.status,
    'prospective-development-only-before-native-attempt');
  assert.equal(registration.seedGroups,4);
  assert.equal(registration.attemptedNativeArms,8);
  assert.equal(registration.seeds.length,4);
  assert.equal(registration.qualifications.paperPrompt,'unverified');
  assert.equal(registration.qualifications.sourcePolicy,'unqualified common bot');
  assert.equal(registration.qualifications.tournamentClock,'unverified');
  assert.equal(registration.qualifications.competitiveWinRate,'unverified');
});
