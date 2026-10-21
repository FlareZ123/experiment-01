'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {CELLS,accruePairedFourCells}=
  require('../scripts/aichi-paired-four-cell-accrual.cjs');

const digest='a'.repeat(64);
const candidateDigests={champion:'b'.repeat(64),newmoon:'c'.repeat(64)};
const sourceDigest='d'.repeat(64);
/** @param {number} rank @param {number} seat @param {number} seed */
function planPair(rank,seat,seed){
  const id=`${rank}:${seat}:${seed}`;
  return {pairId:id,rank,candidateSeat:seat,seed,
    arms:['champion','newmoon'].map(candidateId=>({
      armId:id+':'+candidateId,candidateId}))};
}
function plan(){return {schema:'aichi-fourcell-paired-start-plan-v2',
  status:'precommitted',candidateIds:['champion','newmoon'],ranks:[6],
  candidateDeckHashes:{...candidateDigests},sourceDeckHashes:{6:sourceDigest},
  quotas:{6:Object.fromEntries(CELLS.map(cell=>[cell,1]))},
  attempts:[planPair(6,0,10),planPair(6,1,11),planPair(6,0,12),
    planPair(6,1,13),planPair(6,0,14),planPair(6,1,15)]};}
/** @param {object} p @param {number} firstSlot @param {object} [options] */
function obs(p,firstSlot,options={}){
  return {pairId:p.pairId,rank:p.rank,candidateSeat:p.candidateSeat,
    seed:p.seed,arms:p.arms.map((arm,i)=>{
      const slot=i===1 && options.mismatchedStart?1-firstSlot:firstSlot;
      const name=slot===0?'research-A':'research-B';
      const sourcePhysicalDealSha256=i===1 && options.mismatchedDeal?
        'b'.repeat(64):digest;
      return {...arm,
        candidateDeckSha256:candidateDigests[arm.candidateId],
        sourceDeckSha256:sourceDigest,
        firstTurnSlot:slot,verifiedByDrawLog:true,
        firstTurnPlayerId:slot===0?101:202,firstTurnPlayerName:name,
        firstDrawLogName:name,sourcePhysicalDealSha256};
    })};
}

test('four chronological pair cells selected before any outcome',()=>{
  const p=plan(),rows=[0,0,1,1].map((first,i)=>obs(p.attempts[i],first));
  const r=accruePairedFourCells(p,rows);
  assert.equal(r.complete,true);
  assert.equal(r.blocked,false);
  assert.equal(r.plannedPairs.length,4);
  assert.deepEqual(Object.values(r.counts[6]),[1,1,1,1]);
  assert.equal(r.unconditionalGameRateCertified,false);
  assert.equal(r.competitiveWinRateCertified,false);
  assert.throws(()=>accruePairedFourCells(p,[...rows,obs(p.attempts[4],0)]),
    /after all four-cell quotas/);
});

test('two actual starting orders with perfectly confounded physical seats leaves two cells empty',()=>{
  const p=plan();
  const rows=[1,1,1,1].map((first,i)=>obs(p.attempts[i],first));
  const r=accruePairedFourCells(p,rows);
  assert.equal(r.complete,false);
  assert.deepEqual(r.remainingQuotas[6],{
    'seat0-candidate-first':1,'seat0-source-first':0,
    'seat1-candidate-first':0,'seat1-source-first':1});
  assert.equal(r.retainedAttempts[2].reason,'surplus-preoutcome-stratum');
});

test('mismatched actual first/deal are retained and never silently matched',()=>{
  const p=plan(),rows=[obs(p.attempts[0],0,{mismatchedStart:true}),
    obs(p.attempts[1],0,{mismatchedDeal:true}),obs(p.attempts[2],1)];
  const r=accruePairedFourCells(p,rows);
  assert.equal(r.plannedPairs.length,1);
  assert.equal(r.consumedPairs,3);
  assert.deepEqual(r.retainedAttempts.map(x=>x.reason),[
    'unmatched-actual-first','unmatched-physical-source-deal',
    'accepted-preoutcome-quota']);
});

