'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {E_THRESHOLD}=require('../simulation/evaluation/agent7-aichi-995-early-rejection.cjs');
const {BETS,PAIR_NULL_MAX_MEAN_NONWIN,completedPairLogEValue,assessCompletedSeatPairRejection}=
  require('../simulation/evaluation/agent7-aichi-995-paired-seat-rejection.cjs');

const candidateId='synthetic-proposed-60-unchanged';
const makePair=(i,rank,outcomes)=>({
  id:`synthetic-pair-${i}`,candidateId,originalRank:rank,
  pairSampling:'FRESH_UNBIASED_COMPLETE_PAIR',
  seat0:{id:`pair-${i}-seat0`,sourceSeat:0,outcome:outcomes[0],qualification:'QUALIFIED'},
  seat1:{id:`pair-${i}-seat1`,sourceSeat:1,outcome:outcomes[1],qualification:'QUALIFIED'}
});
test('SFT 16% maximum null mean and nonnegative precommitted pair bets',()=>{
  assert.ok(Math.abs(PAIR_NULL_MAX_MEAN_NONWIN-.16)<1e-12);
  assert.ok(Math.abs(BETS.reduce((sum,row)=>sum+row.weight,0)-1)<1e-12);
  assert.ok(BETS.every(x=>x.lambda>0&&x.lambda<=1/PAIR_NULL_MAX_MEAN_NONWIN));
  assert.ok(Math.abs(completedPairLogEValue([0,0,0]))<1e-12);
});
test('SFT three complete synthetic losing pairs survive, fourth rejects',()=>{
  const pairs=[1,2,3,4].map(i=>makePair(i,6,['loss','loss']));
  const first=assessCompletedSeatPairRejection(pairs.slice(0,3),candidateId);
  const final=assessCompletedSeatPairRejection(pairs,candidateId);
  assert.equal(first.rejectionFlag,false);
  assert.equal(final.rejectionFlag,true);
  assert.equal(final.firstCrossing.ordinal,4);
  assert.equal(final.observedClaimedQualifiedGames,8);
  assert.ok(Math.exp(final.ranks[5].logEValue)>=E_THRESHOLD);
  assert.equal(final.withinPairIndependenceRequired,false);
  assert.equal(final.qualificationVerifiedExternally,false);
  console.log('PAIRED_SEAT_SYNTHETIC',JSON.stringify({
    threePairsE:Math.exp(first.ranks[5].logEValue),
    fourPairsE:Math.exp(final.ranks[5].logEValue),threshold:E_THRESHOLD
  }));
});
test('SFT adaptive rank scheduling and partial-win pairs preserve rank-local evidence',()=>{
  const pairs=[
    makePair(1,6,['win','loss']),makePair(2,11,['win','win']),
    makePair(3,6,['loss','loss']),makePair(4,11,['win','win']),
    makePair(5,6,['loss','loss'])
  ];
  const x=assessCompletedSeatPairRejection(pairs,candidateId);
  assert.equal(x.rejectionFlag,false);
  assert.deepEqual(x.ranks[5].pairNonwinBins,[0,1,2]);
  assert.deepEqual(x.ranks[10].pairNonwinBins,[2,0,0]);
});
test('SFT missing seat, wrong source seat, unqualified root, selected or reused pair fail closed',()=>{
  const p=makePair(1,6,['loss','loss']);
  assert.throws(()=>assessCompletedSeatPairRejection([{...p,seat1:null}],candidateId));
  assert.throws(()=>assessCompletedSeatPairRejection([{...p,seat1:{...p.seat1,sourceSeat:0}}],candidateId),/one game in each/);
  assert.throws(()=>assessCompletedSeatPairRejection([{...p,seat1:{...p.seat1,qualification:'NATIVE_ONLY'}}],candidateId),/QUALIFIED/);
  assert.throws(()=>assessCompletedSeatPairRejection([{...p,pairSampling:'SELECTED_AFTER_FIRST_LOSS'}],candidateId),/cannot enter anytime inference/);
  assert.throws(()=>assessCompletedSeatPairRejection([p,{...makePair(2,6,['loss','loss']),seat0:p.seat0}],candidateId),/reused/);
  assert.throws(()=>assessCompletedSeatPairRejection([p,{...p}],candidateId),/Duplicate/);
});
test('SFT pair betting expectation is one under even extreme within-pair correlation',()=>{
  for(const {lambda} of BETS){
    const bothFail=1+lambda*(1-PAIR_NULL_MAX_MEAN_NONWIN);
    const bothWin=1-lambda*PAIR_NULL_MAX_MEAN_NONWIN;
    assert.ok(Math.abs(.16*bothFail+.84*bothWin-1)<1e-12);
    assert.ok(bothWin>=-1e-12);
  }
});
