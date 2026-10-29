'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {allocateCoinWinnerPairs,verifiedChoice}=
  require('../simulation/evaluation/agent6-coin-winner-strata.cjs');

const IDS=['champion-reference','new-moon-lockbreaker-v1'];
const receipt=first=>({verifiedByDrawLog:true,firstTurnSlot:first,
  firstTurnPlayerId:first===0?101:202,
  firstTurnPlayerName:first===0?'research-A':'research-B',
  firstDrawLogName:first===0?'research-A':'research-B'});
const obs=(candidateId,winner,choseFirst)=>({
  candidateId,coinWinnerSeat:winner,choseFirst,
  firstTurnEvidence:receipt(choseFirst?winner:1-winner)
});
const row=(rank,sourceSeat,seed,winner)=>({rank,sourceSeat,seed,
  observations:IDS.map((id,i)=>obs(id,winner,i===0))});

test('coin winner and first-turn draw-log receipt agree',()=>{
  const x=obs(IDS[0],1,false);
  assert.equal(verifiedChoice(x),true);
  assert.equal(verifiedChoice({...x,firstTurnEvidence:receipt(1)}),false);
});

test('unlike actual starters, paired coin winners are accepted',()=>{
  const rows=[row(6,0,1,0),row(6,0,2,1),
    row(6,1,3,0),row(6,1,4,1)];
  const r=allocateCoinWinnerPairs(rows,{ranks:[6],quota:1});
  assert.equal(r.complete,true);
  assert.equal(r.accepted.length,4);
  assert.ok(r.accepted.every(x=>
    new Set(x.actualFirstTurnByCandidate.map(y=>y.firstTurnSlot)).size===2));
});

test('mismatches, bad proof and full strata stay in denominator',()=>{
  const mismatch=row(6,0,2,0);
  mismatch.observations[1]=obs(IDS[1],1,false);
  const invalid=row(6,0,3,1);
  invalid.observations[0].firstTurnEvidence.verifiedByDrawLog=false;
  const r=allocateCoinWinnerPairs([row(6,0,1,0),mismatch,invalid,
    row(6,0,4,0)],{ranks:[6],quota:1});
  assert.deepEqual(r.rejected.map(x=>x.reason),[
    'coin-winner-mismatch','invalid-or-missing-coin-start-proof',
    'predeclared-quota-full']);
});

test('rejects outcome leakage and duplicate physical rank-seat seeds',()=>{
  const a=row(11,1,10,0);
  assert.throws(()=>allocateCoinWinnerPairs([{...a,winner:'fake'}],
    {ranks:[11],quota:1}));
  assert.throws(()=>allocateCoinWinnerPairs([a,a],{ranks:[11],quota:1}));
});
