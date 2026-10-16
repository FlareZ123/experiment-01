'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {competingEvolutionOpportunity}=
  require('../scripts/first-evolution-contention.cjs');

/** @param {number} bonusDraws @returns {number} */
function brute(bonusDraws) {
  const cards=['V1','V2','M1','M2','B','X1','X2','X3'];
  const h=3,t1=h+1+bonusDraws;
  let valid=0,success=0;
  /** @param {number} at */
  function permute(at) {
    if(at===cards.length) {
      const opener=cards.slice(0,h);
      if(!opener.some(c=>c.startsWith('V')||c==='B')) return;
      valid++;
      const turnOne=cards.slice(0,t1);
      const turnTwo=cards.slice(0,t1+1);
      if(turnOne.filter(c=>c.startsWith('V')).length>=2 &&
          turnTwo.filter(c=>c.startsWith('M')).length===1) success++;
      return;
    }
    for(let i=at;i<cards.length;i++) {
      [cards[i],cards[at]]=[cards[at],cards[i]];
      permute(at+1);
      [cards[i],cards[at]]=[cards[at],cards[i]];
    }
  }
  permute(0);
  return success/valid;
}

test('exhaustive 40,320 physical deals independently agree for zero and one bonus',()=>{
  for(const bonusDraws of [0,1]) {
    const input={deckSize:8,openingSize:3,prizeCount:2,
      basicCount:3,targetBasicCount:2,stageOneCount:2,bonusDraws};
    assert.ok(Math.abs(competingEvolutionOpportunity(input)-brute(bonusDraws))<1e-12);
  }
});

test('three source-deck category counts match independent Python oracle',()=>{
  for(const [basicCount,targetBasicCount,stageOneCount,expected] of [
    [14,3,4,0.017727546863],
    [15,4,4,0.032399842804],
    [15,4,3,0.027342968125]
  ]) {
    const observed=competingEvolutionOpportunity({
      deckSize:60,openingSize:7,prizeCount:6,
      basicCount,targetBasicCount,stageOneCount
    });
    assert.ok(Math.abs(observed-expected)<1e-12,
      JSON.stringify({basicCount,targetBasicCount,stageOneCount,observed,expected}));
  }
});

test('impossible category partitions are rejected',()=>{
  assert.throws(()=>competingEvolutionOpportunity({
    deckSize:60,openingSize:7,prizeCount:6,
    basicCount:3,targetBasicCount:4,stageOneCount:4}),RangeError);
  assert.throws(()=>competingEvolutionOpportunity({
    deckSize:8,openingSize:7,prizeCount:6,
    basicCount:3,targetBasicCount:2,stageOneCount:2}),RangeError);
});
