'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const reg=require('../../results/aichi-2026/registrations/2026-11/agent3-skyliner-hood-v1-authenticated29-20261109.json');
const deck=require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
const {preflight,compare,VERSION}=
  require('../../simulation/evaluation/agent3/skyliner-hood-v1-authenticated29-native.cjs');

test('prospective 29 authenticated opponent ranks, two seats and one fixed candidate sixty',()=>{
  const frozen=preflight();
  assert.equal(VERSION,reg.schema);
  assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(frozen.originalSourceRanks.length,29);
  assert.equal(frozen.completePairs,58);
  assert.equal(frozen.attempts,116);
  assert.deepEqual(reg.missingExactSourceRanks,[23,25,28]);
  assert.ok(reg.sourceRanks.every(rank=>reg.registeredSourceGroups
    .filter(g=>g.rank===rank).length===2));
  assert.equal(new Set(reg.registeredSourceGroups.map(g=>g.seed)).size,58);
  assert.deepEqual(reg.treatmentOnlyFlags,
    {actorSkylinerFundedBenchRetreatRoot:true});
});

function fakeRows(){
  return reg.registeredTrials.map(t=>({
    id:t.id,candidateId:t.candidateId,rank:t.rank,
    status:'ENGINE_TERMINAL',terminal:true,candidateNativeWin:false,
    actualStarterSeat:0,
    fullPhysicalDealFingerprint:'full:'+t.seed,
    sourceDealFingerprint:'source:'+t.seed,
    candidatePaidRetreats:0,sourceRetreatRoots:0,
    candidateFilch:0,candidateNightWatch:0,candidateMaxGeist:0,
    skylinerRootSelected:0
  }));
}

test('full 58 physical pairs and explicit per-rank rows, no fabricated paper wins',()=>{
  const x=fakeRows();
  x[1].candidateNativeWin=true;
  let y=compare(x);
  assert.equal(y.summary.physicalPairsMatched,58);
  assert.equal(y.summary.bothTerminalMatched,58);
  assert.equal(y.summary.observedNativeWinGains,1);
  assert.equal(y.summary.control.attempts,58);
  assert.equal(y.summary.treatment.attempts,58);
  assert.equal(y.perRank.length,29);
  assert.equal(y.perRank[0].pairedSeats.length,2);
  assert.equal(y.summary.independentlyPaperQualifiedGames,0);
  assert.deepEqual(y.summary.sharpCensoredNativeWinDifference,
    {lower:1,upper:1});
  x[3].terminal=false;
  y=compare(x);
  assert.deepEqual(y.summary.sharpCensoredNativeWinDifference,
    {lower:1,upper:2});
  x[3].sourceDealFingerprint='unexpected';
  y=compare(x);
  assert.equal(y.summary.physicalPairsMatched,57);
  assert.deepEqual(y.summary.sharpCensoredNativeWinDifference,
    {lower:1,upper:1});
});
