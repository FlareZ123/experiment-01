'use strict';

const VERSION='public-stadium-effect-status-v1';

/**
 * Resolve one visible Ability's status only when the detached actor view
 * carries a complete, source-consistent suppression receipt.
 * @param {object} pokemon
 * @param {string} abilityName
 * @returns {boolean|null} true when live, false when suppressed, null unknown
 */
function publicAbilityLiveStatus(pokemon,abilityName){
  if(!Array.isArray(pokemon?.abilitySuppressions))return null;
  const rows=pokemon.abilitySuppressions.filter(row=>
    row?.abilityName===abilityName);
  if(rows.length!==1)return null;
  const row=rows[0];
  if(row.suppressed===false)
    return row.reasonCode===null&&row.sourcePrinting===null?true:null;
  if(row.suppressed===true)
    return typeof row.reasonCode==='string'&&
      /^[A-Z][A-Z0-9_]{0,63}$/.test(row.reasonCode)&&
      typeof row.sourcePrinting==='string'&&row.sourcePrinting.length>0?
        false:null;
  return null;
}

/**
 * Return the exact visible Stadium printings. A missing/malformed zone is
 * unknown rather than an empty Stadium row.
 * @param {object} view
 * @returns {string[]|null}
 */
function publicStadiumPrintings(view){
  const zones=[view.ownPublic?.stadium,view.opponentPublic?.stadium];
  if(!zones.every(Array.isArray)||
     !zones.every(zone=>zone.every(printing=>typeof printing==='string')))
    return null;
  return zones.flat();
}

/**
 * Resolve Stadium effects on the acting player's Pokémon conservatively.
 * A positive actor epoch is reproduced; an opponent-only positive epoch is
 * unresolved until the mirrored native Store scope probe is complete.
 * New Moon requires a complete live-Ability receipt and Solrock on the
 * acting player's own board. Printed presence alone is never sufficient.
 * @param {object} view
 * @returns {boolean|null}
 */
function stadiumEffectsSuppressedForOwnPokemon(view){
  const own=view?.ownPublic;
  const ownTurns=own?.publicTurnRestrictions
    ?.stadiumAndToolHaveNoEffectTurnsRemaining;
  const opponentTurns=view?.opponentPublic?.publicTurnRestrictions
    ?.stadiumAndToolHaveNoEffectTurnsRemaining;
  if(!own||!Array.isArray(own.bench))return null;
  if(Number.isSafeInteger(ownTurns)&&ownTurns>0)return true;
  if(!Number.isSafeInteger(ownTurns)||ownTurns<0||
     !Number.isSafeInteger(opponentTurns)||opponentTurns<0)return null;
  if(opponentTurns>0)return null;
  const board=[own.active,...own.bench].filter(Boolean);
  for(const pokemon of board){
    if(!Array.isArray(pokemon.abilities)||
       !Array.isArray(pokemon.abilityDetails))return null;
  }
  const lunatone=board.find(pokemon=>pokemon.abilities.includes('New Moon'));
  if(!lunatone)return false;
  const solrockPresent=board.some(pokemon=>
    typeof pokemon.printing==='string'&&pokemon.printing.startsWith('Solrock '));
  if(!solrockPresent)return false;
  const live=publicAbilityLiveStatus(lunatone,'New Moon');
  return live===null?null:live;
}

module.exports={
  VERSION,publicAbilityLiveStatus,publicStadiumPrintings,
  stadiumEffectsSuppressedForOwnPokemon
};
