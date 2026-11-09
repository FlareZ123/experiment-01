'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent7-paper-celestial-roar-native-pinned-repair-v1';

/**
 * Research-owned, reversible repair of the pinned Regidrago V Celestial Roar:
 * every revealed Energy card (including Special Energy) is eligible to attach,
 * and every unselected revealed non-Energy card enters the public discard pile.
 *
 * The source card's existing Dragon Laser implementation is unchanged.
 * This hook only executes the printed first attack through real native effects.
 *
 * @template T
 * @param {()=>T} execute Native synchronous match or test callback.
 * @param {object} [deps] Optional pinned-class test seam.
 * @returns {{result:T,audit:object}}
 */
function withPaperCelestialRoar(execute,deps={}){
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,
    '../../../vendor/twinleaf/ptcg-server/output');
  const native=file=>require(path.join(base,file));
  const RegidragoV=deps.RegidragoV??
    native('sets/09-sword-and-shield/set-silver-tempest/regidrago-v').RegidragoV;
  const game=deps.game??native('game');
  const WAS_ATTACK_USED=deps.WAS_ATTACK_USED??
    native('game/store/prefabs/prefabs').WAS_ATTACK_USED;
  const MOVE_CARDS=deps.MOVE_CARDS??
    native('game/store/prefabs/prefabs').MOVE_CARDS;
  const {CardList,EnergyCard,AttachEnergyPrompt,StateUtils,
    GameMessage,PlayerType,SlotType,SuperType}=game;
  const proto=RegidragoV.prototype;
  const prior=Object.getOwnPropertyDescriptor(proto,'reduceEffect');
  assert.equal(typeof prior?.value,'function');
  const audit={schema:VERSION,interceptedAttacks:0,openedCards:0,
    specialEnergyOffered:0,discardedRemainders:0,
    allRemaindersCleared:0,unsettledPromptCallbacks:0,
    physicalGameQualified:false};

  function patched(store,state,effect){
    if(!WAS_ATTACK_USED(effect,0,this))
      return prior.value.call(this,store,state,effect);
    audit.interceptedAttacks++;
    const player=effect.player;
    const temp=new CardList();
    MOVE_CARDS(store,state,player.deck,temp,{count:3,sourceCard:this});
    audit.openedCards+=temp.cards.length;
    const energies=temp.cards.filter(card=>card instanceof EnergyCard);
    audit.specialEnergyOffered+=energies.filter(card=>
      card.energyType!=='BASIC'&&card.energyType!==game.EnergyType?.BASIC).length;
    if(!energies.length){
      for(const card of [...temp.cards]){
        MOVE_CARDS(store,state,temp,player.discard,{cards:[card],sourceCard:this});
        audit.discardedRemainders++;
      }
      if(temp.cards.length===0)audit.allRemaindersCleared++;
      return state;
    }
    return store.prompt(state,new AttachEnergyPrompt(
      player.id,GameMessage.ATTACH_ENERGY_CARDS,temp,
      PlayerType.BOTTOM_PLAYER,[SlotType.ACTIVE],
      {superType:SuperType.ENERGY},
      {allowCancel:false,min:energies.length,max:energies.length}
    ),transfers=>{
      if(!Array.isArray(transfers)||transfers.length!==energies.length){
        audit.unsettledPromptCallbacks++;
        return;
      }
      for(const transfer of transfers){
        const target=StateUtils.getTarget(state,player,transfer.to);
        MOVE_CARDS(store,state,temp,target,{cards:[transfer.card],sourceCard:this});
      }
      for(const card of [...temp.cards]){
        MOVE_CARDS(store,state,temp,player.discard,{cards:[card],sourceCard:this});
        audit.discardedRemainders++;
      }
      if(temp.cards.length===0)audit.allRemaindersCleared++;
    });
  }
  Object.defineProperty(proto,'reduceEffect',{...prior,value:patched});
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(proto.reduceEffect,patched);
    Object.defineProperty(proto,'reduceEffect',prior);
  }
}

module.exports={VERSION,withPaperCelestialRoar};
