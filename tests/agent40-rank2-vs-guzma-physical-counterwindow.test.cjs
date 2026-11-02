'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {PAIRS,opponentGuzmaBenchAccess,independentOpponentOracle,
  assessJointCounterwindow}=
  require('../simulation/evaluation/agent40-rank2-vs-guzma-physical-counterwindow.cjs');
const {sampleOpeningBonusScreen,originalRank2Pool}=
  require('../simulation/evaluation/agent40-rank2-mulligan-bonus-tm-screen.cjs');

test('original rank6 and rank1 unchanged eligible-Basic and printed Guzma counts',()=>{
  assert.deepEqual(PAIRS.map(p=>[p.rank,p.eligibleBasics,p.physicalGuzma]),[
    [6,4,3],[1,14,1]
  ]);
});

test('inclusion-exclusion matches separate physical seven-plus-draw hypergeometric enumeration',()=>{
  for(const p of PAIRS)
    for(const bonus of [0,1,2,3,5,10]){
      const result=opponentGuzmaBenchAccess(
        p.eligibleBasics,p.physicalGuzma,bonus);
      const independent=independentOpponentOracle(
        p.eligibleBasics,p.physicalGuzma,bonus);
      assert.ok(Math.abs(result-independent)<1e-12,
        'Opposing original '+p.rank+' bonus '+bonus+
        ': '+result+' vs '+independent);
    }
});

test('genuine opponent needs two Basics and Guzma; direct-Guzma alone overstates mobility',()=>{
  const six=opponentGuzmaBenchAccess(4,3,0);
  const one=opponentGuzmaBenchAccess(14,1,0);
  assert.ok(Math.abs(six-61291/734712)<1e-12);
  assert.ok(Math.abs(one-28238069/267153920)<1e-12);
  assert.ok(six<0.09&&one>0.1);
});

test('opponent physical target access increases with bonus draws, never decreasing',()=>{
  for(const p of PAIRS){
    let previous=0;
    for(let n=0;n<=25;n++){
      const next=opponentGuzmaBenchAccess(
        p.eligibleBasics,p.physicalGuzma,n);
      assert.ok(next+1e-12>=previous);
      previous=next;
    }
  }
});

test('sampled same-deal original rank2 two-player screen preserves probability bounds',()=>{
  const s=sampleOpeningBonusScreen(originalRank2Pool(),10000,177702,12);
  for(const p of PAIRS){
    const no=assessJointCounterwindow(s.conditionalReady,p,0);
    const cap3=assessJointCounterwindow(s.conditionalReady,p,3);
    const all=assessJointCounterwindow(s.conditionalReady,p,12);
    for(const x of [no,cap3,all]){
      assert.ok(x.jointPhysicalCounterwindowLower>=0);
      assert.ok(x.jointPhysicalCounterwindowLower<=
        x.jointPhysicalCounterwindowUpper+1e-12);
      assert.ok(x.jointPhysicalCounterwindowUpper<=x.sourceSetupOpportunity+1e-12);
      assert.ok(Math.abs(Object.values(x.exhaustiveOutcomeWeights)
        .reduce((a,b)=>a+b,0)-1)<1e-12);
    }
    assert.ok(Math.abs(no.sourceSetupOpportunity-
      s.conditionalReady[0])<1e-12);
  }
});

test('no source TM access means no joint window despite opposing Guzma and Bench',()=>{
  const profile=[0,0,0,0];
  for(const p of PAIRS){
    const x=assessJointCounterwindow(profile,p,3);
    assert.equal(x.sourceSetupOpportunity,0);
    assert.equal(x.jointPhysicalCounterwindowLower,0);
    assert.equal(x.jointPhysicalCounterwindowUpper,0);
  }
});
