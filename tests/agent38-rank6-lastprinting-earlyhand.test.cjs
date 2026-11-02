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

test('other authenticated original Iron Thorns printed sixties',()=>{
  const originals=require('../results/aichi-2026/full-decklists.json').decks;
  const expected=[
    [24,0.033027166135889803,0.06962328880775831],
    [29,0.030194520046413,0.06293311926133287]
  ];
  for(const [rank,p7,p8] of expected){
    const deck=originals.find(d=>d.rank===rank);
    assert.ok(deck);
    for(const [n,p] of [[7,p7],[8,p8]]){
      const got=countEarlyHands({cards:deck.cards,observedSize:n,
        openingSize:7,basicName:'Iron Thorns ex',
        supporterName:'Plumeria'});
      assert.ok(Math.abs(got.conditionalPaymentRate-p)<1e-12);
    }
  }
});

test('source-rank6 strict Trainer and global-deck-duplicate Trainer screens',()=>{
  const n7=rank6EarlyHands(7),n8=rank6EarlyHands(8);
  assert.equal(n7.strictTrainerOnlyWeighted,'315096');
  assert.equal(n7.globallyDuplicatedTrainerWeighted,'44942410');
  assert.equal(n8.strictTrainerOnlyWeighted,'45473672');
  assert.equal(n8.globallyDuplicatedTrainerWeighted,'2978721832');
  assert.ok(n7.strictTrainerOnlyRate<n7.globallyDuplicatedTrainerRate);
  assert.ok(n8.strictTrainerOnlyRate<n8.globallyDuplicatedTrainerRate);
});

test('toy exhaustive physical opener distinguishes hand and deck duplication',()=>{
  const cards=[{name:'Basic',category:'Pokémon',count:2},
    {name:'Plumeria',category:'Trainer',count:2},
    {name:'Filler',category:'Trainer',count:2}];
  const physical=['Basic','Basic','Plumeria','Plumeria','Filler','Filler'];
  const observedSize=5,openingSize=3;
  let trainerSafe=0n,globalDuplicateTrainer=0n;
  for(const observed of subsets([...physical.keys()],observedSize)){
    for(const opening of subsets(observed,openingSize)){
      if(!opening.some(i=>physical[i]==='Basic'))continue;
      const hand=observed.map(i=>physical[i]);
      if(!hand.includes('Plumeria'))continue;
      const counts=new Map();
      for(const x of hand)counts.set(x,(counts.get(x)??0)+1);
      const strict=Math.max(0,(counts.get('Plumeria')??0)-2)+
        Math.max(0,(counts.get('Filler')??0)-1);
      const global=(counts.get('Plumeria')??0)-1+
        (counts.get('Filler')??0);
      if(strict>=2)trainerSafe++;
      if(global>=2)globalDuplicateTrainer++;
    }
  }
  const got=countEarlyHands({cards,observedSize,openingSize,
    basicName:'Basic',supporterName:'Plumeria'});
  assert.equal(got.strictTrainerOnlyWeighted,String(trainerSafe));
  assert.equal(got.globallyDuplicatedTrainerWeighted,
    String(globalDuplicateTrainer));
});

test('multiple Supporter physical printings require explicit modeling',()=>{
  assert.throws(()=>countEarlyHands({
    cards:[{name:'Basic',count:2},{name:'Plumeria',count:1,
      printing:{set:'A',number:'1'}},
    {name:'Plumeria',count:1,printing:{set:'B',number:'2'}},
    {name:'Filler',count:2}],observedSize:4,openingSize:3,
    basicName:'Basic',supporterName:'Plumeria'
  }),/single physical Supporter printing/);
});
