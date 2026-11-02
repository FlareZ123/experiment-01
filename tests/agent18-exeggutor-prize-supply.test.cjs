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


test('conditional exact source original agrees with Agent30 preregistered rank2 baseline',()=>{
  const {rank2ConditionalPrizeComparison}=
    require('../scripts/agent18-exeggutor-prize-supply.cjs');
  const p=rank2ConditionalPrizeComparison();
  assert.equal(p.original.available,'68469698109287/79557769491200');
  assert.equal(p.challenger.available,'7624616168431/7955776949120');
  assert.ok(p.availableDeltaPercentagePoints>9.7 &&
    p.availableDeltaPercentagePoints<9.8);
  assert.equal(p.original.availableProbability+p.original.blockedProbability,1);
});

test('basic-valid conditional six prize model agrees with exhaustive small deck deals',()=>{
  const {conditionalFullStageSupply}=
    require('../scripts/agent18-exeggutor-prize-supply.cjs');
  const groups=[
    {count:2,basic:true,required:true},
    {count:1,basic:false,required:true},
    {count:1,basic:true,required:false},
    {count:2,basic:false,required:false}
  ];
  const model=conditionalFullStageSupply(groups,3,6,2,2);
  // Independently choose an initial valid Basic hand, then two prizes.
  const physical=['A','A','B','C','D','D'];
  let good=0,total=0;
  for(let a=0;a<6;a++)for(let b=a+1;b<6;b++){
    const hand=[a,b];
    if(!hand.some(i=>['A','C'].includes(physical[i])))continue;
    const available=[0,1,2,3,4,5].filter(i=>!hand.includes(i));
    for(let j=0;j<available.length;j++)
      for(let k=j+1;k<available.length;k++){
        const prizes=[physical[available[j]],physical[available[k]]];
        const stageA=prizes.filter(p=>p==='A').length!==2;
        const stageB=!prizes.includes('B');
        if(stageA&&stageB)good++;
        total++;
      }
  }
  assert.equal(model.availableProbability,good/total);
});
