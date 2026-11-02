'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {wallyJetDirectWindow}=require('../scripts/agent18-wally-blockade-window.cjs');

/** @param {number} n @param {number} k @returns {number[][]} */
function combinations(n,k){
  if(k===0)return [[]];
  const out=[];
  for(let i=0;i<=n-k;i++)for(const rest of combinations(n-i-1,k-1))
    out.push([i,...rest.map(j=>j+i+1)]);
  return out;
}

/** Exact toy game order: opening Basics, Prize, turn draw, Wally/Jet/Basic, Stage1 in deck. */
function brute(c){
  const cards=[
    ...Array(c.eggs).fill('egg'),...Array(c.otherBasics).fill('basic'),
    ...Array(c.wally).fill('wally'),...Array(c.jet).fill('jet'),
    ...Array(c.exeggutor).fill('evolution'),
    ...Array(c.deckSize-c.eggs-c.otherBasics-c.wally-c.jet-c.exeggutor).fill('other')
  ];
  let valid=0,good=0;
  for(const h of combinations(cards.length,c.opening)){
    if(!h.some(i=>cards[i]==='egg'||cards[i]==='basic'))continue;
    const left=cards.map((_,i)=>i).filter(i=>!h.includes(i));
    for(const ps of combinations(left.length,c.prizes)){
      const prizes=ps.map(i=>left[i]);
      for(const draw of left.filter(i=>!prizes.includes(i))){
        valid++;
        const seen=[...h,draw].map(i=>cards[i]);
        if(seen.includes('egg')&&seen.includes('jet')&&seen.includes('wally')&&
          left.some(i=>!prizes.includes(i)&&i!==draw&&cards[i]==='evolution'))good++;
      }
    }
  }
  return {valid,good,probability:good/valid};
}

test('four frozen rank2 60-card Wally-sensitivity exact rational rates',()=>{
  const base={deckSize:60,opening:7,prizes:6,eggs:2,otherBasics:12,jet:3,exeggutor:2};
  const expected=[
    '1392748831/149873349120',
    '69178943381/3896707077120',
    '9913837361/389670707712',
    '31578165629/974176769280'
  ];
  for(let wally=1;wally<=4;wally++)
    assert.equal(wallyJetDirectWindow({...base,wally}).fraction,expected[wally-1]);
});

test('independent physical-order exhaustive mini-deck with contested Stage1 Prizes',()=>{
  const cases=[
    {deckSize:9,opening:3,prizes:2,eggs:1,otherBasics:2,wally:1,jet:1,exeggutor:1},
    {deckSize:10,opening:3,prizes:2,eggs:2,otherBasics:1,wally:1,jet:1,exeggutor:1},
    {deckSize:10,opening:3,prizes:2,eggs:1,otherBasics:1,wally:2,jet:1,exeggutor:2}
  ];
  for(const c of cases){
    const actual=wallyJetDirectWindow(c);
    const expected=brute(c);
    assert.equal(actual.probability,expected.probability,JSON.stringify(c));
    assert.ok(expected.valid>0);
  }
});

test('adding Wally copies increases this narrowly specified opening opportunity',()=>{
  const base={deckSize:60,opening:7,prizes:6,eggs:2,otherBasics:12,jet:3,exeggutor:2};
  const rates=[1,2,3,4].map(wally=>wallyJetDirectWindow({...base,wally}).probability);
  for(let i=1;i<rates.length;i++)assert.ok(rates[i]>rates[i-1]);
  assert.ok(rates[3]<0.04);
});

test('invalid physical counts cannot produce a purported valid probability',()=>{
  assert.throws(()=>wallyJetDirectWindow({deckSize:9,opening:3,prizes:4,eggs:2,otherBasics:3,wally:2,jet:2,exeggutor:2}));
});
