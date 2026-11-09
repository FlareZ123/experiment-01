'use strict';

const VERSION='agent17-owner-held-forest-seal-early-v1';
const STONE='Forest Seal Stone SIT';

/** @param {object|null} pokemon @returns {boolean} */
function pokemonV(pokemon){
  return pokemon!==null&&typeof pokemon?.name==='string'&&
    / (?:V|VMAX|VSTAR|V-UNION)$/.test(pokemon.name);
}

/**
 * Pure actor-owned, visible-zone preparation for an early Forest Seal Stone.
 * The native Store remains authoritative for Tool legality and Star Alchemy.
 * It preserves the active holder in preference to competing Bench Tool slots.
 *
 * @param {object} view Frozen actor-only root observation.
 * @param {{toolPrintings:Set<string>}} catalog Public card-printing classification.
 * @returns {object|null} Existing native root policy intent.
 */
function chooseForestSealEarly(view,catalog){
  if(view?.decisionKind!=='owner-root'||
     !Array.isArray(view.ownHand)||
     !Array.isArray(view.ownPublic?.bench)||
     view.ownPublic.publicTurnRestrictions?.vstarUsed===true||
     view.ownPublic.deckCount===0)return null;
  const own=view.ownPublic;
  const before=[{slot:'active',index:0,pokemon:own.active},
    ...own.bench.map((pokemon,index)=>({slot:'bench',index,pokemon}))];
  const suitable=before.filter(x=>pokemonV(x.pokemon));
  const equipped=suitable.find(x=>x.pokemon.tools.includes(STONE));
  if(equipped)return {
    kind:'use-forest-star-alchemy',
    slot:equipped.slot,index:equipped.index,
    source:VERSION,holder:equipped.pokemon.printing
  };
  if(own.publicTurnRestrictions?.toolPlayLocked===true||
     view.ownTurnResources?.toolPlayLocked===true||
     !catalog?.toolPrintings?.has(STONE))return null;
  const handIndex=view.ownHand.indexOf(STONE);
  if(handIndex<0)return null;
  const open=suitable.find(x=>x.pokemon.tools.length===0);
  if(!open)return null;
  return {
    kind:'attach-tool-candidate',printing:STONE,handIndex,
    slot:open.slot,index:open.index,
    source:VERSION,holder:open.pokemon.printing
  };
}
module.exports={VERSION,STONE,pokemonV,chooseForestSealEarly};
