'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withRank1MirrorResourceAndAttackAudit}=
  require('../../simulation/twinleaf/agent11-rank1-mirror-owner-pass-resources.cjs');
const {probeStadiumThenEnergyDrive}=
  require('../../simulation/twinleaf/agent11-rank1-dimensionvalley-energy-drive-probe.cjs');
const {continueOriginalRank1RaihanPaleMoon}=
  require('../../simulation/twinleaf/2026-11/agent34-rank1-original-raihan-palemoon-continuation.cjs');
const {inspectOpponentPostGXRetreat}=
  require('../../simulation/twinleaf/2026-11/agent11-rank1-post-gx-opponent-owner.cjs');
const {TARGET,runActualOriginalRank1MirrorPassProbe}=
  require('../../simulation/twinleaf/agent45-rank1-mirror-source-pass-native-probe.cjs');

test('real original rank1 opponent-own-hand action choice after Pale Moon and Skyliner Retreat',()=>{
  const callback=context=>continueOriginalRank1RaihanPaleMoon({
    ...context,raihanPickPrinting:'Psychic Energy MEE',
    afterOpponentRetreat:inspectOpponentPostGXRetreat
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
  const corrected=after?.results?.find(x=>x.corrected);
  const owner=corrected?.opponentRetreat?.ownerCounterReply;
  console.log('AGENT11_ORIGINAL_OPPONENT_POSTGX_OWNER_VIEW',JSON.stringify({
    originalRoot:row.rootActionLedgerSha256,
    correctedDiscardedEnergy:corrected?.discardedPhysicalOpposingEnergy,
    owner
  }));
  assert.ok(owner);
  assert.equal(owner.status,'opponent-own-root-observation');
  assert.equal(owner.ownerId,202);
  assert.equal(owner.sourceOpponentId,101);
  assert.equal(owner.ownerTurn,19);
  assert.equal(owner.decisionKind,'owner-root');
  assert.equal(owner.ownActive,'Girafarig LOT');
  assert.equal(owner.ownActiveEnergy.length,0);
  assert.equal(owner.sourceActive,'Trevenant & Dusknoir-GX SMP');
  assert.equal(owner.sourceActiveEnergy.length,2);
  assert.equal(owner.spectatorOrSourceHiddenAccess,false);
  assert.equal(owner.nativeActionAttempted,false);
  assert.equal(owner.ownHand.length,owner.ownHandCardCount);
  assert.equal(corrected.opponentRetreat.status,'native-retreat-and-pass-settled');
});
