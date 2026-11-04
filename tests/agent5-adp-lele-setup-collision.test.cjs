'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {choose}=require('../simulation/evaluation/agent5-adp-switch-first8-exact.cjs');
const {COUNTS,countCollision}=require('../simulation/evaluation/agent5-adp-lele-setup-collision.cjs');

function brute(counts,handSize,prizeCount){
  const deck=counts.flatMap((count,c)=>Array(count).fill(c));
  const idx=deck.map((_,i)=>i);
  const totals={denominator:0n,coheldOpening:0n,
    initialLeleRescue:0n,drawnLeleRescue:0n};
  function* subsets(all,k,at=0,selected=[]){
    if(selected.length===k){yield selected;return;}
    for(let i=at;i<=all.length-(k-selected.length);i++)
      yield* subsets(all,k,i+1,[...selected,all[i]]);
  }
  for(const handIndex of subsets(idx,handSize)){
    const hand=handIndex.map(i=>deck[i]);
    if(!hand.some(c=>c===0||c===1||c===2))continue;
    const unheld=idx.filter(i=>!handIndex.includes(i));
    for(const prizeIndex of subsets(unheld,prizeCount)){
      const deckAfterPrizes=unheld.filter(i=>!prizeIndex.includes(i));
      for(const draw of deckAfterPrizes){
        const first8=[...hand,deck[draw]];
        const liveDeck=deckAfterPrizes.filter(i=>i!==draw).map(i=>deck[i]);
        totals.denominator++;
        if(hand.includes(0)&&hand.includes(1))totals.coheldOpening++;
        if(!hand.includes(0)||!first8.includes(1)||
           first8.includes(3)||first8.includes(4)||first8.includes(5)||
           !liveDeck.includes(3)||!liveDeck.includes(4))continue;
        if(hand.includes(1))totals.initialLeleRescue++;
        else if(deck[draw]===1)totals.drawnLeleRescue++;
      }
    }
  }
  return totals;
}

test('fixed candidate Lele setup collision agrees with independent opening inclusion exclusion',()=>{
  const actual=countCollision();
  assert.equal(actual.denominator,250397245379590400n);
  const coheld=choose(60,7)-choose(58,7)-choose(59,7)+choose(57,7);
  assert.equal(coheld,8769222n);
  assert.equal(actual.coheldOpening,
    coheld*53n*choose(52,6));
  assert.equal(actual.initialLeleRescue,2481295235026608n);
  assert.equal(actual.drawnLeleRescue,408902585547456n);
  assert.equal(COUNTS.reduce((a,b)=>a+b,0),60);
});

test('independent physical toy first seven, prizes and draw exactly reproduce Lele rescue',()=>{
  for(const counts of [
    [1,1,1,1,1,1,3],
    [2,1,1,1,1,0,3],
    [1,1,2,1,1,0,3]
  ]){
    const exact=countCollision(counts,3,2);
    const independent=brute(counts,3,2);
    assert.deepEqual(exact,independent);
  }
});
