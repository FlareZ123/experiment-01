'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {preflight,REG}=require(
  '../simulation/evaluation/agent1-rank17-electrode-composed-owner-aba.cjs');

test('composed source policy registration freezes all 16 fresh physical deals and 48 arms',()=>{
  assert.strictEqual(preflight(),REG);
  assert.deepEqual(REG.sourcePhysicalSeats,[0,1]);
  assert.equal(REG.seeds.length,8);
  assert.equal(new Set(REG.seeds).size,8);
  assert.equal(REG.independentPhysicalDeals,16);
  assert.equal(REG.totalNativeArms,48);
  assert.equal(REG.seeds.length*REG.sourcePhysicalSeats.length*
    REG.arms.length,REG.totalNativeArms);
  assert.equal(REG.nativeActionCap,180);
  assert.deepEqual(REG.nativePolicy.bothSeats,
    {naturalEvolutionRoot:true,publicContextSpecialEnergy:true});
  assert.equal(REG.cohort,'fresh-independent-prospective-seeds');
});
test('source native Extra Energy Bomb gate retains original 60 and separated paper inference',()=>{
  assert.equal(REG.sourceOriginalRank,17);
  assert.equal(REG.opponentOriginalRank,1);
  assert.equal(REG.sourcePrinted60Sha256.length,64);
  assert.equal(REG.opponentPrinted60Sha256.length,64);
  assert.equal(REG.nativeFlags.electrodeGXEnergyCorrection,true);
  assert.equal(REG.nativeFlags.electroRainDamageCorrection,true);
  assert.equal(REG.nativeFlags.battleCompressorPositiveSelectionCorrection,true);
  assert.ok(REG.exclusions.includes('No win-rate estimate'));
});
