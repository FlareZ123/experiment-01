'use strict';
const assert = require('node:assert/strict');
const { forcedSoloScreen } =
  require('../scripts/agent11-newmoon-thorns-firstturn-exposure.cjs');

/** Exhaustive original physical positions for a ten-card toy deck. */
function bruteToy() {
  const cards=['weak','basic','direct','compressor','carrier',
    'neutral','neutral','neutral','neutral','neutral'];
  /** @param {number[]} pool @param {number} k @param {number} start */
  const subsets=(pool,k,start=0)=>{
    if(k===0)return [[]];
    const out=[];
    for(let i=start;i<=pool.length-k;i++)
      for(const part of subsets(pool,k-1,i+1))out.push([pool[i],...part]);
    return out;
  };
  const indices=Array.from(cards.keys());
  let event=0,valid=0,all=0;
  for(const hand of subsets(indices,3)){
    const remainder=indices.filter(i=>!hand.includes(i));
    for(const prize of remainder){
      for(const draw of remainder){
        if(prize===draw)continue;
        all++;
        if(hand.some(i=>cards[i]==='weak'||cards[i]==='basic'))valid++;
        const now=[...hand,draw].map(i=>cards[i]);
        const remainderHeld=now.filter(c=>c!=='weak');
        if(hand.filter(i=>cards[i]==='weak').length===1 &&
          remainderHeld.every(c=>c==='compressor'||c==='carrier'||c==='neutral') &&
          !(remainderHeld.includes('compressor')&&remainderHeld.includes('carrier')) &&
          now.length===4)event++;
      }
    }
  }
  return {event,valid,all};
}

const toy=forcedSoloScreen({basic:2,vulnerable:1,direct:1,
  compressor:1,carrier:1,safe:7},3,10);
const brute=bruteToy();
assert.equal(brute.all,120*7*6);
assert.ok(Math.abs(toy.unconditionalProbability-brute.event/brute.all)<1e-13);
assert.ok(Math.abs(toy.conditionalProbability-brute.event/brute.valid)<1e-13);

const full=forcedSoloScreen({basic:17,vulnerable:5,direct:16,
  compressor:2,carrier:2,safe:27});
assert.equal(full.numerator,22261584495150n);
assert.equal(full.denominator,18177056551882800n);
assert.equal(full.validHandNumerator,353982806n);
assert.ok(Math.abs(full.conditionalProbability-0.001336196708880144)<1e-15);
assert.ok(Math.abs(full.unconditionalProbability-0.001224707885548396)<1e-15);
console.log('Agent11 first-turn solo exposure: complete toy + exact large count PASS');