test('unverified pair blocks the chronological stream, with original attempt retained',()=>{
  const p=plan();const x=obs(p.attempts[1],0);
  x.arms[1].firstDrawLogName='other';
  const rows=[obs(p.attempts[0],0),x];
  const r=accruePairedFourCells(p,rows);
  assert.equal(r.blocked,true);
  assert.equal(r.consumedPairs,2);
  assert.equal(r.retainedAttempts[1].reason,'unverified-setup');
  assert.throws(()=>accruePairedFourCells(p,[...rows,obs(p.attempts[2],1)]),
    /Cannot skip an unverified pair/);
});

test('even outcome getters are never read during pre-outcome selection',()=>{
  const p=plan();const o=obs(p.attempts[0],0);
  for(const item of [o,...o.arms]) for(const k of
    ['winner','gameScore','prizes','attackCount','engineFinished'])
    Object.defineProperty(item,k,{get(){throw new Error('Outcome read '+k);}});
  assert.equal(accruePairedFourCells(p,[o]).plannedPairs.length,1);
});

test('registration and observed identity must remain immutable and unique',()=>{
  const p=plan();
  assert.throws(()=>accruePairedFourCells({...p,
    attempts:[p.attempts[0],p.attempts[0]]},[]),/Duplicate/);
  assert.throws(()=>accruePairedFourCells({...p,
    attempts:[p.attempts[0],{...p.attempts[0],pairId:'new'}]},[]),/Repeated registered/);
  assert.throws(()=>accruePairedFourCells(p,[obs(p.attempts[1],0)]),/frozen pair order/);
  const bad=obs(p.attempts[0],0);bad.arms[1].armId='renamed';
  assert.throws(()=>accruePairedFourCells(p,[bad]),/renamed/);
});

test('identical initial source positions cannot mask swapped candidate or opponent 60s',()=>{
  const p=plan(),o=obs(p.attempts[0],0);
  o.arms[1].candidateDeckSha256='e'.repeat(64);
  const mismatchedCandidate=accruePairedFourCells(p,[o]);
  assert.equal(mismatchedCandidate.blocked,true);
  assert.equal(mismatchedCandidate.plannedPairs.length,0);
  assert.equal(mismatchedCandidate.retainedAttempts[0].reason,'unverified-setup');

  const source=obs(p.attempts[0],0);
  source.arms[0].sourceDeckSha256='e'.repeat(64);
  const mismatchedSource=accruePairedFourCells(p,[source]);
  assert.equal(mismatchedSource.blocked,true);
  assert.equal(mismatchedSource.plannedPairs.length,0);
  assert.equal(mismatchedSource.retainedAttempts[0].reason,'unverified-setup');

  const missing=obs(p.attempts[0],0);
  delete missing.arms[0].candidateDeckSha256;
  assert.equal(accruePairedFourCells(p,[missing]).blocked,true);
  assert.deepEqual(accruePairedFourCells(p,[obs(p.attempts[0],0)])
    .candidateDeckHashes,candidateDigests);
});

test('registration must pin both candidate 60s and every source 60',()=>{
  const p=plan();
  assert.throws(()=>accruePairedFourCells({...p,
    candidateDeckHashes:{champion:digest}},[]),/Must pin both candidate rosters/);
  assert.throws(()=>accruePairedFourCells({...p,
    candidateDeckHashes:{...candidateDigests,newmoon:'invalid'}},[]),
    /Candidate printing-list SHA-256/);
  assert.throws(()=>accruePairedFourCells({...p,
    sourceDeckHashes:{}},[]),/Must pin every opposing source roster/);
  assert.throws(()=>accruePairedFourCells({...p,
    sourceDeckHashes:{6:'invalid'}},[]),/Source printing-list SHA-256/);
});
