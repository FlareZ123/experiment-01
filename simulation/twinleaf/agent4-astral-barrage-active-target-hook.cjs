'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath @returns {any} */
const native=modulePath=>require(path.join(output,modulePath));

/**
 * Original rank-1 Shadow Rider Calyrex V CRE74 has Astral Barrage:
 * choose 2 opposing Pokémon and put five damage counters on EACH.
 * With fewer than two Pokémon in play, choose the available Pokémon.
 *
 * The pinned upstream reducer erroneously counts only occupied Bench slots,
 * despite including the Active in its ChoosePokemonPrompt. This research-owned
 * opt-in correction is limited to the printed CRE74 Astral Barrage event.
 * It does not certify other prompt properties or general paper legality.
 *
 * @template T
 * @param {()=>T} execute Original native Store experiment.
 * @returns {T}
 */
function withPaperAstralBarrageTargets(execute){
  assert.equal(typeof execute,'function');
  const {ShadowRiderCalyrexV}=
    native('sets/09-sword-and-shield/set-chilling-reign/shadow-rider-calyrex-v');
  const {WAS_ATTACK_USED}=native('game/store/prefabs/prefabs');
  const {StateUtils}=native('game/store/state-utils');
  const {ChoosePokemonPrompt}=
    native('game/store/prompts/choose-pokemon-prompt');
  const {PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {PutCountersEffect}=native('game/store/effects/attack-effects');
  const {GameMessage}=native('game/game-message');
  const proto=ShadowRiderCalyrexV.prototype;
  const original=Object.getOwnPropertyDescriptor(proto,'reduceEffect');
  assert.equal(typeof original?.value,'function');

  function paperAstralBarrage(store,state,effect){
    if(!WAS_ATTACK_USED(effect,1,this)){
      return original.value.call(this,store,state,effect);
    }
    const player=effect.player;
    const opponent=StateUtils.getOpponent(state,player);
    const available=Number(opponent.active.cards.length>0)+
      opponent.bench.filter(slot=>slot.cards.length>0).length;
    const required=Math.min(2,available);
    if(required===0)return state;
    return store.prompt(state,new ChoosePokemonPrompt(
      player.id,
      GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
      PlayerType.TOP_PLAYER,
      [SlotType.BENCH,SlotType.ACTIVE],
      {min:required,max:required,allowCancel:false}
    ),selected=>{
      for(const target of selected??[]){
        const damageEffect=new PutCountersEffect(effect,50);
        damageEffect.target=target;
        store.reduceEffect(state,damageEffect);
      }
    });
  }

  Object.defineProperty(proto,'reduceEffect',
    {...original,value:paperAstralBarrage});
  try{return execute();}
  finally{
    assert.strictEqual(proto.reduceEffect,paperAstralBarrage);
    Object.defineProperty(proto,'reduceEffect',original);
  }
}
module.exports={withPaperAstralBarrageTargets};
