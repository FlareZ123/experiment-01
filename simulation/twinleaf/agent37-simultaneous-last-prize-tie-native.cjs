'use strict';
const assert=require('node:assert/strict');
const {runOne}=require('./agent37-simultaneous-ko-e21-promotion-native.cjs');
const {
  withInstanceScopedSimultaneousLastPrizeTieV1,VERSION,PINNED
}=require('./agent37-paper-ko-simultaneous-last-prize-tie-v1.cjs');
const {inspectPowerglassWinningKo}=require('./agent37-powerglass-winning-ko-native.cjs');
const {GameWinner}=require('../../vendor/twinleaf/ptcg-server/output/game/store/state/state');
const {KnockOutEffect}=require('../../vendor/twinleaf/ptcg-server/output/game/store/effects/game-effects');


function withNonHandPrizeDestination(store,execute){
  return withInstanceScopedSimultaneousLastPrizeTieV1(store,()=>{
    const hookedReduce=store.reduceEffect;
    store.reduceEffect=function(state,effect){
      if(effect instanceof KnockOutEffect){
        const taker=state.players.find(p=>p.id!==effect.player.id);
        assert.ok(taker);
        effect.prizeDestination=taker.discard;
      }
      return hookedReduce.call(store,state,effect);
    };
    return execute();
  });
}

