'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {choose,eachNamedGroupVisible,starterInitiallyAndGroupsByFirstDraw,
  analyzeRank}=require('../scripts/agent41-vileplume-direct-openings.cjs');

const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-12,
  'expected '+a+' to be close to '+b);

/** Independently enumerate all 3024 ordered draws of a nine-card toy deck. */
function bruteToy(){
  const deck=['B','B','A','A','O','P','X','X','X'];
  let yes=0,total=0;
  for(let i=0;i<9;i++)for(let j=0;j<9;j++)for(let k=0;k<9;k++)
    for(let m=0;m<9;m++){
      if(new Set([i,j,k,m]).size!==4)continue;
      total++;
      const opening=[deck[i],deck[j],deck[k]];
      const all=[...opening,deck[m]];
      if(opening.includes('B')&&['A','O','P'].every(x=>all.includes(x)))yes++;
    }
  assert.equal(total,3024);
  return yes/total;
}

function mockSource(rank){
  const otherBasics=rank===2?[
    ['Lillipup',2],['Fan Rotom',1],['Relicanth',1],['Mr. Mime',1],
    ['Girafarig',1],['Budew',1],['Jirachi',1]
  ]:[
    ['Buneary',2],['Fan Rotom',2],['Budew',2],['Eldegoss V',1],
    ['Tatsugiri',1]
  ];
  const cards=[['Bunnelby',2],['Oddish',2],['Pidgey',2],
    ['Tag Call',4],['Guzma & Hala',rank===2?4:3],
    ['Technical Machine: Evolution',2],['Jet Energy',2],
    ...otherBasics].map(([name,count])=>({name,count}));
  const sum=cards.reduce((n,c)=>n+c.count,0);
  cards.push({name:'Filler',count:60-sum});
  assert.equal(cards.reduce((n,c)=>n+c.count,0),60);
  return {rank,archetype:'source fixture',cards};
}

test('exact combinations and inclusion-exclusion over disjoint names',()=>{
  assert.equal(choose(60,7),386206920n);
  assert.equal(choose(5,7),0n);
  assert.equal(choose(5,2),10n);
  near(eachNamedGroupVisible(5,2,[1,1]),1/10);
  near(eachNamedGroupVisible(5,2,[1,1,1]),0);
});

test('opening-position restriction equals fully independent toy enumeration',()=>{
  near(starterInitiallyAndGroupsByFirstDraw(9,3,2,[2,1,1]),bruteToy());
});

test('exact source shapes and opening probabilities',()=>{
  const r2=analyzeRank(mockSource(2));
  const r15=analyzeRank(mockSource(15));
  near(r2.validOpening,0.8614093191287199);
  near(r15.validOpening,0.8614093191287199);
  near(r2.initialSeven.starterAndConnectorGivenValidOpening,
    0.15520116733613432);
  near(r15.initialSeven.starterAndConnectorGivenValidOpening,
    0.14177147538744478);
  near(r2.initialSevenPlusFirstNormalDraw.starterAndConnectorGivenValidOpening,
    0.1705822267008268);
  near(r15.initialSevenPlusFirstNormalDraw.starterAndConnectorGivenValidOpening,
    0.15700363523043423);
  near(r2.initialSevenPlusFirstNormalDraw
    .starterBothBenchesConnectorGivenValidOpening,0.006479865444405437);
  near(r15.initialSevenPlusFirstNormalDraw
    .starterBothBenchesConnectorGivenValidOpening,0.00588310482268617);
});

test('source-count mutation and unknown rank fail closed',()=>{
  const wrong=mockSource(2);
  wrong.cards.find(x=>x.name==='Tag Call').count=3;
  assert.throws(()=>analyzeRank(wrong));
  assert.throws(()=>analyzeRank({...mockSource(2),rank:23}));
});
