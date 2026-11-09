'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withRank1MirrorResourceAndAttackAudit}=
  require('../../simulation/twinleaf/agent11-rank1-mirror-owner-pass-resources.cjs');
const {probeStadiumThenEnergyDrive}=
  require('../../simulation/twinleaf/agent11-rank1-dimensionvalley-energy-drive-probe.cjs');
const {continueOriginalRank1RaihanPaleMoon}=
  require('../../simulation/twinleaf/2026-11/agent34-rank1-original-raihan-palemoon-continuation.cjs');
const {executeOpponentTulipRebuild}=
  require('../../simulation/twinleaf/2026-11/agent11-rank1-postgx-tulip-rebuild.cjs');
const {TARGET,runActualOriginalRank1MirrorPassProbe}=
  require('../../simulation/twinleaf/agent45-rank1-mirror-source-pass-native-probe.cjs');

test('original opponent restores Pale Moon-discarded Psychic using Tulip and VMAX',()=>{
  const callback=context=>continueOriginalRank1RaihanPaleMoon({
    ...context,raihanPickPrinting:'Psychic Energy MEE',
    afterOpponentRetreat:x=>({
      getlost:executeOpponentTulipRebuild(x,{manualTarget:'girafarig'}),
      poweredLatias:executeOpponentTulipRebuild(x,{manualTarget:'latias'})
    })
  });
  const observer=(execute,deps)=>withRank1MirrorResourceAndAttackAudit(
    execute,{...deps,onSourcePass:(state,ownerId,view)=>
      probeStadiumThenEnergyDrive(state,ownerId,view,{
        afterSourcePromotion:callback
      })});
  const original=runActualOriginalRank1MirrorPassProbe({observer});
  const row=original.execution.rawDevelopment.rows.find(x=>x.trial?.id===TARGET);
  assert.equal(row?.rootActionLedgerSha256,
    '3f07a98bee3266a5866351307333d4ad1673ed9e3adb7f356c08cef1290c919a');
  const after=original.mirrorSourcePass.audit.ownerPassResourceAudit
    .sourcePasses.find(x=>x.globalTurn===16)
    ?.detachedCounterfactual?.attackFollowthrough?.sourcePromotion
    ?.scopedContinuation;
  assert.ok(after);
  const corrected=after.results.find(x=>x.corrected);
  const counter=corrected.opponentRetreat.ownerCounterReply;
  assert.ok(counter);
  console.log('AGENT11_RANK1_OPPONENT_TULIP_REBUILD_NATIVE',
    JSON.stringify({
      originalRoot:row.rootActionLedgerSha256,
      PaleMoonDiscarded:corrected.discardedPhysicalOpposingEnergy,
      counter
    }));
  for(const arm of [counter.getlost,counter.poweredLatias]){
    assert.equal(arm.opponentOwnerViewOnly,true);
    assert.equal(arm.sourceOriginalStoreUnchanged,true);
    assert.equal(arm.ownerId,202);
    assert.equal(arm.sourceId,101);
    assert.equal(arm.ownActiveBefore,'Girafarig LOT');
    assert.ok(arm.ownBasicPsychicInDiscardBefore>=3);
    assert.equal(arm.ownBasicPsychicInHandBefore,0);
    assert.equal(arm.ownVMAXHandBefore,2);
    assert.equal(arm.tulipNativeAccepted,true);
    assert.equal(arm.tulipCardsRecovered,3);
    assert.equal(arm.evolutionsAccepted.length,2);
    assert.ok(arm.evolutionsAccepted.every(x=>x.physicalVMAXOnBench));
    assert.equal(arm.underworldAbilities.length,2);
    assert.ok(arm.underworldAbilities.every(x=>x.valid&&x.accepted));
    assert.equal(arm.latiasEnergyAfterUnderworld.length,2);
    assert.equal(arm.normalAttachment,true);
    assert.equal(arm.errors.length,0);
    assert.deepEqual(arm.remainingPromptKinds,[]);
    assert.equal(arm.nextActorId,101);
  }
  assert.equal(counter.getlost.stage,
    'native-tulip-vmax-underworld-girafarig-getlost-settled');
  assert.equal(counter.getlost.physicalSourceCardsBanished,2);
  assert.equal(counter.poweredLatias.stage,
    'native-tulip-vmax-underworld-latias-recharged-and-pass');
  assert.equal(counter.poweredLatias.latiasEnergyAfterManual.length,3);
  assert.equal(counter.poweredLatias.girafarigEnergyAfterManual.length,0);
  assert.equal(corrected.opponentRetreat.status,'native-retreat-and-pass-settled',
    'new native counterlines are independent clones of the unchanged source Pass');
});
