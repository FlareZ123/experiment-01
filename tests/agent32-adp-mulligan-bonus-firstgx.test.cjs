'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,C,fixedBonus,matchup,main,survives
}=require('../simulation/evaluation/agent32-adp-mulligan-bonus-firstgx.cjs');
const {
  evaluate:base
}=require('../simulation/evaluation/agent32-adp-switch-first-gx-physical-window.cjs');
const {bonusOffers}=
  require('../simulation/evaluation/agent32-adp-field-mulligan-offers.cjs');

/** @param {number} x @param {number} y */
function close(x,y){assert.ok(Math.abs(x-y)<1e-12,x+' != '+y);}

test('binomial Pascal edges, independent Prize-exhaustion checks',()=>{
  assert.equal(C(0,0),1n);
  assert.equal(C(60,6),50063860n);
  assert.equal(C(52,6),20358520n);
  assert.equal(C(52,53),0n);
  assert.equal(C(-1,0),0n);
  assert.equal(survives(52,[]),C(52,6));
  assert.equal(survives(52,[1]),C(51,6));
  assert.equal(survives(52,[1,1]),C(50,6));
  assert.equal(survives(52,[0]),0n);
});

test('zero-bonus exact grouped result equals independent first-eight implementation',()=>{
  const x=fixedBonus(0),legacy=base();
  assert.equal(x.bonusCardsTaken,0);
  assert.equal(x.visibleCardsBeforeFirstGX,8);
  assert.equal(x.union.numerator,
    legacy.eitherADPStarterOrSwitch.numerator);
  assert.equal(x.union.denominator,
    legacy.eitherADPStarterOrSwitch.denominator);
  close(x.union.percent,36.45610099968788);
  close(x.adpStartingActive.percent,
    legacy.originalADPStarter.percent);
  close(x.otherStartingActiveSwitch.percent,
    legacy.switchAdditional.percent);
});

test('extra actual bonus cards monotone for purely cumulative physical access',()=>{
  const states=[0,1,2,3,4,5,6].map(fixedBonus);
  for(let i=1;i<states.length;i++){
    assert.ok(states[i].union.probability>=states[i-1].union.probability);
    assert.ok(states[i].adpStartingActive.probability>=
      states[i-1].adpStartingActive.probability);
    assert.ok(states[i].otherStartingActiveSwitch.probability>=
      states[i-1].otherStartingActiveSwitch.probability);
  }
  assert.ok(states[6].union.probability>states[0].union.probability);
});

test('source simultaneous-mulligan mass matches independent reciprocal offer',()=>{
  const arr=[0,1,2,3,4,5].map(fixedBonus);
  for(const b of [4,11,14,16]){
    const x=matchup(b,arr);
    const pBonus=bonusOffers(b,7).opponentOfferedAtLeastOne.fraction;
    const pNoBonus=x.selectedContributions[0].weight;
    close(pNoBonus,1-pBonus);
    assert.ok(x.expectedAccessLowerBound<=x.expectedAccessUpperBound);
    assert.ok(x.unmodeledTailMass>=0&&x.unmodeledTailMass<1);
    assert.ok(x.modeledMass+x.unmodeledTailMass>=1-1e-12);
    assert.ok(x.expectedAccessUpperBound<=1);
    assert.ok(x.expectedAccessLowerBound>=0);
  }
});

test('rank6 original 4 Basics offers larger first-GX bonus boost than 14-Basic source',()=>{
  const x=main(8);
  assert.equal(x.version,VERSION);
  assert.equal(x.fixedSourceSha,
    'bab0ff2ea97da8c410e9ca096ec1826a3f5186878de684856c4dd9454b40d19b');
  assert.equal(x.originalCount,29);
  assert.deepEqual(x.missingOriginalRanks,[23,25,28]);
  assert.equal(x.qualifiedGames,0);
  const rank6=x.rows.find(r=>r.rank===6),rank1=x.rows.find(r=>r.rank===1);
  assert.equal(rank6.opponentBasicCopies,4);
  assert.equal(rank1.opponentBasicCopies,14);
  assert.ok(rank6.expectedAccessLowerBound>rank1.expectedAccessLowerBound);
  assert.ok(rank1.expectedAccessLowerBound>x.baseAccess.probability);
  assert.ok(x.equalOriginalMean.lower>=x.equalOriginalMean.noBonus);
  assert.ok(x.equalOriginalMean.upper>x.equalOriginalMean.lower);
});

test('all source ranks with equal Basic count have identical exact weighted masses',()=>{
  const x=main(8);
  for(const a of x.rows)for(const b of x.rows){
    if(a.opponentBasicCopies===b.opponentBasicCopies){
      assert.equal(a.expectedAccessLowerBound,b.expectedAccessLowerBound);
      assert.equal(a.unmodeledTailMass,b.unmodeledTailMass);
    }
  }
});
