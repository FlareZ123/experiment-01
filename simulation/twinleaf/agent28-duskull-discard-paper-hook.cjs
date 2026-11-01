'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

/** @param {string} relative Pinned, compiled Twinleaf module path. */
const load=relative=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',relative));

/**
 * Temporarily repair the inherited Duskull SFA/PRE "Come and Get You"
 * reducer's mistaken hand-zone check. The printed attack retrieves up to
 * three Duskull from the discard to free Bench slots. Preserve all card
 * transitions in the original native Store; do not edit the pinned vendor.
 *
 * The original implementation checks player.hand.cards despite naming its
 * predicate hasDuskullInDiscard. It raises CANNOT_USE_POWER against a genuine
 * discard-only target and allows a no-target attack to reach an impossible
 * prompt. Those behaviors are excluded by this narrow default-off patch.
 *
 * @returns {()=>void} Restore the exact original reducer prototype method.
 */
function installDuskullDiscardPaperHook(){
  const {Duskull}=load('sets/10-scarlet-and-violet/set-shrouded-fable/duskull');
  const {WAS_ATTACK_USED,MOVE_CARDS}=load('game/store/prefabs/prefabs');
  const {ChooseCardsPrompt}=load('game/store/prompts/choose-cards-prompt');
  const {SuperType}=load('game/store/card/card-types');
  const {GameMessage}=load('game/game-message');
  const original=Duskull.prototype.reduceEffect;
  assert.equal(typeof original,'function','Expected pinned Duskull reducer');
  let restored=false;

  Duskull.prototype.reduceEffect=function correctedDuskull(store,state,effect){
    if(!WAS_ATTACK_USED(effect,0,this)){
      return original.call(this,store,state,effect);
    }
    const player=effect.player;
    const slots=player.bench.filter(slot=>slot.cards.length===0);
    const available=player.discard.cards.filter(card=>
      card.superType===SuperType.POKEMON&&card.name==='Duskull');
    const max=Math.min(3,slots.length,available.length);

    // "Up to 3": an otherwise legally announced attack is allowed to resolve
    // with zero targets, including when there is no available Bench space.
    if(max===0)return state;

    let chosen=[];
    /** @returns {Generator<unknown,void,unknown>} */
    function* applyPrintedAttack(){
      yield store.prompt(state,new ChooseCardsPrompt(
        player,GameMessage.CHOOSE_CARD_TO_PUT_ONTO_BENCH,
        player.discard,{superType:SuperType.POKEMON,name:'Duskull'},
        {min:1,max,allowCancel:false}
      ),cards=>{
        chosen=cards||[];
        generator.next();
      });

      chosen.forEach((card,index)=>{
        MOVE_CARDS(store,state,player.discard,slots[index],{
          cards:[card],sourceCard:effect.source.getPokemonCard()
        });
        slots[index].pokemonPlayedTurn=state.turn;
      });
    }
    const generator=applyPrintedAttack();
    return generator.next().value;
  };

  return function restoreDuskullDiscardPaperHook(){
    if(restored)return;
    Duskull.prototype.reduceEffect=original;
    restored=true;
  };
}

/**
 * Execute a strictly scoped opt-in correction even when the native Store
 * throws. No change to the headless runner's default behavior.
 * @template T
 * @param {()=>T} execute
 * @returns {T}
 */
function withDuskullDiscardPaperHook(execute){
  assert.equal(typeof execute,'function');
  const restore=installDuskullDiscardPaperHook();
  try{return execute();}
  finally{restore();}
}

module.exports={installDuskullDiscardPaperHook,withDuskullDiscardPaperHook};
