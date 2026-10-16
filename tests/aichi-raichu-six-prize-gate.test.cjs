'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {energyPrizeGate,publishedRaichuPrizeGate}=
  require('../scripts/aichi-raichu-six-prize-gate.cjs');

/** @param {number} n @param {number} k */
function combinations(n,k){
  const result=[];
  /** @param {number[]} selected @param {number} start */
  function visit(selected,start){
    if(selected.length===k){result.push([...selected]);return;}
    for(let i=start;i<=n-(k-selected.length);i++)visit([...selected,i],i+1);
  }
  visit([],0);
  return result;
}

/**
 * Independent physical-slot hand then Prize enumeration.
 * @param {{deckSize:number,basics:number,reversal:number,counter:number,
 *   openingSize:number,prizeSize:number,needReversal:number,needCounter:number}} config
 */
function physicalOracle(config){
  const {deckSize,basics,reversal,counter,openingSize,prizeSize,
    needReversal,needCounter}=config;
  const cards=[
    ...Array(basics).fill('B'),...Array(reversal).fill('R'),
    ...Array(counter).fill('C'),
    ...Array(deckSize-basics-reversal-counter).fill('O')
  ];
  let total=0,allR=0,eligible=0;
  for(const handIdx of combinations(deckSize,openingSize)){
    const hand=new Set(handIdx);
    if(!handIdx.some(i=>cards[i]==='B'))continue;
    const remainder=cards.filter((_,i)=>!hand.has(i));
    for(const prizeIdx of combinations(remainder.length,prizeSize)){
      const prize=prizeIdx.map(i=>remainder[i]);
      const r=prize.filter(c=>c==='R').length;
      const c=prize.filter(c=>c==='C').length;
      total++;
      if(r===0)allR++;
      if(r<=reversal-needReversal&&c<=counter-needCounter)eligible++;
    }
  }
  return {total,allR,eligible};
}

test('BigInt category enumerator matches independent miniature physical decks',()=>{
  for(const config of [
    {deckSize:9,basics:3,reversal:2,counter:2,
      openingSize:3,prizeSize:2,needReversal:2,needCounter:1},
    {deckSize:10,basics:4,reversal:1,counter:2,
      openingSize:3,prizeSize:2,needReversal:1,needCounter:2},
    {deckSize:8,basics:2,reversal:2,counter:1,
      openingSize:2,prizeSize:3,needReversal:2,needCounter:1}
  ]){
    const direct=physicalOracle(config);
    const exact=energyPrizeGate(config);
    assert.equal(exact.legalDealCount,BigInt(direct.total));
    assert.ok(Math.abs(exact.allReversalUnprized.probability-
      direct.allR/direct.total)<1e-14);
    assert.ok(Math.abs(exact.requisitePairUnprized.probability-
      direct.eligible/direct.total)<1e-14);
  }
});

test('both published rank 4 and rank 17 have thirteen Basics and the same Prize gate',()=>{
  const rows=publishedRaichuPrizeGate();
  assert.deepEqual(rows.map(r=>r.rank),[4,17]);
  for(const row of rows){
    assert.equal(row.basics,13);
    assert.ok(Math.abs(row.allReversalUnprized.probability-
      0.6463727026896369)<1e-13);
    assert.ok(Math.abs(row.requisitePairUnprized.probability-
      0.6445457790929285)<1e-13);
    assert.ok(row.requisitePairUnprized.probability<
      row.allReversalUnprized.probability);
  }
});

test('strict invalid inventories and impossible requirements are rejected',()=>{
  const base={deckSize:9,basics:3,reversal:2,counter:2,
    openingSize:3,prizeSize:2,needReversal:2,needCounter:1};
  for(const changed of [
    {basics:0},{reversal:-1},{needReversal:3},{needCounter:4},
    {openingSize:0},{prizeSize:0},{openingSize:8},{deckSize:1}
  ]){
    assert.throws(()=>energyPrizeGate({...base,...changed}),/Invalid|No legal/);
  }
});
