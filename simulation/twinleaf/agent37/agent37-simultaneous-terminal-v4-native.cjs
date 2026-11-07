'use strict';

const assert=require('node:assert/strict');
const {runOne}=require('../agent37-simultaneous-ko-e21-promotion-native.cjs');
const {
  resolveRulebookETerminalOutcome,PINNED
}=require('../agent37-paper-ko-simultaneous-last-prize-tie-v1.cjs');
const {
  withInstanceScopedSimultaneousTerminalResolutionV4,VERSION
}=require('./agent37-simultaneous-terminal-v4-adapter.cjs');
const {GameWinner}=require('../../../vendor/twinleaf/ptcg-server/output/game/store/state/state');
const {GameLog}=require('../../../vendor/twinleaf/ptcg-server/output/game/game-message');

const profiles=[
  {name:'owner-final',ownerPrizes:1,enemyPrizes:6,finalTaker:'owner'},
  {name:'opponent-final',ownerPrizes:6,enemyPrizes:1,finalTaker:'opponent'}
];
const promotionCases=[
  {name:'both-can-promote',ownerHasBench:true,enemyHasBench:true},
  {name:'owner-only-promotes',ownerHasBench:true,enemyHasBench:false},
  {name:'opponent-only-promotes',ownerHasBench:false,enemyHasBench:true},
  {name:'neither-can-promote',ownerHasBench:false,enemyHasBench:false}
];

