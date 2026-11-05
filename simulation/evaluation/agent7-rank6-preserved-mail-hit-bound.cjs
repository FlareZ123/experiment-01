'use strict';
const assert=require('node:assert/strict');
const roster=require('../../results/aichi-2026/full-decklists.json');
/** @param {number} n @param {number} k @returns {bigint} */
function combinations(n,k){
  assert.ok(Number.isSafeInteger(n)&&Number.isSafeInteger(k)&&k>=0&&k<=n);
  let x=1n;
  for(let i=1;i<=k;i++)x=x*BigInt(n-i+1)/BigInt(i);
  return x;
}
/** @param {number} deck @param {number} nonhits @param {number} look @returns {number} */
function hitProbability(deck,nonhits,look=4){
  assert.ok(nonhits>=0&&nonhits<=deck);
  const k=Math.min(deck,look);
  const miss=nonhits>=k?combinations(nonhits,k):0n;
  return 1-Number(miss)/Number(combinations(deck,k));
}
function rank6(){
  const cards=roster.decks.find(x=>x.rank===6).cards;
  const count=predicate=>cards.filter(predicate).reduce((n,x)=>n+x.count,0);
  const trainers=count(x=>x.category==='Trainer');
  const mail=count(x=>x.name==="Trainers' Mail");
  const nonhits=count(x=>x.category!=='Trainer')+mail;
  assert.deepEqual([trainers,mail,nonhits],[48,3,15]);
  return {eligible:trainers-mail,nonhits,deck:42,
    noOutsideEvidence:hitProbability(42,15),
    conditionalFourOutside:hitProbability(42,11),
    nativeSettlementProven:false,competitiveGamesQualified:0};
}
module.exports={combinations,hitProbability,rank6};
