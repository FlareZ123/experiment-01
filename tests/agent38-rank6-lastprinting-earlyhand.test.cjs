'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {choose,countEarlyHands,rank6EarlyHands}=
  require('../scripts/agent38-rank6-lastprinting-earlyhand.cjs');

test('binomial exactness includes impossible selections',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(6,2),15n);
  assert.equal(choose(4,5),0n);
});

test('original rank6 7 cards: exact physical opening counts',()=>{
  const s=rank6EarlyHands(7);
  assert.equal(s.totalWeighted,'386206920');
  assert.equal(s.validOpeningWeighted,'154289520');
  assert.equal(s.supporterHeldWeighted,'56156680');
  assert.equal(s.capacityZeroWeighted,'39172288');
  assert.equal(s.capacityOneWeighted,'15222480');
  assert.equal(s.paymentAllowedWeighted,'1761912');
  assert.ok(Math.abs(s.conditionalPaymentRate-
    0.031374931708925816)<1e-15);
});

test('rank6 8 cards after one random draw, first seven Basic valid',()=>{
  const s=rank6EarlyHands(8);
  assert.equal(s.totalWeighted,'20468966760');
  assert.equal(s.validOpeningWeighted,'8177344560');
  assert.equal(s.supporterHeldWeighted,'3368835400');
  assert.equal(s.capacityZeroWeighted,'1993902960');
  assert.equal(s.capacityOneWeighted,'1154502984');
  assert.equal(s.paymentAllowedWeighted,'220429456');
  assert.ok(Math.abs(s.conditionalPaymentRate-
    0.06543194600721662)<1e-15);
});

/** Brute-force physical subsets and opener assignments, independent of DP. */
function subsets(xs,k){
  if(k===0)return [[]];
  if(xs.length<k)return [];
  return subsets(xs.slice(1),k-1).map(a=>[xs[0],...a])
    .concat(subsets(xs.slice(1),k));
}
test('brute-force tiny physical deck agrees with DP including opener order',()=>{
  const cards=[{name:'Basic',count:2},{name:'Plumeria',count:2},
    {name:'Filler',count:2}];
  const physical=['Basic','Basic','Plumeria','Plumeria','Filler','Filler'];
  const observedSize=5,openingSize=3;
  let total=0n,valid=0n,held=0n,allowed=0n;
  for(const observed of subsets([...physical.keys()],observedSize)){
    for(const opener of subsets(observed,openingSize)){
      total++;
      if(!opener.some(i=>physical[i]==='Basic'))continue;
      valid++;
      const have=observed.map(i=>physical[i]);
      if(!have.includes('Plumeria'))continue;
      held++;
      const counts=new Map();
      for(const p of have)counts.set(p,(counts.get(p)??0)+1);
      let capacity=0;
      for(const [p,k] of counts)
        capacity+=Math.max(0,k-(p==='Plumeria'?2:1));
      if(capacity>=2)allowed++;
    }
  }
  const got=countEarlyHands({
    cards,observedSize,openingSize,basicName:'Basic',
    supporterName:'Plumeria'
  });
  assert.equal(got.totalWeighted,String(total));
  assert.equal(got.validOpeningWeighted,String(valid));
  assert.equal(got.supporterHeldWeighted,String(held));
  assert.equal(got.paymentAllowedWeighted,String(allowed));
});

test('no duplicate printings cannot pay conservatively',()=>{
  const got=countEarlyHands({
    cards:[{name:'Basic',count:1},{name:'Plumeria',count:1},
      {name:'A',count:1},{name:'B',count:1}],
    observedSize:4,openingSize:3,basicName:'Basic',
    supporterName:'Plumeria'
  });
  assert.equal(got.paymentAllowedWeighted,'0');
});
