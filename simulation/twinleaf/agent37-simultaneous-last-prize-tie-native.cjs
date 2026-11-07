'use strict';
const assert=require('node:assert/strict');
const {runOne}=require('./agent37-simultaneous-ko-e21-promotion-native.cjs');
const {
  withInstanceScopedSimultaneousLastPrizeResolutionV3,
  resolveSimultaneousLastPrizeWinner,
  VERSION,PINNED
}=require('./agent37-paper-ko-simultaneous-last-prize-tie-v1.cjs');
const {inspectPowerglassWinningKo}=require('./agent37-powerglass-winning-ko-native.cjs');
const {GameWinner}=require('../../vendor/twinleaf/ptcg-server/output/game/store/state/state');
const {GameLog}=require('../../vendor/twinleaf/ptcg-server/output/game/game-message');
const {KnockOutEffect}=require('../../vendor/twinleaf/ptcg-server/output/game/store/effects/game-effects');

function assertNativeWinnerLogReceipt(a,actorSeat,firstPlayerHasBench){
  const firstName=actorSeat===0?'Ferroseed attacker':'Duskull defender';
  const firstId=actorSeat===0?101:202;
  if(firstPlayerHasBench){
    assert.equal(a.nativeWinnerLogMessage,GameLog.LOG_GAME_FINISHED_WINNER);
    assert.equal(a.nativeWinner,GameWinner.PLAYER_1);
    assert.equal(a.nativeWinnerName,firstName);
    assert.equal(a.nativeWinnerPlayerId,firstId);
    assert.equal(a.nativeWinnerLogName,firstName);
    assert.deepEqual(a.nativeWinnerLogParams,{name:firstName});
    return;
  }
  assert.ok(
    a.nativeWinnerLogMessage===GameLog.LOG_GAME_FINISHED_WINNER||
    a.nativeWinnerLogMessage===GameLog.LOG_GAME_FINISHED_DRAW
  );
  if(a.nativeWinnerLogMessage===GameLog.LOG_GAME_FINISHED_DRAW){
    assert.equal(a.nativeWinner,GameWinner.DRAW);
    assert.equal(a.nativeWinnerName,null);
    assert.equal(a.nativeWinnerPlayerId,null);
    assert.equal(a.nativeWinnerLogName,null);
    assert.equal(a.nativeWinnerLogParams,null);
    return;
  }
  assert.equal(a.nativeWinner,GameWinner.PLAYER_1);
  assert.equal(a.nativeWinnerName,firstName);
  assert.equal(a.nativeWinnerPlayerId,firstId);
  assert.equal(a.nativeWinnerLogName,firstName);
  assert.deepEqual(a.nativeWinnerLogParams,{name:firstName});
}


