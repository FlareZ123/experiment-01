'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  choose,countStrictMailRoute,sourceCounts
} = require('../scripts/agent11-thorns-mail-access.cjs');

/** @param {number[]} items @param {number} k @returns {number[][]} */
function selectPositions(items,k){
  if(k===0)return [[]];
  return items.flatMap((value,j)=>selectPositions(items.slice(j+1),k-1)
    .map(tail=>[value,...tail]));
}

/**
 * Physical-identity toy brute force: all valid starting 2, one Prize,
 * one draw, then every top-4 subset on each independent Mail shuffle.
 * @param {number[]} counts
 */
function bruteToy(counts){
  const physical=counts.flatMap((n,category)=>Array(n).fill(category));
  const positions=physical.map((_,j)=>j);
  const peekSampleCount=choose(5,4);
  assert.equal(peekSampleCount,5n);
  let denominator=0n,strict=0n,broader=0n,extraScaled=0n;
  let broaderExtraScaled=0n;
  for(const hand of selectPositions(positions,2)){
    if(!hand.some(j=>physical[j]===0))continue;
    const pool=positions.filter(j=>!hand.includes(j));
    for(const prize of pool){
      const postPrize=pool.filter(j=>j!==prize);
      for(const drawn of postPrize){
        denominator++;
        const held=[...hand,drawn].map(j=>physical[j]);
        const deckIndices=postPrize.filter(j=>j!==drawn);
        const deck=deckIndices.map(j=>physical[j]);
        const direct=held.includes(1) ||
          (held.includes(2)&&deck.includes(1));
        const strictResource=deck.includes(3)&&deck.includes(4);
        if(strictResource&&direct)strict++;
        const readyBroad=(held.includes(3)||(direct&&deck.includes(3)))&&
          (held.includes(4)||(direct&&deck.includes(4)));
        if(readyBroad)broader++;
        const mails=held.filter(c=>c===5).length;
        const peeks=selectPositions(deckIndices,4);
        assert.equal(peeks.length,5);
        for(let combination=0;combination<25;combination++){
          let code=combination,strictHit=false,broadHit=false;
          const possibleBroad=(held.includes(3)||deck.includes(3))&&
            (held.includes(4)||deck.includes(4));
          for(let i=0;i<mails;i++){
            const top4=peeks[code%5].map(j=>physical[j]);
            code=Math.floor(code/5);
            const connector=deck.includes(1)&&
              top4.some(c=>c===1||c===2);
            if(connector)strictHit=true;
            if(connector || (held.includes(4)&&!held.includes(3)&&
                top4.includes(3)))broadHit=true;
          }
          if(strictResource&&!direct&&strictHit)extraScaled++;
          if(!readyBroad&&possibleBroad&&broadHit)broaderExtraScaled++;
        }
      }
    }
  }
  return {denominator,strict,broader,extraScaled,broaderExtraScaled};
}

assert.equal(choose(60,7),386206920n);
const toyCounts=[2,1,1,1,1,2,1];
const brute=bruteToy(toyCounts);
const exact=countStrictMailRoute(toyCounts,2,1);
const scale=25n;
assert.equal(exact.denominator,brute.denominator);
assert.equal(exact.direct*scale,brute.strict*scale);
assert.equal(exact.broader*scale,brute.broader*scale);
assert.equal(exact.extraScaled,brute.extraScaled);
assert.equal(exact.broaderExtraScaled,brute.broaderExtraScaled);
assert.equal(exact.favorableScaled,brute.strict*scale+brute.extraScaled);

const {singleMailAccess}=require(
  '../scripts/agent11-thorns-single-trainers-mail.cjs');
const field=JSON.parse(fs.readFileSync(path.resolve(__dirname,
  '../results/aichi-2026/full-decklists.json'),'utf8'));
const expected=[
  [6,1,3,0.2537731070353226,0.3378150571059356,
    0.03769960247171497,0.37551465957765057],
  [24,3,4,0.3207036626630127,0.39107850627345275,
    0.0629984592055008,0.45407696547895354],
  [29,1,2,0.2537731070353226,0.3378150571059356,
    0.025566750892835433,0.36338180799877107]
];
for(const [rank,dce,mail,direct,broad,increment,extended] of expected){
  const deck=field.decks.find(d=>d.rank===rank);
  assert.ok(deck);
  const counts=sourceCounts(deck);
  assert.deepEqual(counts.slice(0,6),[4,2,2,1,dce,mail]);
  const result=countStrictMailRoute(counts);
  assert.equal(result.denominator,166478632771651200n);
  for(const [actual,expect] of [
    [result.directProbability,direct],
    [result.broaderProbability,broad],
    [result.mailIncrementProbability,increment],
    [result.broaderWithMailProbability,extended]
  ]) assert.ok(Math.abs(actual-expect)<1e-12,
    'source rank '+rank+': '+actual+' vs '+expect);
  assert.ok(result.broaderWithMailProbability>
    result.broaderProbability);
  const prior=singleMailAccess(dce,mail);
  assert.equal(result.broader*prior.denominator,
    prior.base*result.denominator);
  assert.equal(
    (result.broader*(result.scaledDenominator/result.denominator)+
      result.broaderExtraScaled)*prior.allHeldMailDenominator,
    prior.allHeldMailNumerator*result.scaledDenominator);
  assert.ok(result.completeBroaderWithMailProbability>=extended);
}

console.log('Agent11 Trainers Mail: physical toy and exact prior independent all-held-Mail equality PASS');
