'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {
  hasPokemonToPromote,
  resolveRulebookETerminalOutcome,
  PINNED
}=require('../agent37-paper-ko-simultaneous-last-prize-tie-v1.cjs');

const VERSION='agent37-instance-scoped-simultaneous-terminal-resolution-v4';
const BASE=path.resolve(__dirname,'../../../vendor/twinleaf/ptcg-server/output');
/** @param {string} p @returns {any} */
const native=p=>require(path.join(BASE,p));

/**
 * Research-only mixed-terminal adapter. It arms for exactly two Active KOs,
 * two hand-destination Prize groups, and at least one group exhausting that
 * recipient's remaining Prizes. It completes the other Prize group exactly
 * once, then applies the shared Rulebook §E outcome resolver.
 *
 * The v3 both-final adapter remains unchanged and default-off. This separate
 * wrapper is experimental and must not be used as a complete-game or paper
 * legality certificate.
 *
 * @template T
 * @param {any} store Actual pinned Twinleaf Store instance.
 * @param {()=>T} execute Synchronous native transaction.
 * @returns {{result:T,audit:object}} Transaction and terminal-correction audit.
 */
function withInstanceScopedSimultaneousTerminalResolutionV4(store,execute){
  assert.equal(typeof execute,'function');
  const {Store}=native('game/store/store');
  const {EndTurnEffect}=native('game/store/effects/game-phase-effects');
  const {KnockOutEffect,DrawPrizesEffect}=
    native('game/store/effects/game-effects');
  const {GamePhase,GameWinner}=native('game/store/state/state');
  const {GameLog}=native('game/game-message');
  const {checkState}=native('game/store/effect-reducers/check-effect');
  const {TAKE_SPECIFIC_PRIZES}=native('game/store/prefabs/prefabs');
  assert.ok(store instanceof Store);
  assert.equal(Object.hasOwn(store,'reduceEffect'),false);
  assert.equal(Object.hasOwn(store,'log'),false);
  const originalReduce=store.reduceEffect;
  const originalLog=store.log;
  const neighbor=new Store({onStateChange(){}});
  assert.equal(neighbor.reduceEffect,originalReduce);
  assert.equal(neighbor.log,originalLog);

  const audit={
    version:VERSION,pinnedTwinleaf:PINNED,
    intercepted:0,callbacks:0,terminalSuppressed:0,completed:0,
    knockoutEffects:0,activeKoPlayerIds:[],knockoutPrizeCounts:[],
    nonActiveKoEffects:0,prizeGroupCount:0,prizeGroupCounts:[],
    simultaneousTerminalCandidate:false,
    simultaneousLastPrizeCandidate:false,
    secondPrizeTransferAttempted:false,
    secondPrizeTransferCompleted:false,
    firstPrizeTransferCompleted:false,
    bothPrizeTransfersCompleted:false,
    firstPrizeDestinationIsHand:false,
    secondPrizeDestinationIsHand:false,
    nativeTerminalPlayerId:null,
    nativeDuplicatePrizeEffectSuppressed:0,
    winnerLogRewritten:false,tieApplied:false,
    firstPlayerCanPromote:null,otherPlayerCanPromote:null,
    promotionAvailabilitySymmetric:null,
    nativeWinner:null,nativeWinnerPlayerId:null,nativeWinnerName:null,
    expectedWinner:null,winnerOverridden:false,
    winnerLogHandled:false,
    nativeWinnerLogMessage:null,nativeWinnerLogName:null,nativeWinnerLogParams:null,
    nativeWinnerLogType:null,
    winnerLogMessage:null,winnerLogName:null,winnerLogParams:null,
    terminalOutcome:null,
    storeLogRestored:false,storeReduceRestored:false,
    otherStoresUnmodified:true
  };

  let inCheckState=false;
  let secondPrizeTransfer=false;
  let prizeGroups=[];
  let prizeLeftBefore={};
  let prizeTakenBefore={};
  let candidatePlayers=null;
  const processedPrizePlayerIds=new Set();

  const restoreStore=()=>{
    inCheckState=false;
    if(Object.hasOwn(store,'log'))delete store.log;
    if(Object.hasOwn(store,'reduceEffect'))delete store.reduceEffect;
    audit.storeLogRestored=store.log===originalLog;
    audit.storeReduceRestored=store.reduceEffect===originalReduce;
    audit.otherStoresUnmodified=
      neighbor.log===originalLog&&neighbor.reduceEffect===originalReduce;
  };

  /** @this {any} @param {any} state @param {any} effect */
  function paperReduceEffect(state,effect){
    if(this!==store)throw Error('SIMULTANEOUS_TERMINAL_V4_HOOK_WRONG_STORE');

    if(inCheckState&&effect instanceof KnockOutEffect){
      const wasActive=effect.target===effect.player.active;
      const targetPrinting=effect.target.getPokemonCard()?.fullName??null;
      const result=originalReduce.call(store,state,effect);
      audit.knockoutEffects++;
      audit.knockoutPrizeCounts.push({
        targetPrinting,prizeCount:effect.prizeCount,wasActive,playerId:effect.player.id
      });
      if(wasActive){
        if(!effect.preventDefault&&effect.prizeCount>0){
          audit.activeKoPlayerIds.push(effect.player.id);
        }
      }else{
        audit.nonActiveKoEffects++;
      }
      if(!effect.preventDefault&&effect.prizeCount>0){
        const taker=state.players.find(p=>p.id!==effect.player.id);
        assert.ok(taker);
        const destination=effect.prizeDestination||taker.hand;
        let group=prizeGroups.find(g=>
          g.playerId===taker.id&&g.destination===destination
        );
        if(!group){
          group={playerId:taker.id,destination,count:0};
          prizeGroups.push(group);
        }
        group.count+=effect.prizeCount;
        audit.prizeGroupCount=prizeGroups.length;
        audit.prizeGroupCounts=prizeGroups.map(value=>({
          playerId:value.playerId,count:value.count,
          destinationIsHand:value.destination===state.players.find(p=>p.id===value.playerId)?.hand
        }));
      }
      return result;
    }

    if(inCheckState&&effect instanceof DrawPrizesEffect){
      // Only two distinct Prize recipients are admissible in this armed
      // transaction. A re-dispatched effect for an already processed recipient
      // must not invoke native side effects or move its Prizes again.
      if(audit.simultaneousTerminalCandidate&&
        processedPrizePlayerIds.has(effect.player.id)){
        effect.preventDefault=true;
        audit.nativeDuplicatePrizeEffectSuppressed++;
        return state;
      }
      const result=originalReduce.call(store,state,effect);
      if(secondPrizeTransfer){
        audit.secondPrizeDestinationIsHand=
          !effect.preventDefault&&effect.destination===effect.player.hand;
        processedPrizePlayerIds.add(effect.player.id);
        return result;
      }
      processedPrizePlayerIds.add(effect.player.id);

      const firstPlayer=effect.player;
      const otherPlayer=state.players.find(p=>p.id!==firstPlayer.id);
      if(state.players.length!==2||!otherPlayer)return result;
      const firstGroup=prizeGroups.find(g=>g.playerId===firstPlayer.id);
      const otherGroup=prizeGroups.find(g=>g.playerId===otherPlayer.id);
      if(!firstGroup||!otherGroup)return result;

      const firstCanPromote=hasPokemonToPromote(firstPlayer);
      const otherCanPromote=hasPokemonToPromote(otherPlayer);
      audit.firstPlayerCanPromote=firstCanPromote;
      audit.otherPlayerCanPromote=otherCanPromote;
      audit.promotionAvailabilitySymmetric=firstCanPromote===otherCanPromote;
      const firstGroupExhausts=
        firstGroup.count>=prizeLeftBefore[firstPlayer.id];
      const otherGroupExhausts=
        otherGroup.count>=prizeLeftBefore[otherPlayer.id];
      const activeKoIds=new Set(audit.activeKoPlayerIds);
      const candidate=
        audit.knockoutEffects===2&&
        activeKoIds.size===2&&
        audit.nonActiveKoEffects===0&&
        prizeGroups.length===2&&
        new Set(prizeGroups.map(g=>g.playerId)).size===2&&
        firstGroup.destination===firstPlayer.hand&&
        otherGroup.destination===otherPlayer.hand&&
        prizeLeftBefore[firstPlayer.id]>0&&
        prizeLeftBefore[otherPlayer.id]>0&&
        (firstGroupExhausts||otherGroupExhausts)&&
        !state.isSuddenDeath&&
        !effect.preventDefault&&
        effect.destination===firstPlayer.hand;
      if(!candidate)return result;

      audit.simultaneousTerminalCandidate=true;
      audit.simultaneousLastPrizeCandidate=
        firstGroupExhausts&&otherGroupExhausts;
      audit.firstPrizeDestinationIsHand=true;
      audit.secondPrizeDestinationIsHand=
        otherGroup.destination===otherPlayer.hand;
      candidatePlayers={
        firstPlayer,otherPlayer,firstGroup,otherGroup,
        nativeTerminalPlayer:firstGroupExhausts?firstPlayer:otherPlayer
      };
      audit.nativeTerminalPlayerId=candidatePlayers.nativeTerminalPlayer.id;

      const otherGroupAlreadyProcessed=
        processedPrizePlayerIds.has(otherPlayer.id);
      if(firstGroupExhausts&&!otherGroupAlreadyProcessed){
        const prizes=otherPlayer.prizes
          .filter(prize=>prize.cards.length>0)
          .slice(0,Math.min(otherGroup.count,prizeLeftBefore[otherPlayer.id]));
        audit.secondPrizeTransferAttempted=true;
        secondPrizeTransfer=true;
        try{
          TAKE_SPECIFIC_PRIZES(store,state,otherPlayer,prizes,{
            destination:otherGroup.destination,
            skipReduce:false
          });
        }finally{
          secondPrizeTransfer=false;
        }
      }
      const expectedOtherTransfer=
        Math.min(otherGroup.count,prizeLeftBefore[otherPlayer.id]);
      audit.secondPrizeTransferCompleted=
        otherPlayer.prizesTakenThisTurn-prizeTakenBefore[otherPlayer.id]===
          expectedOtherTransfer;
      return result;
    }

    if(effect instanceof EndTurnEffect&&state.phase===GamePhase.ATTACK){
      audit.intercepted++;
      inCheckState=true;
      prizeLeftBefore=Object.fromEntries(
        state.players.map(player=>[player.id,player.getPrizeLeft()])
      );
      prizeTakenBefore=Object.fromEntries(
        state.players.map(player=>[player.id,player.prizesTakenThisTurn])
      );
      audit.prizeLeftBefore={...prizeLeftBefore};
      audit.prizeTakenBefore={...prizeTakenBefore};
      let didComplete=false;
      const result=checkState(store,state,()=>{
        audit.callbacks++;
        didComplete=true;
        if(state.phase===GamePhase.FINISHED){
          // Never certify or silently preserve an early native winner after
          // arming the correction unless the other Prize transfer is complete.
          if(audit.simultaneousTerminalCandidate){
            assert.equal(audit.secondPrizeTransferCompleted,true,
              'armed simultaneous terminal must complete second Prize transfer');
            assert.ok(candidatePlayers&&audit.firstPrizeDestinationIsHand&&
              audit.secondPrizeDestinationIsHand,
            'armed simultaneous terminal must retain both hand destinations');
          }
          if(audit.simultaneousTerminalCandidate&&
            audit.secondPrizeTransferCompleted&&
            candidatePlayers&&
            audit.firstPrizeDestinationIsHand&&
            audit.secondPrizeDestinationIsHand){
            const firstExpectedTransfer=Math.min(
              candidatePlayers.firstGroup.count,
              prizeLeftBefore[candidatePlayers.firstPlayer.id]
            );
            const otherExpectedTransfer=Math.min(
              candidatePlayers.otherGroup.count,
              prizeLeftBefore[candidatePlayers.otherPlayer.id]
            );
            const firstActualTransfer=
              candidatePlayers.firstPlayer.prizesTakenThisTurn-
                prizeTakenBefore[candidatePlayers.firstPlayer.id];
            const otherActualTransfer=
              candidatePlayers.otherPlayer.prizesTakenThisTurn-
                prizeTakenBefore[candidatePlayers.otherPlayer.id];
            audit.firstPrizeTransferCompleted=
              firstActualTransfer===firstExpectedTransfer;
            audit.bothPrizeTransfersCompleted=
              audit.firstPrizeTransferCompleted&&
              otherActualTransfer===otherExpectedTransfer;
            assert.equal(audit.bothPrizeTransfersCompleted,true,
              'both simultaneous KO Prize groups must transfer exactly once');

            assert.equal(audit.winnerLogHandled,true,
              'native terminal winner log must be captured before paper correction');
            const player1=state.players[0];
            const player2=state.players[1];
            const paperOutcome=resolveRulebookETerminalOutcome({
              youTookAllPrizes:player1.getPrizeLeft()===0,
              opponentTookAllPrizes:player2.getPrizeLeft()===0,
              youCanPromote:hasPokemonToPromote(player1),
              opponentCanPromote:hasPokemonToPromote(player2)
            });
            assert.notEqual(paperOutcome,'ONGOING');
            const expectedWinner=paperOutcome==='DRAW'
              ?GameWinner.DRAW
              :paperOutcome==='YOU_WIN'?GameWinner.PLAYER_1:GameWinner.PLAYER_2;
            const nativeWinner=audit.nativeWinner;
            state.winner=expectedWinner;
            audit.expectedWinner=expectedWinner;
            audit.winnerOverridden=nativeWinner!==expectedWinner;
            audit.terminalOutcome=paperOutcome;
            audit.tieApplied=expectedWinner===GameWinner.DRAW;
          }
          audit.terminalSuppressed++;
          restoreStore();
          return;
        }
        audit.completed++;
        restoreStore();
        originalReduce.call(store,state,effect);
      });
      if(!didComplete&&state.phase===GamePhase.FINISHED){
        audit.terminalSuppressed++;
      }
      return result;
    }
    return originalReduce.call(store,state,effect);
  }

  store.reduceEffect=paperReduceEffect;
  store.log=function(state,message,params,client){
    if(audit.simultaneousTerminalCandidate&&
      audit.secondPrizeTransferCompleted&&
      audit.firstPrizeDestinationIsHand&&
      audit.secondPrizeDestinationIsHand&&
      (message===GameLog.LOG_GAME_FINISHED_WINNER||
        message===GameLog.LOG_GAME_FINISHED_DRAW)){
      const nativeTerminalPlayer=candidatePlayers.nativeTerminalPlayer;
      const nativeLogIsDraw=message===GameLog.LOG_GAME_FINISHED_DRAW;
      audit.nativeWinnerLogMessage=message;
      audit.nativeWinnerLogName=params?.name??null;
      audit.nativeWinnerLogParams=params??null;
      audit.nativeWinnerLogType=nativeLogIsDraw?'DRAW':'WINNER';
      const nativeWinner=nativeLogIsDraw?GameWinner.DRAW:
        state.players[0]===nativeTerminalPlayer
          ?GameWinner.PLAYER_1
          :state.players[1]===nativeTerminalPlayer
            ?GameWinner.PLAYER_2:null;
      assert.ok(nativeWinner!==null,
        'native Prize-exhaustion player must be present in state.players');
      const player1=state.players[0];
      const player2=state.players[1];
      const paperOutcome=resolveRulebookETerminalOutcome({
        youTookAllPrizes:player1.getPrizeLeft()===0,
        opponentTookAllPrizes:player2.getPrizeLeft()===0,
        youCanPromote:hasPokemonToPromote(player1),
        opponentCanPromote:hasPokemonToPromote(player2)
      });
      assert.notEqual(paperOutcome,'ONGOING');
      const expectedWinner=paperOutcome==='DRAW'
        ?GameWinner.DRAW
        :paperOutcome==='YOU_WIN'?GameWinner.PLAYER_1:GameWinner.PLAYER_2;
      const winnerPlayer=expectedWinner===GameWinner.PLAYER_1
        ?player1
        :expectedWinner===GameWinner.PLAYER_2?player2:null;
      const winnerLogMessage=expectedWinner===GameWinner.DRAW
        ?GameLog.LOG_GAME_FINISHED_DRAW
        :GameLog.LOG_GAME_FINISHED_WINNER;
      const winnerLogParams=winnerPlayer
        ?{...(params||{}),name:winnerPlayer.name}:undefined;
      state.winner=expectedWinner;
      audit.nativeWinner=nativeWinner;
      audit.nativeWinnerPlayerId=nativeLogIsDraw?null:nativeTerminalPlayer.id;
      audit.nativeWinnerName=nativeLogIsDraw?null:nativeTerminalPlayer.name;
      audit.expectedWinner=expectedWinner;
      audit.winnerOverridden=nativeWinner!==expectedWinner;
      audit.winnerLogHandled=true;
      audit.terminalOutcome=paperOutcome;
      audit.tieApplied=expectedWinner===GameWinner.DRAW;
      audit.winnerLogRewritten=winnerLogMessage!==message||
        nativeWinner!==expectedWinner||
        (winnerPlayer!==null&&params?.name!==winnerPlayer.name);
      audit.winnerLogMessage=winnerLogMessage;
      audit.winnerLogName=winnerPlayer?.name??null;
      audit.winnerLogParams=winnerLogParams??null;
      return originalLog.call(store,state,winnerLogMessage,winnerLogParams,client);
    }
    return originalLog.call(store,state,message,params,client);
  };

  let result;
  try{
    result=execute();
  }finally{
    restoreStore();
  }
  return {result,audit};
}

module.exports={
  withInstanceScopedSimultaneousTerminalResolutionV4,
  VERSION,PINNED
};
