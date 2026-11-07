'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent37-instance-scoped-simultaneous-last-prize-resolution-v3';
const PINNED='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const BASE=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} p @returns {any} */
const native=p=>require(path.join(BASE,p));

/**
 * Research-only terminal adapter. When two Active KOs each exhaust the
 * corresponding player's remaining Prizes, it processes both prize transfers
 * before native choosePrizeCards reaches endGame, then changes the winner to
 * DRAW. The Store log is rewritten to the draw message as well.
 *
 * This deliberately supports only simple simultaneous Prize-to-hand transfers
 * with exactly two Active KOs, two Prize groups, and no other KO effects.
 * After both Prize groups transfer, Rulebook §E selects DRAW when both players
 * share promotion availability, and awards the player who can promote when only
 * one player has a Pokémon available to promote.

 * Scope: one attack's EndTurnEffect/checkState transaction. A multi-turn runner
 * must apply this wrapper around each attack transaction separately.
 *
 * @template T
 * @param {any} store Actual pinned Twinleaf Store instance.
 * @param {()=>T} execute Synchronous native transaction.
 * @returns {{result:T,audit:object}} Transaction and terminal-correction audit.
 */
function hasPokemonToPromote(player){
  return player.bench.some(slot=>slot.getPokemonCard());
}

function resolveSimultaneousLastPrizeWinner(state,firstPlayer,otherPlayer){
  const {GameWinner}=native('game/store/state/state');
  const firstCanPromote=hasPokemonToPromote(firstPlayer);
  const otherCanPromote=hasPokemonToPromote(otherPlayer);
  if(firstCanPromote===otherCanPromote)return GameWinner.DRAW;
  const winner=firstCanPromote?firstPlayer:otherPlayer;
  return state.players[0]===winner?GameWinner.PLAYER_1:GameWinner.PLAYER_2;
}

