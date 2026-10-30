'use strict';
const assert=require('node:assert/strict');
const VERSION='agent33-sky-field-bench-expansion-opportunity-v1';

/**
 * Owner-only Sky Field placement, requiring a physically full five-Pokémon
 * Bench and a separately held, legally playable Basic ready for the new slot.
 * This is a deliberately conservative visible tactical policy.
 * @param {object} view Detached actor observation, never raw State.
 * @param {{basics:Set<string>,abilityBasics:Set<string>}} catalog
 * @returns {object|null}
 */
function chooseSkyFieldBenchExpansion(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,r=view.ownTurnResources;
  if(!own.active||!Array.isArray(own.bench)||own.bench.length!==5||
     own.bench.some(slot=>slot===null))return null;
  const stadium=[...(own.stadium??[]),
    ...(view.opponentPublic?.stadium??[])];
  // Never replace an opponent lock or destroy current Bench geometry
  // without a state-aware, strategic counterfactual.
  if(stadium.length>0)return null;
  if(r.pokemonPlayLocked===true||r.stadiumPlayLocked!==false||
     !Number.isSafeInteger(r.stadiumPlayedTurn)||
     r.stadiumPlayedTurn>=view.globalTurn)return null;
  const basicInHand=view.ownHand.some(p=>catalog.basics.has(p)&&
    !(r.abilityPokemonPlayLocked===true&&catalog.abilityBasics.has(p)));
  if(!basicInHand)return null;
  const index=view.ownHand.findIndex(p=>p.startsWith('Sky Field '));
  if(index<0)return null;
  return {kind:'play-sky-field',handIndex:index,
    printing:view.ownHand[index],
    reason:'full-five-bench-held-basic-expand-to-eight'};
}
module.exports={VERSION,chooseSkyFieldBenchExpansion};
