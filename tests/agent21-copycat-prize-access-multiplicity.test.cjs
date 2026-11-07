'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {copycatPrizeAccessCut}=require('../scripts/agent21-copycat-prize-access-multiplicity.cjs');
const {prizeMinCut}=require('../scripts/agent6-copycat-prize-mincut.cjs');

/** @param {number} actual @param {number} expected */
function near(actual,expected){
  assert.ok(Math.abs(actual-expected)<1e-12,
    'Expected '+expected+', received '+actual);
}

test('1/1/1 baseline reproduces Agent6 exact Prize-only cut',()=>{
  const r=copycatPrizeAccessCut();
  const legacy=prizeMinCut({basicCount:14,heavyBallCopies:1});
  near(r.validOpeningProbability,0.8614093191287199);
  near(r.immediatePrizeOnlyCut,0.02366909103369581);
  near(r.immediatePrizeOnlyCut,legacy.immediatePrizeOnlyCut);
  near(r.anyCorePrized,legacy.atLeastOneCorePrized);
});

test('a second Heavy Ball reduces the baseline cut by more than tenfold',()=>{
  const r=copycatPrizeAccessCut({heavyBallCopies:2});
  near(r.immediatePrizeOnlyCut,0.00219491873859848);
  assert.ok(r.immediatePrizeOnlyCut<
    copycatPrizeAccessCut().immediatePrizeOnlyCut/10);
});

test('a second copy of either core Basic gives the symmetric one-slot result',()=>{
  const secondMimikyu=copycatPrizeAccessCut({mimikyuCopies:2});
  const secondDialga=copycatPrizeAccessCut({dialgaCopies:2});
  near(secondMimikyu.immediatePrizeOnlyCut,0.009435729698241826);
  near(secondDialga.immediatePrizeOnlyCut,0.009435729698241826);
  near(secondMimikyu.immediatePrizeOnlyCut,
    secondDialga.immediatePrizeOnlyCut);
  assert.equal(secondMimikyu.basicCount,15);
});

test('two copies of both core Basics sharply reduce the Prize-only cut',()=>{
  const r=copycatPrizeAccessCut({mimikyuCopies:2,dialgaCopies:2});
  near(r.immediatePrizeOnlyCut,0.0011659565851377587);
  assert.equal(r.basicCount,16);
});

test('copy additions can be evaluated at a fixed total Basic count',()=>{
  const secondMimikyu=copycatPrizeAccessCut({
    mimikyuCopies:2,otherBasicCopies:11
  });
  const bothCoreCopies=copycatPrizeAccessCut({
    mimikyuCopies:2,dialgaCopies:2,otherBasicCopies:10
  });
  near(secondMimikyu.immediatePrizeOnlyCut,0.009398928974940789);
  near(bothCoreCopies.immediatePrizeOnlyCut,0.0011495458143169286);
  assert.equal(secondMimikyu.basicCount,14);
  assert.equal(bothCoreCopies.basicCount,14);
  near(secondMimikyu.validOpeningProbability,0.8614093191287199);
});

test('second core copy plus second Heavy Ball further reduces the cut',()=>{
  const r=copycatPrizeAccessCut({mimikyuCopies:2,heavyBallCopies:2});
  near(r.immediatePrizeOnlyCut,0.0006666168493070397);
  assert.equal(r.basicCount,15);
});

test('the Prize-only cut is monotone over one to four available Heavy Balls',()=>{
  const values=[0,1,2,3,4].map(heavyBallCopies=>
    copycatPrizeAccessCut({heavyBallCopies}).immediatePrizeOnlyCut);
  for(let i=1;i<values.length;i++)assert.ok(values[i]<values[i-1]);
  near(values[0],0.18766340795943798);
});

test('the reported cut is a subset of the event that a core role is Prized',()=>{
  for(const options of [
    {},{mimikyuCopies:2},{dialgaCopies:2},{mimikyuCopies:2,dialgaCopies:2},
    {heavyBallCopies:2},{mimikyuCopies:2,heavyBallCopies:2}
  ]){
    const r=copycatPrizeAccessCut(options);
    assert.ok(r.anyCorePrized>=r.immediatePrizeOnlyCut);
    near(r.nonCut+r.immediatePrizeOnlyCut,1);
    assert.equal(r.paperPlayabilityCertified,false);
    assert.equal(r.strategicOptimalityCertified,false);
  }
});

test('invalid multiplicities and deck dimensions fail closed',()=>{
  for(const options of [
    {mimikyuCopies:0},{dialgaCopies:0},{heavyBallCopies:-1},
    {otherBasicCopies:-1},{mimikyuCopies:1.5},{dialgaCopies:NaN},
    {heavyBallCopies:Infinity},{totalCards:10},
    {mimikyuCopies:40,dialgaCopies:40},{heavyBallCopies:60},
    {initialHandSize:0},{prizeCount:61}
  ])assert.throws(()=>copycatPrizeAccessCut(options),RangeError);
});
