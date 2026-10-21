'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {countDirectHorrorHouse,main}=
  require('../scripts/newmoon-direct-horror-house-physical-window.cjs');
const {sourceCounts,inclusionExclusion}=
  require('../scripts/newmoon-thorns-gx-lockline-window.cjs');
const {main:previousVisibility}=
  require('../scripts/new-moon-thorns-starter-joint.cjs');

const exactUnion=[
  '9043015824/121947076667',
  '7524622837/55363743396',
  '1349534834643/7100517817900',
  '603408280504/2535555434475'
];

test('source list is fixed and each changed 60 has a legal-sized physical count',()=>{
  const baseline=sourceCounts();
  for(let copies=1;copies<=4;copies++){
    const counts={...baseline,gengar:copies,basics:16+copies};
    assert.equal(counts.mewtwo,2);
    assert.equal(counts.basics-counts.mewtwo-counts.gengar,14);
    assert.ok(counts.compressor<=4&&counts.cologne<=4);
    assert.equal(counts.basics+(60-counts.basics),60);
    assert.ok(counts.basics+counts.compressor+counts.cologne+
      counts.psychicEnergy<=60);
  }
});

test('four hypothetical Gengar-copy resource probabilities are exact rationals',()=>{
  const r=main();
  assert.equal(r.qualifiedCompetitiveGames,0);
  assert.equal(r.fixedSourcePrintingHash,
    'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  for(let copies=1;copies<=4;copies++){
    const row=r.cases['gengar'+copies];
    assert.equal(row.eitherRoute.numerator+'/'+row.eitherRoute.denominator,
      exactUnion[copies-1]);
    const total=[
      row.nativeGengarStarter.probability,
      row.copyViaDrawnGengar.probability,
      row.copyViaCompressor.probability
    ].reduce((a,b)=>a+b,0);
    assert.ok(Math.abs(total-row.eitherRoute.probability)<1e-15);
  }
  assert.ok(r.cases.gengar2.eitherRoute.probability>
    r.cases.gengar1.eitherRoute.probability);
});

test('new baseline copied-Compressor subcase equals independent eight-card inclusion-exclusion',()=>{
  const baseline=sourceCounts();
  const r=countDirectHorrorHouse(baseline);
  const other=inclusionExclusion(baseline);
  assert.equal(r.copyViaCompressor.numerator,other.numerator);
  assert.equal(r.copyViaCompressor.denominator,other.denominator);
  assert.equal(r.nativeGengarStarter.numerator+'/'+
    r.nativeGengarStarter.denominator,'12349477/176991403');
  assert.equal(r.copyViaDrawnGengar.numerator+'/'+
    r.copyViaDrawnGengar.denominator,'6812035/18761088718');
});

test('real Gengar donor condition is stricter than prior donor-agnostic visibility',()=>{
  const previous=previousVisibility().eitherDirectGXChannel.firstDraw;
  const observed=countDirectHorrorHouse(sourceCounts()).eitherRoute.probability;
  assert.ok(Math.abs(previous-0.09510164456970868)<1e-12);
  assert.ok(Math.abs(observed-0.07415524890927642)<1e-12);
  assert.ok(observed<previous);
});

test('invalid source counts do not silently become plausible probabilities',()=>{
  const c=sourceCounts();
  assert.throws(()=>countDirectHorrorHouse({...c,basics:2}));
  assert.throws(()=>countDirectHorrorHouse({...c,psychicEnergy:55}));
  assert.throws(()=>countDirectHorrorHouse({...c,gengar:0}));
});
