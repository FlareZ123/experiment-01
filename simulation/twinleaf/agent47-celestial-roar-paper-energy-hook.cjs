'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent47-paper-celestial-roar-special-energy-hook-v1';
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(root,name));

/**
 * Reversible pinned-revision replacement for Celestial Roar's Energy selection.
 * The printed SIT135 text specifies any Energy card. The pinned upstream
 * reducer and native prompt only include Basic Energy, even when Double
 * Dragon Energy ROS can legally attach to its Dragon-type attacker.
 *
 * This test-only hook replicates the original reducer's public sequence
 * except for including all EnergyCard instances. Does not edit vendor code.
 * It is not an automatically certified replacement for full paper gameplay.
 *
 * @template T
 * @param {()=>T} execute Synchronous real Store experiment.
 * @param {object} [deps] Test injected native classes/functions.
 * @returns {{result:T,audit:object}}
 */
function withPaperCelestialRoarEnergy(execute,deps={}){
 assert.equal(typeof execute,'function');
 const RegidragoV=deps.RegidragoV??load(
   'sets/09-sword-and-shield/set-silver-tempest/regidrago-v').RegidragoV;
 const {WAS_ATTACK_USED,MOVE_CARDS}=deps.prefabs??
   load('game/store/prefabs/prefabs');
 const {EnergyCard}=deps.energyCard??
   load('game/store/card/energy-card');
 const {CardList}=deps.cardList??
   load('game/store/state/card-list');
 const {AttachEnergyPrompt}=deps.prompt??
   load('game/store/prompts/attach-energy-prompt');
 const {GameMessage}=deps.gameMessage??load('game/game-message');
 const {PlayerType,SlotType}=deps.targetTypes??
   load('game/store/actions/play-card-action');
 const {SuperType}=deps.cardTypes??load('game/store/card/card-types');
 const {StateUtils}=deps.stateUtils??load('game/store/state/state-utils');
 const proto=RegidragoV.prototype;
 const original=Object.getOwnPropertyDescriptor(proto,'reduceEffect');
 assert.equal(typeof original?.value,'function');
 const audit={version:VERSION,replacedAttackResolutions:0,
  candidateSpecialEnergyCards:0,candidateBasicEnergyCards:0,
  nativePromptsCreated:0,nativeSelectedTransfers:0,
  nativeEffectSettlements:0,competitiveQualified:false};
 function patched(store,state,effect){
  if(!WAS_ATTACK_USED(effect,0,this)){
   return original.value.call(this,store,state,effect);
  }
  audit.replacedAttackResolutions++;
  const player=effect.player,temp=new CardList();
  MOVE_CARDS(store,state,player.deck,temp,{count:3,sourceCard:this});
  const found=temp.cards.filter(card=>card instanceof EnergyCard);
  audit.candidateBasicEnergyCards+=found.filter(card=>card.energyType===1).length;
  audit.candidateSpecialEnergyCards+=found.filter(card=>card.energyType!==1).length;
  if(found.length===0){
   for(const card of [...temp.cards])
    MOVE_CARDS(store,state,temp,player.discard,{cards:[card],sourceCard:this});
   audit.nativeEffectSettlements++;
   return state;
  }
  audit.nativePromptsCreated++;
  return store.prompt(state,new AttachEnergyPrompt(player.id,
    GameMessage.ATTACH_ENERGY_CARDS,temp,PlayerType.BOTTOM_PLAYER,
    [SlotType.ACTIVE],{superType:SuperType.ENERGY},
    {min:found.length,max:found.length,allowCancel:false}
  ),transfers=>{
    assert.ok(Array.isArray(transfers)&&transfers.length===found.length,
      'Mandatory printed-energy attachment must assign every Energy');
    const assigned=new Set();
    for(const transfer of transfers){
     assert.ok(found.includes(transfer.card)&&!assigned.has(transfer.card),
       'Native Celestial Roar transferred an unavailable physical Energy');
     assert.equal(transfer.to?.player,PlayerType.BOTTOM_PLAYER);
     assert.equal(transfer.to?.slot,SlotType.ACTIVE);
     assigned.add(transfer.card);
     const target=StateUtils.getTarget(state,player,transfer.to);
     MOVE_CARDS(store,state,temp,target,{cards:[transfer.card],sourceCard:this});
     audit.nativeSelectedTransfers++;
    }
    for(const card of [...temp.cards])
     MOVE_CARDS(store,state,temp,player.discard,{cards:[card],sourceCard:this});
    audit.nativeEffectSettlements++;
  });
 }
 Object.defineProperty(proto,'reduceEffect',{...original,value:patched});
 try{return{result:execute(),audit};}
 catch(error){
  if(error&&typeof error==='object')
   error.nativeCelestialRoarSpecialEvidence=audit;
  throw error;
 }finally{
  assert.strictEqual(proto.reduceEffect,patched);
  Object.defineProperty(proto,'reduceEffect',original);
 }
}
module.exports={VERSION,withPaperCelestialRoarEnergy};
