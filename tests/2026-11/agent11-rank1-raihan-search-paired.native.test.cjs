'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withRank1MirrorResourceAndAttackAudit}=
  require('../../simulation/twinleaf/agent11-rank1-mirror-owner-pass-resources.cjs');
const {probeStadiumThenEnergyDrive}=
  require('../../simulation/twinleaf/agent11-rank1-dimensionvalley-energy-drive-probe.cjs');
const {comparePhysicalRaihanSearchChoices}=
  require('../../simulation/twinleaf/2026-11/agent11-rank1-raihan-search-paired.cjs');
const {TARGET,runActualOriginalRank1MirrorPassProbe}=
  require('../../simulation/twinleaf/agent45-rank1-mirror-source-pass-native-probe.cjs');

test('the very same genuine rank1 hand independently supports two Raihan searches',()=>{
  const observer=(execute,deps)=>withRank1MirrorResourceAndAttackAudit(
    execute,{...deps,onSourcePass:(state,ownerId,view)=>
      probeStadiumThenEnergyDrive(state,ownerId,view,{
        afterSourcePromotion:comparePhysicalRaihanSearchChoices
      })});
  const original=runActualOriginalRank1MirrorPassProbe({observer});
  const row=original.execution.rawDevelopment.rows.find(x=>x.trial?.id===TARGET);
  assert.equal(row?.rootActionLedgerSha256,
    '3f07a98bee3266a5866351307333d4ad1673ed9e3adb7f356c08cef1290c919a');
  const paired=original.mirrorSourcePass.audit.ownerPassResourceAudit
    .sourcePasses.find(x=>x.globalTurn===16)
    ?.detachedCounterfactual?.attackFollowthrough?.sourcePromotion
    ?.scopedContinuation;
  assert.ok(paired);
  assert.equal(paired.sameInitialPhysicalSource,true);
  assert.equal(paired.publicOwnerDecisionOnly,true);
  assert.equal(paired.originalFirstCard,"Lillie's Clefairy ex JTG");
  assert.equal(paired.reservePsychicChoice,'Psychic Energy MEE');
  assert.equal(paired.control.status,'native-source-raihan-funded-two-arm-gx-settled');
  assert.equal(paired.treatment.status,'native-source-raihan-funded-two-arm-gx-settled');
  const originalArm=paired.control.results.find(x=>x.corrected);
  const reserveArm=paired.treatment.results.find(x=>x.corrected);
  assert.equal(originalArm.opponentRetreat.status,'native-retreat-and-pass-settled');
  assert.equal(reserveArm.opponentRetreat.status,'native-retreat-and-pass-settled');
  assert.equal(originalArm.discardedPhysicalOpposingEnergy,3);
  assert.equal(reserveArm.discardedPhysicalOpposingEnergy,3);
  const initial=originalArm.opponentRetreat.sourceNextTurn;
  const reserved=reserveArm.opponentRetreat.sourceNextTurn;
  assert.ok(initial && reserved);
  assert.equal(reserved.sourceRemainingPrizesAfter,5);
  assert.equal(reserved.opponentDiscardedGirafarig,true);
  assert.equal(reserved.noInsertedCards,true);
  console.log('AGENT11_SAME_PHYSICAL_RAIHAN_CHOICE_AB',JSON.stringify({
    originalRoot:row.rootActionLedgerSha256,
    sourceTurn:paired.sourceStateTurn,
    controlSelection:paired.originalFirstCard,
    treatmentSelection:paired.reservePsychicChoice,
    controlReturn:initial,
    treatmentReturn:reserved,
    competitiveQualifiedGames:paired.qualifiedPaperGames
  }));
});
