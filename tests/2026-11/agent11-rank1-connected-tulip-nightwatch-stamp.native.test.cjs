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
const {executeReturnedNightWatch}=
  require('../../simulation/twinleaf/2026-11/agent11-rank1-returned-night-watch.cjs');
const {respondWithOwnedUnfairStamp}=
  require('../../simulation/twinleaf/2026-11/agent11-rank1-next-opponent-unfair-stamp.cjs');
const {TARGET,runActualOriginalRank1MirrorPassProbe}=
  require('../../simulation/twinleaf/agent45-rank1-mirror-source-pass-native-probe.cjs');

test('single original source through opponent Tulip, real Night Watch Prize and owner Stamp',()=>{
  const followSource=ctx=>executeReturnedNightWatch({
    ...ctx,afterNightWatch:respondWithOwnedUnfairStamp
  });
  const callback=context=>continueOriginalRank1RaihanPaleMoon({
    ...context,raihanPickPrinting:'Psychic Energy MEE',
    afterOpponentRetreat:x=>({
      getlost:executeOpponentTulipRebuild(x,{
        manualTarget:'girafarig',afterOpponentTurn:followSource
      }),
      poweredLatias:executeOpponentTulipRebuild(x,{
        manualTarget:'latias',afterOpponentTurn:followSource
      })
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
  const corrected=original.mirrorSourcePass.audit.ownerPassResourceAudit
    .sourcePasses.find(x=>x.globalTurn===16)
    ?.detachedCounterfactual?.attackFollowthrough?.sourcePromotion
    ?.scopedContinuation?.results?.find(x=>x.corrected);
  assert.ok(corrected);
  const counter=corrected.opponentRetreat.ownerCounterReply;
  assert.ok(counter);
  const report={originalRoot:row.rootActionLedgerSha256,
    results:{}};
  for(const [name,arm] of Object.entries(counter)){
    const next=arm.sourceNextTurn;
    report.results[name]={
      opponentStage:arm.stage,
      opponentPostGXLatiasPsy:arm.latiasEnergyAfterManual?.length??null,
      publicLostZoneDelta:arm.actualSourceLostZoneDelta??0,
      nextSource:next?{
        turn:next.sourceTurn,
        hasPhysicalPsychic:next.hasHeldThirdPsychic,
        attackAccepted:next.attackAccepted,
        sourcePrizesBefore:next.sourceRemainingPrizesBefore,
        sourcePrizesAfter:next.sourceRemainingPrizesAfter,
        opponentPromoted:next.opponentActiveAfter,
        paidEnergy:next.energyAfter?.length,
        stage:next.status,
        nextOwnerUnfairStamp:next.nextOpponentResponse?{
          nativeStage:next.nextOpponentResponse.stage,
          hasHeld:next.nextOpponentResponse.hasPhysicallyHeldStamp,
          ownerHandAfter:next.nextOpponentResponse.ownerHandCountAfter,
          sourceHandAfter:next.nextOpponentResponse.sourceHandCountAfter,
          nextActor:next.nextOpponentResponse.nextActorId
        }:null
      }:null
    };
    assert.ok(arm.stage.startsWith('native-tulip-vmax-underworld'));
    assert.ok(next,'true next source turn required after native opponent');
    assert.equal(next.sourceTurn,20);
    assert.equal(next.hasHeldThirdPsychic,true);
    assert.equal(next.attackAccepted,true);
    assert.equal(next.status,'native-night-watch-fully-settled');
    assert.equal(next.sourceRemainingPrizesBefore,6);
    assert.equal(next.sourceRemainingPrizesAfter,5);
    assert.equal(next.opponentDiscardedGirafarig,true);
    assert.deepEqual(next.unsettledPrompts,[]);
    assert.equal(next.errors.length,0);
    assert.ok(next.nextOpponentResponse);
    if(next.nextOpponentResponse.hasPhysicallyHeldStamp){
      assert.equal(next.nextOpponentResponse.stage,
        'native-owned-unfair-stamp-five-versus-two-settled');
      assert.equal(next.nextOpponentResponse.sourceHandCountAfter,2);
    }
  }
  assert.equal(counter.getlost.physicalSourceCardsBanished,2);
  assert.equal(counter.poweredLatias.latiasEnergyAfterManual.length,3);
  console.log('AGENT11_ORIGINAL_RANK1_CONNECTED_TULIP_NIGHTWATCH_STAMP',
    JSON.stringify(report));
});
