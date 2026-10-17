'use strict';
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
let installed=null;

/**
 * Reversible paper-rules guard for Guzma BUS when the opponent has no Bench.
 * The pinned Store can dispatch PlayCardAction without consulting canPlay.
 * Guard both the card's canPlay path and physical Store dispatch to avoid
 * consuming an ineffective Supporter. A sole own Active with no own Bench
 * remains a legal Guzma play whenever the opponent has a Bench.
 *
 * @returns {() => void}
 */
function installGuzmaNoTargetHook(){
  if(installed)return()=>{};
  const {Guzma}=require(path.join(
    output,'sets/08-sun-and-moon/set-burning-shadows/guzma'
  ));
  const {StateUtils}=require(path.join(output,'game/store/state-utils'));
  const {Store}=require(path.join(output,'game/store/store'));
  const {PlayCardAction}=require(path.join(
    output,'game/store/actions/play-card-action'));
  const {GameError}=require(path.join(output,'game/game-error'));
  const {GameMessage}=require(path.join(output,'game/game-message'));
  const original=Guzma.prototype.canPlay;
  const originalDispatch=Store.prototype.dispatch;

  /** @param {object} state @param {object} player */
  function opponentHasBench(state,player){
    const opponent=StateUtils.getOpponent(state,player);
    return opponent.bench.some(slot=>slot.cards.length>0);
  }
  function correctedCanPlay(store,state,player){
    return original.call(this,store,state,player)&&
      opponentHasBench(state,player);
  }
  function correctedDispatch(action,...rest){
    if(action instanceof PlayCardAction){
      const state=this.state;
      const player=state.players.find(side=>side.id===action.id);
      if(player?.hand.cards[action.handIndex]?.name==='Guzma' &&
          !opponentHasBench(state,player)){
        throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
      }
    }
    return originalDispatch.call(this,action,...rest);
  }

  Guzma.prototype.canPlay=correctedCanPlay;
  Store.prototype.dispatch=correctedDispatch;
  installed={original,corrected:correctedCanPlay,
    originalDispatch,correctedDispatch};

  return function restoreGuzmaNoTargetHook(){
    if(!installed)return;
    if(Guzma.prototype.canPlay===installed.corrected){
      Guzma.prototype.canPlay=installed.original;
    }
    if(Store.prototype.dispatch===installed.correctedDispatch){
      Store.prototype.dispatch=installed.originalDispatch;
    }
    installed=null;
  };
}
module.exports={installGuzmaNoTargetHook};
