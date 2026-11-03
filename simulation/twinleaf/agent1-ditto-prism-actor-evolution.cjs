'use strict';
const assert=require('node:assert/strict');

const VERSION='agent1-owner-ditto-prism-dynamic-stage1-evolution-v1';
const DITTO='Ditto Prism Star LOT';
const ABILITY='Almighty Evolution';

/**
 * Read only the acting owner's face-up native Ditto permission, which is
 * updated by the pinned CheckTableStateEffect and is a public game property.
 * The private owner deck, Prizes, opponent player and owner hand are absent.
 * This receipt is needed only when explicitly opting into Ditto evolution.
 *
 * @param {object} owner Native acting Player object.
 * @param {object} stages Pinned public Stage enum.
 * @returns {{activeAllowed:boolean,benchAllowed:boolean[]}}
 */
function ownerDittoStage1Receipt(owner,stages){
  assert.ok(Number.isInteger(stages?.STAGE_1));
  const allowed=slot=>{
    const card=slot?.getPokemonCard?.();
    return card?.fullName===DITTO&&
      card.powers?.some(power=>power.name===ABILITY)===true&&
      card.evolvesToStage?.includes(stages.STAGE_1)===true;
  };
  return {
    activeAllowed:allowed(owner.active),
    benchAllowed:owner.bench.map(allowed)
  };
}

/**
 * Propose an ordinary from-hand PlayCardAction when a face-up Ditto's
 * dynamically exposed native Stage 1 permission is already confirmed.
 * The real Store must still accept the action. This does not assess which
 * Stage 1 is strategically optimal or whether the prerequisite was reached.
 *
 * @param {object} view Frozen, detached owner actor root observation.
 * @param {object} catalog Public printed card catalog.
 * @param {{activeAllowed:boolean,benchAllowed:boolean[]}|null} receipt
 * @returns {object|null}
 */
function chooseDittoStage1EvolutionIntent(view,catalog,receipt){
  assert.equal(view?.decisionKind,'owner-root');
  const r=view.ownTurnResources,turn=view.globalTurn;
  if(!receipt||!Number.isSafeInteger(turn)||turn<=2||
      r.pokemonPlayLocked||r.evolutionPlayLocked||
      !(catalog.evolutions instanceof Map)||
      !Number.isInteger(catalog.stages?.STAGE_1))return null;
  const targets=[
    ...view.ownPublic.bench.map((pokemon,index)=>({
      pokemon,slot:'bench',index,
      permitted:receipt.benchAllowed?.[index]===true
    })),
    {pokemon:view.ownPublic.active,slot:'active',index:0,
      permitted:receipt.activeAllowed===true}
  ].filter(({pokemon,permitted})=>
    permitted&&pokemon?.printing===DITTO&&
    pokemon.abilities?.includes(ABILITY)===true&&
    Number.isSafeInteger(pokemon.lastPlayedOrEvolvedTurn)&&
    pokemon.lastPlayedOrEvolvedTurn<turn&&
    pokemon.publicRestrictions?.cannotEvolveNextTurn!==true);
  if(targets.length===0)return null;
  for(let handIndex=0;handIndex<view.ownHand.length;handIndex++){
    const printing=view.ownHand[handIndex];
    const meta=catalog.evolutions.get(printing);
    if(meta?.stage!==catalog.stages.STAGE_1||
        (r.abilityPokemonPlayLocked&&meta.hasAbility))continue;
    const target=targets[0];
    return {
      kind:'evolve-pokemon',handIndex,printing,
      slot:target.slot,index:target.index,from:DITTO,
      sourceAbility:ABILITY,sourceDynamicStage1Verified:true,
      nativeEffectAndLocksVerified:false
    };
  }
  return null;
}
module.exports={
  VERSION,DITTO,ABILITY,ownerDittoStage1Receipt,
  chooseDittoStage1EvolutionIntent
};
