'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {choose} = require('../../scripts/aichi-prize-conditionals.cjs');

const groupsOrder = ['thorns','thunder','dce','guzmaHala','tagCall','discards','other'];

/** @param {bigint} x @param {bigint} y @returns {bigint} */
function gcd(x,y) {
  while (y !== 0n) [x,y] = [y,x%y];
  return x;
}

/**
 * Produce an exact rational rate, reducing potentially enormous integer sums.
 * @param {bigint} numerator
 * @param {bigint} denominator
 */
function rational(numerator,denominator) {
  const divisor=gcd(numerator,denominator);
  return {numerator:numerator/divisor,denominator:denominator/divisor,
    decimal:Number(numerator)/Number(denominator)};
}

/**
 * Group counts resolved from the actual rank-6 source 60.
 * The conservative discard whitelist has Beach, Mail, Belt and Camping Gear.
 * @param {{decks:{rank:number,cards:{name:string,count:number}[]}[]} } published
 * @returns {Record<string,number>}
 */
function rank6Groups(published) {
  const deck=published.decks.find(row=>row.rank===6);
  assert.ok(deck,'Aichi rank 6 source list is required');
  const count=name=>deck.cards.filter(row=>row.name===name)
    .reduce((sum,row)=>sum+row.count,0);
  const result={
    thorns:count('Iron Thorns ex'),
    thunder:count('Thunder Mountain ♢'),
    dce:count('Double Colorless Energy'),
    guzmaHala:count('Guzma & Hala'),
    tagCall:count('Tag Call'),
    discards:['Tropical Beach',"Trainers' Mail",'Palace Belt','Camping Gear']
      .reduce((sum,name)=>sum+count(name),0)
  };
  const total=deck.cards.reduce((sum,row)=>sum+row.count,0);
  assert.equal(total,60,'Physical source list must be exactly 60 cards');
  result.other=60-Object.values(result).reduce((sum,value)=>sum+value,0);
  assert.ok(result.other>=0);
  return result;
}

/**
 * Favorable hidden Prize combinations for the opening plan's specific
 * restricted owner-search requirements. This is an oracle *analysis* only.
 * It is never used to select an in-game action.
 * @param {Record<string,number>} groups
 * @param {Record<string,number>} hand8
 * @param {'direct'|'guzma-hala'|'tag-call'} route
 * @returns {bigint}
 */
function favorablePrizes(groups,hand8,route) {
  if (route==='direct') return choose(52,6);
  const remaining={
    thunder:groups.thunder-hand8.thunder,
    dce:groups.dce-hand8.dce,
    guzmaHala:groups.guzmaHala-hand8.guzmaHala
  };
  const others=52-Object.values(remaining).reduce((a,b)=>a+b,0);
  let ways=0n;
  for(let pm=0;pm<=remaining.thunder;pm++) {
    for(let pd=0;pd<=remaining.dce;pd++) {
      for(let pg=0;pg<=remaining.guzmaHala;pg++) {
        if (!hand8.thunder && pm===remaining.thunder) continue;
        if (!hand8.dce && pd===remaining.dce) continue;
        if (route==='tag-call' && pg===remaining.guzmaHala) continue;
        ways+=choose(remaining.thunder,pm)*choose(remaining.dce,pd)*
          choose(remaining.guzmaHala,pg)*choose(others,6-pm-pd-pg);
      }
    }
  }
  return ways;
}

/**
 * Exact probability of visible-hand routes with available, unprized search
 * targets, conditional on a legal seven-card start. Physical opening: first
 * seven, six unseen Prizes, one normal draw. No mulligan bonus or card effects.
 * This quantity is an action-resource opportunity, not a policy success rate.
 * @param {Record<string,number>} groups
 * @param {{conditionalTagCallPayment?:boolean}} [options]
 */
function exactExpandedOpening(groups,options={}) {
  assert.equal(groupsOrder.reduce((sum,key)=>sum+groups[key],0),60);
  const conditionalTagCallPayment=options.conditionalTagCallPayment===true;
  const raw={direct:0n,'guzma-hala':0n,'tag-call':0n,legacyNarrow:0n};
  const hand={};
  function enumerate(index,left) {
    const key=groupsOrder[index];
    if(index===groupsOrder.length-1) {
      if(left<=groups[key]) { hand[key]=left; countHand(); }
      return;
    }
    for(let n=0;n<=Math.min(left,groups[key]);n++) {
      hand[key]=n;
      enumerate(index+1,left-n);
    }
  }
  function countHand() {
    if(hand.thorns===0) return;
    const direct=hand.thunder>0 && hand.dce>0;
    const route=direct?'direct':hand.guzmaHala>0?'guzma-hala':
      hand.tagCall>0?'tag-call':null;
    // With held G&H, Tag Call is no longer needed for this turn's connector.
    // After using one Tag Call to search G&H, only remaining copies qualify.
    // Other future tactical value is deliberately outside this resource model.
    const spareTags=hand.guzmaHala>0?hand.tagCall:
      route==='tag-call'?Math.max(0,hand.tagCall-1):0;
    const effectiveDiscards=hand.discards+
      (conditionalTagCallPayment?spareTags:0);
    if (!route || (!hand.dce && effectiveDiscards<2)) return;
    const ways=groupsOrder.reduce((product,key)=>
      product*choose(groups[key],hand[key]),1n);
    // With one Basic among eight, it must occupy the initial seven (7/8).
    const openingWeight=hand.thorns===1?7n:8n;
    const contribution=ways*openingWeight*favorablePrizes(groups,hand,route);
    raw[route]+=contribution;
    if(route==='guzma-hala' && hand.thunder && !hand.dce &&
        hand.discards>=2) raw.legacyNarrow+=contribution;
  }
  enumerate(0,8);
  const validSeven=choose(60,7)-choose(60-groups.thorns,7);
  const denominator=8n*choose(60,8)*choose(52,6)*validSeven;
  const normalize=n=>rational(n*choose(60,7),denominator);
  const total=raw.direct+raw['guzma-hala']+raw['tag-call'];
  return {groups,byRoute:{
    direct:normalize(raw.direct),
    guzmaHala:normalize(raw['guzma-hala']),
    tagCall:normalize(raw['tag-call'])
  },legacyNarrow:normalize(raw.legacyNarrow),total:normalize(total)};
}

if(require.main===module) {
  const published=require(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'));
  const result=exactExpandedOpening(rank6Groups(published));
  process.stdout.write(JSON.stringify(result,(key,value)=>
    typeof value==='bigint'?value.toString():value,null,2)+'\n');
}
module.exports={rank6Groups,exactExpandedOpening,favorablePrizes};
