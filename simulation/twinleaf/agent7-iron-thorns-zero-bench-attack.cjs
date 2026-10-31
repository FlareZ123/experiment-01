'use strict';

const VERSION='agent7-thorns-zero-own-bench-printed-volt-cyclone-v1';

/**
 * Screen an owner-only original Store option. The supplied card database
 * describes Volt Cyclone as 140 damage then moving one Energy from itself
 * to a Benched Pokémon. With no own Bench, that second instruction has no
 * recipient. The advanced rulebook says applicable attack portions still
 * resolve. Structural screening cannot certify all prevention effects.
 *
 * @param {object} view Genuine detached public owner-root observation.
 * @param {object} intent Independently offered publicly payable attack.
 * @returns {boolean}
 */
function noOwnBenchPrintedVoltCyclone(view,intent){
  const own=view?.ownPublic;
  const active=own?.active;
  if(!active||active.name!=='Iron Thorns ex'||
     intent?.kind!=='attack'||intent.attackName!=='Volt Cyclone'||
     intent.printedDamage!==140||
     !Array.isArray(own.bench)||
     !own.bench.every(slot=>slot===null)||
     !Array.isArray(active.attacks))return false;
  return active.attacks.some(a=>
    a.name==='Volt Cyclone'&&
    (a.damage===140||a.damage==='140')&&
    a.text==='Move an Energy from this Pokémon to 1 of your Benched Pokémon.');
}

module.exports={VERSION,noOwnBenchPrintedVoltCyclone};
