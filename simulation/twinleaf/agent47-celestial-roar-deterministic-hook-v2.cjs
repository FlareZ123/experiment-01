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
const activeHookByPrototype=new WeakMap();

/**
 * Scoped serial native Store installer, including asynchronous owner prompts.
 * The pinned reducer is on a shared class prototype: never run two native
 * games concurrently in the same process while this patch is installed.
 */
function installDeterministicCelestialRoar(deps={}) {
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
  assert.ok(!activeHookByPrototype.has(proto),
    'CELESTIAL_HOOK_ALREADY_INSTALLED: use separate native processes for concurrency');
  const original=Object.getOwnPropertyDescriptor(proto,'reduceEffect');
  assert.equal(typeof original?.value,'function');
  assert.equal(original.configurable!==false,true,'Celestial Roar reducer must be restorable');
  // Source-bound to original rank20 Basic/DDE. Any other restricted Special
  // Energy requires explicit paper/native attachment proof.
  const isKnownAttachableSpecial=card=>{
    const id=card.fullName??card.printing??card.name??'';
    return /^Double Dragon Energy(?: ROS(?: 97)?)?$/i.test(id);
  };
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
    for(const card of moved){
      if(card instanceof EnergyCard){
        if(card.energyType!==EnergyType.BASIC && !isKnownAttachableSpecial(card))
          throw new Error('UNVERIFIED_CELESTIAL_SPECIAL_ENERGY_ATTACHABILITY');
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
  let restored=false;
  const installed=Object.freeze({
    audit,
    restore(){
      if(restored)return;
      assert.strictEqual(proto.reduceEffect,patched,'Celestial Roar reducer was replaced concurrently');
      Object.defineProperty(proto,'reduceEffect',original);
      restored=true;
      activeHookByPrototype.delete(proto);
    },
    get restored(){return restored;}
  });
  activeHookByPrototype.set(proto,installed);
  return installed;
}
/** Synchronous owner scope: always restore the original native reducer. */
function withDeterministicCelestialRoar(execute,deps={}) {
  assert.equal(typeof execute,'function');
  const hook=installDeterministicCelestialRoar(deps);
  try {
    const result=execute();
    if(result&&typeof result.then==='function')
      throw new TypeError('withDeterministicCelestialRoar requires synchronous execute');
    return {result,audit:hook.audit};
  }catch(error){
    if(error&&typeof error==='object')error.celestialRoarDeterministicAudit=hook.audit;
    throw error;
  }finally{hook.restore();}
}
/** Asynchronous scoped owner run, SERIAL; no parallel games in this process. */
async function withDeterministicCelestialRoarAsync(execute,deps={}) {
  assert.equal(typeof execute,'function');
  const hook=installDeterministicCelestialRoar(deps);
  try{return {result:await execute(),audit:hook.audit};}
  catch(error){
    if(error&&typeof error==='object')error.celestialRoarDeterministicAudit=hook.audit;
    throw error;
  }finally{hook.restore();}
}
module.exports={VERSION,installDeterministicCelestialRoar,
  withDeterministicCelestialRoar,withDeterministicCelestialRoarAsync};
