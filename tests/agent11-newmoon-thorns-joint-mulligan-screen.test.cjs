'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {choose}=require('../scripts/agent11-thorns-first-volt-access.cjs');
const {forcedSoloScreen}=require(
  '../scripts/agent11-newmoon-thorns-firstturn-exposure.cjs');
const {candidateSoloScreen,sourceResourceAccess,jointExposure,fromRepo}=
  require('../scripts/agent11-newmoon-thorns-joint-mulligan-screen.cjs');

const c={
  basic:17,vulnerable:5,direct:16,safe:27,compressor:2,carrier:2,
  neutral:23
};
const eps=1e-14;

test('candidate mulligan-screen k=0 independently recovers old exact physical result',()=>{
  const old=forcedSoloScreen(c);
  const current=candidateSoloScreen(c,0);
  assert.ok(Math.abs(current.conditionalProbability-
    old.conditionalProbability)<eps);
  assert.equal(current.conditionalProbability,0.001336196708880144);
  for(let k=1;k<=19;k++)
    assert.ok(candidateSoloScreen(c,k).conditionalProbability<=
      candidateSoloScreen(c,k-1).conditionalProbability);
  assert.equal(candidateSoloScreen(c,19).numerator,0n);
  assert.equal(choose(60,7),386206920n);
});

test('source frozen all-held-Mail conditional access is preserved exactly',()=>{
  const expected=[
    [1,3,0.3881298815114233273365237238653128916429],
    [3,4,0.4660594997942049258338592538193879540081],
    [1,2,0.3719281708806440994029460634025480546141]
  ];
  for(const [d,m,p] of expected)
    assert.ok(Math.abs(sourceResourceAccess(d,m,0)-p)<eps);
});

test('two-sided geometric mulligan mix preserves normalized full mass',()=>{
  const p=jointExposure(1,3,c);
  assert.ok(Math.abs(p.bothFirstRound+
    p.candidateGetsAtLeastOneBonus+
    p.sourceGetsAtLeastOneBonus-1)<eps);
  assert.ok(p.candidateGetsAtLeastOneBonus>0.5);
  assert.ok(p.sourceGetsAtLeastOneBonus<0.04);
  assert.equal(p.screenedCandidateBonusTerms,18);
  assert.ok(p.uncomputedJointUpperBound<8e-16);
});

test('full exact profile-specific joint screening remains bounded and reproducible',()=>{
  const targets=[
    [1,3,0.00027445602170182427,0.0005186178702936041],
    [3,4,0.0003295422556391752,0.0006227471697673428],
    [1,2,0.00026304277774004136,0.00049696919787052846]
  ];
  for(const [d,m,joint,naive] of targets){
    const p=jointExposure(d,m,c,10);
    assert.ok(Math.abs(p.observedJointConjunction-joint)<eps);
    assert.ok(Math.abs(p.naiveBothValidConditionalConjunction-naive)<eps);
    assert.ok(p.observedJointConjunction<
      p.naiveBothValidConditionalConjunction);
    assert.ok(p.relativeToNaiveConditional>0.52 &&
      p.relativeToNaiveConditional<0.54);
    assert.ok(p.bothValidContribution>0&&
      p.candidateCompensationContribution>0&&
      p.sourceCompensationContribution>0);
    assert.equal(p.sourceValid,0.3994996257446656);
    assert.equal(p.candidateValid,0.9165625670301298);
  }
});

test('frozen original Aichi 60s and actual New Moon 60 independently anchor profiles',()=>{
  const report=fromRepo();
  assert.deepEqual(report.profiles.map(p=>p.rank),[6,24,29]);
  assert.deepEqual(report.profiles.map(p=>p.mailCopies),[3,4,2]);
  assert.equal(report.competitiveQualifiedGames,0);
  assert.equal(report.categories.basic,17);
  assert.equal(report.categories.safe,27);
});
