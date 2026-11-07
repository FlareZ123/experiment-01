'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const BASE=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(BASE,p));

/**
 * For the exact proven original source state, directly resolve the inner
 * Apex Dragon attack choice on a Dragon Dialga-GX in Mimikyu owner's discard.
 * This is a paper-equivalent flattening of the printed
 * Copycat -> Apex Dragon -> chosen Dragon attack line, not a generalized
 * recursive copy engine. It leaves all damage, GX usage, and extra-turn
 * operations to the pinned source Dialga's native delegated handlers.
 *
 * Always opt-in and reversible. The earlier full two-level native delegation
 * merely exposed a prompt but failed to apply Timeless-GX, hence this
 * independently falsifiable reduction experiment.
 *
 * @template T
 * @param {()=>T} execute Synchronous pinned Store workload.
 * @returns {{result:T,audit:object}} Complete audit with reversible lifecycle.
 */
function withMimikyuApexFlattenedCounterline(execute){
  assert.equal(typeof execute,'function');
  const {Mimikyu}=native('sets/08-sun-and-moon/set-guardians-rising/mimikyu');
  const {WAS_ATTACK_USED}=native('game/store/prefabs/prefabs');
  const {COPY_ATTACK_FROM_POKEMON_LIST}=
    native('game/store/prefabs/copy-attack-prefabs');
  const descriptor=Object.getOwnPropertyDescriptor(Mimikyu.prototype,'reduceEffect');
  assert.equal(typeof descriptor?.value,'function');
  const original=descriptor.value;
  const audit={version:'agent46-exact-apex-flattened-exploration-v1',
    exactPreviousAttackOnly:true,exactDragonPayloadPrintingOnly:true,
    intercepted:0,delegatedDragonChoices:0,restored:false,
    nativeSourceEdited:false,qualifiedCompetitiveGames:0};
  /** @this {object} */
  function patched(store,state,effect){
    if(WAS_ATTACK_USED(effect,1,this)&&this.fullName==='Mimikyu GRI'){
      const player=effect.player;
      const opponent=state.players.find(p=>p.id!==player.id);
      const previous=state.playerLastAttack?.[opponent?.id];
      if(previous?.attack?.name==='Apex Dragon'&&
         previous?.sourceCard?.fullName==='Regidrago VSTAR SIT'&&
         previous.attack.copycatAttack===true&&
         previous.attack.gxAttack!==true){
        audit.intercepted++;
        const target=player.discard.cards.filter(card=>
          card.fullName==='Dialga-GX UPR'&&
          card.attacks.some(a=>a.name==='Timeless-GX'&&a.gxAttack===true));
        if(target.length===0)return state;
        audit.delegatedDragonChoices++;
        return COPY_ATTACK_FROM_POKEMON_LIST(
          store,state,effect,target,
          {allowCancel:false,maxRetries:1});
      }
    }
    return original.call(this,store,state,effect);
  }
  Object.defineProperty(Mimikyu.prototype,'reduceEffect',
    {...descriptor,value:patched});
  try{return {result:execute(),audit};}
  finally{
    Object.defineProperty(Mimikyu.prototype,'reduceEffect',descriptor);
    audit.restored=Mimikyu.prototype.reduceEffect===original;
  }
}
module.exports={withMimikyuApexFlattenedCounterline};
