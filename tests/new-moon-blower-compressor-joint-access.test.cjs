'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {main,calculate}=
  require('../scripts/new-moon-blower-compressor-joint-access.cjs');

test('source-locked simultaneous early resource windows have exact fractions',()=>{
  const o=main();
  assert.equal(o.fixedCandidateHash,
    'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  assert.deepEqual(o.result.candidateCompressorGengar,{
    numerator:'15335595',denominator:'353982806',
    probability:15335595/353982806
  });
  assert.deepEqual(o.result.directBlowerAndCompressorGengar,{
    numerator:'1565265',denominator:'176991403',
    probability:1565265/176991403
  });
  assert.deepEqual(o.result.exclusiveBoxAndCompressorGengar,{
    numerator:'35435778',denominator:'9380544359',
    probability:35435778/9380544359
  });
  assert.deepEqual(o.result.union,{
    numerator:'118394823',denominator:'9380544359',
    probability:118394823/9380544359
  });
  assert.deepEqual(o.result.rawEightDrawWeights,{
    compressorGengar:'918802170',directBlower:'187559580',
    exclusiveSecretBox:'81069430'
  });
});

test('disjoint routes partition the union and cannot exceed prerequisite',()=>{
  const x=main().result;
  assert.ok(Math.abs(x.directBlowerAndCompressorGengar.probability+
    x.exclusiveBoxAndCompressorGengar.probability-
    x.union.probability)<1e-15);
  assert.ok(x.union.probability<=x.candidateCompressorGengar.probability);
});

test('missing one critical card zeroes the corresponding route',()=>{
  const inv={mewtwo:2,gengar:1,compressor:2,blower:2,box:1,basics:17};
  assert.equal(calculate({...inv,blower:0}).union.numerator,'0');
  assert.equal(calculate({...inv,compressor:0}).union.numerator,'0');
  assert.equal(calculate({...inv,box:0})
    .exclusiveBoxAndCompressorGengar.numerator,'0');
  assert.throws(()=>calculate({...inv,gengar:2}));
});
