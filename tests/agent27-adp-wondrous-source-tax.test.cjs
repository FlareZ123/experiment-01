'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {choose}=require('../simulation/evaluation/agent5-adp-paid-opening.cjs');
const {ORIGINAL_RANKS,verifyPrintedSource,conditionalAdpGxUnits,
  exactDoubleViridianPrized,main}=
  require('../simulation/evaluation/agent27-adp-wondrous-source-tax.cjs');

test('All three authenticated original Thorns print Wondrous exactly once',()=>{
  const source=verifyPrintedSource();
  assert.deepEqual(source.sourceRanks,[6,24,29]);
  assert.deepEqual(ORIGINAL_RANKS,[6,24,29]);
  assert.deepEqual(source.sourceWondrousCopies,[1,1,1]);
  assert.equal(source.candidateViridian,2);
  assert.equal(source.candidateFieldBlower,2);
});

test('Printed ADP + one DDE funds enhanced GX when Stadium tax absent',()=>{
  const r=conditionalAdpGxUnits({wondrousActive:false,viridianPlayed:false,
    fieldBlowerPlayed:false,ddeAttached:true});
  assert.equal(r.unitsToAnnounceGX,1);
  assert.equal(r.unitsForEnhancedGX,2);
  assert.equal(r.availableEnergyUnits,2);
  assert.equal(r.baseGXUnitPayable,true);
  assert.equal(r.enhancedGXUnitPayable,true);
});

test('Original Wondrous makes one DDE insufficient for enhanced GX',()=>{
  const r=conditionalAdpGxUnits({wondrousActive:true,viridianPlayed:false,
    fieldBlowerPlayed:false,ddeAttached:true});
  assert.equal(r.unitsForEnhancedGX,3);
  assert.equal(r.availableEnergyUnits,2);
  assert.equal(r.baseGXUnitPayable,true);
  assert.equal(r.enhancedGXUnitPayable,false);
  assert.equal(r.stadiumTaxStillActive,true);
});

test('Field Blower Item cannot remove protected Wondrous',()=>{
  const r=conditionalAdpGxUnits({wondrousActive:true,viridianPlayed:false,
    fieldBlowerPlayed:true,ddeAttached:true});
  assert.equal(r.itemFieldBlowerCannotClearWondrous,true);
  assert.equal(r.enhancedGXUnitPayable,false);
  assert.equal(r.stadiumTaxStillActive,true);
});

test('Playing Viridian replaces Wondrous without Item or Supporter removal',()=>{
  const r=conditionalAdpGxUnits({wondrousActive:true,viridianPlayed:true,
    fieldBlowerPlayed:false,ddeAttached:true});
  assert.equal(r.stadiumTaxStillActive,false);
  assert.equal(r.unitsForEnhancedGX,2);
  assert.equal(r.enhancedGXUnitPayable,true);
});

test('An additional already attached Energy unit can fund taxed enhanced GX',()=>{
  const r=conditionalAdpGxUnits({wondrousActive:true,viridianPlayed:false,
    fieldBlowerPlayed:false,ddeAttached:true,extraAttachedEnergyUnits:1});
  assert.equal(r.unitsForEnhancedGX,3);
  assert.equal(r.availableEnergyUnits,3);
  assert.equal(r.enhancedGXUnitPayable,true);
  assert.equal(r.dependsOnUnverifiedAdditionalAttachments,true);
});

test('An added Colorless source without DDE still lacks required Metal and Water',()=>{
  const r=conditionalAdpGxUnits({wondrousActive:true,viridianPlayed:false,
    fieldBlowerPlayed:false,ddeAttached:false,extraAttachedEnergyUnits:3});
  assert.equal(r.availableEnergyUnits,3);
  assert.equal(r.enhancedGXUnitPayable,false);
  assert.equal(r.baseGXUnitPayable,false);
});

test('Double-Viridian Prize risk is exact conditional valid-seven hypergeometric',()=>{
  const r=exactDoubleViridianPrized();
  const valid=choose(60,7)-choose(53,7);
  const noStadiumValid=choose(58,7)-choose(51,7);
  assert.equal(r.numerator,noStadiumValid*choose(6,2));
  assert.equal(r.denominator,valid*choose(53,2));
  assert.ok(Math.abs(r.probability-0.008672995106093177)<1e-15);
});

test('Invalid synthetic resource states fail closed',()=>{
  assert.throws(()=>conditionalAdpGxUnits({wondrousActive:true,
    viridianPlayed:false,fieldBlowerPlayed:false,ddeAttached:true,
    extraAttachedEnergyUnits:-1}));
  assert.throws(()=>conditionalAdpGxUnits({wondrousActive:true,
    viridianPlayed:false,fieldBlowerPlayed:false,ddeAttached:true,
    extraAttachedEnergyUnits:0.5}));
});

test('This mathematical screen admits zero competitive games',()=>{
  const r=main();
  assert.equal(r.competitiveGamesQualified,0);
  assert.equal(r.lockedOneDDE.enhancedGXUnitPayable,false);
  assert.equal(r.replacedByViridian.enhancedGXUnitPayable,true);
});
