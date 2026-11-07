'use strict';
const assert=require('node:assert/strict');
const {runOne}=require('./agent37-simultaneous-ko-e21-promotion-native.cjs');
const {
  withInstanceScopedSimultaneousLastPrizeResolutionV2,
  resolveSimultaneousLastPrizeWinner,
  VERSION,PINNED
}=require('./agent37-paper-ko-simultaneous-last-prize-tie-v1.cjs');
const {inspectPowerglassWinningKo}=require('./agent37-powerglass-winning-ko-native.cjs');
const {GameWinner}=require('../../vendor/twinleaf/ptcg-server/output/game/store/state/state');
const {KnockOutEffect}=require('../../vendor/twinleaf/ptcg-server/output/game/store/effects/game-effects');


function withNonHandPrizeDestination(store,execute){
  return withInstanceScopedSimultaneousLastPrizeResolutionV2(store,()=>{
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

/** @returns {object} Native defect and terminal resolution adapter regression. */
function run(){
  const makePromotionPlayer=(id,canPromote)=>({
    id,
    bench:canPromote?[{getPokemonCard:()=>({})}]:[]
  });
  const p1=makePromotionPlayer(1,true);
  const p2=makePromotionPlayer(2,true);
  assert.equal(resolveSimultaneousLastPrizeWinner({players:[p1,p2]},p1,p2),GameWinner.DRAW);
  p1.bench=[];
  p2.bench=[];
  assert.equal(resolveSimultaneousLastPrizeWinner({players:[p1,p2]},p1,p2),GameWinner.DRAW);
  p1.bench=[{getPokemonCard:()=>({})}];
  assert.equal(resolveSimultaneousLastPrizeWinner({players:[p1,p2]},p1,p2),GameWinner.PLAYER_1);
  p1.bench=[];
  p2.bench=[{getPokemonCard:()=>({})}];
  assert.equal(resolveSimultaneousLastPrizeWinner({players:[p1,p2]},p1,p2),GameWinner.PLAYER_2);
  assert.equal(resolveSimultaneousLastPrizeWinner({players:[p2,p1]},p1,p2),GameWinner.PLAYER_1);
  const rows=[0,1].map(actorSeat=>{
    const baseline=runOne(actorSeat,false,1,true);
    const v2=runOne(actorSeat,true,1,true);
    const v3=runOne(actorSeat,withInstanceScopedSimultaneousLastPrizeResolutionV2,1,true);
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
    withStoreHook:withInstanceScopedSimultaneousLastPrizeResolutionV2
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

  // Rulebook §E mixed row: when both players take all Prizes and only one
  // has a Pokémon to promote, that player wins.
  const asymmetricPromotionAvailability=[0,1].map(actorSeat=>{
    const treatment=runOne(
      actorSeat,withInstanceScopedSimultaneousLastPrizeResolutionV2,1,true,false
    );
    const result=treatment.result,a=treatment.audit;
    assert.equal(result.finished,true);
    assert.equal(result.winnerSeat,actorSeat);
    assert.equal(result.ownerPrizesRemaining,0);
    assert.equal(result.opponentPrizesRemaining,0);
    assert.equal(a.knockoutEffects,2);
    assert.equal(a.activeKoPlayerIds.length,2);
    assert.equal(a.prizeGroupCount,2);
    assert.equal(a.firstPlayerCanPromote!==a.otherPlayerCanPromote,true);
    assert.equal(a.promotionAvailabilitySymmetric,false);
    assert.equal(a.simultaneousLastPrizeCandidate,true);
    assert.equal(a.secondPrizeTransferAttempted,true);
    assert.equal(a.secondPrizeTransferCompleted,true);
    assert.equal(a.tieApplied,false);
    assert.equal(a.expectedWinner,actorSeat===0?GameWinner.PLAYER_1:GameWinner.PLAYER_2);
    assert.equal(a.winnerOverridden,a.nativeWinner!==a.expectedWinner);
    assert.equal(a.winnerLogHandled,true);
    assert.equal(a.winnerLogRewritten,a.winnerOverridden);
    return {
      actorSeat,
      firstPlayerCanPromote:a.firstPlayerCanPromote,
      otherPlayerCanPromote:a.otherPlayerCanPromote,
      promotionAvailabilitySymmetric:a.promotionAvailabilitySymmetric,
      terminalOutcome:a.terminalOutcome,
      nativeWinner:a.nativeWinner,
      expectedWinner:a.expectedWinner,
      winnerOverridden:a.winnerOverridden,
      winnerSeat:result.winnerSeat
    };
  });

  return {
    schema:'agent37-simultaneous-last-prize-resolution-native-v2',
    pinnedTwinleaf:PINNED,
    hook:VERSION,
    paperRule:'Rulebook §E: simultaneous Prize exhaustion is a draw when promotion availability matches; the only player able to promote wins when it differs',
    nativeDefectConfirmedBothSeats:true,
    simultaneousLastPrizeResolutionBothSeats:true,
    bothPrizeTransfersVerified:true,
    drawLogAndWinnerVerified:true,
    singlePlayerLastPrizeControlPreserved:true,
    nonHandPrizeDestinationControlPreserved:true,
    asymmetricPromotionAvailabilityWinnerCorrected:true,
    mixedTerminalRowsSupported:true,
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
