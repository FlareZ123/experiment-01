'use strict';

const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const load=name=>require(path.join(output,name));
let restoreActive=null;

/**
 * Repair the pinned Gengar & Mimikyu-GX TEU Horror House-GX extra
 * Psychic-Energy condition in BOTH directions. Printed `provides` does not
 * account for Prism/Rainbow or Temple of Sinnoh. Use effective Energy units.
 * Only overrides one printed attack branch; all other card effects delegate.
 * Installation is reversible, idempotent and must never be combined with
 * the older additive Horror House hook in the same match.
 *
 * @returns {()=>void} Restore pinned reducer prototype.
 */
function installEffectiveHorrorHouseEnergyHook(){
  if(restoreActive)return restoreActive;
  const {GengarMimikyuGX}=load(
    'sets/08-sun-and-moon/set-team-up/gengar-and-mimikyu-gx');
  const {CheckProvidedEnergyEffect}=load('game/store/effects/check-effects');
  const {CardType}=load('game/store/card/card-types');
  const {StateUtils}=load('game/store/state-utils');
  const {WAS_ATTACK_USED,BLOCK_IF_GX_ATTACK_USED,DRAW_CARDS_UNTIL_CARDS_IN_HAND}=
    load('game/store/prefabs/prefabs');
  const {OPPONENT_CANNOT_PLAY_ANY_CARDS}=
    load('game/store/prefabs/effect-of-attack-prefabs');
  const original=GengarMimikyuGX.prototype.reduceEffect;

  /** @param {object} store @param {object} state @param {object} effect */
  function corrected(store,state,effect){
    if(!WAS_ATTACK_USED(effect,1,this)){
      return original.call(this,store,state,effect);
    }
    const player=effect.player;
    BLOCK_IF_GX_ATTACK_USED(player);
    player.usedGX=true;
    OPPONENT_CANNOT_PLAY_ANY_CARDS(store,state,effect,this);

    const provided=new CheckProvidedEnergyEffect(player);
    store.reduceEffect(state,provided);
    if(StateUtils.checkEnoughEnergy(provided.energyMap,[
      CardType.PSYCHIC,CardType.PSYCHIC])){
      [player,StateUtils.getOpponent(state,player)].forEach(p=>
        DRAW_CARDS_UNTIL_CARDS_IN_HAND(p,7));
    }
    return state;
  }

  GengarMimikyuGX.prototype.reduceEffect=corrected;
  restoreActive=()=>{
    if(GengarMimikyuGX.prototype.reduceEffect===corrected){
      GengarMimikyuGX.prototype.reduceEffect=original;
    }
    restoreActive=null;
  };
  return restoreActive;
}

/** @template T @param {()=>T} execute @returns {T} */
function withEffectiveHorrorHouseEnergy(execute){
  const restore=installEffectiveHorrorHouseEnergyHook();
  try{
    return execute();
  }finally{
    restore();
  }
}

module.exports={installEffectiveHorrorHouseEnergyHook,
  withEffectiveHorrorHouseEnergy};
