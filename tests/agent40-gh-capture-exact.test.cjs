'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const {
  EXPECTED,KEYS,choose,sourceCounts,prizePolynomial,exactOpening
}=require('../scripts/agent40-gh-capture-exact.cjs');

const CASES=Object.freeze([
  [2,false,1,'30615119825665/224352909965184'],
  [2,false,2,'2228284907333/43990766659840'],
  [2,false,3,'4639687219/465172942080'],
  [2,true,1,'142718134087913/2243529099651840'],
  [2,true,2,'1160612629207/43990766659840'],
  [2,true,3,'26469288969997/4487058199303680'],
  [15,false,1,'1221438779677/10773248977920'],
  [15,false,2,'297383904755087/8158287635097600'],
  [15,false,3,'533490012508561/89741163986073600'],
  [15,true,1,'12211761854443/203957190877440'],
  [15,true,2,'152067231965489/7179293118885888'],
  [15,true,3,'137985201783043/35896465594429440']
]);

/** @param {number[]} items @param {number} k @returns {number} */
function brutePrizeChoices(items,k){
  let valid=0;
  /** @param {number} i @param {number[]} selected */
  function go(i,selected){
    if(selected.length===k){
      // Required physical group 0 has two, 1 has two, 2 has one.
      if(![0,1,2].some(g=>
        items.every((x,j)=>x!==g||selected.includes(j))))valid++;
      return;
    }
    for(let j=i;j<=items.length-(k-selected.length);j++){
      selected.push(j);go(j+1,selected);selected.pop();
    }
  }
  go(0,[]);
  return valid;
}

test('Prize polynomial independently matches exhaustive toy subsets',()=>{
  const items=[0,0,1,1,2,3,3,3];
  for(let prizeCount=0;prizeCount<=8;prizeCount++){
    assert.equal(prizePolynomial([2,2,1],3,prizeCount),
      BigInt(brutePrizeChoices(items,prizeCount)));
  }
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(60,61),0n);
});

test('original rank-2 and rank-15 exact access + discard-surplus fractions',()=>{
  for(const [rank,threeChannelSearch,minimumConnectors,expected] of CASES){
    const result=exactOpening(EXPECTED[rank],{
      minimumConnectors,threeChannelSearch});
    assert.equal(result.numerator+'/'+result.denominator,expected,
      rank+':tri='+threeChannelSearch+':connectors='+minimumConnectors);
    assert.ok(result.conditionalProbability>0);
  }
});

test('adding discard-resource constraints cannot increase opening access',()=>{
  for(const rank of [2,15]){
    const broad=[1,2,3].map(minimumConnectors=>
      exactOpening(EXPECTED[rank],{minimumConnectors}));
    const full=[1,2,3].map(minimumConnectors=>
      exactOpening(EXPECTED[rank],{
        minimumConnectors,threeChannelSearch:true}));
    for(let i=0;i<3;i++){
      assert.ok(full[i].conditionalProbability<=broad[i].conditionalProbability);
      if(i>0){
        assert.ok(broad[i].conditionalProbability<
          broad[i-1].conditionalProbability);
        assert.ok(full[i].conditionalProbability<
          full[i-1].conditionalProbability);
      }
    }
  }
});

test('source-pinned exact printing groups and 14 eligible Basics match original 60s',
  {skip:!fs.existsSync(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'))},()=>{
    const root=path.resolve(__dirname,'..');
    for(const rank of [2,15]){
      const counts=sourceCounts(root,rank);
      assert.deepEqual(Object.keys(counts),KEYS);
      assert.deepEqual(counts,EXPECTED[rank]);
    }
  });
