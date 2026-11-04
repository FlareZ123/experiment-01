'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  sourceBonusDisagreement,historicalRankFiveSixPrediction
}=require('../simulation/evaluation/agent3-source-bonus-coupled-mulligan-model.cjs');
const {
  mulliganDisagreement,choose,frozenRankOneNewMoonCase
}=require('../simulation/evaluation/agent3-coupled-opening-input-order.cjs');

const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,
  `Expected ${a} to equal ${b}`);

/**
 * Independent finite enumeration of geometric joint mulligan counts.
 * Opponent sources have geometric failures independently of candidate arms.
 * @param {boolean[]} a @param {boolean[]} b @param {number} sourceBasics
 */
function bruteForceJointMulligans(a,b,sourceBasics) {
  const events=mulliganDisagreement(a,b);
  const qa=events.referenceMulligan,qb=events.challengerMulligan;
  const p11=events.jointMulligan;
  const p10=qa-p11,p01=qb-p11,p00=1-qa-qb+p11;
  const qS=choose(60-sourceBasics,7)/choose(60,7);
  let result=0,mass=0;
  for(let m=0;m<24;m++)for(let n=0;n<24;n++){
    const massCell=m===n?p11**m*p00:
      m>n?p11**n*p10*qa**(m-n-1)*(1-qa):
      p11**m*p01*qb**(n-m-1)*(1-qb);
    mass+=massCell;
    if(m!==n)result+=massCell*(1-qS**Math.max(m,n));
  }
  close(mass,1);
  return result;
}

test('source mismatch probability matches independently enumerated joint geometric counts',()=>{
  const prior=frozenRankOneNewMoonCase();
  const first=new Set(prior.historicalReferenceBasicPositions);
  const second=new Set(prior.historicalChallengerBasicPositions);
  const a=Array.from({length:60},(_,i)=>first.has(i));
  const b=Array.from({length:60},(_,i)=>second.has(i));
  for(const sourceBasics of [1,4,11,14,20,60]){
    const value=sourceBonusDisagreement(a,b,sourceBasics);
    close(value.sourceBonusCardCountDisagreement,
      bruteForceJointMulligans(a,b,sourceBasics));
    assert.ok(value.sourceBonusCardCountDisagreement>=0);
    assert.ok(value.sourceBonusCardCountDisagreement<=1);
    assert.equal(value.competitiveQualified,false);
  }
});

test('historical two source Basic counts explain directional first-mulligan masking',()=>{
  const outcome=historicalRankFiveSixPrediction();
  assert.equal(outcome.sourceRank5BasicCount,11);
  assert.equal(outcome.sourceRank6BasicCount,4);
  assert.equal(outcome.observedSetupOnlySourceBonusDisagreement.rank5,4);
  assert.equal(outcome.observedSetupOnlySourceBonusDisagreement.rank6,1);
  close(outcome.rank5.sourceMulliganProbability,0.22242114149585926);
  close(outcome.rank6.sourceMulliganProbability,0.6005003742553344);
  close(outcome.rank5.sourceBonusCardCountDisagreement,0.090724291631435);
  close(outcome.rank6.sourceBonusCardCountDisagreement,0.0499904236953941);
  assert.ok(outcome.rank5.sourceBonusCardCountDisagreement>
    outcome.rank6.sourceBonusCardCountDisagreement);
});

test('same candidate Basic-mask positions make source bonus identical under coupling',()=>{
  const a=Array.from({length:60},(_,i)=>i<14);
  const val=sourceBonusDisagreement(a,a,11);
  close(val.sourceBonusCardCountDisagreement,0);
  close(val.candidateAnyMulliganCountDisagreement,0);
});

test('invalid source or candidate zero-Basic roster fails closed',()=>{
  const a=Array.from({length:60},(_,i)=>i<14);
  assert.throws(()=>sourceBonusDisagreement(a,a,0),TypeError);
  assert.throws(()=>sourceBonusDisagreement(a,a,61),TypeError);
  assert.throws(()=>sourceBonusDisagreement(a,Array(60).fill(false),4),TypeError);
  assert.throws(()=>sourceBonusDisagreement(Array(60).fill(false),a,4),TypeError);
});
