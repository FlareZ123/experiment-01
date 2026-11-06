'use strict';

const VERSION='agent14-public-counter-condition-witness-v1';
const COUNTER_UNIT=10;

/**
 * Detect a narrowly supported immediate, damage-counter-dependent printed
 * attack effect from the acting owner's visible opponent board. This
 * intentionally proves only that the printed numerical prerequisite holds.
 * Attack costs, rule-box powers, immunities, active locks, effect resolution
 * and the strategic value of a Knock Out must be checked separately.
 *
 * @param {object} view Detached acting-owner root observation.
 * @param {object} attack Printed public attack definition.
 * @returns {object} Fixed-shape owner-visible condition witness.
 */
function counterKnockoutPrerequisite(view,attack){
  const text=attack?.text??'';
  const exactActive=text.match(
    /^If your opponent's Active Pokémon has exactly (\d+) damage counters on it, that Pokémon is Knocked Out\./);
  const minimumActive=text.match(
    /^If your opponent's Active Pokémon has (\d+) or more damage counters on it, that Pokémon is Knocked Out\./);
  const exactAny=text.match(
    /^Knock Out 1 of your opponent's Pokémon that has exactly (\d+) damage counters on it\./);
  const matched=exactActive??minimumActive??exactAny;
  if(!matched)return {recognized:false,satisfied:false,
    condition:null,requiredDamage:null,targets:[]};
  const requiredDamage=Number(matched[1])*COUNTER_UNIT;
  const slots=[
    {slot:'active',pokemon:view.opponentPublic?.active},
    ...(exactAny?(view.opponentPublic?.bench??[]).map((pokemon,index)=>({
      slot:'bench',index,pokemon})):[])
  ];
  const candidates=slots.filter(({pokemon})=>
    pokemon&&Number.isSafeInteger(pokemon.damage)&&
    (minimumActive?pokemon.damage>=requiredDamage:
      pokemon.damage===requiredDamage));
  return {
    recognized:true,satisfied:candidates.length>0,
    condition:minimumActive?'minimum-count':'exact-count',
    requiredDamage,targets:candidates.map(({slot,index,pokemon})=>({
      slot,...(slot==='bench'?{index}:{}),
      printing:pokemon.printing,observedDamage:pokemon.damage,
      printedHp:pokemon.hp
    }))
  };
}

module.exports={VERSION,counterKnockoutPrerequisite};
