'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const source=require('../results/aichi-2026/full-decklists.json');
const {choose,sourcePartition,searchablePrizeWays,enumerate,probability}=
  require('../scripts/agent21-rank11-quickball-prize-frontier.cjs');

const rank11=source.decks.find(deck=>deck.rank===11);
assert.ok(rank11,'Original Aichi rank11 60 must exist');
const r=enumerate(rank11);

test('source original 60 and Basic count must remain unchanged',()=>{
  assert.deepEqual(sourcePartition(rank11),[2,2,2,6,4,4,9,8,23]);
  assert.equal(r.denominator,324031005021884160n);
});

test('Prize inclusion-exclusion preserves searchable target cards',()=>{
  assert.equal(searchablePrizeWays(2,2,true),
    choose(52,6)-2n*choose(50,4)+choose(48,2));
  assert.equal(searchablePrizeWays(2,2,false),
    choose(52,6)-choose(50,4));
  assert.equal(searchablePrizeWays(0,2,true),0n);
  assert.equal(searchablePrizeWays(2,0,false),0n);
});

test('existing direct route matches independent exact published result',()=>{
  assert.equal(r.direct,20917841360559248n);
  assert.ok(Math.abs(probability(r.direct,r.denominator)-
    0.06455506120208007)<1e-14);
});

test('Quick Ball-only prize-recoverable increment excludes direct access',()=>{
  assert.equal(r.quickOnlyBeforePrizes,7179053775981360n);
  assert.equal(r.quickOnly,6841036302154704n);
  assert.ok(r.quickOnly<r.quickOnlyBeforePrizes);
  assert.ok(Math.abs(probability(r.quickOnly,r.denominator)-
    0.021112289244335367)<1e-14);
  assert.ok(Math.abs(probability(r.direct+r.quickOnly,r.denominator)-
    0.08566735044641544)<1e-14);
});

test('some Quick-only hands hold Darkness as a possible discard payment',()=>{
  assert.equal(r.quickEnergy,3970321033218048n);
  assert.equal(r.quickTwoEnergy,1062414985435776n);
  assert.ok(r.quickOnly>r.quickEnergy && r.quickEnergy>r.quickTwoEnergy);
  assert.ok(Math.abs(probability(r.quickEnergy,r.denominator)-
    0.012252904727280352)<1e-14);
  assert.ok(Math.abs(probability(r.quickEnergy,r.quickOnly)-
    0.5803683620225091)<1e-14);
});

console.log(JSON.stringify({
  scope:'exact card-location census, no legal-play or win-rate claim',
  sourceRank:rank11.rank,
  direct:probability(r.direct,r.denominator),
  quickOnly:probability(r.quickOnly,r.denominator),
  quickWithDarkness:probability(r.quickEnergy,r.denominator),
  combined:probability(r.direct+r.quickOnly,r.denominator)
},null,2));
