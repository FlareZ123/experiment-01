'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {allocations,run} = require('../scripts/aichi-rank11-field-blower-early-route.cjs');

test('exact source ranks and categorical opening fractions',()=>{
  const result=run();
  assert.deepEqual(result.sourceCounts,{
    shadowRiderV:3,forestSealStone:1,fieldBlower:1,
    otherBasics:11,otherCards:44
  });
  assert.deepEqual(allocations([1,1,1],2),[
    [0,1,1],[1,0,1],[1,1,0]
  ]);
  assert.equal(result.exact.directFieldBlower.numerator,'8530787');
  assert.equal(result.exact.directFieldBlower.denominator,'66788480');
  assert.equal(result.exact.stoneShadowVAndUnprizedBlower.numerator,'11539959');
  assert.equal(result.exact.stoneShadowVAndUnprizedBlower.denominator,'267153920');
  assert.equal(result.exact.unionDirectOrStone.numerator,'44320267');
  assert.equal(result.exact.unionDirectOrStone.denominator,'267153920');
  assert.equal(result.exact.additionalDisjointStoneRoute.numerator,'10197119');
  assert.equal(result.exact.additionalDisjointStoneRoute.denominator,'267153920');
  assert.equal(result.qualifiedForCompetitiveInference,false);
});

test('independent seeded physical-deal simulation agrees with exact event',()=>{
  const result=run().exact;
  const pool=[...Array(3).fill(0),1,2,...Array(11).fill(3),
    ...Array(44).fill(4)];
  assert.equal(pool.length,60);
  let seed=0x6a09e667;
  /** @returns {number} */
  const next=()=>{
    seed^=seed<<13; seed^=seed>>>17; seed^=seed<<5;
    return (seed>>>0)/4294967296;
  };
  let valid=0,seen=0,stoneEvent=0,union=0;
  for(let trial=0;trial<180000;trial++){
    const shuffled=pool.slice();
    for(let i=59;i>0;i--){
      const j=Math.floor(next()*(i+1));
      const temp=shuffled[i];shuffled[i]=shuffled[j];shuffled[j]=temp;
    }
    const opening=shuffled.slice(0,7);
    if(!opening.some(c=>c===0||c===3))continue;
    valid++;
    const visible=[...opening,shuffled[13]];
    const direct=visible.includes(2);
    const route=visible.includes(1)&&visible.includes(0)&&
      !shuffled.slice(7,13).includes(2);
    if(direct)seen++;
    if(route)stoneEvent++;
    if(direct||route)union++;
  }
  assert.ok(valid>150000);
  assert.ok(Math.abs(seen/valid-result.directFieldBlower.percent/100)<0.005);
  assert.ok(Math.abs(stoneEvent/valid-
    result.stoneShadowVAndUnprizedBlower.percent/100)<0.005);
  assert.ok(Math.abs(union/valid-result.unionDirectOrStone.percent/100)<0.005);
  process.stdout.write(JSON.stringify({trials:180000,valid,
    estimates:{direct:seen/valid,stone:stoneEvent/valid,union:union/valid}})+'\n');
});
