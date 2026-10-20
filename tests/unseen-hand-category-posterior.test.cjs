'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {unseenHandCategoryPosterior:forecast}=require('../simulation/twinleaf/unseen-hand-category-posterior.cjs');
const {choose}=require('../simulation/twinleaf/redeal-posterior.cjs');

const base={unseenCategoryCount:4,unseenOtherCount:4,
  unknownHandCount:4,knownHandCategoryCount:0,
  unitEffect:50,threshold:200,uniformUnknownHandAllocation:true};

test('concealed four Trainers versus four Energy yield the identical prior',()=>{
  // Both allocations have exactly the same actor observation and known pool.
  const trainersInActualHiddenHand=[0,4];
  const predictions=trainersInActualHiddenHand.map(()=>forecast(base));
  assert.deepEqual(predictions[0],predictions[1]);
  assert.equal(predictions[0].thresholdNumerator,'1');
  assert.equal(predictions[0].thresholdDenominator,'70');
  assert.equal(predictions[0].probabilityAtLeastThreshold,1/70);
  assert.equal(predictions[0].expectedEffect,100);
  assert.deepEqual(predictions[0].distribution.map(x=>x.numerator),['1','16','36','16','1']);
});

test('one publicly known Trainer in hand is counted deterministically',()=>{
  const p=forecast({...base,knownHandCategoryCount:1,threshold:200});
  assert.equal(p.thresholdNumerator,'17');
  assert.equal(p.thresholdDenominator,'70');
  assert.equal(p.expectedEffect,150);
});

test('all-category, no-category and empty unknown hands',()=>{
  for (const [T,F,h,k,u,threshold,prob,expect] of [
    [5,0,3,0,50,150,1,150],
    [0,5,3,0,50,50,0,0],
    [0,0,0,2,50,100,1,100],
    [0,0,0,2,0,1,0,0]
  ]) {
    const p=forecast({unseenCategoryCount:T,unseenOtherCount:F,
      unknownHandCount:h,knownHandCategoryCount:k,
      unitEffect:u,threshold,uniformUnknownHandAllocation:true});
    assert.equal(p.probabilityAtLeastThreshold,prob);
    assert.equal(p.expectedEffect,expect);
    assert.equal(p.distribution.length,1);
  }
});

test('small entire domain matches independent enumeration and moments',()=>{
  for(let T=0;T<=7;T++)for(let F=0;F<=7;F++)for(let h=0;h<=T+F;h++) {
    const p=forecast({unseenCategoryCount:T,unseenOtherCount:F,
      unknownHandCount:h,knownHandCategoryCount:1,
      unitEffect:50,threshold:150,uniformUnknownHandAllocation:true});
    const denom=choose(T+F,h);
    assert.equal(p.distribution.reduce((s,row)=>s+BigInt(row.numerator),0n),denom);
    let favourable=0n;
    let weighted=0n;
    // Independently enumerate every binary mask for this modest test domain.
    for (let mask=0;mask<(1<<(T+F));mask++){
      let selected=0,category=0;
      for(let i=0;i<T+F;i++)if(mask&(1<<i)){
        selected++;
        if(i<T)category++;
      }
      if(selected!==h)continue;
      if(50*(1+category)>=150)favourable++;
      weighted+=BigInt(1+category);
    }
    assert.equal(p.thresholdNumerator,favourable.toString());
    assert.equal(p.probabilityAtLeastThreshold,Number(favourable)/Number(denom));
    assert.ok(Math.abs(p.expectedCategoryCount-Number(weighted)/Number(denom))<1e-12);
  }
});

test('explicitly rejects unverified model and impossible count arguments',()=>{
  assert.throws(()=>forecast({...base,uniformUnknownHandAllocation:false}),/Uniform/);
  assert.throws(()=>forecast({...base,unknownHandCount:9}),/Invalid/);
  assert.throws(()=>forecast({...base,unseenCategoryCount:-1}),/Invalid/);
  assert.throws(()=>forecast({...base,unseenOtherCount:60}),/Invalid/);
});
