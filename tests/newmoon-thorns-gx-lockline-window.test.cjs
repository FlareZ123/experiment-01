'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  choose,inclusionExclusion,physicalSubsetCount,sourceCounts,main
}=require('../scripts/newmoon-thorns-gx-lockline-window.cjs');

const source=sourceCounts();
const baseline={
  original:'979895887/243894153334',
  extraTwoPsychicEnergy:'35639466/7173357451',
  extraTwoCologne:'905764863/121947076667',
  extraTwoCompressor:'905764863/121947076667',
  oneExtraCologneAndCompressor:'1018557576/121947076667'
};

test('read all genuine source physical counts rather than guessed total',()=>{
  assert.deepEqual(source,{
    mewtwo:2,gengar:1,compressor:2,cologne:2,psychicEnergy:6,
    basics:17
  });
  assert.equal(choose(60,7).toString(),'386206920');
});

test('independent multivariate physical subsets equal inclusion-exclusion',()=>{
  const variants=[
    source,
    {...source,psychicEnergy:8},
    {...source,cologne:4},
    {...source,compressor:4},
    {...source,cologne:3,compressor:3},
    {...source,psychicEnergy:7,cologne:3},
    {...source,compressor:3,psychicEnergy:7}
  ];
  for(const counts of variants){
    const result=inclusionExclusion(counts);
    const eligible=(choose(60,7)-choose(43,7))*53n*52n;
    const count=physicalSubsetCount(counts);
    assert.equal(
      46n*count*BigInt(result.denominator),
      eligible*BigInt(result.numerator),
      'Two separately derived exact physical-counting methods disagree');
  }
});

test('exact fixed-60 resource window and slot perturbation rationals',()=>{
  const r=main();
  assert.equal(r.schema,'newmoon-rank6-direct-gx-lockline-resource-window-v1');
  assert.equal(r.fixedSourcePrintingHash,
    'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  for(const [name,expected] of Object.entries(baseline)){
    const observed=r.outcomes[name];
    assert.equal(observed.numerator+'/'+observed.denominator,expected,name);
    assert.ok(observed.probability>0&&observed.probability<0.01);
  }
  assert.ok(
    r.outcomes.oneExtraCologneAndCompressor.probability>
    r.outcomes.extraTwoCologne.probability);
});

test('missing a mandatory resource eliminates only this narrow route',()=>{
  for(const key of ['mewtwo','compressor','cologne','psychicEnergy']){
    const result=inclusionExclusion({...source,[key]:0});
    assert.equal(result.probability,0,key);
  }
});

test('four standard perturbations preserve fixed Basic count and 60-slot legality',()=>{
  assert.equal(source.basics,17);
  assert.ok(source.mewtwo+source.gengar<source.basics);
  for(const counts of [
    {...source,psychicEnergy:8},{...source,cologne:4},
    {...source,compressor:4},{...source,cologne:3,compressor:3}]){
    assert.ok(counts.basics+counts.compressor+counts.cologne+
      counts.psychicEnergy<=60);
    assert.ok(counts.compressor<=4 && counts.cologne<=4);
    assert.equal(counts.basics,source.basics);
  }
});
