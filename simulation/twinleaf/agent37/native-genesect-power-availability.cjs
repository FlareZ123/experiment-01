'use strict';

const assert=require('node:assert/strict');

const VERSION='agent37-native-genesect-power-availability-v1';
const SOURCE='Genesect V FST',POWER='Fusion Strike System';

/**
 * Ask the pinned Store's CheckPokemonPowersEffect for actual usable power
 * names at the owner's physical active and Bench positions.
 * This is the same native legality check made by UseAbilityAction itself;
 * it respects Klefki, Path to the Peak, Garbotoxin, Iron Thorns and future
 * competing locks without allowing the selector to inspect private zones.
 *
 * @param {object} state Live native Store state.
 * @param {object} store Actual native Store.
 * @param {0|1} seat The physical Genesect owner seat.
 * @param {{CheckPokemonPowersEffect?:Function}} [dependencies] Test seam.
 * @returns {Array<{position:'active'|'bench',benchIndex:number|null}>}
 */
function nativeGenesectPowerAvailability(state,store,seat,dependencies={}){
  assert.ok(seat===0||seat===1);
  assert.equal(state.activePlayer,seat);
  const player=state.players[seat];
  assert.ok(player);
  const {CheckPokemonPowersEffect}=dependencies.CheckPokemonPowersEffect?{
    CheckPokemonPowersEffect:dependencies.CheckPokemonPowersEffect
  }:require('../../../vendor/twinleaf/ptcg-server/output/game/store/effects/check-effects');
  const slots=[
    {position:'active',benchIndex:null,slot:player.active},
    ...player.bench.map((slot,benchIndex)=>({
      position:'bench',benchIndex,slot
    }))
  ];
  const allowed=[];
  for(const {position,benchIndex,slot} of slots){
    const card=slot?.getPokemonCard?.();
    if(card?.fullName!==SOURCE)continue;
    const effect=new CheckPokemonPowersEffect(player,card);
    store.reduceEffect(state,effect);
    if(effect.powers.some(power=>power.name===POWER&&
       power.useWhenInPlay===true))
      allowed.push({position,benchIndex});
  }
  return allowed;
}

module.exports={VERSION,nativeGenesectPowerAvailability};
