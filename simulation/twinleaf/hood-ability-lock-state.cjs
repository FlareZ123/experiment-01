'use strict';

function hasPower(pokemon,name) {
  return Array.isArray(pokemon?.powers) &&
    pokemon.powers.some(power=>power?.name===name);
}
function slotPokemon(slot) { return slot?.getPokemonCard?.() ?? null; }

function liveGarbotoxinSlots(player) {
  const slots=[];
  if(player?.active)slots.push({zone:'active',index:null,slot:player.active});
  if(Array.isArray(player?.bench))player.bench.forEach((slot,index)=>
    slots.push({zone:'bench',index,slot}));
  return slots.filter(({slot})=>{
    const pokemon=slotPokemon(slot);
    return hasPower(pokemon,'Garbotoxin')&&
      Array.isArray(slot?.tools)&&slot.tools.length>0;
  }).map(({zone,index,slot})=>{
    const pokemon=slotPokemon(slot);
    return {zone,index,printing:pokemon.fullName??pokemon.name??null,
      tools:slot.tools.map(tool=>tool?.fullName??tool?.name??null)};
  });
}
function hasLiveGarbotoxin(player){return liveGarbotoxinSlots(player).length>0;}
function hasActiveIronThornsInitialization(player){
  const pokemon=slotPokemon(player?.active);
  return pokemon?.name==='Iron Thorns ex'&&hasPower(pokemon,'Initialization');
}
function hasLiveOpponentAbilityLock(player){
  return hasActiveIronThornsInitialization(player)||hasLiveGarbotoxin(player);
}
function hasJammingTowerInPlay(state){
  return (state?.players??[]).some(player=>
    player?.stadium?.cards?.some(card=>card?.name==='Jamming Tower'));
}
function hasPathToThePeakInPlay(state){
  return (state?.players??[]).some(player=>
    player?.stadium?.cards?.some(card=>card?.name==='Path to the Peak'));
}
function hasProtectableHoodLockThreat(opponent,state){
  return hasLiveOpponentAbilityLock(opponent)&&
    !hasJammingTowerInPlay(state)&&
    !hasPathToThePeakInPlay(state);
}
function opponentActiveHasToolJammer(opponent){
  return Array.isArray(opponent?.active?.tools)&&
    opponent.active.tools.some(tool=>tool?.name==='Tool Jammer');
}
function hasUnspentActiveUnderworldDoor(own){
  const pokemon=slotPokemon(own?.active);
  return pokemon?.name==='Shadow Rider Calyrex VMAX'&&
    hasPower(pokemon,'Underworld Door')&&
    typeof own?.marker?.hasMarker==='function'&&
    !own.marker.hasMarker('UNDERWORLD_DOOR_MARKER',pokemon);
}
function hoodedDoorRecoveryPlan(own){
  const hand=own?.hand?.cards??[];
  const discard=own?.discard?.cards??[];
  const deck=own?.deck?.cards??[];
  const hasHand=name=>hand.some(card=>card?.name===name);
  const hasDiscard=name=>discard.some(card=>card?.name===name);
  const hasDeck=name=>deck.some(card=>card?.name===name);
  if(hasHand('Psychic Energy'))return 'direct';
  if(hasDiscard('Psychic Energy')&&hasHand('Night Stretcher'))return 'stretcher';
  if(hasHand('Battle Compressor')&&hasHand('Night Stretcher')&&
     hasDeck('Psychic Energy'))return 'compressor-stretcher';
  return null;
}
function canUseHoodedDoorUnderGarbotoxin(own,opponent,state){
  const active=slotPokemon(own?.active);
  return active?.name==='Shadow Rider Calyrex VMAX'&&
    hasPower(active,'Underworld Door')&&
    own.active.tools?.some(tool=>tool?.name==='Stealthy Hood')===true&&
    hasUnspentActiveUnderworldDoor(own)&&
    hasLiveGarbotoxin(opponent)&&
    !opponentActiveHasToolJammer(opponent)&&
    !hasJammingTowerInPlay(state)&&
    !hasPathToThePeakInPlay(state);
}
function hasHoodedDoorRecoveryWindow(own,opponent,state){
  const hasBenchVmax=(own?.bench??[]).some(slot=>
    slotPokemon(slot)?.name==='Shadow Rider Calyrex VMAX');
  return canUseHoodedDoorUnderGarbotoxin(own,opponent,state)&&
    hasBenchVmax&&hoodedDoorRecoveryPlan(own)!==null;
}
module.exports={
  hasPower,liveGarbotoxinSlots,hasLiveGarbotoxin,
  hasActiveIronThornsInitialization,hasLiveOpponentAbilityLock,
  hasJammingTowerInPlay,hasPathToThePeakInPlay,
  hasProtectableHoodLockThreat,
  opponentActiveHasToolJammer,hasUnspentActiveUnderworldDoor,
  hoodedDoorRecoveryPlan,canUseHoodedDoorUnderGarbotoxin,
  hasHoodedDoorRecoveryWindow
};
