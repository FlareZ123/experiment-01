'use strict';
const assert = require('node:assert/strict');
const {choose,hardCrisisBarriers,sourceRank26Barriers} =
  require('../scripts/aichi-rank26-crisis-barriers.cjs');

/** @param {number[]} arr @param {number} k @returns {number[][]} */
function combinations(arr,k) {
  if(k===0)return [[]];
  if(arr.length<k)return [];
  const [first,...rest]=arr;
  return [...combinations(rest,k-1).map(a=>[first,...a]),
    ...combinations(rest,k)];
}

/**
 * Independent exact physical deal enumeration in a small deck.
 * M designated Basic, O other Basics, D,T,R distinguished non-Basics,
 * x undistinguished non-Basics.
 * @param {{deckSize:number,basicCount:number,handSize:number,prizeCount:number}} o
 */
function brute(o) {
  const {deckSize:N,basicCount:B,handSize:h,prizeCount:p}=o;
  const cards=['M',...Array(B-1).fill('O'),'D','T','R',
    ...Array(N-B-3).fill('x')];
  const ids=Array.from({length:N},(_,i)=>i);
  let total=0n,a=0n,b=0n,intersection=0n;
  for(const hand of combinations(ids,h)) {
    const handCards=hand.map(i=>cards[i]);
    if(!handCards.includes('M')&&!handCards.includes('O'))continue;
    const remaining=ids.filter(i=>!hand.includes(i));
    for(const prize of combinations(remaining,p)) {
      const prized=prize.map(i=>cards[i]);
      const eventA=prized.includes('D')&&prized.includes('T');
      const eventB=handCards.includes('M')&&!handCards.includes('O')&&
        prized.includes('R')&&prized.includes('T');
      total++;
      if(eventA)a++;
      if(eventB)b++;
      if(eventA&&eventB)intersection++;
    }
  }
  return {total,a,b,intersection,union:a+b-intersection};
}

assert.equal(choose(5,2),10n);
assert.equal(choose(5,6),0n);
for(const options of [
  {deckSize:10,basicCount:2,handSize:3,prizeCount:3},
  {deckSize:12,basicCount:3,handSize:3,prizeCount:3},
  {deckSize:12,basicCount:4,handSize:4,prizeCount:3}
]) {
  const got=hardCrisisBarriers(options), exact=brute(options);
  for(const [key,row] of [
    ['a',got.bothSpecialEnergyAndTicketPrized],
    ['b',got.forcedMeloettaActiveAndRopeTicketPrized],
    ['intersection',got.overlap],
    ['union',got.unionLowerBoundOnNoFirstTurnCrisis]
  ]) {
    assert.equal(row.favorableDeals,exact[key].toString(),key);
    assert.equal(row.totalDeals,exact.total.toString(),key);
  }
}
const rank26=hardCrisisBarriers({
  deckSize:60,basicCount:12,handSize:7,prizeCount:6
});
assert.ok(Math.abs(rank26.unionLowerBoundOnNoFirstTurnCrisis.percent-
  0.8910781031056714)<1e-12);
const real=sourceRank26Barriers(require('node:path').resolve(__dirname,'..'));
assert.deepEqual(real,rank26);
console.log('Rank26 source and exact joint barrier counts verified against physical miniature decks');
