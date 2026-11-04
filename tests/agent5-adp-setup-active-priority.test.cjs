'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {categorizeFixedDeck}=require('../simulation/evaluation/agent5-adp-switch-first8-exact.cjs');
const {compareFirstBasicSelection}=
  require('../simulation/evaluation/agent5-adp-setup-active-priority.cjs');
const registered=require('../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json');

/** An independent physical-card/ordered-setup enumeration for very small decks. */
function brute(counts,handSize,prizeCount){
  const source=counts.flatMap((quantity,c)=>Array(quantity).fill(c));
  const indices=source.map((_,i)=>i);
  const fields=['priorityAdpStartsScaled','greedyAdpStartsScaled',
    'priorityAdpEnergyScaled','greedyAdpEnergyScaled',
    'priorityAllEnergyScaled','greedyAllEnergyScaled',
    'greedyRescueHeldAdpScaled','greedyRescueSearchedAdpScaled'];
  const countsOut=Object.fromEntries(fields.map(field=>[field,0n]));
  let denominator=0n;
  function* orderedHand(prefix=[],left=indices){
    if(prefix.length===handSize){yield prefix;return;}
    for(const number of left)yield* orderedHand([...prefix,number],
      left.filter(i=>i!==number));
  }
  function* pickPrizes(from,count,offset=0,prefix=[]){
    if(prefix.length===count){yield prefix;return;}
    for(let j=offset;j<=from.length-(count-prefix.length);j++)
      yield* pickPrizes(from,count,j+1,[...prefix,from[j]]);
  }
  for(const ordered of orderedHand()){
    const opening=ordered.map(i=>source[i]);
    const basic=opening.find(category=>category===0||category===1);
    if(basic===undefined)continue;
    const outside=indices.filter(i=>!ordered.includes(i));
    const optimal=opening.includes(0)?0:1;
    for(const prizes of pickPrizes(outside,prizeCount)){
      const afterPrize=outside.filter(i=>!prizes.includes(i));
      for(const d of afterPrize){
        const seen=[...opening,source[d]];
        const deck=afterPrize.filter(i=>i!==d).map(i=>source[i]);
        const has=(array,category)=>array.includes(category);
        const energy=has(seen,7)||(has(deck,7)&&
          (has(seen,6)||(has(seen,3)&&has(deck,6))));
        const adp=has(seen,0)||(has(deck,0)&&
          (has(seen,3)||has(seen,4)||has(seen,5)));
        denominator++;
        if(optimal===0)countsOut.priorityAdpStartsScaled++;
        if(basic===0)countsOut.greedyAdpStartsScaled++;
        if(!energy)continue;
        if(optimal===0)countsOut.priorityAdpEnergyScaled++;
        if(basic===0)countsOut.greedyAdpEnergyScaled++;
        if(optimal===0||(has(seen,2)&&adp))
          countsOut.priorityAllEnergyScaled++;
        if(basic===0||(has(seen,2)&&adp))
          countsOut.greedyAllEnergyScaled++;
        if(basic===1&&opening.includes(0)&&has(seen,2))
          countsOut.greedyRescueHeldAdpScaled++;
        if(basic===1&&!opening.includes(0)&&has(seen,2)&&adp)
          countsOut.greedyRescueSearchedAdpScaled++;
      }
    }
  }
  return {denominator,countsOut};
}

test('fixed60 greedy and deliberate ADP start results are exact',()=>{
  const out=compareFirstBasicSelection(categorizeFixedDeck(registered));
  const percent=key=>100*Number(out[key])/Number(out.denominatorScaled);
  assert.equal(out.denominatorScaled,105166843059427968000n);
  assert.ok(Math.abs(percent('priorityAdpStartsScaled')-36.85745784435869)<1e-11);
  assert.ok(Math.abs(percent('greedyAdpStartsScaled')-100*2/7)<1e-11);
  assert.ok(Math.abs(percent('priorityAdpEnergyScaled')-28.9936530125316)<1e-11);
  assert.ok(Math.abs(percent('greedyAdpEnergyScaled')-22.817497625092404)<1e-11);
  assert.ok(Math.abs(percent('priorityAllEnergyScaled')-37.98153051861419)<1e-11);
  assert.ok(Math.abs(percent('greedyAllEnergyScaled')-32.96164378282613)<1e-11);
  assert.ok(out.priorityAllEnergyScaled>out.greedyAllEnergyScaled);
});

test('physical, ordered, three-card toy hands exactly match scaled hypergeometric method',()=>{
  for(const counts of [
    [1,2,1,1,1,0,1,1,2],
    [2,1,1,1,0,1,1,1,2],
    [1,2,2,0,1,0,1,1,2]
  ]){
    const exact=compareFirstBasicSelection(counts,{openingHandSize:3,prizeCount:2});
    const observed=brute(counts,3,2);
    for(const [key,count] of Object.entries(observed.countsOut))
      assert.equal(exact[key]*observed.denominator,
        count*exact.denominatorScaled,
        'Ordered physical sample mismatch for '+key+' in '+counts.join(','));
  }
});

test('no ADP means no ADP start and no full rescue if absent from deck',()=>{
  const out=compareFirstBasicSelection([0,5,2,4,3,4,3,4,35]);
  assert.equal(out.priorityAdpStartsScaled,0n);
  assert.equal(out.greedyAdpStartsScaled,0n);
  assert.equal(out.priorityAllEnergyScaled,0n);
  assert.equal(out.greedyAllEnergyScaled,0n);
});
