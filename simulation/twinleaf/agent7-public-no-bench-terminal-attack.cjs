'use strict';

const VERSION='agent7-public-lone-active-knockout-heuristic-v2-special-energy-penalty';

/**
 * A conservative, fully actor-visible potential terminal route. If the
 * opponent has only one Pokémon, a Knock Out of that Active Pokémon ends
 * the game regardless of Prize count. This is a public damage *screen*:
 * native Store and paper effects still need to settle the actual attack.
 *
 * Reject unknown target HP/damage, unknown card metadata, Active Tools and
 * target Abilities; they may modify HP, prevention or resulting damage.
 * Ignore beneficial Weakness, but account for printed matching Resistance.
 *
 * @param {object} view Detached authentic owner-root public observation.
 * @param {object} attack Independent payable printed-damage attack intent.
 * @returns {boolean} A potential last-Pokémon Knock Out, never a guarantee.
 */
function publicNoBenchPotentialKnockout(view,attack){
  const own=view?.ownPublic?.active;
  const opponent=view?.opponentPublic;
  const target=opponent?.active;
  if(!own||!target||attack?.kind!=='attack'||
     !Number.isSafeInteger(attack.printedDamage)||
     attack.printedDamage<=0||
     !Number.isSafeInteger(target.hp)||target.hp<=0||
     !Number.isSafeInteger(target.damage)||target.damage<0||
     target.damage>=target.hp||
     !Array.isArray(opponent.bench)||
     opponent.bench.some(p=>p!==null)||
     !Array.isArray(target.energies)||
     !target.energies.every(energy=>typeof energy==='string'&&
       /^(Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy(?: |$)/.test(energy))||
     !Array.isArray(own.energies)||
     !Array.isArray(target.tools)||target.tools.length>0||
     !Array.isArray(target.abilities)||target.abilities.length>0||
     !Array.isArray(own.printed?.types)||
     !Array.isArray(target.printed?.resistance))
    return false;
  let resistance=0;
  for(const entry of target.printed.resistance){
    if(!own.printed.types.includes(entry.type))continue;
    if(!Number.isFinite(entry.value))return false;
    resistance=Math.max(resistance,Math.abs(entry.value));
  }
  // Double Turbo Energy's printed self-attack modifier is -20 per card.
  // Positive Weakness and other unmodeled boosts are deliberately excluded.
  const doubleTurboCount=own.energies.filter(energy=>
    typeof energy==='string'&&
      (energy==='Double Turbo Energy'||
       energy.startsWith('Double Turbo Energy '))).length;
  return attack.printedDamage-20*doubleTurboCount-resistance>=
    target.hp-target.damage;
}

module.exports={VERSION,publicNoBenchPotentialKnockout};