function run(){
  const rows=[];
  for(const profile of profiles){
    for(const actorSeat of [0,1]){
      for(const scenario of promotionCases){
        const {result,audit}=runOne(
          actorSeat,
          withInstanceScopedSimultaneousTerminalResolutionV4,
          6,
          true,
          scenario.enemyHasBench,
          scenario.ownerHasBench,
          {
            enemyActiveName:'Shadow Rider Calyrex VMAX CRE',
            enemyEvolutionBaseName:'Shadow Rider Calyrex V CRE',
            enemyActiveDamage:260,
            ownerPrizes:profile.ownerPrizes,
            enemyPrizes:profile.enemyPrizes,
            stopAfterAttack:true
          }
        );
        const paperOutcome=resolveRulebookETerminalOutcome({
          youTookAllPrizes:profile.finalTaker==='owner',
          opponentTookAllPrizes:profile.finalTaker==='opponent',
          youCanPromote:scenario.ownerHasBench,
          opponentCanPromote:scenario.enemyHasBench
        });
        assert.notEqual(paperOutcome,'ONGOING');
        const expectedWinner=paperOutcome==='DRAW'
          ?'DRAW':paperOutcome==='YOU_WIN'?'owner':'opponent';
        const expectedWinnerName=expectedWinner==='owner'
          ?'Ferroseed attacker'
          :expectedWinner==='opponent'?'Duskull defender':null;
        const finalTakerId=profile.finalTaker==='owner'?101:202;
        const expectedNativeWinnerSeat=profile.finalTaker==='owner'
          ?actorSeat:1-actorSeat;
        const expectedNativeWinner=expectedNativeWinnerSeat===0
          ?GameWinner.PLAYER_1:GameWinner.PLAYER_2;
        const expectedPaperWinnerSeat=expectedWinner==='owner'
          ?actorSeat:expectedWinner==='opponent'?1-actorSeat:null;
        const expectedPaperWinner=expectedPaperWinnerSeat===null
          ?GameWinner.DRAW
          :expectedPaperWinnerSeat===0?GameWinner.PLAYER_1:GameWinner.PLAYER_2;

        const groupCountsByRecipient=Object.fromEntries(
          audit.prizeGroupCounts.map(g=>[g.playerId,g.count])
        );
        const expectedPrizeTransfers={
          owner:Math.min(groupCountsByRecipient[101]??0,profile.ownerPrizes),
          opponent:Math.min(groupCountsByRecipient[202]??0,profile.enemyPrizes)
        };
        const actualPrizeTransfers={
          owner:result.ownerPrizesTakenThisTurn,
          opponent:result.opponentPrizesTakenThisTurn
        };

        assert.equal(result.finished,true);
        assert.equal(audit.version,VERSION);
        assert.equal(audit.pinnedTwinleaf,PINNED);
        assert.equal(audit.simultaneousTerminalCandidate,true);
        assert.equal(audit.simultaneousLastPrizeCandidate,false);
        assert.equal(audit.prizeGroupCount,2);
        assert.equal(audit.prizeGroupCounts.length,2);
        assert.equal(audit.prizeGroupCounts.every(g=>g.destinationIsHand),true);
        assert.equal(typeof audit.secondPrizeTransferAttempted,'boolean');
        assert.equal(audit.secondPrizeTransferCompleted,true);
        assert.equal(audit.firstPrizeTransferCompleted,true);
        assert.equal(audit.bothPrizeTransfersCompleted,true);
        assert.equal(audit.nativeWinnerLogType,'WINNER');
        assert.equal(audit.nativeWinnerLogMessage,GameLog.LOG_GAME_FINISHED_WINNER);
        assert.equal(audit.nativeWinner,expectedNativeWinner);
        assert.equal(audit.nativeWinnerPlayerId,finalTakerId);
        assert.equal(audit.nativeTerminalPlayerId,finalTakerId);
        assert.equal(audit.nativeWinnerName,
          profile.finalTaker==='owner'?'Ferroseed attacker':'Duskull defender');
        assert.equal(audit.nativeWinnerLogName,audit.nativeWinnerName);
        assert.deepEqual(audit.nativeWinnerLogParams,{name:audit.nativeWinnerName});
        assert.equal(audit.expectedWinner,expectedPaperWinner);
        assert.equal(audit.winnerLogHandled,true);
        assert.equal(audit.winnerLogMessage,
          expectedWinner==='DRAW'?GameLog.LOG_GAME_FINISHED_DRAW:
            GameLog.LOG_GAME_FINISHED_WINNER);
        assert.equal(audit.winnerLogName,expectedWinnerName);
        assert.equal(audit.winnerOverridden,expectedPaperWinner!==expectedNativeWinner);
        assert.equal(audit.winnerLogRewritten,expectedPaperWinner!==expectedNativeWinner);
        assert.equal(audit.storeLogRestored,true);
        assert.equal(audit.storeReduceRestored,true);
        assert.equal(audit.otherStoresUnmodified,true);
        assert.equal(actualPrizeTransfers.owner,expectedPrizeTransfers.owner);
        assert.equal(actualPrizeTransfers.opponent,expectedPrizeTransfers.opponent);
        assert.equal(result.ownerPrizesRemaining,
          profile.ownerPrizes-expectedPrizeTransfers.owner);
        assert.equal(result.opponentPrizesRemaining,
          profile.enemyPrizes-expectedPrizeTransfers.opponent);
        assert.equal(result.winner,expectedPaperWinner);
        const actualWinner=result.winnerPlayer??'DRAW';
        assert.equal(actualWinner,expectedWinner);
        assert.equal(result.pendingPrompts.length,0);

        rows.push({
          profile:profile.name,actorSeat,scenario:scenario.name,
          ownerCanPromote:scenario.ownerHasBench,
          opponentCanPromote:scenario.enemyHasBench,
          paperOutcome,expectedWinner,actualWinner,
          nativeWinnerPlayerId:audit.nativeWinnerPlayerId,
          nativeWinnerName:audit.nativeWinnerName,
          nativeWinnerLogType:audit.nativeWinnerLogType,
          nativeWinnerLogName:audit.nativeWinnerLogName,
          nativeTerminalPlayerId:audit.nativeTerminalPlayerId,
          expectedPrizeTransfers,actualPrizeTransfers,
          prizeTransfersComplete:
            actualPrizeTransfers.owner===expectedPrizeTransfers.owner&&
            actualPrizeTransfers.opponent===expectedPrizeTransfers.opponent,
          winnerOverridden:audit.winnerOverridden,
          correctedWinnerLogName:audit.winnerLogName,
          correctedWinnerLogMessage:audit.winnerLogMessage,
          secondPrizeTransferAttempted:audit.secondPrizeTransferAttempted,
          nativeDuplicatePrizeEffectSuppressed:
            audit.nativeDuplicatePrizeEffectSuppressed,
          storeRestored:audit.storeLogRestored&&audit.storeReduceRestored
        });
      }
    }
  }

  const summary={
    rows:rows.length,
    transferCompleteRows:rows.filter(x=>x.prizeTransfersComplete).length,
    draws:rows.filter(x=>x.expectedWinner==='DRAW').length,
    ownerWins:rows.filter(x=>x.expectedWinner==='owner').length,
    opponentWins:rows.filter(x=>x.expectedWinner==='opponent').length,
    nativeWinnerCorrections:rows.filter(x=>x.winnerOverridden).length,
    nativeWinnerLogs:rows.filter(x=>x.nativeWinnerLogType==='WINNER').length,
    storeRestoredRows:rows.filter(x=>x.storeRestored).length
  };
  assert.deepEqual(summary,{
    rows:16,transferCompleteRows:16,draws:4,ownerWins:6,opponentWins:6,
    nativeWinnerCorrections:4,nativeWinnerLogs:16,storeRestoredRows:16
  });

  return {
    schema:'agent37-simultaneous-terminal-resolution-native-v4',
    version:VERSION,
    pinnedTwinleaf:PINNED,
    fixture:'two Active KnockOutEffects; native 3-Prize VMAX and 1-Prize Basic groups; hand destinations',
    profiles:profiles.map(({name,ownerPrizes,enemyPrizes})=>({name,ownerPrizes,enemyPrizes})),
    actorSeats:[0,1],
    promotionCases:promotionCases.map(({name,ownerHasBench,enemyHasBench})=>({
      name,ownerHasBench,opponentHasBench:enemyHasBench
    })),
    summary,
    rows,
    competitiveGamesQualified:0,
    limitations:[
      'Controlled staged native mechanics fixture, not a complete legal game',
      'English Twinleaf card definitions and Format.EXPANDED only',
      'Promotion availability is represented by a Pokémon on the Bench',
      'Exactly two Active KnockOutEffects and two Prize groups to hand',
      'No prevention, replacement Prize destination, non-Active KO, deck-out, or other terminal condition',
      'Opt-in research adapter; not integrated into the shared common policy'
    ]
  };
}

if(require.main===module){
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
}
module.exports={run};
