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
function hoodAttachTargets(player,opponent,state){
  if(!hasProtectableHoodLockThreat(opponent,state))return [];
  const candidates=[];
  const activePokemon=slotPokemon(player?.active);
  if(activePokemon?.name==='Shadow Rider Calyrex VMAX'&&
     player?.active?.tools?.length===0&&
     !opponentActiveHasToolJammer(opponent)) {
    candidates.push({zone:'active',index:0,priority:2,
      printing:activePokemon.fullName??activePokemon.name});
  }
  (player?.bench??[]).forEach((slot,index)=>{
    const pokemon=slotPokemon(slot);
    if(!pokemon||slot?.tools?.length!==0)return;
    if(pokemon.name==='Shadow Rider Calyrex VMAX') {
      candidates.push({zone:'bench',index,priority:3,
        printing:pokemon.fullName??pokemon.name});
    } else if(pokemon.name==='Shadow Rider Calyrex V') {
      candidates.push({zone:'bench',index,priority:1,
        printing:pokemon.fullName??pokemon.name});
    }
  });
  return candidates.sort((a,b)=>b.priority-a.priority||a.index-b.index);
}
function opponentActiveHasToolJammer(opponent){
  return Array.isArray(opponent?.active?.tools)&&
    opponent.active.tools.some(tool=>tool?.name==='Tool Jammer');
}
function hasUnspentUnderworldDoorAt(own,zone,index=0){
  const slot=zone==='active'?own?.active:own?.bench?.[index];
  const pokemon=slotPokemon(slot);
  return pokemon?.name==='Shadow Rider Calyrex VMAX'&&
    hasPower(pokemon,'Underworld Door')&&
    typeof own?.marker?.hasMarker==='function'&&
    !own.marker.hasMarker('UNDERWORLD_DOOR_MARKER',pokemon);
}
function hasUnspentActiveUnderworldDoor(own){
  return hasUnspentUnderworldDoorAt(own,'active',0);
}

/**
 * Enumerate only owner-controlled Hooded VMAX sources whose own once-per-turn
 * Underworld Door marker is still unspent. A source may be Active or Benched.
 */
function unspentHoodedDoorSources(own){
  const sources=[];
  const add=(slot,zone,index)=>{
    const pokemon=slotPokemon(slot);
    if(pokemon?.name!=='Shadow Rider Calyrex VMAX'||
       !hasPower(pokemon,'Underworld Door')||
       !slot?.tools?.some(tool=>tool?.name==='Stealthy Hood')||
       !hasUnspentUnderworldDoorAt(own,zone,index))return;
    sources.push({
      zone,index,pokemon,
      printing:pokemon.fullName??pokemon.name,
      tools:slot.tools.map(tool=>tool?.fullName??tool?.name??null)
    });
  };
  add(own?.active,'active',0);
  (own?.bench??[]).forEach((slot,index)=>add(slot,'bench',index));
  return sources;
}

/**
 * Revalidate the exact source selected at the start of a recovery attempt.
 * Active Tool Jammer suppresses only an Active Hood; a Benched Hood remains
 * usable. Stadium suppression and live Garbotoxin apply to either position.
 */
function isHoodedDoorSourceUsable(own,opponent,state,source){
  if(!source||!['active','bench'].includes(source.zone))return false;
  if(!hasLiveGarbotoxin(opponent)||
     hasJammingTowerInPlay(state)||
     hasPathToThePeakInPlay(state))return false;
  const slot=source.zone==='active'?own?.active:own?.bench?.[source.index];
  if(slotPokemon(slot)!==source.pokemon||
     !slot?.tools?.some(tool=>tool?.name==='Stealthy Hood')||
     !hasUnspentUnderworldDoorAt(own,source.zone,source.index))return false;
  return source.zone!=='active'||!opponentActiveHasToolJammer(opponent);
}

/** Prefer the protected Bench source; use Active only when its Tool is live. */
function selectHoodedDoorSource(own,opponent,state){
  const sources=unspentHoodedDoorSources(own);
  return sources.find(source=>source.zone==='bench'&&
    isHoodedDoorSourceUsable(own,opponent,state,source))??
    sources.find(source=>source.zone==='active'&&
      isHoodedDoorSourceUsable(own,opponent,state,source))??null;
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
function canUseHoodedDoorUnderGarbotoxin(own,opponent,state,source=null){
  return source?
    isHoodedDoorSourceUsable(own,opponent,state,source):
    selectHoodedDoorSource(own,opponent,state)!==null;
}
function hasHoodedDoorRecoveryWindow(own,opponent,state){
  const hasBenchVmax=(own?.bench??[]).some(slot=>
    slotPokemon(slot)?.name==='Shadow Rider Calyrex VMAX');
  return selectHoodedDoorSource(own,opponent,state)!==null&&
    hasBenchVmax&&hoodedDoorRecoveryPlan(own)!==null;
}
module.exports={
  hasPower,liveGarbotoxinSlots,hasLiveGarbotoxin,
  hasActiveIronThornsInitialization,hasLiveOpponentAbilityLock,
  hasJammingTowerInPlay,hasPathToThePeakInPlay,
  hasProtectableHoodLockThreat,hoodAttachTargets,
  opponentActiveHasToolJammer,hasUnspentUnderworldDoorAt,
  hasUnspentActiveUnderworldDoor,unspentHoodedDoorSources,
  isHoodedDoorSourceUsable,selectHoodedDoorSource,
  hoodedDoorRecoveryPlan,canUseHoodedDoorUnderGarbotoxin,
  hasHoodedDoorRecoveryWindow
};
