'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {choose,itemHandPrior,buildCardSubtypeIndex,
  trainerSubtype,analyzeOriginalField}=
  require('../simulation/evaluation/agent50-eri-item-hand-priors.cjs');

const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,
  'Expected '+a+' to approximately equal '+b);

test('exact five-card hypergeometric boundaries and direct K=1 proof',()=>{
  assert.equal(choose(60,5),5461512);
  assert.equal(choose(60,61),0);
  assert.equal(choose(60,-1),0);
  assert.deepEqual(itemHandPrior(0,5),{
    pAny:0,pTwoOrMore:0,expectedDiscardCap2:0});
  const all=itemHandPrior(60,5);
  near(all.pAny,1);
  near(all.pTwoOrMore,1);
  near(all.expectedDiscardCap2,2);
  const singleton=itemHandPrior(1,5);
  near(singleton.pAny,5/60);
  near(singleton.pTwoOrMore,0);
  near(singleton.expectedDiscardCap2,5/60);
});

test('Item prior strictly increases with count for each decision metric',()=>{
  let previous=itemHandPrior(0,5);
  for(let k=1;k<=60;k++){
    const now=itemHandPrior(k,5);
    assert.ok(now.pAny>=previous.pAny-1e-10);
    assert.ok(now.pTwoOrMore>=previous.pTwoOrMore-1e-10);
    assert.ok(now.expectedDiscardCap2>=
      previous.expectedDiscardCap2-1e-10);
    for(const x of [now.pAny,now.pTwoOrMore])
      assert.ok(x>=-1e-10&&x<=1+1e-10);
    assert.ok(now.expectedDiscardCap2>=-1e-10&&
      now.expectedDiscardCap2<=2+1e-10);
    previous=now;
  }
});

test('exact Eri, Ultra Ball, and Computer Search Trainer subtype distinct',()=>{
  const index=buildCardSubtypeIndex();
  const rows=[
    ['Eri','TEF','146','Supporter'],
    ['Ultra Ball','SUM','135','Item'],
    ['Computer Search','BCR','137','Item']
  ];
  for(const [name,set,number,subtype] of rows){
    const row={category:'Trainer',name,
      printing:{set,number}};
    const observed=trainerSubtype(row,index);
    assert.equal(observed.subtype,subtype,name);
    assert.ok(['exact','name-uniform-fallback'].includes(observed.basis));
  }
});

test('all 29 published originals have normalized item bounds and no leakage',()=>{
  const x=analyzeOriginalField();
  assert.equal(x.fieldCount,29);
  assert.deepEqual(x.missingOriginalRanks,[23,25,28]);
  assert.equal(new Set(x.rows.map(row=>row.rank)).size,29);
  const rank6=x.rows.find(row=>row.rank===6);
  assert.ok(rank6);
  assert.ok(rank6.trainerSubtypes.Supporter>=1,
    'Original rank6 has Eri Supporter');
  for(const row of x.rows){
    assert.ok(row.itemCopiesLower>=0&&
      row.itemCopiesLower<=row.itemCopiesUpper&&
      row.itemCopiesUpper<=60);
    assert.ok(row.unknownTrainerCopies>=0);
    const expected=itemHandPrior(row.itemCopiesLower,5);
    assert.deepEqual(row.fiveCardLower,expected);
    assert.ok(row.fiveCardUpper.pAny+1e-10>=row.fiveCardLower.pAny);
    assert.ok(row.fiveCardUpper.pTwoOrMore+1e-10>=
      row.fiveCardLower.pTwoOrMore);
    assert.equal(row.unknown.reduce((n,c)=>n+c.count,0),
      row.unknownTrainerCopies);
  }
});
