'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent47-paper-celestial-roar-deterministic-energy-v2';
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(root,name));

/**
 * Ephemeral, reversible pinned-native Regidrago V SIT135 Celestial Roar hook.
 * Replaces a non-paper Basic-only and orphan-prone AttachEnergyPrompt reducer
 * with the deterministic printed instruction: top 3 to transient zone, move
 * every Energy (including Special) to the same attacking Regidrago, move the
 * rest to discard. No arbitrary card/target choice exists for this attack.
 *
 * The native Store's own MOVE_CARDS is used for every physical transition.
 * No upstream source is edited. Native Store and all triggers are still the
 * actual engine, but this hook's fidelity must be separately native-tested.
 * Must wrap a SYNCHRONOUS test / game step; never await inside execute().
 */
function withDeterministicCelestialRoar(execute,deps={}) {
  assert.equal(typeof execute,'function');
  const RegidragoV=deps.RegidragoV??load(
    'sets/09-sword-and-shield/set-silver-tempest/regidrago-v').RegidragoV;
  const prefabs=deps.prefabs??load('game/store/prefabs/prefabs');
  const {WAS_ATTACK_USED,MOVE_CARDS}=prefabs;
  const {EnergyCard}=deps.energyCard??load('game/store/card/energy-card');
  const {CardList}=deps.cardList??load('game/store/state/card-list');
  const {EnergyType}=deps.cardTypes??load('game/store/card/card-types');
  assert.equal(typeof WAS_ATTACK_USED,'function');
  assert.equal(typeof MOVE_CARDS,'function');
  const proto=RegidragoV.prototype;
  const original=Object.getOwnPropertyDescriptor(proto,'reduceEffect');
  assert.equal(typeof original?.value,'function');
  assert.equal(original.configurable!==false,true,'Celestial Roar reducer must be restorable');
  const audit={version:VERSION,attacksIntercepted:0,topCardsMoved:0,
    attachedBasic:0,attachedSpecial:0,discardedNonEnergy:0,
    nativePromptsCreated:0,completeSettlements:0,competitiveQualified:false};
  function patched(store,state,effect) {
    if(!WAS_ATTACK_USED(effect,0,this))
      return original.value.call(this,store,state,effect);
    audit.attacksIntercepted++;
    const player=effect.player;
    assert.ok(player?.deck&&player?.discard&&player?.active,'Celestial Roar has no physical actor zone');
    const temp=new CardList();
    MOVE_CARDS(store,state,player.deck,temp,{count:3,sourceCard:this});
    const moved=[...temp.cards];
    audit.topCardsMoved+=moved.length;
    // Snapshot before moving anything: do not iterate a mutating live zone.
    for(const card of moved){
      if(card instanceof EnergyCard){
        MOVE_CARDS(store,state,temp,player.active,{cards:[card],sourceCard:this});
        if(card.energyType===EnergyType.BASIC)audit.attachedBasic++;
        else audit.attachedSpecial++;
      } else {
        MOVE_CARDS(store,state,temp,player.discard,{cards:[card],sourceCard:this});
        audit.discardedNonEnergy++;
      }
    }
    assert.equal(temp.cards.length,0,'Celestial Roar left a card in the transient zone');
    audit.completeSettlements++;
    return state;
  }
  Object.defineProperty(proto,'reduceEffect',{...original,value:patched});
  try{
    const result=execute();
    if(result&&typeof result.then==='function')
      throw new TypeError('withDeterministicCelestialRoar requires synchronous execute');
    return {result,audit};
  }catch(error){
    if(error&&typeof error==='object')error.celestialRoarDeterministicAudit=audit;
    throw error;
  }finally{
    assert.strictEqual(proto.reduceEffect,patched,'Celestial Roar reducer was replaced concurrently');
    Object.defineProperty(proto,'reduceEffect',original);
  }
}
module.exports={VERSION,withDeterministicCelestialRoar};
