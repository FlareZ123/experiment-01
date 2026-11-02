'use strict';

const VERSION='agent14-owner-farewell-letter-frontier-v1';
const UNOWN='Unown AOR';
const ABILITY='Farewell Letter';

/**
 * Propose the exact AOR-30 Bench draw Ability from the acting player's
 * detached, paper-visible observation. Discarding cards attached to Unown
 * can have real strategic cost, so this conservative prototype uses only
 * a naked Unown and preserves at least one card in the owner's deck.
 * Native Store acceptance and effect settlement remain independently gated.
 *
 * @param {object} view Detached actorObservation from the current owner.
 * @returns {{kind:'use-farewell-letter',benchIndex:number,printing:string,abilityName:string}|null}
 */
function chooseOwnerFarewellLetter(view){
  if(view?.decisionKind!=='owner-root')return null;
  const own=view.ownPublic;
  if(!own?.active||!Array.isArray(own.bench)||
      !Number.isSafeInteger(own.deckCount)||own.deckCount<=1)return null;
  // Silent Lab removes the Ability from Basic Unown while it is in play.
  const stadiums=[...(own.stadium??[]),...(view.opponentPublic?.stadium??[])];
  if(stadiums.some(p=>p.startsWith('Silent Lab ')))return null;
  for(let benchIndex=0;benchIndex<own.bench.length;benchIndex++){
    const pokemon=own.bench[benchIndex];
    if(pokemon?.printing!==UNOWN||
        !pokemon.abilities?.includes(ABILITY)||
        !Array.isArray(pokemon.energies)||pokemon.energies.length>0||
        !Array.isArray(pokemon.tools)||pokemon.tools.length>0||
        !Array.isArray(pokemon.evolutionPrintings)||
        pokemon.evolutionPrintings.length!==1)continue;
    return {kind:'use-farewell-letter',benchIndex,
      printing:UNOWN,abilityName:ABILITY};
  }
  return null;
}

module.exports={VERSION,chooseOwnerFarewellLetter};
