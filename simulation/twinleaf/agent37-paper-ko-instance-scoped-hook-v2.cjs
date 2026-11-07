'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent37-instance-scoped-ko-before-e21-simultaneous-promotion-v2';
const PINNED='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const BASE=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath @returns {any} */
const native=modulePath=>require(path.join(BASE,modulePath));

/**
 * Research-only v2: order the two simultaneous Active promotion prompts by
 * next-turn player. It changes state.players only after all ordinary Prize
 * prompts have resolved, allowing native checkState to build the promotion
 * prompt array in the paper-required order. It restores the original player
 * array and activePlayer before the first promotion prompt is exposed and
 * before the native EndTurnEffect resumes.
 *
 * The correction is deliberately narrow: exactly two Active KOs, no other
 * KOs, two single-Prize groups, two players with more than one Prize remaining,
 * and at least one Benched Pokémon each. Other cases retain native behavior.
 *
 * @template T
 * @param {any} store Actual pinned Twinleaf Store instance.
 * @param {()=>T} execute Synchronous native transaction, including prompts.
 * @returns {{result:T,audit:object}} Result plus order/restoration audit.
 */
function withInstanceScopedPaperKoBeforeEndTurnV2(store,execute){
  assert.equal(typeof execute,'function');
  const {Store}=native('game/store/store');
  const {EndTurnEffect}=
    native('game/store/effects/game-phase-effects');
  const {KnockOutEffect}=
    native('game/store/effects/game-effects');
  const {GamePhase}=native('game/store/state/state');
  const {GameMessage}=native('game/game-message');
  const {checkState}=native('game/store/effect-reducers/check-effect');
  assert.ok(store instanceof Store,'Use the actual pinned Store');
  assert.equal(Object.hasOwn(store,'reduceEffect'),false,
    'Store must not already be overridden');
  assert.equal(Object.hasOwn(store,'prompt'),false,
    'Store prompt must not already be overridden');
  const originalReduce=store.reduceEffect;
  const originalPrompt=store.prompt;
  assert.equal(typeof originalReduce,'function');
  assert.equal(typeof originalPrompt,'function');
  const neighbor=new Store({onStateChange(){}});
  assert.equal(neighbor.reduceEffect,originalReduce);
  assert.equal(neighbor.prompt,originalPrompt);

  const audit={
    version:VERSION,pinnedTwinleaf:PINNED,
    intercepted:0,completed:0,terminalSuppressed:0,
    deferredAtCheckReturn:0,callbacks:0,
    knockoutEffects:0,activeKoPlayerIds:[],
    nonActiveKoEffects:0,prizeGroupCount:0,
    expectedPrizePromptCount:0,prizePromptsResolved:0,
    correctionArmed:false,correctionSkippedReason:null,
    promotionOrderReordered:false,
    stateRestoredBeforePromotionPrompt:false,
    originalPlayerOrderRestoredBeforeEndTurn:false,
    originalActivePlayerRestoredBeforeEndTurn:false,
    promptRestored:false,otherStoresUnmodified:true,
    originalRestored:false,paperQualifiedGames:0
  };

  let resolvingPaperCheck=false;
  let promptWrapperInstalled=false;
  let originalPlayerOrder=null;
  let originalActivePlayer=null;
  let activeState=null;
  let prizeGroups=[];

  const restorePlayerState=()=>{
    if(originalPlayerOrder===null)return;
    activeState.players[0]=originalPlayerOrder[0];
    activeState.players[1]=originalPlayerOrder[1];
    activeState.activePlayer=originalActivePlayer;
    originalPlayerOrder=null;
    originalActivePlayer=null;
    activeState=null;
    audit.originalPlayerOrderRestoredBeforeEndTurn=true;
    audit.originalActivePlayerRestoredBeforeEndTurn=true;
  };
  const restorePrompt=()=>{
    if(!promptWrapperInstalled)return;
    delete store.prompt;
    promptWrapperInstalled=false;
    audit.promptRestored=store.prompt===originalPrompt;
  };
  const restoreAll=()=>{
    restorePlayerState();
    restorePrompt();
    resolvingPaperCheck=false;
  };

  /** @this {any} @param {any} state @param {any} effect */
  function paperReduceEffect(state,effect){
    if(this!==store)throw Error('SIMULTANEOUS_KO_HOOK_WRONG_STORE');

    if(resolvingPaperCheck&&effect instanceof KnockOutEffect){
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
        assert.ok(taker,'KO prize taker must exist');
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

    if(effect instanceof EndTurnEffect&&state.phase===GamePhase.ATTACK){
      audit.intercepted++;
      activeState=state;
      let didComplete=false;
      let stateSwapped=false;

      const canCorrect=()=>{
        const ids=new Set(audit.activeKoPlayerIds);
        const prizes=state.players.map(p=>
          p.prizes.filter(prize=>prize.cards.length>0).length
        );
        const benches=state.players.map(p=>
          p.bench.some(slot=>slot.getPokemonCard())
        );
        const onePrizeGroups=prizeGroups.length===2&&
          prizeGroups.every(group=>group.count===1)&&
          new Set(prizeGroups.map(group=>group.playerId)).size===2;
        return audit.knockoutEffects===2&&
          ids.size===2&&
          audit.nonActiveKoEffects===0&&
          onePrizeGroups&&
          !state.isSuddenDeath&&
          prizes.every(count=>count>1)&&
          benches.every(Boolean);
      };

      const swapForNextPlayer=()=>{
        if(stateSwapped||!audit.correctionArmed)return;
        originalPlayerOrder=[state.players[0],state.players[1]];
        originalActivePlayer=state.activePlayer;
        const nextPlayer=originalPlayerOrder[1-originalActivePlayer];
        const currentPlayer=originalPlayerOrder[originalActivePlayer];
        state.players[0]=nextPlayer;
        state.players[1]=currentPlayer;
        state.activePlayer=1;
        stateSwapped=true;
        audit.promotionOrderReordered=originalPlayerOrder[0]!==nextPlayer;
      };

      const promptWrapper=function(stateArg,prompt,callback){
        if(prompt.constructor.name==='ChoosePrizePrompt'){
          if(audit.expectedPrizePromptCount===0){
            audit.expectedPrizePromptCount=prizeGroups.length;
            audit.correctionArmed=canCorrect();
            if(!audit.correctionArmed){
              audit.correctionSkippedReason='KO/prize/bench preconditions outside narrow v2 scope';
            }
          }
          const wrappedCallback=result=>{
            const nextState=callback(result);
            audit.prizePromptsResolved++;
            if(audit.correctionArmed&&
              audit.prizePromptsResolved===audit.expectedPrizePromptCount&&
              state.phase!==GamePhase.FINISHED){
              swapForNextPlayer();
            }
            return nextState;
          };
          return originalPrompt.call(this,stateArg,prompt,wrappedCallback);
        }

        if(prompt.constructor.name==='ChoosePokemonPrompt'&&
          prompt.message===GameMessage.CHOOSE_NEW_ACTIVE_POKEMON){
          if(stateSwapped){
            restorePlayerState();
            restorePrompt();
            audit.stateRestoredBeforePromotionPrompt=true;
          }
          return originalPrompt.call(this,stateArg,prompt,callback);
        }
        return originalPrompt.call(this,stateArg,prompt,callback);
      };

      store.prompt=promptWrapper;
      promptWrapperInstalled=true;
      resolvingPaperCheck=true;
      try{
        const result=checkState(store,state,()=>{
          audit.callbacks++;
          didComplete=true;
          restoreAll();
          if(state.phase===GamePhase.FINISHED){
            audit.terminalSuppressed++;
            return;
          }
          audit.completed++;
          originalReduce.call(store,state,effect);
        });
        if(!didComplete){
          audit.deferredAtCheckReturn++;
          if(state.phase===GamePhase.FINISHED){
            audit.terminalSuppressed++;
            audit.correctionSkippedReason='terminal before promotion ordering is needed';
          }
        }
        if(!didComplete&&!store.hasPrompts())restoreAll();
        return result;
      }catch(error){
        restoreAll();
        throw error;
      }
    }
    return originalReduce.call(store,state,effect);
  }

  store.reduceEffect=paperReduceEffect;
  let result;
  try{
    result=execute();
  }finally{
    restoreAll();
    delete store.reduceEffect;
    audit.originalRestored=store.reduceEffect===originalReduce;
    audit.otherStoresUnmodified=
      neighbor.reduceEffect===originalReduce&&neighbor.prompt===originalPrompt;
  }
  return {result,audit};
}

module.exports={
  withInstanceScopedPaperKoBeforeEndTurnV2,
  VERSION,PINNED
};