function withNonHandPrizeDestination(store,execute){
  return withInstanceScopedSimultaneousLastPrizeResolutionV3(store,()=>{
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
    const v3=runOne(actorSeat,withInstanceScopedSimultaneousLastPrizeResolutionV3,1,true);
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
    assert.equal(a.winnerLogRewritten,
      a.nativeWinner!==a.expectedWinner||
      a.nativeWinnerLogMessage!==a.winnerLogMessage||
      a.nativeWinnerLogName!==a.winnerLogName);
    assert.equal(a.winnerLogMessage,GameLog.LOG_GAME_FINISHED_DRAW);
    assert.equal(a.winnerLogName,null);
    assert.equal(a.winnerLogParams,null);
    assert.equal(a.nativeWinner,GameWinner.PLAYER_1);
    assertNativeWinnerLogReceipt(a,actorSeat,true);
    assert.equal(a.nativeWinnerLogMessage,GameLog.LOG_GAME_FINISHED_WINNER);
    assert.equal(a.nativeWinnerLogName,a.nativeWinnerName);
    assert.deepEqual(a.nativeWinnerLogParams,{name:a.nativeWinnerName});
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
    withStoreHook:withInstanceScopedSimultaneousLastPrizeResolutionV3
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
      actorSeat,withInstanceScopedSimultaneousLastPrizeResolutionV3,1,true,false
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
    assertNativeWinnerLogReceipt(a,actorSeat,actorSeat===0);
    assert.equal(a.winnerOverridden,a.nativeWinner!==a.expectedWinner);
    assert.equal(a.winnerLogHandled,true);
    assert.equal(a.winnerLogMessage,GameLog.LOG_GAME_FINISHED_WINNER);
    assert.equal(a.winnerLogName,'Ferroseed attacker');
    assert.deepEqual(a.winnerLogParams,{name:'Ferroseed attacker'});
    assert.equal(a.winnerLogRewritten,
      a.nativeWinner!==a.expectedWinner||
      a.nativeWinnerLogMessage!==a.winnerLogMessage||
      a.nativeWinnerLogName!==a.winnerLogName);
    return {
      actorSeat,
      firstPlayerCanPromote:a.firstPlayerCanPromote,
      otherPlayerCanPromote:a.otherPlayerCanPromote,
      promotionAvailabilitySymmetric:a.promotionAvailabilitySymmetric,
      terminalOutcome:a.terminalOutcome,
      nativeWinner:a.nativeWinner,
      nativeWinnerName:a.nativeWinnerName,
      expectedWinner:a.expectedWinner,
      winnerOverridden:a.winnerOverridden,
      winnerLogMessage:a.winnerLogMessage,
      winnerLogName:a.winnerLogName,
      winnerSeat:result.winnerSeat
    };
  });

  const opponentOnlyPromotionAvailability=[0,1].map(actorSeat=>{
    const treatment=runOne(
      actorSeat,withInstanceScopedSimultaneousLastPrizeResolutionV3,1,true,true,false
    );
    const result=treatment.result,a=treatment.audit;
    assert.equal(result.finished,true);
    assert.equal(result.winnerSeat,1-actorSeat);
    assert.equal(result.winnerPlayer,'opponent');
    assert.equal(result.ownerPrizesRemaining,0);
    assert.equal(result.opponentPrizesRemaining,0);
    assert.equal(a.knockoutEffects,2);
    assert.equal(a.activeKoPlayerIds.length,2);
    assert.equal(a.prizeGroupCount,2);
    assert.equal(a.firstPlayerCanPromote,actorSeat===1);
    assert.equal(a.otherPlayerCanPromote,actorSeat===0);
    assert.equal(a.promotionAvailabilitySymmetric,false);
    assert.equal(a.simultaneousLastPrizeCandidate,true);
    assert.equal(a.secondPrizeTransferAttempted,true);
    assert.equal(a.secondPrizeTransferCompleted,true);
    assert.equal(a.tieApplied,false);
    assert.equal(a.expectedWinner,actorSeat===0?GameWinner.PLAYER_2:GameWinner.PLAYER_1);
    assertNativeWinnerLogReceipt(a,actorSeat,actorSeat===1);
    assert.equal(a.winnerOverridden,a.nativeWinner!==a.expectedWinner);
    assert.equal(a.winnerLogHandled,true);
    assert.equal(a.winnerLogMessage,GameLog.LOG_GAME_FINISHED_WINNER);
    assert.equal(a.winnerLogName,'Duskull defender');
    assert.deepEqual(a.winnerLogParams,{name:'Duskull defender'});
    assert.equal(a.winnerLogRewritten,
      a.nativeWinner!==a.expectedWinner||
      a.nativeWinnerLogMessage!==a.winnerLogMessage||
      a.nativeWinnerLogName!==a.winnerLogName);
    assert.equal(a.terminalSuppressed,1);
    assert.equal(a.storeLogRestored,true);
    assert.equal(a.storeReduceRestored,true);
    assert.equal(a.otherStoresUnmodified,true);
    return {
      actorSeat,
      firstPlayerCanPromote:a.firstPlayerCanPromote,
      otherPlayerCanPromote:a.otherPlayerCanPromote,
      nativeWinner:a.nativeWinner,
      expectedWinner:a.expectedWinner,
      winnerOverridden:a.winnerOverridden,
      winnerLogName:a.winnerLogName,
      winnerSeat:result.winnerSeat
    };
  });

  const neitherCanPromote=[0,1].map(actorSeat=>{
    const treatment=runOne(
      actorSeat,withInstanceScopedSimultaneousLastPrizeResolutionV3,1,true,false,false
    );
    const result=treatment.result,a=treatment.audit;
    assert.equal(result.finished,true);
    assert.equal(result.winner,GameWinner.DRAW);
    assert.equal(result.winnerSeat,null);
    assert.equal(result.winnerPlayer,null);
    assert.equal(result.ownerPrizesRemaining,0);
    assert.equal(result.opponentPrizesRemaining,0);
    assert.equal(result.ownerActive,null);
    assert.equal(result.opponentActive,null);
    assert.equal(result.promotionOrder.length,0);
    assert.equal(a.knockoutEffects,2);
    assert.equal(a.activeKoPlayerIds.length,2);
    assert.equal(a.prizeGroupCount,2);
    assert.equal(a.firstPlayerCanPromote,false);
    assert.equal(a.otherPlayerCanPromote,false);
    assert.equal(a.promotionAvailabilitySymmetric,true);
    assert.equal(a.simultaneousLastPrizeCandidate,true);
    assert.equal(a.secondPrizeTransferAttempted,true);
    assert.equal(a.secondPrizeTransferCompleted,true);
    assert.equal(a.tieApplied,true);
    assertNativeWinnerLogReceipt(a,actorSeat,false);
    assert.equal(a.expectedWinner,GameWinner.DRAW);
    assert.equal(a.winnerOverridden,a.nativeWinner!==a.expectedWinner);
    assert.equal(a.winnerLogHandled,true);
    assert.equal(a.winnerLogMessage,GameLog.LOG_GAME_FINISHED_DRAW);
    assert.equal(a.winnerLogName,null);
    assert.equal(a.winnerLogParams,null);
    assert.equal(a.winnerLogRewritten,
      a.nativeWinner!==a.expectedWinner||
      a.nativeWinnerLogMessage!==a.winnerLogMessage||
      a.nativeWinnerLogName!==a.winnerLogName);
    assert.equal(a.terminalSuppressed,1);
    assert.equal(a.storeLogRestored,true);
    assert.equal(a.storeReduceRestored,true);
    assert.equal(a.otherStoresUnmodified,true);
    return {
      actorSeat,
      firstPlayerCanPromote:a.firstPlayerCanPromote,
      otherPlayerCanPromote:a.otherPlayerCanPromote,
      nativeWinner:a.nativeWinner,
      expectedWinner:a.expectedWinner,
      winnerOverridden:a.winnerOverridden,
      winnerLogMessage:a.winnerLogMessage,
      terminalOutcome:a.terminalOutcome
    };
  });

  const prizeProfiles=[
    {name:'exact-3-to-1',ownerPrizes:3,enemyPrizes:1,ownerTaken:3,opponentTaken:1},
    {name:'overkill-3-to-1',ownerPrizes:2,enemyPrizes:1,ownerTaken:2,opponentTaken:1}
  ];
  const asymmetricPrizeGroupCounts=prizeProfiles.flatMap(profile=>
    [0,1].flatMap(actorSeat=>{
      const cases=[
        {name:'both-can-promote',enemyHasBench:true,ownerHasBench:true,expected:GameWinner.DRAW},
        {name:'owner-only-promotes',enemyHasBench:false,ownerHasBench:true,
          expected:actorSeat===0?GameWinner.PLAYER_1:GameWinner.PLAYER_2},
        {name:'opponent-only-promotes',enemyHasBench:true,ownerHasBench:false,
          expected:actorSeat===0?GameWinner.PLAYER_2:GameWinner.PLAYER_1},
        {name:'neither-can-promote',enemyHasBench:false,ownerHasBench:false,expected:GameWinner.DRAW}
      ];
      return cases.map(testCase=>{
        const treatment=runOne(
          actorSeat,
          withInstanceScopedSimultaneousLastPrizeResolutionV3,
          3,
          true,
          testCase.enemyHasBench,
          testCase.ownerHasBench,
          {
            enemyActiveName:'Shadow Rider Calyrex VMAX CRE',
            enemyEvolutionBaseName:'Shadow Rider Calyrex V CRE',
            enemyActiveDamage:260,
            ownerPrizes:profile.ownerPrizes,
            enemyPrizes:profile.enemyPrizes
          }
        );
        const result=treatment.result,a=treatment.audit;
        assert.equal(result.finished,true);
        assert.equal(result.winner,testCase.expected);
        assert.equal(result.winnerSeat,
          testCase.expected===GameWinner.DRAW?null:
            testCase.expected===GameWinner.PLAYER_1?0:1);
        assert.equal(result.ownerPrizesRemaining,0);
        assert.equal(result.opponentPrizesRemaining,0);
        assert.equal(result.ownerPrizesTakenThisTurn,profile.ownerTaken);
        assert.equal(result.opponentPrizesTakenThisTurn,profile.opponentTaken);
        assert.equal(result.seenPrompts.includes('ChoosePrizePrompt'),false);
        assert.equal(result.seenPrompts.includes('ChoosePokemonPrompt'),false);
        assert.equal(result.seenPrompts.includes('AttachEnergyPrompt'),false);
        assert.equal(a.knockoutEffects,2);
        assert.equal(a.activeKoPlayerIds.length,2);
        assert.equal(a.prizeGroupCount,2);
        assert.equal(a.simultaneousLastPrizeCandidate,true);
        assert.equal(a.secondPrizeTransferAttempted,true);
        assert.equal(a.secondPrizeTransferCompleted,true);
        assert.equal(a.firstPrizeDestinationIsHand,true);
        assert.equal(a.secondPrizeDestinationIsHand,true);
        assert.equal(a.bothPrizeTransfersCompleted,true);
        assert.deepEqual(a.knockoutPrizeCounts.map(x=>x.prizeCount).sort(),[1,3]);
        const koCounts=Object.fromEntries(
          a.knockoutPrizeCounts.map(x=>[x.targetPrinting,x.prizeCount])
        );
        assert.equal(koCounts['Ferroseed NXD'],1);
        assert.equal(koCounts['Shadow Rider Calyrex VMAX CRE'],3);
        assert.deepEqual(a.prizeGroupCounts.map(x=>x.count).sort(),[1,3]);
        assert.equal(a.prizeGroupCounts.every(x=>x.destinationIsHand),true);
        assert.equal(a.firstPlayerCanPromote,
          actorSeat===0?testCase.ownerHasBench:testCase.enemyHasBench);
        assert.equal(a.otherPlayerCanPromote,
          actorSeat===0?testCase.enemyHasBench:testCase.ownerHasBench);
        assert.equal(a.promotionAvailabilitySymmetric,
          testCase.ownerHasBench===testCase.enemyHasBench);
        assert.equal(a.expectedWinner,testCase.expected);
        assert.equal(a.winnerOverridden,a.nativeWinner!==a.expectedWinner);
        assert.equal(a.winnerLogMessage,
          testCase.expected===GameWinner.DRAW
            ?GameLog.LOG_GAME_FINISHED_DRAW
            :GameLog.LOG_GAME_FINISHED_WINNER);
        const expectedLogName=testCase.expected===GameWinner.DRAW?null:
          testCase.expected===GameWinner.PLAYER_1
            ?(actorSeat===0?'Ferroseed attacker':'Duskull defender')
            :(actorSeat===0?'Duskull defender':'Ferroseed attacker');
        assert.equal(a.winnerLogName,expectedLogName);
        assert.deepEqual(a.winnerLogParams,
          expectedLogName===null?null:{name:expectedLogName});
        assert.equal(a.winnerLogHandled,true);
        assert.equal(a.terminalSuppressed,1);
        assert.equal(a.storeLogRestored,true);
        assert.equal(a.storeReduceRestored,true);
        assert.equal(a.otherStoresUnmodified,true);
        assertNativeWinnerLogReceipt(a,actorSeat,
          actorSeat===0?testCase.ownerHasBench:testCase.enemyHasBench);
        return {
          actorSeat,
          prizeProfile:profile.name,
          scenario:testCase.name,
          expectedOutcome:testCase.expected===GameWinner.DRAW?'DRAW':
            testCase.expected===GameWinner.PLAYER_1?'PLAYER_1':'PLAYER_2',
          actualOutcome:result.winner===GameWinner.DRAW?'DRAW':
            result.winner===GameWinner.PLAYER_1?'PLAYER_1':'PLAYER_2',
          initialPrizeCounts:{owner:profile.ownerPrizes,opponent:profile.enemyPrizes},
          prizesTakenThisTurn:{
            owner:result.ownerPrizesTakenThisTurn,
            opponent:result.opponentPrizesTakenThisTurn
          },
          remainingPrizes:{
            owner:result.ownerPrizesRemaining,
            opponent:result.opponentPrizesRemaining
          },
          knockoutPrizeCounts:a.knockoutPrizeCounts.map(x=>({
            targetPrinting:x.targetPrinting,prizeCount:x.prizeCount
          })),
          prizeGroupCounts:a.prizeGroupCounts.map(x=>({
            count:x.count,destinationIsHand:x.destinationIsHand
          })),
          nativeWinner:a.nativeWinner,
          expectedWinner:a.expectedWinner,
          winnerOverridden:a.winnerOverridden,
          winnerLogName:a.winnerLogName
        };
      });
    })
  );

  const mixedFinalPrizeProfiles=[
    {name:'owner-final',ownerPrizes:1,enemyPrizes:6,finalTaker:'owner'},
    {name:'opponent-final',ownerPrizes:6,enemyPrizes:1,finalTaker:'opponent'}
  ];
  const mixedTerminalRows=mixedFinalPrizeProfiles.flatMap(profile=>
    [0,1].flatMap(actorSeat=>{
      const cases=[
        {name:'both-can-promote',ownerHasBench:true,enemyHasBench:true},
        {name:'owner-only-promotes',ownerHasBench:true,enemyHasBench:false},
        {name:'opponent-only-promotes',ownerHasBench:false,enemyHasBench:true},
        {name:'neither-can-promote',ownerHasBench:false,enemyHasBench:false}
      ];
      return cases.map(testCase=>{
        const treatment=runOne(
          actorSeat,
          withInstanceScopedSimultaneousLastPrizeResolutionV3,
          6,
          true,
          testCase.enemyHasBench,
          testCase.ownerHasBench,
          {
            enemyActiveName:'Shadow Rider Calyrex VMAX CRE',
            enemyEvolutionBaseName:'Shadow Rider Calyrex V CRE',
            enemyActiveDamage:260,
            ownerPrizes:profile.ownerPrizes,
            enemyPrizes:profile.enemyPrizes,
            stopAfterAttack:true
          }
        );
        const result=treatment.result,a=treatment.audit;
        const finalTakerCanPromote=profile.finalTaker==='owner'
          ?testCase.ownerHasBench:testCase.enemyHasBench;
        const otherCanPromote=profile.finalTaker==='owner'
          ?testCase.enemyHasBench:testCase.ownerHasBench;
        const expectedOutcome=!finalTakerCanPromote&&otherCanPromote
          ?'DRAW':profile.finalTaker;
        const actualOutcome=result.winnerPlayer??'DRAW';
        const expectedOwnerTaken=profile.ownerPrizes===1
          ?1:(actorSeat===0&&!testCase.enemyHasBench?3:0);
        const expectedOpponentTaken=profile.enemyPrizes===1
          ?1:(actorSeat===1&&!testCase.ownerHasBench?1:0);
        assert.equal(result.finished,true);
        assert.equal(result.winnerPlayer,profile.finalTaker);
        assert.equal(result.winnerSeat,
          profile.finalTaker==='owner'?actorSeat:1-actorSeat);
        assert.deepEqual(result.pendingPrompts,[]);
        assert.equal(result.ownerPrizesTakenThisTurn,expectedOwnerTaken);
        assert.equal(result.opponentPrizesTakenThisTurn,expectedOpponentTaken);
        assert.equal(result.ownerPrizesRemaining,
          profile.ownerPrizes-expectedOwnerTaken);
        assert.equal(result.opponentPrizesRemaining,
          profile.enemyPrizes-expectedOpponentTaken);
        assert.equal(a.simultaneousLastPrizeCandidate,false);
        assert.equal(a.storeLogRestored,true);
        assert.equal(a.storeReduceRestored,true);
        assert.equal(a.otherStoresUnmodified,true);
        return {
          profile:profile.name,
          finalTaker:profile.finalTaker,
          actorSeat,
          scenario:testCase.name,
          ownerCanPromote:testCase.ownerHasBench,
          opponentCanPromote:testCase.enemyHasBench,
          paperOutcome:expectedOutcome,
          nativeOutcome:actualOutcome,
          nativeMatchesPaper:actualOutcome===expectedOutcome,
          ownerPrizesTakenThisTurn:result.ownerPrizesTakenThisTurn,
          opponentPrizesTakenThisTurn:result.opponentPrizesTakenThisTurn,
          ownerPrizesRemaining:result.ownerPrizesRemaining,
          opponentPrizesRemaining:result.opponentPrizesRemaining,
          pendingPrompts:result.pendingPrompts,
          v3Candidate:a.simultaneousLastPrizeCandidate,
          v3WinnerCorrectionApplied:a.winnerLogHandled
        };
      });
    })
  );
  const mixedSingleFinalPrizeMismatches=
    mixedTerminalRows.filter(row=>!row.nativeMatchesPaper);

  const neighborStoreIsolationVerified=rows.every(row=>
    row.v3Audit?.otherStoresUnmodified===true);
  const restorationVerified=rows.every(row=>
    row.v3Audit?.storeLogRestored===true&&
    row.v3Audit?.storeReduceRestored===true);
  assert.equal(neighborStoreIsolationVerified,true);
  assert.equal(restorationVerified,true);
  return {
    schema:'agent37-simultaneous-last-prize-resolution-native-v3',
    pinnedTwinleaf:PINNED,
    hook:VERSION,
    paperRule:'Rulebook §E: simultaneous Prize exhaustion is a draw when promotion availability matches; the only player able to promote wins when it differs',
    nativeDefectConfirmedBothSeats:true,
    simultaneousLastPrizeResolutionBothSeats:true,
    bothPrizeTransfersVerified:true,
    neighborStoreIsolationVerified,
    restorationVerified,
    drawLogAndWinnerVerified:true,
    singlePlayerLastPrizeControlPreserved:true,
    nonHandPrizeDestinationControlPreserved:true,
    asymmetricPromotionAvailabilityWinnerCorrected:true,
    asymmetricPrizeGroupCountsBothSeatsVerified:asymmetricPrizeGroupCounts.length===16,
    opponentOnlyPromotionWinnerCorrected:true,
    neitherPromotableTieCorrected:true,
    bothFinalPrizePromotionAsymmetryCovered:true,
    mixedSingleFinalPrizeRowsSupported:false,
    mixedSingleFinalPrizeRuleTableGapDemonstrated:
      mixedSingleFinalPrizeMismatches.length===4,
    mixedSingleFinalPrizeMismatchCount:mixedSingleFinalPrizeMismatches.length,
    competitiveGamesQualified:0,
    rows,
    controls:{
      singleLastPrize,nonHandDestination,asymmetricPromotionAvailability,
      asymmetricPrizeGroupCounts,mixedTerminalRows,opponentOnlyPromotionAvailability,neitherCanPromote
    }
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
