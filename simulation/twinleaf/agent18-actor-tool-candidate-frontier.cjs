'use strict';

const assert=require('node:assert/strict');

/**
 * Build a metadata-only, public printing lookup from the pinned native card
 * classes. This catalog is independent of any deck, Prize or game state.
 *
 * @param {object[]} all Public native printed card definitions.
 * @param {{TrainerCard:Function,TrainerType:{TOOL:number}}} types
 * @returns {Set<string>} Exactly the printed Pokémon Tool names.
 */
function actorToolPrintingCatalog(all,types){
  assert.ok(Array.isArray(all));
  assert.ok(typeof types?.TrainerCard==='function');
  assert.ok(Number.isInteger(types?.TrainerType?.TOOL));
  return new Set(all.filter(card=>
    card instanceof types.TrainerCard&&
    card.trainerType===types.TrainerType.TOOL
  ).map(card=>card.fullName));
}

/**
 * Enumerate potential OWN Pokémon Tool attachment actions using nothing but
 * a detached actor-only root view and a public exact-printing Tool catalog.
 *
 * This is an upper bound on candidate attachments, NOT an exact legal-play
 * list. Individual Tools may have extra recipient restrictions, printed
 * timing conditions or specific effects that the native Store must verify.
 * A decision policy must also value the opportunity cost of occupying a
 * one-Tool slot. This function does not rank or execute anything.
 *
 * @param {object} view Frozen actorObservation for an owner root.
 * @param {Set<string>} tools Public printed Pokémon Tool catalog.
 * @returns {{kind:string,printing:string,handIndex:number,slot:string,index:number}[]}
 */
function enumerateActorToolCandidates(view,tools){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(tools instanceof Set);
  if(view.ownTurnResources.toolPlayLocked===true ||
     view.ownPublic.publicTurnRestrictions.toolPlayLocked===true)
    return [];
  const targets=[
    {slot:'active',index:0,pokemon:view.ownPublic.active},
    ...view.ownPublic.bench.map((pokemon,index)=>({
      slot:'bench',index,pokemon
    }))
  ].filter(target=>target.pokemon!==null&&
    target.pokemon.tools.length===0);
  const candidates=[];
  for(let handIndex=0;handIndex<view.ownHand.length;handIndex++){
    const printing=view.ownHand[handIndex];
    if(!tools.has(printing))continue;
    for(const target of targets)candidates.push({
      kind:'attach-tool-candidate',printing,handIndex,
      slot:target.slot,index:target.index
    });
  }
  return candidates;
}

module.exports={actorToolPrintingCatalog,enumerateActorToolCandidates};
