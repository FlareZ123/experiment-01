'use strict';

const assert=require('node:assert/strict');
const {choose}=require('./aichi-prize-conditionals.cjs');
const field=require('../results/aichi-2026/full-decklists.json');
const {discardOrder}=require('../simulation/twinleaf/rank6-broad-thorns-policy.cjs');

/** @param {bigint} a @param {bigint} b */
function gcd(a,b) {
  while(b!==0n) [a,b]=[b,a%b];
  return a;
}

/** @param {bigint} numerator @param {bigint} denominator */
function asExactProbability(numerator,denominator) {
  const factor=gcd(numerator,denominator);
  return {fraction:String(numerator/factor)+'/'+String(denominator/factor),
    probability:Number(numerator)/Number(denominator)};
}

/**
 * Exact combinatorial K0 resource event for the actual broad source policy.
 * Not a policy execution rate. The already-known positive-control seed has
 * no statistical role. The first seven must contain a Basic Thorns; the
 * eighth card is the normal first-turn draw after six random Prize cards.
 */
function analyzeBroadRank6Opportunity() {
  const rank6=field.decks.find(deck=>deck.rank===6);
  assert.ok(rank6);
  const copies=name=>rank6.cards.filter(c=>c.name===name)
    .reduce((n,c)=>n+c.count,0);
  const reserved=new Set([
    'Iron Thorns ex','Thunder Mountain ♢','Double Colorless Energy',
    'Guzma & Hala','Tag Call'
  ]);
  const safe=new Set(discardOrder);
  const b=copies('Iron Thorns ex'),t=copies('Thunder Mountain ♢');
  const d=copies('Double Colorless Energy'),g=copies('Guzma & Hala');
  const tag=copies('Tag Call');
  const s=rank6.cards.filter(card=>safe.has(card.name))
    .reduce((n,card)=>n+card.count,0);
  const other=rank6.cards.filter(card=>
    !reserved.has(card.name)&&!safe.has(card.name))
    .reduce((n,card)=>n+card.count,0);
  const groups=[b,t,d,g,tag,s,other];
  assert.deepEqual(groups,[4,1,1,2,2,38,12]);
  const total=groups.reduce((n,c)=>n+c,0);
  assert.equal(total,60);

  let triggerWays=0n,availableWays=0n,directWays=0n;
  let visited=0;
  const prizeWays=choose(52,6);
  const handWays=choose(60,8);
  const legalSeven=choose(60,7)-choose(60-b,7);
  const allSeven=choose(60,7);
  const eight=Array(groups.length).fill(0);

  /** @returns {void} */
  function visit() {
    const [hb,ht,hd,hg,hTag,hSafe]=eight;
    if(hb===0)return;
    const needThunder=ht===0, needDce=hd===0;
    const isDirect=!needThunder&&!needDce;
    const hasConnector=hg>0||hTag>0;
    if(!isDirect && (!hasConnector || (needDce&&hSafe<2)))return;
    let multiplicity=hb===1?7n:8n;
    for(let i=0;i<eight.length;i++) {
      multiplicity*=choose(groups[i],eight[i]);
    }
    visited++;
    triggerWays+=multiplicity*prizeWays;
    if(isDirect) {
      directWays+=multiplicity*prizeWays;
      availableWays+=multiplicity*prizeWays;
      return;
    }
    const missing=Number(needThunder)+Number(needDce);
    let legalPrizeWays=choose(52-missing,6);
    if(hg===0) {
      // Tag Call has to find at least one of the two hidden G&H.
      legalPrizeWays-=choose(50-missing,4);
    }
    availableWays+=multiplicity*legalPrizeWays;
  }

  /** @param {number} i @param {number} left */
  function enumerate(i,left) {
    if(i===groups.length-1) {
      if(left>=0 && left<=groups[i]) {
        eight[i]=left;
        visit();
      }
      return;
    }
    for(let n=0;n<=Math.min(left,groups[i]);n++) {
      eight[i]=n;
      enumerate(i+1,left-n);
    }
  }
  enumerate(0,8);
  const denom=8n*handWays*prizeWays*legalSeven;
  const adjust=allSeven;
  return {
    schema:'rank6-broad-hand-discard-resource-combinatorics-v1',
    fieldRank:6,sourcePlayer:rank6.player,groups,
    eightCardAllocationsContributing:visited,
    fullFirstSevenBasicConditioned:true,
    sixUnknownPrizes:true,oneNormalDraw:true,
    direct:asExactProbability(directWays*adjust,denom),
    proposedHandTrigger:asExactProbability(triggerWays*adjust,denom),
    requiredSearchCardsAvailable:asExactProbability(availableWays*adjust,denom),
    note:'Card-resource feasibility only. No opponent effects, supported-card legality, original mulligan bonus, prompt execution, DCI opportunity costs, choice policy quality, actual attacks or win rates.',
    qualifiedForCompetitiveInference:false
  };
}

if(require.main===module) {
  process.stdout.write(JSON.stringify(analyzeBroadRank6Opportunity(),null,2)+'\n');
}
module.exports={analyzeBroadRank6Opportunity};
