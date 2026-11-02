'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {grandTreeDirectWindow}=require('../scripts/agent18-grand-tree-turn2-window.cjs');

/** @param {number[]} a @param {number} k @returns {number[][]} */
function chooseIndices(a,k){
  if(k===0)return [[]];
  const out=[];
  for(let i=0;i<=a.length-k;i++)for(const tail of chooseIndices(a.slice(i+1),k-1))
    out.push([a[i],...tail]);
  return out;
}

/** Independent tiny physical-deck order enumeration. */
function brute(c){
  const cards=[...Array(c.targetBasics).fill('target'),
    ...Array(c.otherBasics).fill('basic'),...Array(c.grandTrees).fill('tree'),
    ...Array(c.jet).fill('jet'),...c.stages.flatMap((v,i)=>Array(v).fill('stage'+i))];
  while(cards.length<c.deckSize)cards.push('other');
  const indices=cards.map((_,i)=>i);
  let total=0,hit=0;
  for(const hand of chooseIndices(indices,c.opening)){
    if(!hand.some(i=>cards[i]==='target'||cards[i]==='basic'))continue;
    const remaining=indices.filter(i=>!hand.includes(i));
    for(const prizes of chooseIndices(remaining,c.prizes)){
      const deck=remaining.filter(i=>!prizes.includes(i));
      for(const draw1 of deck){
        const afterFirst=deck.filter(i=>i!==draw1);
        for(const draw2 of c.draws===1?[null]:afterFirst){
          total++;
          const seen=[...hand,draw1,...(draw2===null?[]:[draw2])];
          const beforeSecond=c.draws===1?hand:[...hand,draw1];
          if(!beforeSecond.some(i=>cards[i]==='target'))continue;
          if(!seen.some(i=>cards[i]==='tree')||!seen.some(i=>cards[i]==='jet'))continue;
          const remainingDeck=afterFirst.filter(i=>i!==draw2);
          if(c.stages.every((_,i)=>remainingDeck.some(x=>cards[x]==='stage'+i)))hit++;
        }
      }
    }
  }
  return hit/total;
}

test('exact unchanged original and proposed 60 turn-two direct access',()=>{
  const shared={deckSize:60,opening:7,prizes:6,targetBasics:2,otherBasics:12,grandTrees:1};
  const expected={
    '1,2,2,1':'3489859/734673280',
    '1,3,2':'49738489/5877386240',
    '2,2,2,1':'7444820561/1112696076800',
    '2,3,2':'3016209569/249788915200'
  };
  for(const draws of [1,2]){
    for(const pair of [{jet:2,stages:[2,1]},{jet:3,stages:[2]}]){
      const key=[draws,pair.jet,...pair.stages].join(',');
      assert.equal(grandTreeDirectWindow({...shared,...pair,draws}).fraction,expected[key]);
    }
  }
});

test('separate physical-order brute-force for both first and second seats',()=>{
  const base={deckSize:10,opening:3,prizes:2,targetBasics:1,otherBasics:1,grandTrees:1,jet:1};
  for(const draws of [1,2])for(const stages of [[1],[1,1]]){
    const c={...base,draws,stages};
    assert.equal(grandTreeDirectWindow(c).probability,brute(c));
  }
});

test('Stage2 requires two distinct stages searchable after Prizes',()=>{
  const base={deckSize:60,opening:7,prizes:6,targetBasics:2,otherBasics:12,grandTrees:1,jet:2};
  const stage1=grandTreeDirectWindow({...base,stages:[2],draws:1}).probability;
  const stage2=grandTreeDirectWindow({...base,stages:[2,1],draws:1}).probability;
  assert.ok(stage1>stage2);
});
