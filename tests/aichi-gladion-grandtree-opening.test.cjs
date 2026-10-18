'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {choose,opportunity,run}=
  require('../scripts/aichi-gladion-grandtree-opening.cjs');

/** @param {number[]} cards @param {number} count */
function picks(cards,count){
  if(count===0)return [[]];
  if(cards.length<count)return [];
  return [...picks(cards.slice(1),count-1).map(x=>[cards[0],...x]),
    ...picks(cards.slice(1),count)];
}

test('source rank 2 probability is exact and print-guarded',()=>{
  const p=run();
  assert.equal(p.basics,14);
  assert.equal(p.grandTreePrizedAndGladionInFirstEight.numerator,'1748253');
  assert.equal(p.grandTreePrizedAndGladionInFirstEight.denominator,'133576960');
  assert.equal(p.grandTreeBeyondFirstPrizeSlot.numerator,'582751');
  assert.equal(p.grandTreeBeyondFirstPrizeSlot.denominator,'53430784');
});

test('independent exhaustive toy deals agree with finite counting',()=>{
  assert.equal(choose(9,3),84n);
  assert.equal(choose(9,10),0n);
  const cards=['B','B','G','T','x','x','x','x','x'];
  const ids=cards.map((_,i)=>i);
  let total=0,hits=0;
  for(const hand of picks(ids,3)){
    if(!hand.some(i=>cards[i]==='B'))continue;
    const remain=ids.filter(i=>!hand.includes(i));
    for(const prizes of picks(remain,2)){
      for(const next of remain.filter(i=>!prizes.includes(i))){
        total++;
        if(prizes.some(i=>cards[i]==='T')&&
            (hand.some(i=>cards[i]==='G')||cards[next]==='G'))hits++;
      }
    }
  }
  const p=opportunity({size:9,hand:3,prizes:2,basics:2});
  const ratio=Number(p.grandTreePrizedAndGladionInFirstEight.numerator)/
    Number(p.grandTreePrizedAndGladionInFirstEight.denominator);
  assert.ok(total>0&&hits>0);
  assert.ok(Math.abs(ratio-hits/total)<1e-14);
});
