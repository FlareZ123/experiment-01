'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const VERSION='agent25-regidrago-v-celestial-roar-custody-hook-v1';
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(output,name));

/**
 * Research-only reversible patch for original pinned Regidrago V SIT.
 * Original Celestial Roar uses temp.cards.forEach while MOVE_CARDS mutates
 * that same array and skips a non-Energy leftover. Preserve native prompt,
 * timing and targeting. Snapshot remaining cards before moving to discard.
 *
 * @template T
 * @param {()=>T} execute Exact synchronous pinned Store replay.
 * @param {object} [deps] Optional test-only injection.
 * @returns {{result:T,audit:object}}
 */
function withCorrectedCelestialRoarCustody(execute,deps={}){
  assert.equal(typeof execute,'function');
  const Native=deps.RegidragoV??load(
    'sets/09-sword-and-shield/set-silver-tempest/regidrago-v').RegidragoV;
  const game=deps.game??load('game');
  const prefabs=deps.prefabs??load('game/store/prefabs/prefabs');
  const {EnergyCard,EnergyType,SuperType,PlayerType,SlotType,
    GameMessage,AttachEnergyPrompt,StateUtils,CardList}=game;
  const {WAS_ATTACK_USED,MOVE_CARDS}=prefabs;
  assert.equal(typeof WAS_ATTACK_USED,'function');
  assert.equal(typeof MOVE_CARDS,'function');
  const proto=Native.prototype;
  const descriptor=Object.getOwnPropertyDescriptor(proto,'reduceEffect');
  assert.equal(typeof descriptor?.value,'function');
  const audit={version:VERSION,enginePin:PIN,
    originalVendorFilesUnmodified:true,attacks:0,
    topDeckPhysicalCards:0,attachmentPrompts:0,
    energyAttached:0,remainingDiscarded:0,
    tempRemainderLengths:[],allRemaindersZero:true,
    originalReducerRestored:false,qualifiedGames:0};
  function corrected(store,state,effect){
    if(!WAS_ATTACK_USED(effect,0,this))
      return descriptor.value.call(this,store,state,effect);
    const player=effect.player,temp=new CardList();
    MOVE_CARDS(store,state,player.deck,temp,{count:3,sourceCard:this});
    audit.attacks++;
    audit.topDeckPhysicalCards+=temp.cards.length;
    const eligible=temp.cards.filter(card=>
      card instanceof EnergyCard&&card.energyType===EnergyType.BASIC);
    if(eligible.length===0){
      for(const card of temp.cards.slice()){
        MOVE_CARDS(store,state,temp,player.discard,{cards:[card],sourceCard:this});
        audit.remainingDiscarded++;
      }
      audit.tempRemainderLengths.push(temp.cards.length);
      audit.allRemaindersZero&&=temp.cards.length===0;
      return state;
    }
    audit.attachmentPrompts++;
    return store.prompt(state,new AttachEnergyPrompt(
      player.id,GameMessage.ATTACH_ENERGY_CARDS,temp,
      PlayerType.BOTTOM_PLAYER,[SlotType.ACTIVE],
      {superType:SuperType.ENERGY,energyType:EnergyType.BASIC},
      {min:eligible.length,max:eligible.length,allowCancel:false}
    ),transfers=>{
      if(!transfers)return;
      for(const transfer of transfers){
        const target=StateUtils.getTarget(state,player,transfer.to);
        MOVE_CARDS(store,state,temp,target,{
          cards:[transfer.card],sourceCard:this});
        audit.energyAttached++;
      }
      // Correct the pinned in-place forEach mutation by snapshotting first.
      for(const card of temp.cards.slice()){
        MOVE_CARDS(store,state,temp,player.discard,{
          cards:[card],sourceCard:this});
        audit.remainingDiscarded++;
      }
      audit.tempRemainderLengths.push(temp.cards.length);
      audit.allRemaindersZero&&=temp.cards.length===0;
    });
  }
  Object.defineProperty(proto,'reduceEffect',{...descriptor,value:corrected});
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(proto.reduceEffect,corrected,
      'Regidrago V reducer changed during reversible execution');
    Object.defineProperty(proto,'reduceEffect',descriptor);
    assert.deepEqual(Object.getOwnPropertyDescriptor(proto,'reduceEffect'),descriptor);
    audit.originalReducerRestored=true;
  }
}
module.exports={VERSION,PIN,withCorrectedCelestialRoarCustody};