function withInstanceScopedSimultaneousLastPrizeTieV1(store,execute){
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
    simultaneousLastPrizeCandidate:false,
    secondPrizeTransferAttempted:false,
    secondPrizeTransferCompleted:false,
    firstPrizeDestinationIsHand:false,
    secondPrizeDestinationIsHand:false,
    winnerLogRewritten:false,tieApplied:false,
    firstPlayerCanPromote:null,otherPlayerCanPromote:null,
    promotionAvailabilitySymmetric:null,
    nativeWinner:null,nativeWinnerPlayerId:null,nativeWinnerName:null,
    expectedWinner:null,winnerOverridden:false,
    winnerLogHandled:false,
    nativeWinnerLogMessage:null,nativeWinnerLogName:null,nativeWinnerLogParams:null,
    winnerLogMessage:null,winnerLogName:null,winnerLogParams:null,
    terminalOutcome:null,
    bothPrizeTransfersCompleted:false,
    storeLogRestored:false,storeReduceRestored:false,
    otherStoresUnmodified:true
  };

  let inCheckState=false;
  let secondPrizeTransfer=false;
  let prizeGroups=[];
  let prizeLeftBefore={};
  let prizeTakenBefore={};
  let candidatePlayers=null;

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
    if(this!==store)throw Error('SIMULTANEOUS_LAST_PRIZE_HOOK_WRONG_STORE');

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
      const result=originalReduce.call(store,state,effect);
      if(secondPrizeTransfer){
        audit.secondPrizeDestinationIsHand=
          !effect.preventDefault&&effect.destination===effect.player.hand;
        return result;
      }

      const firstPlayer=effect.player;
      const otherPlayer=state.players.find(p=>p.id!==firstPlayer.id);
      const firstGroup=prizeGroups.find(g=>g.playerId===firstPlayer.id);
      const otherGroup=prizeGroups.find(g=>g.playerId===otherPlayer.id);
      if(state.players.length!==2||!otherPlayer)return result;
      const firstCanPromote=firstPlayer.bench.some(slot=>slot.getPokemonCard());
      const otherCanPromote=otherPlayer.bench.some(slot=>slot.getPokemonCard());
      audit.firstPlayerCanPromote=firstCanPromote;
      audit.otherPlayerCanPromote=otherCanPromote;
      audit.promotionAvailabilitySymmetric=firstCanPromote===otherCanPromote;
      const activeKoIds=new Set(audit.activeKoPlayerIds);
      const candidate=
        state.players.length===2&&
        audit.knockoutEffects===2&&
        activeKoIds.size===2&&
        audit.nonActiveKoEffects===0&&
        prizeGroups.length===2&&
        new Set(prizeGroups.map(g=>g.playerId)).size===2&&
        firstGroup&&otherGroup&&
        firstGroup.destination===firstPlayer.hand&&
        otherGroup.destination===otherPlayer.hand&&
        firstGroup.count>=prizeLeftBefore[firstPlayer.id]&&
        otherGroup.count>=prizeLeftBefore[otherPlayer.id]&&
        prizeLeftBefore[firstPlayer.id]>0&&
        prizeLeftBefore[otherPlayer.id]>0&&
        !state.isSuddenDeath&&
        !effect.preventDefault&&
        effect.destination===firstPlayer.hand;
      if(!candidate)return result;

      audit.simultaneousLastPrizeCandidate=true;
      audit.firstPrizeDestinationIsHand=true;
      candidatePlayers={firstPlayer,otherPlayer};

      const prizes=otherPlayer.prizes
        .filter(prize=>prize.cards.length>0)
        .slice(0,otherGroup.count);
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
      audit.secondPrizeTransferCompleted=
        otherPlayer.getPrizeLeft()===0;
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
          if(audit.simultaneousLastPrizeCandidate&&
            audit.secondPrizeTransferCompleted&&
            candidatePlayers&&
            audit.firstPrizeDestinationIsHand&&
            audit.secondPrizeDestinationIsHand&&
            candidatePlayers.firstPlayer.getPrizeLeft()===0&&
            candidatePlayers.otherPlayer.getPrizeLeft()===0&&
            candidatePlayers.firstPlayer.prizesTakenThisTurn>
              prizeTakenBefore[candidatePlayers.firstPlayer.id]&&
            candidatePlayers.otherPlayer.prizesTakenThisTurn>
              prizeTakenBefore[candidatePlayers.otherPlayer.id]){
            assert.equal(audit.winnerLogHandled,true,
              'native terminal winner log must be captured before winner correction');
            const nativeWinner=audit.nativeWinner;
            const expectedWinner=resolveSimultaneousLastPrizeWinner(
              state,candidatePlayers.firstPlayer,candidatePlayers.otherPlayer
            );
            state.winner=expectedWinner;
            audit.expectedWinner=expectedWinner;
            audit.winnerOverridden=nativeWinner!==expectedWinner;
            audit.terminalOutcome=expectedWinner===GameWinner.DRAW
              ?'DRAW':expectedWinner===GameWinner.PLAYER_1?'PLAYER_1':'PLAYER_2';
            audit.tieApplied=expectedWinner===GameWinner.DRAW;
            audit.bothPrizeTransfersCompleted=true;
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
    if(audit.simultaneousLastPrizeCandidate&&
      audit.secondPrizeTransferCompleted&&
      audit.firstPrizeDestinationIsHand&&
      audit.secondPrizeDestinationIsHand&&
      (message===GameLog.LOG_GAME_FINISHED_WINNER||
        message===GameLog.LOG_GAME_FINISHED_DRAW)){
      // choosePrizeCards processes Prize groups in state.players order and
      // ends the game on the first group's final Prize. endGame logs before
      // assigning state.winner, so state.winner is still NONE here. A native
      // DRAW log is also captured because the paper table can require a win.
      const firstProcessedPlayer=candidatePlayers.firstPlayer;
      const nativeLogIsDraw=message===GameLog.LOG_GAME_FINISHED_DRAW;
      audit.nativeWinnerLogMessage=message;
      audit.nativeWinnerLogName=params?.name??null;
      audit.nativeWinnerLogParams=params??null;
      const nativeWinner=nativeLogIsDraw?GameWinner.DRAW:
        state.players[0]===firstProcessedPlayer
          ?GameWinner.PLAYER_1
          :state.players[1]===firstProcessedPlayer
            ?GameWinner.PLAYER_2:null;
      assert.ok(nativeWinner!==null,
        'first Prize-group player must be present in state.players');
      const expectedWinner=resolveSimultaneousLastPrizeWinner(
        state,candidatePlayers.firstPlayer,candidatePlayers.otherPlayer
      );
      const winnerPlayer=expectedWinner===GameWinner.PLAYER_1
        ?state.players[0]
        :expectedWinner===GameWinner.PLAYER_2
          ?state.players[1]:null;
      const winnerLogMessage=expectedWinner===GameWinner.DRAW
        ?GameLog.LOG_GAME_FINISHED_DRAW
        :GameLog.LOG_GAME_FINISHED_WINNER;
      const winnerLogParams=winnerPlayer
        ?{...(params||{}),name:winnerPlayer.name}:undefined;
      state.winner=expectedWinner;
      const nativeWinnerPlayer=nativeWinner===GameWinner.DRAW
        ?null:firstProcessedPlayer;
      audit.nativeWinner=nativeWinner;
      audit.nativeWinnerPlayerId=nativeWinnerPlayer?.id??null;
      audit.nativeWinnerName=nativeWinnerPlayer?.name??null;
      audit.expectedWinner=expectedWinner;
      audit.winnerOverridden=nativeWinner!==expectedWinner;
      audit.winnerLogHandled=true;
      audit.terminalOutcome=expectedWinner===GameWinner.DRAW
        ?'DRAW':expectedWinner===GameWinner.PLAYER_1?'PLAYER_1':'PLAYER_2';
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

const withInstanceScopedSimultaneousLastPrizeResolutionV3=
  withInstanceScopedSimultaneousLastPrizeTieV1;
// Compatibility aliases route old callers to the corrected implementation.
const withInstanceScopedSimultaneousLastPrizeResolutionV2=
  withInstanceScopedSimultaneousLastPrizeResolutionV3;

module.exports={
  withInstanceScopedSimultaneousLastPrizeTieV1,
  withInstanceScopedSimultaneousLastPrizeResolutionV2,
  withInstanceScopedSimultaneousLastPrizeResolutionV3,
  hasPokemonToPromote,
  resolveSimultaneousLastPrizeWinner,
  VERSION,PINNED
};
