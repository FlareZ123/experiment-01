'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const BASE=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=part=>require(path.join(BASE,part));
const PRINTING='Mimikyu GRI';
const PRIOR_ATTACK='Apex Dragon';
const PRIOR_POKEMON='Regidrago VSTAR SIT';

/**
 * Strictly opt-in source-scoped research hook to test the rule-legal hypothesis
 * that non-GX Apex Dragon can be copied by Mimikyu GRI's printed Copycat.
 *
 * The pinned helper blocks every attack with copycatAttack=true. The print
 * instead excludes GX attacks; this hook makes one exact non-GX Apex source
 * eligible for delegated copied-attack execution. The actual nested Dragon
 * selection and engine result are left to original Store prompts/effects.
 * This is not certified for general full-game use or competitive evaluation.
 *
 * @template T
 * @param {()=>T} execute Staged real Store trial, synchronous.
 * @returns {{result:T,audit:object}} Reversible prototype experiment and count.
 */
function withMimikyuApexPaperHypothesis(execute){
  assert.equal(typeof execute,'function');
  const {Mimikyu}=native('sets/08-sun-and-moon/set-guardians-rising/mimikyu');
  const {WAS_ATTACK_USED}=native('game/store/prefabs/prefabs');
  const {runDelegatedCopiedAttackGenerator}=
    native('game/store/prefabs/copy-attack-delegation');
  const descriptor=Object.getOwnPropertyDescriptor(Mimikyu.prototype,'reduceEffect');
  assert.equal(typeof descriptor?.value,'function');
  const original=descriptor.value;
  const audit={printing:PRINTING,qualifiedCompetitiveGames:0,
    enabled:false,intercepts:0,delegationAttempted:0,restored:false,
    exactSourceOnly:true,noVendorEdits:true};
  /** @this {object} */
  function patched(store,state,effect){
    if(WAS_ATTACK_USED(effect,1,this)){
      const player=effect.player;
      const opponent=state.players.find(p=>p.id!==player.id);
      const previous=state.playerLastAttack?.[opponent?.id];
      if(this.fullName===PRINTING&&
         previous?.sourceCard?.fullName===PRIOR_POKEMON&&
         previous.attack?.name===PRIOR_ATTACK&&
         previous.attack?.copycatAttack===true&&
         previous.attack?.gxAttack!==true){
        const originalSource=previous.sourceCard;
        audit.intercepts++;
        let generator;
        generator=runDelegatedCopiedAttackGenerator(
          ()=>generator.next(),{
            store,state,player,opponent,copycatCard:this,
            sourceCard:originalSource,
            selectedAttack:previous.attack,
            sourceSlot:effect.source
          });
        audit.delegationAttempted++;
        return generator.next().value;
      }
    }
    return original.call(this,store,state,effect);
  }
  Object.defineProperty(Mimikyu.prototype,'reduceEffect',
    {...descriptor,value:patched});
  audit.enabled=true;
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(Mimikyu.prototype.reduceEffect,patched);
    Object.defineProperty(Mimikyu.prototype,'reduceEffect',descriptor);
    audit.restored=Mimikyu.prototype.reduceEffect===original;
  }
}
module.exports={withMimikyuApexPaperHypothesis,PRINTING,PRIOR_ATTACK,PRIOR_POKEMON};
