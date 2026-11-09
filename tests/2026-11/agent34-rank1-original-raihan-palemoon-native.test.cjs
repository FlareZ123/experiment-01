'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const { withRank1MirrorResourceAndAttackAudit } =
  require('../../simulation/twinleaf/agent11-rank1-mirror-owner-pass-resources.cjs');
const { probeStadiumThenEnergyDrive } =
  require('../../simulation/twinleaf/agent11-rank1-dimensionvalley-energy-drive-probe.cjs');
const { continueOriginalRank1RaihanPaleMoon } =
  require('../../simulation/twinleaf/2026-11/agent34-rank1-original-raihan-palemoon-continuation.cjs');
const { TARGET,runActualOriginalRank1MirrorPassProbe } =
  require('../../simulation/twinleaf/agent45-rank1-mirror-source-pass-native-probe.cjs');

const FROZEN_ROOT_SHA=
  '3f07a98bee3266a5866351307333d4ad1673ed9e3adb7f356c08cef1290c919a';

test('original physical rank1 t16 -> t18 Raihan/Pale Moon-GX genuine native two-arm source',()=>{
  const observer=(execute,deps)=>withRank1MirrorResourceAndAttackAudit(
    execute,{...deps,onSourcePass:(state,ownerId,view)=>
      probeStadiumThenEnergyDrive(state,ownerId,view,{
        afterSourcePromotion:continueOriginalRank1RaihanPaleMoon
      })});
  const run=runActualOriginalRank1MirrorPassProbe({observer});
  const row=run.execution.rawDevelopment.rows.find(x=>x.trial?.id===TARGET);
  assert.ok(row);
  assert.equal(row.rootActionLedgerSha256,FROZEN_ROOT_SHA,
    'native alternative must not mutate the original game root ledger');
  assert.equal(row.actionCount,110);
  assert.equal(row.winner,1);
  const sourceAudit=run.mirrorSourcePass.audit.ownerPassResourceAudit;
  const after=sourceAudit.sourcePasses.find(e=>e.globalTurn===16)
    ?.detachedCounterfactual?.attackFollowthrough?.sourcePromotion?.scopedContinuation;
  assert.ok(after,'actual source-dealt cloned t18 continuation should be present');
  console.log('AGENT34_SOURCE_RAIHAN_PALEMOON_NATIVE',JSON.stringify(after));
  assert.equal(after.sourceTurn,18);
  assert.equal(after.sourceHandRaihan,true);
  assert.equal(after.sourceHandPsychic,true);
  assert.equal(after.status,'native-source-raihan-funded-two-arm-gx-settled',
    'inspect the full native receipt before interpreting a missed payoff');
  assert.equal(after.supporterNativeAccepted,true);
  assert.equal(after.attachPromptNativeResolved,true);
  assert.equal(after.searchedOwnDeck,true);
  assert.equal(after.manualEnergyNativeAccepted,true);
  assert.equal(after.energyAfterManual.length,2);
  assert.equal(after.results.length,2);
  const [baseline,corrected]=after.results;
  assert.equal(baseline.corrected,false);
  assert.equal(corrected.corrected,true);
  assert.equal(baseline.outcome,'genuine-native-gx-settled');
  assert.equal(corrected.outcome,'genuine-native-gx-settled');
  assert.equal(baseline.physicalPaidSource,corrected.physicalPaidSource);
  assert.equal(baseline.gxSpent,true);
  assert.equal(corrected.gxSpent,true);
  assert.equal(baseline.delayedKOs.length,1);
  assert.equal(corrected.delayedKOs.length,1);
  assert.equal(baseline.remainingOpposingEnergy.length,3);
  assert.equal(corrected.remainingOpposingEnergy.length,0);
  assert.equal(corrected.discardedPhysicalOpposingEnergy,3);
  assert.equal(corrected.correctedExtraEnergy,1);
});
