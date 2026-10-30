'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent24-paper-spiritomb-shared-ace-hand-hook-v1';
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=p=>require(path.join(root,p));

/**
 * Reversible pinned-revision hook for Spiritomb LTR's own ACE SPEC plays.
 *
 * The supplied printed Sealing Scream blocks BOTH players' ACE SPEC plays
 * from hand. Pinned Twinleaf's reducer only inspects the OTHER player's
 * Pokémon and therefore lets its controller use an ACE SPEC. The hook
 * adds the missing owner case, retaining the original opponent branch.
 *
 * This is a research-only corrective diagnostic. For attached ACE SPEC
 * Energy, native AttachEnergyEffect does not itself distinguish from-hand
 * and from-deck, so no broad complete-paper-equivalence claim follows.
 *
 * @template T
 * @param {()=>T} execute Synchronous real pinned Store activity
 * @param {object} [deps] Optional real-class overrides for isolated tests.
 * @returns {{result:T,audit:object}}
 */
function withPaperSpiritombSharedAce(execute,deps={}){
  assert.equal(typeof execute,'function');
  const Spiritomb=deps.Spiritomb??load(
    'sets/06-black-and-white/set-legendary-treasures/spiritomb').Spiritomb;
  const types=deps.playEffects??load('game/store/effects/play-card-effects');
  const {CardTag,PlayerType}=deps.cardTypes??load(
    'game/store/card/card-types');
  const {GameError}=deps.gameError??load('game/game-error');
  const {GameMessage}=deps.gameMessage??load('game/game-message');
  const {IS_ABILITY_BLOCKED}=deps.prefabs??load(
    'game/store/prefabs/prefabs');
  const descriptor=Object.getOwnPropertyDescriptor(
    Spiritomb.prototype,'reduceEffect');
  assert.equal(typeof descriptor?.value,'function');
  const audit={schema:VERSION,ownerAceAttempts:0,
    ownerAceDenied:0,ownerAceAbilityBlocked:0,
    originalOpponentReducerCalls:0,competitiveQualified:false};
  function isAcePlay(effect){
    if(effect instanceof types.PlayItemEffect||
       effect instanceof types.PlayStadiumEffect||
       effect instanceof types.AttachPokemonToolEffect)
      return effect.trainerCard?.hasTag(CardTag.ACE_SPEC)===true;
    if(effect instanceof types.AttachEnergyEffect)
      return effect.energyCard?.hasTag(CardTag.ACE_SPEC)===true;
    return false;
  }
  function patched(store,state,effect){
    if(isAcePlay(effect)){
      const player=effect.player;
      let thisIsMySpiritomb=false;
      player.forEachPokemon(PlayerType.BOTTOM_PLAYER,
        (_zone,card)=>{if(card===this)thisIsMySpiritomb=true;});
      if(thisIsMySpiritomb){
        audit.ownerAceAttempts++;
        if(IS_ABILITY_BLOCKED(store,state,player,this)){
          audit.ownerAceAbilityBlocked++;
        }else{
          audit.ownerAceDenied++;
          throw new GameError(GameMessage.BLOCKED_BY_EFFECT);
        }
      }
    }
    audit.originalOpponentReducerCalls++;
    return descriptor.value.call(this,store,state,effect);
  }
  Object.defineProperty(Spiritomb.prototype,'reduceEffect',{
    ...descriptor,value:patched
  });
  try{return {result:execute(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.nativePaperSpiritombSharedAceEvidence=audit;
    throw error;
  }finally{
    assert.strictEqual(Spiritomb.prototype.reduceEffect,patched);
    Object.defineProperty(Spiritomb.prototype,'reduceEffect',descriptor);
  }
}
module.exports={VERSION,withPaperSpiritombSharedAce};