/** @returns {object} Native defect and terminal tie adapter regression. */
function run(){
  const rows=[0,1].map(actorSeat=>{
    const baseline=runOne(actorSeat,false,1,true);
    const v2=runOne(actorSeat,true,1,true);
    const v3=runOne(actorSeat,withInstanceScopedSimultaneousLastPrizeTieV1,1,true);
    const b=baseline.result,old=v2.result,fixed=v3.result,a=v3.audit;

    assert.equal(b.finished,true);
    assert.equal(old.finished,true);
    assert.equal(b.winnerSeat,0);
    assert.equal(old.winnerSeat,0);
    assert.equal(b.ownerPrizesRemaining,actorSeat===0?0:1);
    assert.equal(b.opponentPrizesRemaining,actorSeat===0?1:0);
    assert.equal(old.ownerPrizesRemaining,b.ownerPrizesRemaining);
    assert.equal(old.opponentPrizesRemaining,b.opponentPrizesRemaining);

    assert.equal(fixed.finished,true);
    assert.equal(fixed.winner,GameWinner.DRAW);
    assert.equal(fixed.winnerSeat,null);
    assert.equal(fixed.winnerPlayer,null);
    assert.equal(fixed.ownerPrizesRemaining,0);
    assert.equal(fixed.opponentPrizesRemaining,0);
    assert.equal(fixed.promotionOrder.length,0);
    assert.equal(fixed.seenPrompts.includes('ChoosePrizePrompt'),false);
    assert.equal(fixed.seenPrompts.includes('ChoosePokemonPrompt'),false);
    assert.equal(fixed.seenPrompts.includes('AttachEnergyPrompt'),false);

    assert.equal(a.simultaneousLastPrizeCandidate,true);
    assert.equal(a.secondPrizeTransferAttempted,true);
    assert.equal(a.secondPrizeTransferCompleted,true);
    assert.equal(a.firstPrizeDestinationIsHand,true);
    assert.equal(a.secondPrizeDestinationIsHand,true);
    assert.equal(a.bothPrizeTransfersCompleted,true);
    assert.equal(a.winnerLogRewritten,true);
    assert.equal(a.tieApplied,true);
    assert.equal(a.terminalSuppressed,1);
    assert.equal(a.storeLogRestored,true);
    assert.equal(a.storeReduceRestored,true);
    assert.equal(a.otherStoresUnmodified,true);

    return {
      actorSeat,
      paperExpectedOutcome:'Tie',
      nativeOutcome:b.winnerPlayer,
      nativePrizeCounts:{owner:b.ownerPrizesRemaining,opponent:b.opponentPrizesRemaining},
      v2Outcome:old.winnerPlayer,
      v3Outcome:'DRAW',
      v3PrizeCounts:{owner:fixed.ownerPrizesRemaining,opponent:fixed.opponentPrizesRemaining},
      v3Audit:a
    };
  });

  const singleLastPrize=inspectPowerglassWinningKo({
    actorSeat:0,lastPrize:true,opponentHasBench:true,settleAll:true,
    withStoreHook:withInstanceScopedSimultaneousLastPrizeTieV1
  });
  assert.equal(singleLastPrize.finalState.finished,true);
  assert.equal(singleLastPrize.scopedHookAudit.simultaneousLastPrizeCandidate,false);
  assert.equal(singleLastPrize.scopedHookAudit.tieApplied,false);
  assert.equal(singleLastPrize.scopedHookAudit.winnerLogRewritten,false);
  assert.equal(singleLastPrize.scopedHookAudit.terminalSuppressed,1);
  assert.equal(singleLastPrize.finalState.ownerPrizesRemaining,0);
  assert.equal(singleLastPrize.finalState.sourcePrizesRemaining,6);

  const nonHandDestination=[0,1].map(actorSeat=>{
    const treatment=runOne(actorSeat,withNonHandPrizeDestination,1,true);
    const result=treatment.result,a=treatment.audit;
    assert.equal(a.knockoutEffects,2);
    assert.equal(a.activeKoPlayerIds.length,2);
    assert.equal(a.prizeGroupCount,2);
    assert.equal(a.simultaneousLastPrizeCandidate,false);
    assert.equal(a.secondPrizeTransferAttempted,false);
    assert.equal(a.secondPrizeTransferCompleted,false);
    assert.equal(a.tieApplied,false);
    assert.equal(a.winnerLogRewritten,false);
    assert.equal(a.storeLogRestored,true);
    assert.equal(a.storeReduceRestored,true);
    return {
      actorSeat,
      simultaneousLastPrizeCandidate:a.simultaneousLastPrizeCandidate,
      secondPrizeTransferAttempted:a.secondPrizeTransferAttempted,
      tieApplied:a.tieApplied,
      ownerPrizesRemaining:result.ownerPrizesRemaining,
      opponentPrizesRemaining:result.opponentPrizesRemaining
    };
  });

  // Rulebook §E has mixed terminal rows: if both players take all Prizes
  // but only one can promote, the player who can promote wins. This tie-only
  // adapter must decline to call that case a draw.
  const asymmetricPromotionAvailability=[0,1].map(actorSeat=>{
    const treatment=runOne(
      actorSeat,withInstanceScopedSimultaneousLastPrizeTieV1,1,true,false
    );
    const result=treatment.result,a=treatment.audit;
    assert.equal(a.knockoutEffects,2);
    assert.equal(a.activeKoPlayerIds.length,2);
    assert.equal(a.prizeGroupCount,2);
    assert.equal(a.firstPlayerCanPromote!==a.otherPlayerCanPromote,true);
    assert.equal(a.promotionAvailabilitySymmetric,false);
    assert.equal(a.simultaneousLastPrizeCandidate,false);
    assert.equal(a.secondPrizeTransferAttempted,false);
    assert.equal(a.tieApplied,false);
    assert.equal(a.winnerLogRewritten,false);
    return {
      actorSeat,
      firstPlayerCanPromote:a.firstPlayerCanPromote,
      otherPlayerCanPromote:a.otherPlayerCanPromote,
      promotionAvailabilitySymmetric:a.promotionAvailabilitySymmetric,
      tieApplied:a.tieApplied,
      nativeWinnerSeat:result.winnerSeat
    };
  });

  return {
    schema:'agent37-simultaneous-last-prize-tie-native-v1',
    pinnedTwinleaf:PINNED,
    hook:VERSION,
    paperRule:'Rulebook §E: simultaneous loss conditions tie; asymmetric promotion availability is a winner case',
    nativeDefectConfirmedBothSeats:true,
    v3TieCorrectionBothSeats:true,
    bothPrizeTransfersVerified:true,
    drawLogAndWinnerVerified:true,
    singlePlayerLastPrizeControlPreserved:true,
    nonHandPrizeDestinationControlPreserved:true,
    asymmetricPromotionAvailabilityControlPreserved:true,
    mixedTerminalRowsSupported:false,
    competitiveGamesQualified:0,
    rows,
    controls:{
      singleLastPrize,nonHandDestination,asymmetricPromotionAvailability
    }
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
