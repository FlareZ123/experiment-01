'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {SOURCE,choose,countRequiredInSeven,analyze}=require(
  '../simulation/evaluation/agent2-rank26-selfko-first8.cjs');
const source=require('../results/aichi-2026/full-decklists.json').decks['26'];

test('all six required printed source categories and Meloetta match original 60',()=>{
  assert.equal(source.rank,26);
  assert.equal(source.cards.reduce((n,r)=>n+r.count,0),60);
  const printed=[
    ['Meloetta ex','BLK','44',1],
    ['Unown','AOR','30',4],
    ['Exeggcute','PLF','4',2],
    ['Risky Ruins','MEG','127',4],
    ['Damage Pump','LOR','156',4],
    ['Counter Catcher','PAR','160',1],
    ['Canceling Cologne','ASR','136',1]
  ];
  for(const [name,set,number,count] of printed){
    const row=source.cards.find(r=>r.name===name);
    assert.ok(row,name);
    assert.equal(row.count,count);
    assert.equal(row.printing.set,set);
    assert.equal(row.printing.number,number);
  }
  assert.equal(SOURCE.sourceBasicCount,source.category_counts.Pokémon);
  assert.equal(1+Object.values(SOURCE.required).reduce((a,b)=>a+b,0)+43,60);
});
test('BigInt combinatorics return correct exact small and large integers',()=>{
  assert.equal(choose(59,7),341149446n);
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(7,0),1n);
  assert.equal(choose(3,4),0n);
});
test('only one neutral or one doubled required category can occupy seventh slot',()=>{
  const counts=Object.values(SOURCE.required);
  const directProduct=counts.reduce((v,n)=>v*BigInt(n),1n);
  const doubled=counts.reduce((total,n)=>
    total+choose(n,2)*(directProduct/BigInt(n)),0n);
  assert.equal(directProduct,128n);
  assert.equal(doubled,640n);
  assert.equal(countRequiredInSeven(counts,43),5504n+640n);
  assert.equal(countRequiredInSeven([1,1,1,1,1,1],0),0n);
  assert.equal(countRequiredInSeven([1,1,1,1,1,1],1),1n);
});
test('valid-seven conditioned exact probability and no claimed game',()=>{
  const a=analyze();
  assert.equal(a.requiredSevenSubsets,'6144');
  assert.equal(a.allOtherSevenSubsets,'341149446');
  assert.ok(Math.abs(a.unconditionalProbability-2.1011319479029727e-6)<1e-18);
  assert.ok(Math.abs(a.basicValidOpeningProbability-0.8093533072892635)<1e-12);
  assert.ok(Math.abs(a.conditionalBasicValidProbability-
    2.5960627194324006e-6)<1e-17);
  assert.equal(a.gamesPlayed,0);
});
