'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {choose}=require('../scripts/aichi-opening-basics.cjs');
const {strictPublicActiveRobustIntervals:strict}=
  require('../scripts/agent26-public-active-robust-source-intervals-v2.cjs');
const {publicActiveRobustIntervals:prior}=
  require('../scripts/agent26-public-active-robust-source-intervals.cjs');
const manifest=require('../results/aichi-2026/full-decklists.json');
const receipts=require('../results/statistics/agent26-real-native-source6-public-mulligan-six.json');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-11,
  String(a)+' != '+String(b));

test('six real public rank6 receipts sharpen exactly two Prism Star lower bounds',()=>{
  const expected=[1/65,null,null,null,1/385,null];
  receipts.rows.forEach((row,i)=>{
    const hands=row.firstPublicHand?[row.firstPublicHand]:[];
    const old=prior(manifest,hands,'Iron Thorns ex');
    const newer=strict(manifest,hands,'Iron Thorns ex');
    const a=old.ranges.find(x=>x.rank===6);
    const b=newer.ranges.find(x=>x.rank===6);
    assert.ok(b.posteriorLower+1e-12>=a.posteriorLower);
    if(expected[i]!==null)near(b.posteriorLower,expected[i]);
    else near(b.posteriorLower,a.posteriorLower);
    assert.equal(b.upperEvent,a.upperEvent);
    assert.equal(b.lowerEvent,a.lowerEvent);
    assert.equal(newer.competitiveQualifiedGames,0);
  });
});

test('one-card Radiant Active cap gives stronger no-mulligan original rank1 lower',()=>{
  const old=prior(manifest,[],'Radiant Eternatus');
  const cap1=strict(manifest,[],'Radiant Eternatus',
    {maxActiveCopies:1});
  const cap4=strict(manifest,[],'Radiant Eternatus');
  const a=old.ranges.find(x=>x.rank===1);
  const b=cap1.ranges.find(x=>x.rank===1);
  near(a.posteriorLower,cap4.ranges.find(x=>x.rank===1).posteriorLower);
  const D=Number(choose(60,7));
  const forced=(Number(choose(47,7))-Number(choose(46,7)))/D;
  const unknownOne=1-Number(choose(59,7))/D;
  near(b.posteriorLower,forced/(forced+3*unknownOne));
  near(a.posteriorLower,forced/(forced+3*
    (1-Number(choose(56,7))/D)));
  assert.ok(b.posteriorLower>a.posteriorLower);
  assert.equal(cap1.activeCopyCap,1);
  assert.equal(cap1.competitiveQualifiedGames,0);
});

test('two distinct observed ACE SPEC names imply impossible common-60 source',()=>{
  const first=['Secret Box','A','B','C','D','E','F'];
  const next=['Computer Search','A','B','C','D','E','F'];
  const a=strict(manifest,[first,next],'Iron Thorns ex');
  assert.equal(a.status,'OUTSIDE_SUPPORTED_32_SOURCE_EVENT');
  assert.equal(a.omittedTotalLikelihoodUpper,0);
  assert.equal(a.competitiveQualifiedGames,0);
});

test('generic public-Active unknown bound remains no greater than old bound',()=>{
  const hand=receipts.rows[0].firstPublicHand;
  const old=prior(manifest,[hand],'Iron Thorns ex');
  const next=strict(manifest,[hand],'Iron Thorns ex');
  assert.ok(next.omittedTotalLikelihoodUpper<=
    old.omittedTotalLikelihoodUpper*(1+1e-12));
  assert.equal(next.knownSourceRanks,29);
  assert.deepEqual(next.missingSourceRanks,[23,25,28]);
  assert.equal(next.usedConcealedOpponentState,false);
});
