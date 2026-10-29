'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {auditSpecialEnergyVocabulary}=
  require('../scripts/agent17-special-energy-vocabulary.cjs');
const source=require('../results/aichi-2026/full-decklists.json');
const result=auditSpecialEnergyVocabulary(source);
const rank=n=>result.rows.find(x=>x.rank===n);

test('29 original 60s, 24 with Specials, 118 physical Special copies',()=>{
  assert.equal(result.originalSources,29);
  assert.deepEqual(result.missingOriginals,[23,25,28]);
  assert.equal(result.specialSources,24);
  assert.equal(result.specialCopies,118);
  assert.equal(result.recognizedCopies,38);
  assert.equal(result.unrecognizedCopies,80);
});
test('real frontier supports only six full and three partial original sources',()=>{
  assert.deepEqual(result.fullRanks,[3,5,6,24,26,29]);
  assert.deepEqual(result.partialRanks,[2,7,15]);
  assert.deepEqual(result.zeroRanks,
    [4,9,10,12,13,14,17,18,19,20,21,27,30,31,32]);
});
test('rank4/rank17 twelve Specials unrecognized by implemented frontier',()=>{
  for(const n of [4,17]){
    const x=rank(n);
    assert.equal(x.specialCopies,12);
    assert.equal(x.recognizedCopies,0);
    assert.deepEqual(x.unsupported.map(y=>[y.printing,y.count]),[
      ['Reversal Energy PAL',4],
      ['Counter Energy CIN',4],
      ['Unit Energy LPM UPR',4]
    ]);
    assert.equal(x.recognizedByOneDraw.probability,0);
  }
});
test('rank7 partially recognized native-special direct held rate',()=>{
  const x=rank(7);
  assert.equal(x.specialCopies,4);
  assert.equal(x.recognizedCopies,2);
  assert.equal(x.unrecognizedCopies,2);
  assert.equal(x.unsupported.length,2);
  assert.ok(Math.abs(x.recognizedByOneDraw.probability-
    0.23915588783091557)<1e-14);
});
test('three exact Iron Thorns source 60s remain fully recognized by numeric switch',()=>{
  for(const n of [6,24,29]){
    const x=rank(n);
    assert.equal(x.recognizedCopies,8);
    assert.equal(x.unrecognizedCopies,0);
    assert.ok(Math.abs(x.recognizedByOneDraw.probability-
      0.6689638133580127)<1e-13);
  }
  assert.equal(result.qualification.competitiveGameQualified,false);
});
test('original sixty tampering fails before any unsupported-energy inference',()=>{
  const bad=structuredClone(source);
  bad.decks.find(x=>x.rank===4).cards[0].count++;
  assert.throws(()=>auditSpecialEnergyVocabulary(bad));
});
