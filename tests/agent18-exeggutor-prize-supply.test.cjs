'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {fullStagePrizeSupply,rank2JointSupply}=
  require('../scripts/agent18-exeggutor-prize-supply.cjs');

test('source and candidate exact two-line 60-card six-prize rates',()=>{
  assert.equal(fullStagePrizeSupply([2,2,1]).blocked,'8929/77140');
  assert.equal(fullStagePrizeSupply([2,2]).blocked,'550/32509');
  assert.equal(fullStagePrizeSupply([2,2,2,2,2,1]).blocked,'248807/1787995');
  assert.equal(fullStagePrizeSupply([2,2,2,2,2]).blocked,'5542/131747');
});

test('independent exact enumeration of all three-prize six-card subsets',()=>{
  const deck=['A','A','B','B','C','X'];
  let blocked=0,total=0;
  for(let i=0;i<6;i++)for(let j=i+1;j<6;j++)for(let k=j+1;k<6;k++){
    const prizes=[deck[i],deck[j],deck[k]];
    const hasA=prizes.filter(x=>x==='A').length===2;
    const hasB=prizes.filter(x=>x==='B').length===2;
    const hasC=prizes.includes('C');
    if(hasA||hasB||hasC)blocked++;
    total++;
  }
  const actual=fullStagePrizeSupply([2,2,1],6,3);
  assert.equal(actual.blockedProbability,blocked/total);
  assert.equal(actual.availableProbability,(total-blocked)/total);
});

test('one single prized copy gives prize count / deck size',()=>{
  assert.equal(fullStagePrizeSupply([1],60,6).blocked,'1/10');
  assert.equal(fullStagePrizeSupply([2],60,6).blocked,'1/118');
});

test('exact source stage sizes are enforced and report never calls this a win',()=>{
  const card=(name,count)=>({category:'Pokémon',name,count});
  const original={rank:2,cards:[
    card('Oddish',2),card('Gloom',2),card('Vileplume',2),
    card('Lillipup',2),card('Herdier',2),card('Stoutland',1)
  ]};
  const challenger={sourceDeckRank:2,cards:[
    card('Oddish',2),card('Gloom',2),card('Vileplume',2),
    card('Exeggcute',2),card('Exeggutor',2)
  ]};
  const report=rank2JointSupply(original,challenger);
  assert.ok(report.jointBlockedDeltaPercentagePoints>9);
  assert.equal(report.competitiveQualifiedGames,0);
  challenger.cards.at(-1).count=1;
  assert.throws(()=>rank2JointSupply(original,challenger));
});

test('rejects physically impossible group partition',()=>{
  assert.throws(()=>fullStagePrizeSupply([61]));
  assert.throws(()=>fullStagePrizeSupply([2],60,61));
  assert.throws(()=>fullStagePrizeSupply([0],60,6));
});
