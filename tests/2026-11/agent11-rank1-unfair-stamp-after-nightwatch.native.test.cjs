'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withRank1MirrorResourceAndAttackAudit}=
  require('../../simulation/twinleaf/agent11-rank1-mirror-owner-pass-resources.cjs');
const {probeStadiumThenEnergyDrive}=
  require('../../simulation/twinleaf/agent11-rank1-dimensionvalley-energy-drive-probe.cjs');
const {continueOriginalRank1RaihanPaleMoon}=
  require('../../simulation/twinleaf/2026-11/agent34-rank1-original-raihan-palemoon-continuation.cjs');
const {executeReturnedNightWatch}=
  require('../../simulation/twinleaf/2026-11/agent11-rank1-returned-night-watch.cjs');
const {respondWithOwnedUnfairStamp}=
  require('../../simulation/twinleaf/2026-11/agent11-rank1-next-opponent-unfair-stamp.cjs');
const {TARGET,runActualOriginalRank1MirrorPassProbe}=
  require('../../simulation/twinleaf/agent45-rank1-mirror-source-pass-native-probe.cjs');

test('original source Night Watch Prize activates genuine opposing held Unfair Stamp',()=>{
  const callback=context=>continueOriginalRank1RaihanPaleMoon({
    ...context,raihanPickPrinting:'Psychic Energy MEE',
    afterOpponentPass:context=>executeReturnedNightWatch({
      ...context,afterNightWatch:respondWithOwnedUnfairStamp
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
  const branch=original.mirrorSourcePass.audit.ownerPassResourceAudit
    .sourcePasses.find(x=>x.globalTurn===16)
    ?.detachedCounterfactual?.attackFollowthrough?.sourcePromotion
    ?.scopedContinuation?.results?.find(x=>x.corrected);
  assert.ok(branch);
  const next=branch.opponentRetreat.sourceNextTurn;
  assert.equal(next.status,'native-night-watch-fully-settled');
  assert.equal(next.sourceRemainingPrizesAfter,5);
  const reply=next.nextOpponentResponse;
  console.log('AGENT11_SOURCE_RANK1_POST_NIGHTWATCH_OPP_STAMP_NATIVE',
    JSON.stringify({originalRoot:row.rootActionLedgerSha256,
      sourceOriginalPrizeAfterNightWatch:next.sourceRemainingPrizesAfter,
      opponentOwnerReply:reply}));
  assert.ok(reply);
  assert.equal(reply.originalSourcePreserved,true);
  assert.equal(reply.ownerInfoOnly,true);
  assert.equal(reply.opponentActorId,202);
  assert.equal(reply.sourceActorId,101);
  assert.equal(reply.hasPhysicallyHeldStamp,true);
  assert.equal(reply.stampNativeAccepted,true);
  assert.equal(reply.stampDiscardedPhysical,true);
  assert.equal(reply.ownerHandCountAfter,5);
  assert.equal(reply.sourceHandCountAfter,2);
  assert.deepEqual(reply.remainingPromptKinds,[]);
  assert.equal(reply.stage,'native-owned-unfair-stamp-five-versus-two-settled');
  assert.equal(reply.errors.length,0);
  assert.equal(reply.nextActorId,202);
  assert.equal(branch.opponentRetreat.status,'native-retreat-and-pass-settled');
});
