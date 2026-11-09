'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {withRank1MirrorResourceAndAttackAudit} =
  require('../../simulation/twinleaf/agent11-rank1-mirror-owner-pass-resources.cjs');
const {probeStadiumThenEnergyDrive} =
  require('../../simulation/twinleaf/agent11-rank1-dimensionvalley-energy-drive-probe.cjs');
const {continueOriginalRank1RaihanPaleMoon} =
  require('../../simulation/twinleaf/2026-11/agent34-rank1-original-raihan-palemoon-continuation.cjs');
const {executeReturnedNightWatch} =
  require('../../simulation/twinleaf/2026-11/agent11-rank1-returned-night-watch.cjs');
const {TARGET,runActualOriginalRank1MirrorPassProbe} =
  require('../../simulation/twinleaf/agent45-rank1-mirror-source-pass-native-probe.cjs');

const FROZEN_ROOT =
  '3f07a98bee3266a5866351307333d4ad1673ed9e3adb7f356c08cef1290c919a';

test('original source Raihan chooses actual third Psychic then tests next-turn Night Watch',()=>{
  const callback=context=>continueOriginalRank1RaihanPaleMoon({
    ...context,
    raihanPickPrinting:'Psychic Energy MEE',
    afterOpponentPass:executeReturnedNightWatch
  });
  const observer=(execute,deps)=>withRank1MirrorResourceAndAttackAudit(
    execute,{...deps,onSourcePass:(state,ownerId,view)=>
      probeStadiumThenEnergyDrive(state,ownerId,view,{
        afterSourcePromotion:callback
      })});
  const original=runActualOriginalRank1MirrorPassProbe({observer});
  const row=original.execution.rawDevelopment.rows.find(x=>x.trial?.id===TARGET);
  assert.ok(row);
  assert.equal(row.rootActionLedgerSha256,FROZEN_ROOT);
  assert.equal(row.actionCount,110);
  const event=original.mirrorSourcePass.audit.ownerPassResourceAudit
    .sourcePasses.find(x=>x.globalTurn===16)
    ?.detachedCounterfactual?.attackFollowthrough?.sourcePromotion
    ?.scopedContinuation;
  assert.ok(event);
  console.log('AGENT11_RAIHAN_THIRD_PSYCHIC_NIGHTWATCH',JSON.stringify({
    sourceOriginalRoot:row.rootActionLedgerSha256,
    actualRaihanSelection:event.raihanOwnDeckSelected,
    results:event.results.map(x=>({
      corrected:x.corrected,
      discardedPhysicalOpposingEnergy:x.discardedPhysicalOpposingEnergy,
      opponentRetreat:x.opponentRetreat.status,
      sourceNextTurn:x.opponentRetreat.sourceNextTurn
    }))
  }));
  assert.equal(event.status,'native-source-raihan-funded-two-arm-gx-settled');
  assert.equal(event.raihanOwnDeckSelected,'Psychic Energy MEE');
  const [pinned,corrected]=event.results;
  assert.equal(pinned.opponentRetreat.sourceNextTurn,null);
  assert.equal(corrected.opponentRetreat.status,'native-retreat-and-pass-settled');
  assert.equal(corrected.discardedPhysicalOpposingEnergy,3);
  const next=corrected.opponentRetreat.sourceNextTurn;
  assert.ok(next,'must audit returned actual owner turn in cloned state');
  assert.equal(next.sourceOwnerOnlyHandForChoice,true);
  assert.equal(next.hasHeldThirdPsychic,true);
  assert.equal(next.energyBefore.length,2);
  assert.equal(next.physicalEnergyMoved,true);
  assert.equal(next.energyAfter.length,3);
  assert.equal(next.attackAccepted,true,'three paid Psychic should permit Night Watch');
  assert.equal(next.errors.length,0);
  assert.equal(next.opponentDiscardedGirafarig,true);
  assert.equal(next.sourceRemainingPrizesBefore,6);
  assert.equal(next.sourceRemainingPrizesAfter,5,
    'source must actually take the Knock Out Prize');
  assert.equal(next.actualPrizeProgress,1);
  assert.equal(next.status,'native-night-watch-fully-settled');
  assert.deepEqual(next.unsettledPrompts,[]);
  assert.equal(next.nextActorId,202,
    'opposing owner must get the next meaningful turn');
  const random=next.promptTrace.find(x=>x.kind==='ChooseCardsPrompt');
  assert.ok(random?.resolved);
  assert.equal(random.concealedCardNamesReadForChoice,false);
  assert.equal(new Set(random.opaqueHandIndices).size,2);
  const prize=next.promptTrace.find(x=>x.kind==='ChoosePrizePrompt');
  assert.ok(prize?.resolved);
  assert.equal(prize.concealedPrizeFacesReadForChoice,false);
  const promotion=next.promptTrace.find(x=>x.kind==='ChoosePokemonPrompt');
  assert.ok(promotion?.resolved);
  assert.equal(promotion.choosingOwnerId,202);
});
