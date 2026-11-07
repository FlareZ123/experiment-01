'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const BASE=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(BASE,p));

/**
 * Purely exploratory, narrow native effect-settlement witness:
 * when the real previous attack is non-GX Apex Dragon, preselect one owner's
 * discarded Dragon Dialga-GX UPR Timeless-GX as the copied payload, then use
 * Twinleaf's synchronous source DelegatedCopiedAttack to apply original
 * printed damage and extra-turn handlers.
 *
 * This variant deliberately skips the player's mandatory strategic choice.
 * It can establish downstream damage/GX semantics, but cannot qualify a
 * playable original game or be installed as a general-purpose paper fix.
 *
 * @template T
 * @param {()=>T} execute Synchronous two-seat native fixture.
 * @returns {{result:T,audit:object}} Reversible, audited source-only test.
 */
function withPreselectedNativeMimikyuApexTimeless(execute){
  assert.equal(typeof execute,'function');
  const {Mimikyu}=native('sets/08-sun-and-moon/set-guardians-rising/mimikyu');
  const {WAS_ATTACK_USED}=native('game/store/prefabs/prefabs');
  const {runDelegatedCopiedAttack}=
    native('game/store/prefabs/copy-attack-delegation');
  const descriptor=Object.getOwnPropertyDescriptor(Mimikyu.prototype,'reduceEffect');
  assert.equal(typeof descriptor?.value,'function');
  const original=descriptor.value;
  const audit={tag:'agent46-apex-sync-preselected-native-v1',
    printedSourceOnly:true,ownerDragonInDiscardRequired:true,
    sourceCardHandlerUsed:true,choicePromptsSkipped:true,
    count:0,restoreVerified:false,qualifiedCompetitiveGames:0};

  /** @this {object} */
  function patched(store,state,effect){
    if(WAS_ATTACK_USED(effect,1,this)&&this.fullName==='Mimikyu GRI'){
      const player=effect.player;
      const opponent=state.players.find(p=>p.id!==player.id);
      const last=state.playerLastAttack?.[opponent?.id];
      if(last?.sourceCard?.fullName==='Regidrago VSTAR SIT'&&
         last?.attack?.name==='Apex Dragon'&&
         last.attack.gxAttack!==true){
        const dragon=player.discard.cards.find(c=>
          c.fullName==='Dialga-GX UPR'&&
          c.attacks.some(a=>a.name==='Timeless-GX'&&a.gxAttack===true));
        if(dragon===undefined)return state;
        const targetAttack=dragon.attacks.find(a=>a.name==='Timeless-GX');
        assert.ok(targetAttack);
        audit.count++;
        return runDelegatedCopiedAttack({
          store,state,player,opponent,copycatCard:this,
          sourceCard:dragon,selectedAttack:targetAttack,
          sourceSlot:effect.source
        });
      }
    }
    return original.call(this,store,state,effect);
  }
  Object.defineProperty(Mimikyu.prototype,'reduceEffect',
    {...descriptor,value:patched});
  try{return {result:execute(),audit};}
  finally{
    Object.defineProperty(Mimikyu.prototype,'reduceEffect',descriptor);
    audit.restoreVerified=Mimikyu.prototype.reduceEffect===original;
  }
}
module.exports={withPreselectedNativeMimikyuApexTimeless};
