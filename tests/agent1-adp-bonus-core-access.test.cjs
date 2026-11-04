'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {
  buildAdpPreDrawWorlds,exactRoutesAfterObservedDraws,
  opponentMulliganMaxBonusCoreBounds,original29AdpBonusCoreScreen
}=require('../simulation/evaluation/agent1-adp-bonus-core-access.cjs');
const {
  exactAdpInitialActiveCoreOpportunity,agent5OriginalCandidateGroups
}=require('../simulation/evaluation/agent1-adp-t1-core-access.cjs');

/** @param {number} actual @param {number} expected */
function near(actual,expected) {
  assert.ok(Math.abs(actual-expected)<1e-12,
    'Expected '+expected+', observed '+actual);
}

test('nine-card independent physical index brute-force fixtures across 1..4 draws',()=>{
  const w=buildAdpPreDrawWorlds({
    adp:1,doubleDragon:2,guzmaHala:1,tagCall:1,other:4,
    basics:2,handSize:3,prizeSize:2
  });
  assert.equal(w.pool,4);
  assert.equal(w.baseDenominator,735n);
  assert.equal(w.initialAdpBase,420n);
  const fixture={
    1:{den:'2940',adp:'1680',direct:'1080',sup:'270',tag:'90',core:'1440'},
    2:{den:'4410',adp:'2520',direct:'1980',sup:'300',tag:'48',core:'2328'},
    3:{den:'2940',adp:'1680',direct:'1500',sup:'100',tag:'0',core:'1600'},
    4:{den:'735',adp:'420',direct:'405',sup:'0',tag:'0',core:'405'}
  };
  for(let m=1;m<=4;m++) {
    const x=exactRoutesAfterObservedDraws(w,m);
    const f=fixture[m];
    assert.equal(x.denominator,f.den);
    assert.equal(x.numerator.initialAdp,f.adp);
    assert.equal(x.numerator.directDoubleDragon,f.direct);
    assert.equal(x.numerator.heldGuzmaHala,f.sup);
    assert.equal(x.numerator.tagCallToGuzmaHala,f.tag);
    assert.equal(x.numerator.combinedCoreAccess,f.core);
  }
});

test('single normal draw exactly matches independently enumerated first-seven path',()=>{
  const input=agent5OriginalCandidateGroups();
  const seven=exactAdpInitialActiveCoreOpportunity(input);
  const worlds=buildAdpPreDrawWorlds(input);
  const one=exactRoutesAfterObservedDraws(worlds,1);
  assert.equal(worlds.pool,47);
  assert.equal(worlds.groups.size,516);
  assert.equal(one.denominator,seven.totals.acceptedWorlds);
  assert.deepEqual(one.numerator,seven.numerators);
  for(const [k,v] of Object.entries(seven.probabilities))
    near(one.probabilities[k],v);
});

test('exact two and three draws increase direct access but change route allocation',()=>{
  const w=buildAdpPreDrawWorlds(agent5OriginalCandidateGroups());
  const two=exactRoutesAfterObservedDraws(w,2);
  const three=exactRoutesAfterObservedDraws(w,3);
  near(two.probabilities.combinedCoreAccess,0.30655579097887153);
  near(two.probabilities.directDoubleDragon,0.16698660161789944);
  near(two.probabilities.heldGuzmaHala,0.0774030624591575);
  near(two.probabilities.tagCallToGuzmaHala,0.062166126901814577);
  near(three.probabilities.combinedCoreAccess,0.31991716255756375);
  near(three.probabilities.directDoubleDragon,0.18279742332971805);
  near(three.probabilities.tagCallToGuzmaHala,0.05848362373877626);
  assert.ok(three.probabilities.directDoubleDragon>
    two.probabilities.directDoubleDragon);
});

test('single specific opponent Basic count changes upper-envelope bonus access',()=>{
  const w=buildAdpPreDrawWorlds(agent5OriginalCandidateGroups());
  const curve=Array.from({length:w.pool},
    (_,i)=>exactRoutesAfterObservedDraws(w,i+1));
  const rank6=opponentMulliganMaxBonusCoreBounds(w,4,curve);
  const rank1=opponentMulliganMaxBonusCoreBounds(w,14,curve);
  near(rank6.lowerCoreProbability,0.3091489215877413);
  near(rank1.lowerCoreProbability,0.2925284236768103);
  assert.ok(rank6.unmodelledExcessMulliganTailProbability<4e-11);
  assert.ok(rank6.upperCoreProbability-rank6.lowerCoreProbability<2e-11);
  assert.ok(rank1.lowerCoreProbability>curve[0].probabilities.combinedCoreAccess);
  assert.ok(rank6.lowerCoreProbability>rank1.lowerCoreProbability);
});

test('29 rank-locked original sources preserve exclusions and 29 mean',()=>{
  const screen=original29AdpBonusCoreScreen();
  assert.equal(screen.rows.length,29);
  assert.deepEqual(screen.missingRanks,[23,25,28]);
  near(screen.baselineNoBonus,0.289936530125316);
  near(screen.fieldMeanLower,0.29477038765196417);
  assert.ok(screen.fieldMeanUpper-screen.fieldMeanLower<2e-12);
  assert.ok(screen.rows.every(x=>
    x.lowerCoreProbability>=screen.baselineNoBonus-1e-12));
  assert.ok(screen.rows.every(x=>
    x.lowerCoreProbability<=0.3685745784435869+1e-12));
});
