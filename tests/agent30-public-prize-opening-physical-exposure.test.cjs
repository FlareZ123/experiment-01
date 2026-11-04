'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {conditionalPhysicalAccess}=
  require('../scripts/agent17-field-firstturn-trainer-access.cjs');
const {
  countSourcePrizeGatedTrainers,analyze
}=require('../simulation/evaluation/agent30-public-prize-opening-physical-exposure.cjs');

test('disjoint printed card count uses exact Trainer category and print set',()=>{
  const deck={cards:[
    {category:'Trainer',name:'Counter Catcher',
      printing:{set:'PAR'},count:3},
    {category:'Trainer',name:'Counter Catcher',
      printing:{set:'CIN'},count:2},
    {category:'Pokémon',name:'Roxanne',
      printing:{set:'ASR'},count:1},
    {category:'Trainer',name:'Roxanne',
      printing:{set:'ASR'},count:1},
    {category:'Trainer',name:'Special Red Card',
      printing:{set:'CRI'},count:2},
    {category:'Trainer',name:'Ultra Ball',
      printing:{set:'MEG'},count:1}
  ]};
  assert.deepEqual(countSourcePrizeGatedTrainers(deck),{
    copies:6,byPrinting:{
      'Counter Catcher PAR':3,'Roxanne ASR':1,
      'Special Red Card CRI':2
    }
  });
});

test('independent exact conditional physical sample considers Basic valid seven',()=>{
  // Ten physical cards: two Basics, two target non-Basic cards,
  // six others. Both event counts are conditional on >=1 Basic
  // in the initial 2, and six later Prize cards are marginalized.
  const first=conditionalPhysicalAccess(10,2,2,2,0);
  const after=conditionalPhysicalAccess(10,2,2,2,1);
  const brute=[];
  for(let a=0;a<10;a++)for(let b=a+1;b<10;b++){
    if(a>=2&&b>=2)continue;
    brute.push([a,b]);
  }
  let held=0,extended=0;
  for(const hand of brute){
    if(hand.some(id=>id===2||id===3))held++;
    let effective=0;
    for(let draw=0;draw<10;draw++){
      if(hand.includes(draw))continue;
      if([...hand,draw].some(id=>id===2||id===3))effective++;
    }
    extended+=effective;
  }
  assert.equal(first.probability,held/brute.length);
  assert.equal(after.probability,extended/(brute.length*8));
  assert.ok(after.probability>=first.probability);
});

test('29 original source-locked 60s have exactly 15 printed cards across ten distinct ranks',()=>{
  const x=analyze(path.resolve(__dirname,'..'));
  assert.equal(x.originalFullSources,29);
  assert.deepEqual(x.missingOriginalRanks,[23,25,28]);
  assert.equal(x.sourceManifestSha256.length,64);
  assert.equal(x.totalPhysicalCopies,15);
  assert.deepEqual(x.exactPrintedCardCopyTotals,{
    'Counter Catcher PAR':10,'Roxanne ASR':2,
    'Special Red Card CRI':3,'Special Red Card M4':0
  });
  assert.deepEqual(x.ranksWithCopies,[3,5,7,8,12,14,21,22,26,32]);
  assert.equal(x.rows.reduce((n,r)=>n+r.publicPrizeGatedPhysicalCopies,0),15);
  assert.equal(x.rows.filter(r=>r.publicPrizeGatedPhysicalCopies>0).length,10);
  assert.ok(x.equalOriginalMeanAcceptedBasicOpeningSeven>0);
  assert.ok(x.equalOriginalMeanAcceptedBasicSevenPlusOneDraw>=
    x.equalOriginalMeanAcceptedBasicOpeningSeven);
  for(const row of x.rows){
    const seven=row.acceptedBasicSeven.probability;
    const eight=row.acceptedBasicSevenPlusOneNormalDraw.probability;
    assert.ok(seven>=0&&seven<=1&&eight>=seven&&eight<=1);
    assert.equal(seven===0,row.publicPrizeGatedPhysicalCopies===0);
    assert.equal(eight===0,row.publicPrizeGatedPhysicalCopies===0);
  }
  assert.equal(x.boundary.competitivelyQualifiedGames,0);
  assert.equal(x.boundary.estimatedWinRate,null);
});
