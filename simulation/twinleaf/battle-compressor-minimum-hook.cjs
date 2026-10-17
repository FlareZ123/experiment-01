'use strict';
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
let installed=null;

/**
 * Require 1-3 Battle Compressor selections, per Japanese official FAQ 9672.
 * Research-owned correction for the pinned min:0 selection prompt.
 * @returns {() => void} Uninstall correction.
 */
function installBattleCompressorMinimumHook(){
  if(installed)return installed.restore;
  const {BattleCompressor}=require(path.join(output,
    'sets/07-x-and-y/set-phantom-forces/battle-compressor'));
  const {ChooseCardsPrompt}=require(path.join(output,
    'game/store/prompts/choose-cards-prompt'));
  const {GameMessage,GameError}=require(path.join(output,'game'));
  const {MOVE_CARDS,SHUFFLE_DECK}=require(path.join(output,
    'game/store/prefabs/prefabs'));
  const {WAS_TRAINER_USED}=require(path.join(output,
    'game/store/prefabs/trainer-prefabs'));
  const {Store}=require(path.join(output,'game/store/store'));
  const {ResolvePromptAction}=require(path.join(output,
    'game/store/actions/resolve-prompt-action'));
  const originalDispatch=Store.prototype.dispatch;
  const original=BattleCompressor.prototype.reduceEffect;
  function corrected(store,state,effect){
    if(!WAS_TRAINER_USED(effect,this))return state;
    const player=effect.player;
    if(!this.canPlay(store,state,player)){
      throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
    }
    return store.prompt(state,new ChooseCardsPrompt(
      player,GameMessage.CHOOSE_CARD_TO_DISCARD,player.deck,{},
      {min:1,max:3,allowCancel:false}
    ),selected=>{
      MOVE_CARDS(store,state,player.deck,player.discard,{
        cards:selected||[],sourceCard:this
      });
      SHUFFLE_DECK(store,state,player);
    });
  }
  function guardedDispatch(action,clientRoleId){
    if(action instanceof ResolvePromptAction &&
       Array.isArray(action.result) && action.result.length===0){
      const prompt=this.state.prompts.find(p=>p.id===action.id);
      if(prompt instanceof ChooseCardsPrompt &&
         prompt.message===GameMessage.CHOOSE_CARD_TO_DISCARD &&
         prompt.cards===prompt.player.deck &&
         prompt.options.min===1 && prompt.options.max===3 &&
         prompt.player.supporter.cards.some(c=>c instanceof BattleCompressor)){
        throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
      }
    }
    return originalDispatch.call(this,action,clientRoleId);
  }
  Store.prototype.dispatch=guardedDispatch;
  BattleCompressor.prototype.reduceEffect=corrected;
  const restore=()=>{
    if(BattleCompressor.prototype.reduceEffect===corrected){
      BattleCompressor.prototype.reduceEffect=original;
    }
    installed=null;
  };
  installed={restore};
  return restore;
}
module.exports={installBattleCompressorMinimumHook};
