'use strict';
const path=require('node:path');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
let restore=null;

/**
 * Opt-in compatibility for the global once-per-turn restriction printed on
 * Crobat V DAA 104 Dark Asset. Pinned Twinleaf checks its own instance only,
 * which allows a second distinct Crobat V to draw again in the same turn.
 *
 * Keep the printed Basic play legal and skip only the extra Ability prompt.
 * Vendor code is left unmodified.
 *
 * @returns {()=>void} Idempotent hook uninstaller.
 */
function installGlobalDarkAssetHook(){
  if(restore)return restore;
  const {CrobatV}=require(path.join(output,
    'sets/09-sword-and-shield/set-darkness-ablaze/crobat-v'));
  const {PlayPokemonEffect}=require(path.join(output,
    'game/store/effects/play-card-effects'));
  const original=CrobatV.prototype.reduceEffect;
  /** @param {object} store @param {object} state @param {object} effect */
  function corrected(store,state,effect){
    if(effect instanceof PlayPokemonEffect&&effect.pokemonCard===this&&
       effect.player.marker.hasMarker(this.DARK_ASSET_MARKER)){
      return state;
    }
    return original.call(this,store,state,effect);
  }
  CrobatV.prototype.reduceEffect=corrected;
  restore=()=>{
    if(CrobatV.prototype.reduceEffect!==corrected)
      throw new Error('Global Dark Asset reducer ownership lost');
    CrobatV.prototype.reduceEffect=original;
    restore=null;
  };
  return restore;
}
module.exports={installGlobalDarkAssetHook};
