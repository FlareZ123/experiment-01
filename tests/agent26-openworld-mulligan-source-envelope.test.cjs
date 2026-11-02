'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {choose}=require('../scripts/aichi-opening-basics.cjs');
const {unknownInvalidSevenUpper,unknownHistoryUpper,
  openWorldSourceEnvelope}=
  require('../scripts/agent26-openworld-mulligan-source-envelope.cjs');
const manifest=require('../results/aichi-2026/full-decklists.json');
const receipts=require('../results/statistics/agent26-real-native-source6-public-mulligan-six.json');
const denom=Number(choose(60,7));
const close=(a,b,tolerance=1e-12)=>
  assert.ok(Math.abs(a-b)<=tolerance,`Expected ${a} ≈ ${b}`);

test('exact unordered-seven unknown limits respect four-copy and Basic Energy exemptions',()=>{
  const h=['A','B','C','D','E','F','G'];
  const repeated=["Trainers' Mail","Trainers' Mail",'A','B','C','D','E'];
  close(unknownInvalidSevenUpper(h),4**7/den,1e-16);
  close(unknownInvalidSevenUpper(repeated),6*4**5/den,1e-16);
  close(unknownInvalidSevenUpper(Array(7).fill('Grass Energy')),1);
  assert.equal(unknownInvalidSevenUpper(Array(7).fill('Double Colorless Energy')),0);
  close(unknownHistoryUpper([h,repeated]),
    unknownInvalidSevenUpper(h)*unknownInvalidSevenUpper(repeated),1e-20);
  assert.equal(unknownHistoryUpper([]),1);
});

test('genuine source-rank6 visible seven is 100% inside known 29 and not across missing 3',()=>{
  const row=receipts.rows.find(x=>
    x.seed===4136149016&&x.candidateSeat===0);
  const x=openWorldSourceEnvelope(manifest,[row.firstPublicHand]);
  const six=x.sourceBounds.find(r=>r.rank===6);
  assert.deepEqual(x.missingRanks,[23,25,28]);
  close(six.posteriorConditionalOn29Known,1);
  close(x.knownEventMean,6.848564596959988e-9,1e-17);
  close(x.missingEventLikelihoodUpper,4**7/den,1e-16);
  close(x.posteriorKnownSourceMassLower,0.0015581139055567503);
  close(six.posteriorLowerAcross32,0.0015581139055567503);
  close(six.posteriorUpperAcross32,1);
});

test('duplicate Trainers Mail and zero mulligans have independently predictable bounds',()=>{
  const first=receipts.rows.find(x=>x.seed===3730833191&&x.candidateSeat===0);
  const x=openWorldSourceEnvelope(manifest,[first.firstPublicHand]);
  close(x.missingEventLikelihoodUpper,6*4**5/den,1e-16);
  close(x.posteriorKnownSourceMassLower,0.0002600232724899876);
  const empty=openWorldSourceEnvelope(manifest,[]);
  close(empty.knownEventMean,0.7912294697289253);
  close(empty.posteriorKnownSourceMassLower,0.8843737017357747);
  assert.equal(empty.competitiveQualifiedGames,0);
});

test('all six frozen native public setup receipts yield finite inclusive source ranges',()=>{
  assert.equal(receipts.rows.length,6);
  for(const row of receipts.rows){
    const x=openWorldSourceEnvelope(manifest,row.firstPublicHand?
      [row.firstPublicHand]:[]);
    close(x.posteriorKnownSourceMassLower+x.posteriorUnknownSourceMassUpper,1);
    assert.equal(x.sourceBounds.length,29);
    for(const s of x.sourceBounds){
      assert.ok(s.posteriorLowerAcross32>=0);
      assert.ok(s.posteriorUpperAcross32>=s.posteriorLowerAcross32);
      assert.ok(s.posteriorUpperAcross32<=1);
    }
  }
});
