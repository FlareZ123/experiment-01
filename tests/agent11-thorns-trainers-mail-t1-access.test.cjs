'use strict';
const assert=require('node:assert/strict');
const {countOneMailAccess}=
  require('../scripts/agent11-thorns-trainers-mail-t1-access.cjs');
const {countSourceAttackLine}=
  require('../scripts/agent11-thorns-tagcall-first-attack.cjs');

/** @param {number[]} pool @param {number} k @param {number} start */
function subsets(pool,k,start=0){
  if(k===0)return [[]];
  const result=[];
  for(let i=start;i<=pool.length-k;i++){
    for(const rest of subsets(pool,k-1,i+1))result.push([pool[i],...rest]);
  }
  return result;
}
/** @returns {{baseline:number,oneMail:number,total:number,additional:number}} */
function bruteToy(){
  const counts=[2,1,1,1,1,1,5];
  const cards=counts.flatMap((count,index)=>Array(count).fill(index));
  const ids=Array.from(cards.keys());
  let total=0,baseline=0,additional=0;
  for(const h of subsets(ids,4)){
    if(!h.some(i=>cards[i]===0))continue;
    const rest=ids.filter(i=>!h.includes(i));
    for(const prize of rest){
      const restAfterPrize=rest.filter(i=>i!==prize);
      for(const next of restAfterPrize){
        const deckIds=restAfterPrize.filter(i=>i!==next);
        const held=[...h,next].map(i=>cards[i]);
        const deck=deckIds.map(i=>cards[i]);
        const direct=held.includes(1)||(held.includes(2)&&deck.includes(1));
        const readyM=held.includes(3)||(direct&&deck.includes(3));
        const readyD=held.includes(4)||(direct&&deck.includes(4));
        const base=readyM&&readyD;
        for(const four of subsets(deckIds,2)){
          total++;
          if(base)baseline++;
          if(!base&&held.includes(5)&&deck.includes(1)&&
            (held.includes(3)||deck.includes(3))&&
            (held.includes(4)||deck.includes(4))&&
            four.some(i=>cards[i]===1||cards[i]===2))additional++;
        }
      }
    }
  }
  return {baseline,additional,total,oneMail:baseline+additional};
}
const toy=countOneMailAccess([2,1,1,1,1,1,5],4,1,2);
const brute=bruteToy();
assert.equal(brute.total,239400); // (C(12,4)-C(10,4))*8*7*C(6,2)
assert.ok(Math.abs(toy.baselineProbability-brute.baseline/brute.total)<1e-14);
assert.ok(Math.abs(toy.incrementProbability-brute.additional/brute.total)<1e-14);
assert.ok(Math.abs(toy.oneMailProbability-brute.oneMail/brute.total)<1e-14);

for(const [d,mail,baseline,increment] of [
  [1,3,0.3378150571059356,0.045060410921608986],
  [3,4,0.39107850627345275,0.062026151726032805],
  [1,2,0.3378150571059356,0.03183325931053457]
]){
  const c=[4,2,2,1,d,mail,51-d-mail];
  const r=countOneMailAccess(c);
  const direct=countSourceAttackLine([...c.slice(0,5),c[5]+c[6]]);
  assert.ok(Math.abs(r.baselineProbability-direct.broaderProbability)<1e-15);
  assert.ok(Math.abs(r.baselineProbability-baseline)<1e-15);
  assert.ok(Math.abs(r.incrementProbability-increment)<1e-15);
  assert.ok(r.additional>0n);
  assert.ok(r.oneMailProbability<1);
}
console.log('Agent11 original Thorns Trainers Mail first-turn access: exhaustive toy PASS');
