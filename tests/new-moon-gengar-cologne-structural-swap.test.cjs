'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {main,directChannels}=
  require('../scripts/new-moon-gengar-cologne-structural-swap.cjs');

/** @param {number} actual @param {number} expected */
function near(actual,expected) {
  assert.ok(Math.abs(actual-expected)<1e-10,
    'Expected '+expected+', got '+actual);
}

test('source exact resource fractions agree with previously published rank6 screen',()=>{
  const x=main();
  assert.equal(x.actualSourceHash,
    'a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4');
  near(x.sourceResult.native.firstDraw,0.06977444548535501);
  near(x.sourceResult.copied.firstDraw,0.027519949175691543);
  near(x.sourceResult.either.firstDraw,0.09510164456970829);
  near(x.sourceResult.either.withAllBonuses,0.11328003548);
});

test('proposed added Gengar and removed Cologne is an exact source-count single-slot swap',()=>{
  const x=main();
  assert.equal(x.structuralSwap.gengar,x.baseline.gengar+1);
  assert.equal(x.structuralSwap.cologne,x.baseline.cologne-1);
  assert.equal(x.structuralSwap.basics,x.baseline.basics+1);
  near(x.alternateResult.native.firstDraw,0.13117143557773247);
  near(x.alternateResult.copied.firstDraw,0.014213236836681902);
  near(x.alternateResult.either.firstDraw,0.14320996276103454);
  near(x.alternateResult.either.withAllBonuses,0.16380055391);
  assert.ok(x.deltaEither.firstDraw>0.048);
  assert.ok(x.deltaEither.withAllBonuses>0.05);
});

test('the three-Prize Gengar solo-start exposure rises in rank26 matchup',()=>{
  const x=main();
  near(x.meloettaSolo.baseline.initiallySoleGengar,
    0.017222457974413594);
  near(x.meloettaSolo.structuralSwap.initiallySoleGengar,
    0.02920583782484664);
  near(x.meloettaSolo.baseline.soleGengarAfterAllBonusCards,
    0.016154581995936117);
  near(x.meloettaSolo.structuralSwap.soleGengarAfterAllBonusCards,
    0.027266600161748293);
  assert.ok(x.meloettaSolo.structuralSwap.anySoloAfterAllBonusCards<
    x.meloettaSolo.baseline.anySoloAfterAllBonusCards);
});

test('both channel intersection is included only once',()=>{
  const x=main();
  for(const key of ['firstDraw','withAllBonuses']) {
    for(const candidate of [x.sourceResult,x.alternateResult]) {
      near(candidate.either[key],
        candidate.native[key]+candidate.copied[key]-candidate.overlap[key]);
      assert.ok(candidate.either[key]<=candidate.native[key]+candidate.copied[key]);
    }
  }
  assert.throws(()=>directChannels({...x.baseline,cologne:-1}));
});
