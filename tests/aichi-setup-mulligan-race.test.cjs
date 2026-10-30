"use strict";
const test=require('node:test');
const assert=require('node:assert/strict');
const {choose,openingValid,mulliganRace,targetAccess,expectedTargetAccess}=
  require('../scripts/aichi-setup-mulligan-race.cjs');
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,String(a)+' != '+String(b));

test('integer combinatorics and exact paper-size opening denominators',()=>{
  assert.equal(choose(60,7),386206920n);
  close(openingValid(60,4),0.3994996257446656);
  close(openingValid(60,14),0.8614093191287199);
});

test('rank 6 four Basics versus champion fourteen Basics',()=>{
  const x=mulliganRace(4,14);
  close(x.bothValid+x.aBonusProbability+x.bBonusProbability,1);
  close(x.bBonusProbability,0.5642343175423022);
  close(x.aBonusProbability,0.06039306263215036);
  close(x.bExpectedBonus,1.4123525560019536);
  close(x.aExpectedBonus,0.07010959980469617);
  close(x.bAtLeast(3),0.20346328957682416);
});

test('swapping deck seats swaps all race statistics',()=>{
  const a=mulliganRace(4,14),b=mulliganRace(14,4);
  close(a.aBonusProbability,b.bBonusProbability);
  close(a.bExpectedBonus,b.aExpectedBonus);
  close(a.bothValid,b.bothValid);
});

test('universal-Basic decks produce no mulligans',()=>{
  const x=mulliganRace(60,60);
  close(x.bothValid,1);close(x.aBonusProbability,0);
  close(x.bBonusProbability,0);
});

test('single Basic target and full physical Prize cap',()=>{
  const p=expectedTargetAccess({ownerBasics:14,rivalBasics:4,
    targets:1,targetBasics:1});
  close(p.baseline,0.135436968321483);
  close(p.withAllOptionalBonusDraws,0.15847598355862322);
  close(p.uplift,0.02303901523714024);
  close(p.cappedTail,3.6565413400057494e-11);
});

test('all accessible Basics targeted means guaranteed target in valid opening',()=>{
  close(targetAccess({total:12,hand:3,basic:2,targets:2,
    targetBasics:2,extra:0}),1);
});

test('finite toy enumeration agrees with exact no-target-and-valid hand law',()=>{
  // 8 distinguishable cards: 2 Basics (one targeted), one targeted Item;
  // enumerate all 8*7 ordered two-card openings with Basic validity.
  const cards=['targetBasic','otherBasic','targetItem',...Array(5).fill('filler')];
  let valid=0,noTarget=0;
  for(let i=0;i<8;i++)for(let j=0;j<8;j++){
    if(i===j)continue;
    const hand=[cards[i],cards[j]];
    if(!hand.includes('targetBasic')&&!hand.includes('otherBasic'))continue;
    valid++;
    if(!hand.some(x=>x.startsWith('target')))noTarget++;
  }
  close(targetAccess({total:8,hand:2,basic:2,targets:2,
    targetBasics:1,extra:0}),1-noTarget/valid);
});
