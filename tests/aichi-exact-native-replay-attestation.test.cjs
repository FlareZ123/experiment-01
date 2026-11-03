'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {attestExactNativeReplay}=
  require('../scripts/aichi-exact-native-replay-attestation.cjs');

function sample(){
  return {
    schema:'agent47-rank26-preregistered-natural-owner-24-paired-v1',
    registration:'results/aichi-2026/registrations/original.md',
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceRank:26,opponentRank:6,
    sourceDigest:'a'.repeat(64),opponentDigest:'b'.repeat(64),
    seedBase:20261110,repeats:[20,20],seats:[0,1],cap:120,
    nativeAttempts:2,originalPhysicalPairs:1,
    controlPolicy:'control-v3',treatmentPolicy:'opt-in-v1',
    summary:{pairs:1,nativeAttempts:2,competitiveQualifiedGames:0,
      firstControlCompressor:0,firstSelectedCompressor:1,
      nativeErrors:[],controlTerminals:0,selectedTerminals:0},
    cases:[{repeat:20,slot:'A',seed:456,sourceSeat:0,
      physicalParity:'EXACT_FULL_INITIAL_PHYSICAL_MATCH',
      control:{actualLiveStore:true,initialFullPhysicalDigest:'x',
        sourceFirstAcceptedActions:[{action:'PassTurnAction'}]},
      selected:{actualLiveStore:true,initialFullPhysicalDigest:'x',
        sourceFirstAcceptedActions:[
          {action:'PlayCardAction',card:'Battle Compressor'},
          {action:'PassTurnAction'}],
        policyAudit:{earlyCompressor:{events:[
          {kind:'native-own-deck-selection',cards:['Lightning Energy MEE']}]
        }}}}]
  };
}

test('identical real-Store cases, outcomes and metadata attest exact replay',()=>{
  const original=sample();
  const later=structuredClone(original);
  later.seedPlanManifestSha256='c'.repeat(64);
  later.sourcePrintedSha256='d'.repeat(64);
  const r=attestExactNativeReplay(original,later);
  assert.equal(r.exactReplay,true);
  assert.equal(r.originalPhysicalPairs,1);
  assert.equal(r.archivedNativeAttemptsCompared,2);
  assert.equal(r.competitivelyQualifiedGames,0);
  assert.match(r.casesSha256,/^[0-9a-f]{64}$/);
});

test('same counts but changed physical seed identity is a hard failure',()=>{
  const modified=sample();
  modified.cases[0].seed=999;
  assert.throws(()=>attestExactNativeReplay(sample(),modified),
    /full real-store physical or accepted-action case/);
});

test('native source ID resolver drift is a hard failure',()=>{
  assert.throws(()=>attestExactNativeReplay(sample(),
    {...sample(),sourceDigest:'9'.repeat(64)}),
  /registered field: sourceDigest/);
});

test('same real deal but changed accepted action is a hard failure',()=>{
  const modified=sample();
  modified.cases[0].selected.sourceFirstAcceptedActions[0].card='Escape Rope';
  assert.throws(()=>attestExactNativeReplay(sample(),modified),
    /full real-store physical or accepted-action case/);
});

test('same action but changed owner prompt settlement is a hard failure',()=>{
  const modified=sample();
  modified.cases[0].selected.policyAudit.earlyCompressor.events[0]
    .cards=['Exeggcute PLF'];
  assert.throws(()=>attestExactNativeReplay(sample(),modified),
    /full real-store physical or accepted-action case/);
});

test('same cases but changed observed summary is a hard failure',()=>{
  const modified=sample();
  modified.summary.firstSelectedCompressor=0;
  assert.throws(()=>attestExactNativeReplay(sample(),modified),
    /original source game\/action summary/);
});

test('any competitive qualification claim fails closed even on identical ledgers',()=>{
  const modified=sample();
  modified.summary.competitiveQualifiedGames=1;
  assert.throws(()=>attestExactNativeReplay(modified,modified),
    /1 !== 0/);
});
