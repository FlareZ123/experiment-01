'use strict';

function hasPower(pokemon,name) {
  return Array.isArray(pokemon?.powers) &&
    pokemon.powers.some(power=>power?.name===name);
}

function slotPokemon(slot) {
  return slot?.getPokemonCard?.() ?? null;
}

/** Active or Benched Garbodor is a live source iff Garbotoxin and a Tool are present. */
function liveGarbotoxinSlots(player) {
  const slots=[];
  if(player?.active)slots.push({zone:'active',index:null,slot:player.active});
  if(Array.isArray(player?.bench)){
    player.bench.forEach((slot,index)=>slots.push({zone:'bench',index,slot}));
  }
  return slots.filter(({slot})=>{
    const pokemon=slotPokemon(slot);
    return hasPower(pokemon,'Garbotoxin')&&
      Array.isArray(slot?.tools)&&slot.tools.length>0;
  }).map(({zone,index,slot})=>{
    const pokemon=slotPokemon(slot);
    return {
      zone,index,
      printing:pokemon.fullName??pokemon.name??null,
      tools:slot.tools.map(tool=>tool?.fullName??tool?.name??null)
    };
  });
}

function hasLiveGarbotoxin(player) {
  return liveGarbotoxinSlots(player).length>0;
}

function hasActiveIronThornsInitialization(player) {
  const pokemon=slotPokemon(player?.active);
  return pokemon?.name==='Iron Thorns ex'&&
    hasPower(pokemon,'Initialization');
}

function hasLiveOpponentAbilityLock(player) {
  return hasActiveIronThornsInitialization(player)||hasLiveGarbotoxin(player);
}

function hasJammingTowerInPlay(state) {
  return (state?.players??[]).some(player=>
    player?.stadium?.cards?.some(card=>card?.name==='Jamming Tower'));
}

function hasPathToThePeakInPlay(state) {
  return (state?.players??[]).some(player=>
    player?.stadium?.cards?.some(card=>card?.name==='Path to the Peak'));
}

function opponentActiveHasToolJammer(opponent) {
  return Array.isArray(opponent?.active?.tools)&&
    opponent.active.tools.some(tool=>tool?.name==='Tool Jammer');
}

/** Is the candidate's Active Hood and printed Underworld Door currently usable? */
function canUseHoodedDoorUnderGarbotoxin(own,opponent,state) {
  const active=slotPokemon(own?.active);
  return active?.name==='Shadow Rider Calyrex VMAX'&&
    hasPower(active,'Underworld Door')&&
    own.active.tools?.some(tool=>tool?.name==='Stealthy Hood')===true&&
    hasLiveGarbotoxin(opponent)&&
    !opponentActiveHasToolJammer(opponent)&&
    !hasJammingTowerInPlay(state)&&
    !hasPathToThePeakInPlay(state);
}

/**
 * Full owner/public predicate for Battle Compressor -> Night Stretcher ->
 * Hooded Underworld Door. It reads only the candidate's own hand/board and
 * the opponent's public Active/Bench/Tools/Stadium.
 */
function hasHoodedDoorRecoveryWindow(own,opponent,state) {
  const hand=own?.hand?.cards??[];
  const hasCard=name=>hand.some(card=>card?.name===name);
  const hasBenchVmax=(own?.bench??[]).some(slot=>
    slotPokemon(slot)?.name==='Shadow Rider Calyrex VMAX');
  return canUseHoodedDoorUnderGarbotoxin(own,opponent,state)&&
    hasBenchVmax&&hasCard('Battle Compressor')&&
    hasCard('Night Stretcher')&&hasCard('Field Blower');
}

module.exports={
  hasPower,liveGarbotoxinSlots,hasLiveGarbotoxin,
  hasActiveIronThornsInitialization,hasLiveOpponentAbilityLock,
  hasJammingTowerInPlay,hasPathToThePeakInPlay,
  opponentActiveHasToolJammer,canUseHoodedDoorUnderGarbotoxin,
  hasHoodedDoorRecoveryWindow
};
