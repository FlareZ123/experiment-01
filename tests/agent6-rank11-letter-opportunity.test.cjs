'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {choose,energyStarvedWithLetter,rank11Report}=
  require('../scripts/agent6-rank11-letter-opportunity.cjs');

const rank11={n:60,b:11,e:8,l:4,h:7,p:6,d:1};

test('exact authentic rank11 eight-seen opportunity',()=>{
  const result=rank11Report();
  assert.equal(result.numerator,'2411940300');
  assert.equal(result.denominator,'15916235808');
  assert.ok(Math.abs(result.probability-0.1515396183554709)<1e-13);
  assert.equal(result.minimumEnergyRemainingInDeck,2);
  assert.equal(result.qualifiedCompetitiveGames,0);
});

test('initial seven and optional draws are distinct estimands',()=>{
  const seven=energyStarvedWithLetter({...rank11,d:0});
  const eight=energyStarvedWithLetter(rank11);
  const nine=energyStarvedWithLetter({...rank11,d:2});
  assert.ok(Math.abs(seven.probability-0.1597336261330164)<1e-13);
  assert.ok(seven.probability>eight.probability);
  assert.ok(eight.probability>nine.probability);
});

test('tiny independent exhaustive census of ordered additional draw',()=>{
  const cards=['B','E','L','X','X','X'];
  let valid=0,success=0;
  for(let i=0;i<6;i++)for(let j=i+1;j<6;j++){
    if(cards[i]!=='B'&&cards[j]!=='B')continue;
    for(let k=0;k<6;k++){
      if(k===i||k===j)continue;
      valid++;
      const hand=[cards[i],cards[j],cards[k]];
      if(!hand.includes('E')&&hand.includes('L'))success++;
    }
  }
  const exact=energyStarvedWithLetter({
    n:6,b:1,e:1,l:1,h:2,p:1,d:1
  });
  assert.equal(Number(exact.numerator)*valid,
    Number(exact.denominator)*success);
});

test('guards and integer combinations',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(5,7),0n);
  assert.throws(()=>energyStarvedWithLetter({...rank11,d:48}));
  assert.throws(()=>energyStarvedWithLetter({...rank11,b:51}));
});
