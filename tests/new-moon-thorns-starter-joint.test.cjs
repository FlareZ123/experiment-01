'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {jointDirect,ironThornsDirect,main} = require('../scripts/new-moon-thorns-starter-joint.cjs');

/** Independently enumerate every permutation of a tiny seven-card deck. */
function smallOracle() {
  const cards=['M','B','B','C','E','X','X'];
  let valid=0, successes=0;
  function visit(prefix, remaining) {
    if (!remaining.length) {
      const opening=prefix.slice(0,2);
      if (!opening.some(x=>x==='M'||x==='B')) return;
      valid++;
      const visible=prefix.slice(0,4);
      if (opening.includes('M')&&visible.includes('C')&&visible.includes('E')) successes++;
      return;
    }
    for (let i=0;i<remaining.length;i++) {
      visit([...prefix,remaining[i]],remaining.filter((_,j)=>j!==i));
    }
  }
  visit([],cards);
  return successes/valid;
}

test('Joint inclusion-exclusion matches independently enumerated small deck',()=>{
  const predicted=jointDirect({size:7,hand:2,basics:3,starters:1,groups:[1,1],later:2});
  assert.ok(Math.abs(predicted-smallOracle())<1e-12);
});

test('Absent counter resource prevents joint direct visibility',()=>{
  const p=jointDirect({size:60,hand:7,basics:17,starters:2,groups:[0],later:1});
  assert.ok(Math.abs(p)<1e-12);
});

test('Source-anchored Thorns opening three-axis and four-axis percentages',()=>{
  const p={size:60,hand:7,prizes:6,basics:17,starters:2,opponentBasics:4};
  const two=ironThornsDirect({...p,groups:[2]});
  const three=ironThornsDirect({...p,groups:[2,6]});
  const four=ironThornsDirect({...p,groups:[2,6,2]});
  assert.ok(Math.abs(two.firstDraw-0.05472225111408383)<1e-12);
  assert.ok(Math.abs(two.withAllBonuses-0.06484140844096999)<1e-12);
  assert.ok(Math.abs(three.firstDraw-0.027519949175691588)<1e-12);
  assert.ok(Math.abs(three.withAllBonuses-0.03843317688802187)<1e-12);
  assert.ok(Math.abs(four.firstDraw-0.004917964910611905)<1e-12);
  assert.ok(Math.abs(four.withAllBonuses-0.00953350323294538)<1e-12);
  assert.ok(four.withAllBonuses<three.withAllBonuses);
});

test('Frozen candidate manifest and three source opponents reconcile',()=>{
  const data=main();
  assert.deepEqual(data.benchmarkRanks,[6,24,29]);
  assert.match(data.risks,/does not establish legal Item use/);
  assert.ok(data.starterOnly>data.starterAndCologne.withAllBonuses);
});
