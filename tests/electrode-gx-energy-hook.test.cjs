'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {runCase}=require('../simulation/twinleaf/electrode-gx-ability-contract.cjs');
const {installElectrodeGXEnergyHook}=
  require('../simulation/twinleaf/electrode-gx-energy-hook.cjs');

test('Electrode-GX must attach all five available or reject activation',()=>{
  const restore=installElectrodeGXEnergyHook();
  try {
    assert.equal(installElectrodeGXEnergyHook(),restore);
    const valid=runCase(5);
    assert.equal(valid.transferred,5);
    assert.equal(valid.remainingEnergy,0);
    assert.equal(valid.opponentPrizesTaken,2);
    assert.throws(()=>runCase(4),/./);
    assert.throws(()=>runCase(0),/./);
  } finally {
    restore();
  }
});

test('Electrode rejects blocked recipients',()=>{
 const restore=installElectrodeGXEnergyHook();
 try { assert.throws(()=>runCase(0,true)); assert.throws(()=>runCase(0,true,true)); }
 finally { restore(); }
});

test('Electrode rejects partial discard and bot decisions',()=>{
 const restore=installElectrodeGXEnergyHook();
 try { assert.throws(()=>runCase(1,false,false,2)); assert.throws(()=>runCase(0,false,true)); }
 finally { restore(); }
});

test('headless hook is opt-in, labeled, and restored on both source ranks',()=>{
  const path=require('node:path');
  const {runMatch,initializeCards}=require('../simulation/twinleaf/headless.cjs');
  const {resolveManifestFile}=require('../simulation/twinleaf/resolve-field.cjs');
  initializeCards();
  const {ElectrodeGX}=require(path.resolve(__dirname,
    '../vendor/twinleaf/ptcg-server/output/sets/08-sun-and-moon/set-celestial-storm/electrode-gx'));
  const original=ElectrodeGX.prototype.reduceEffect;
  const source=resolveManifestFile(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
  const rank4=source.decks.find(d=>d.rank===4);
  const rank17=source.decks.find(d=>d.rank===17);
  assert.ok(rank4?.playableUnderEngine && rank17?.playableUnderEngine);
  const options={deckA:rank4.cardIds,deckB:rank17.cardIds,
    seed:20261017,maxActions:40,isolatePolicyRandomness:true,
    strictPromptValidation:true};
  const control=runMatch({...options,electrodeGXEnergyCorrection:false});
  assert.equal(ElectrodeGX.prototype.reduceEffect,original);
  const corrected=runMatch({...options,electrodeGXEnergyCorrection:true});
  assert.equal(ElectrodeGX.prototype.reduceEffect,original);
  assert.equal(control.electrodeGXEnergyCorrection,false);
  assert.equal(corrected.electrodeGXEnergyCorrection,true);
  assert.ok(!control.policy.includes('ElectrodeGXMandatoryEnergy-v1'));
  assert.ok(corrected.policy.includes('ElectrodeGXMandatoryEnergy-v1'));
  assert.deepEqual(control.deckHashes,corrected.deckHashes);
  assert.deepEqual(control.rules,corrected.rules);
  assert.equal(corrected.promptValidationMode,'predispatch-prompt-validate');
  const combined=runMatch({...options,electrodeGXEnergyCorrection:true,
    electroRainDamageCorrection:true});
  assert.equal(ElectrodeGX.prototype.reduceEffect,original);
  assert.equal(combined.electrodeGXEnergyCorrection,true);
  assert.equal(combined.electroRainDamageCorrection,true);
  assert.ok(combined.policy.includes('ElectrodeGXMandatoryEnergy-v1'));
  assert.ok(combined.policy.includes('ElectroRainDamage-v1'));
  assert.deepEqual(corrected.deckHashes,combined.deckHashes);
});
