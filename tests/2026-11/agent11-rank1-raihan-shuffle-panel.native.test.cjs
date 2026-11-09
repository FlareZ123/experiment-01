'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withRank1MirrorResourceAndAttackAudit}=
  require('../../simulation/twinleaf/agent11-rank1-mirror-owner-pass-resources.cjs');
const {probeStadiumThenEnergyDrive}=
  require('../../simulation/twinleaf/agent11-rank1-dimensionvalley-energy-drive-probe.cjs');
const {compareRaihanRegisteredShufflePanel,SHUFFLE_SEEDS}=
  require('../../simulation/twinleaf/2026-11/agent11-rank1-raihan-search-paired.cjs');
const {TARGET,runActualOriginalRank1MirrorPassProbe}=
  require('../../simulation/twinleaf/agent45-rank1-mirror-source-pass-native-probe.cjs');

test('original source rank1 physical Raihan choices across registered actual deck shuffles',()=>{
  const observer=(execute,deps)=>withRank1MirrorResourceAndAttackAudit(
    execute,{...deps,onSourcePass:(state,ownerId,view)=>
      probeStadiumThenEnergyDrive(state,ownerId,view,{
        afterSourcePromotion:compareRaihanRegisteredShufflePanel
      })});
  const original=runActualOriginalRank1MirrorPassProbe({observer});
  const row=original.execution.rawDevelopment.rows.find(x=>x.trial?.id===TARGET);
  assert.equal(row?.rootActionLedgerSha256,
    '3f07a98bee3266a5866351307333d4ad1673ed9e3adb7f356c08cef1290c919a');
  const panel=original.mirrorSourcePass.audit.ownerPassResourceAudit
    .sourcePasses.find(x=>x.globalTurn===16)
    ?.detachedCounterfactual?.attackFollowthrough?.sourcePromotion
    ?.scopedContinuation;
  assert.ok(panel);
  console.log('AGENT11_RAIHAN_REGISTERED_SHUFFLE16_NATIVE',
    JSON.stringify({
      originalRoot:row.rootActionLedgerSha256,
      version:panel.version,
      summary:panel.summary,
      rows:panel.rows,
      competitiveQualifiedGames:panel.competitiveGames
    }));
  assert.deepEqual(panel.registeredSeeds,SHUFFLE_SEEDS);
  assert.equal(panel.summary.paired,16);
  assert.equal(panel.summary.validSourcePhysical,16);
  assert.equal(panel.competitiveGames,0);
  for(const x of panel.rows){
    assert.ok(SHUFFLE_SEEDS.includes(x.seed));
    assert.equal(x.controlRaihan,"Lillie's Clefairy ex JTG");
    assert.equal(x.treatmentRaihan,'Psychic Energy MEE');
    assert.equal(x.controlHeldPsychicAfterRaihanFunding,0,
      'control must rely on a subsequent genuine draw');
    assert.ok(x.treatmentHeldPsychicAfterRaihanFunding>=1);
    assert.equal(x.correctedOpposingEnergyDiscarded,3);
    assert.equal(x.treatmentCorrectedOpposingEnergyDiscarded,3);
    assert.equal(x.controlRetreat,'native-retreat-and-pass-settled');
    assert.equal(x.treatmentRetreat,'native-retreat-and-pass-settled');
    assert.equal(x.treatmentHeldPsyAtSourceTurn20,true);
    assert.equal(x.treatmentNightWatch,'native-night-watch-fully-settled');
    assert.equal(x.treatmentSourcePrizes,5);
    assert.equal(x.treatmentErrors,0);
    if(x.controlHeldPsyAtSourceTurn20){
      assert.equal(x.controlNightWatch,'native-night-watch-fully-settled');
      assert.equal(x.controlSourcePrizes,5);
    }else{
      assert.equal(x.controlNightWatch,'original-owner-return-preconditions-not-met');
      assert.equal(x.controlSourcePrizes,6);
    }
  }
  assert.ok(panel.summary.controlWithoutPsy>0,
    'registered shuffle test needs at least one control funding failure');
  assert.ok(panel.summary.controlNightWatchPrize>0,
    'registered shuffle test should include an existing successful natural draw');
  assert.equal(panel.summary.treatmentWithoutPsy,0);
  assert.equal(panel.summary.treatmentOnlyKOs,panel.summary.controlWithoutPsy);
});
