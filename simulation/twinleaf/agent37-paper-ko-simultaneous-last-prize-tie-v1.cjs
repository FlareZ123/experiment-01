'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent37-instance-scoped-simultaneous-last-prize-tie-v1';
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
 *
 * @template T
 * @param {any} store Actual pinned Twinleaf Store instance.
 * @param {()=>T} execute Synchronous native transaction.
 * @returns {{result:T,audit:object}} Transaction and terminal-correction audit.
 */
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
    knockoutEffects:0,activeKoPlayerIds:[],
    nonActiveKoEffects:0,prizeGroupCount:0,
    simultaneousLastPrizeCandidate:false,
    secondPrizeTransferAttempted:false,
    secondPrizeTransferCompleted:false,
    firstPrizeDestinationIsHand:false,
    secondPrizeDestinationIsHand:false,
    winnerLogRewritten:false,tieApplied:false,
    bothPrizeTransfersCompleted:false,
    storeLogRestored:false,storeReduceRestored:false,
    otherStoresUnmodified:true
  };

  let inCheckState=false;
  let secondPrizeTransfer=false;
  let prizeGroups=[];
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
      const result=originalReduce.call(store,state,effect);
      audit.knockoutEffects++;
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
      }
      return result;
    }

    if(inCheckState&&effect instanceof DrawPrizesEffect){
      const result=originalReduce.call(store,state,effect);
      if(secondPrizeTransfer){
        audit.secondPrizeDestinationIsHand=
          effect.destination===effect.player.hand;
        return result;
      }

      const firstPlayer=effect.player;
      const otherPlayer=state.players.find(p=>p.id!==firstPlayer.id);
      const firstGroup=prizeGroups.find(g=>g.playerId===firstPlayer.id);
      const otherGroup=prizeGroups.find(g=>g.playerId===otherPlayer.id);
      const activeKoIds=new Set(audit.activeKoPlayerIds);
      const candidate=
        audit.knockoutEffects===2&&
        activeKoIds.size===2&&
        audit.nonActiveKoEffects===0&&
        prizeGroups.length===2&&
        new Set(prizeGroups.map(g=>g.playerId)).size===2&&
        firstGroup&&otherGroup&&
        firstGroup.count>=firstPlayer.getPrizeLeft()&&
        otherGroup.count>=otherPlayer.getPrizeLeft()&&
        firstPlayer.getPrizeLeft()>0&&
        otherPlayer.getPrizeLeft()>0&&
        !state.isSuddenDeath&&
        effect.destination===firstPlayer.hand;
      if(!candidate)return result;

      audit.simultaneousLastPrizeCandidate=true;
      audit.firstPrizeDestinationIsHand=true;
      candidatePlayers={firstPlayer,otherPlayer};
      prizeTakenBefore={
        [firstPlayer.id]:firstPlayer.prizesTakenThisTurn,
        [otherPlayer.id]:otherPlayer.prizesTakenThisTurn
      };

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
            state.winner=GameWinner.DRAW;
            audit.tieApplied=true;
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
      message===GameLog.LOG_GAME_FINISHED_WINNER){
      audit.winnerLogRewritten=true;
      return originalLog.call(store,state,GameLog.LOG_GAME_FINISHED_DRAW,undefined,client);
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
  withInstanceScopedSimultaneousLastPrizeTieV1,
  VERSION,PINNED
};
