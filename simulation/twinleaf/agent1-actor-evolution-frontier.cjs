'use strict';
const assert=require('node:assert/strict');
const VERSION='agent1-actor-natural-evolution-frontier-v1';
/** @param {number} previous @param {number} next @param {object} stages @returns {boolean} */
function isNaturalStageStep(previous,next,stages){
 if(next===stages.STAGE_1)return previous===stages.BASIC||previous===stages.RESTORED;
 if(next===stages.STAGE_2)return previous===stages.STAGE_1;
 if(next===stages.VMAX||next===stages.VSTAR)return previous===stages.BASIC;
 return false;
}
/**
 * Select an ordinary printed evolution from owner hand and public board.
 * Unknown turn chronology and special effect-only evolution both fail closed.
 * @param {object} view Detached owner actor observation.
 * @param {object} catalog Public print metadata, containing an evolution Map.
 * @returns {object|null}
 */
function chooseNaturalEvolutionIntent(view,catalog){
 assert.equal(view.decisionKind,'owner-root');
 const r=view.ownTurnResources,turn=view.globalTurn;
 if(turn<=2||r.pokemonPlayLocked||r.evolutionPlayLocked)return null;
 const evolutions=catalog.evolutions,stages=catalog.stages;
 if(!(evolutions instanceof Map)||!stages)return null;
 const targets=[...view.ownPublic.bench.map((pokemon,index)=>({pokemon,slot:'bench',index})),{pokemon:view.ownPublic.active,slot:'active',index:0}];
 for(let handIndex=0;handIndex<view.ownHand.length;handIndex++){
  const printing=view.ownHand[handIndex],meta=evolutions.get(printing);
  if(!meta||(r.abilityPokemonPlayLocked&&meta.hasAbility))continue;
  for(const target of targets){
   const p=target.pokemon;
   if(!p||p.name!==meta.evolvesFrom||p.publicRestrictions?.cannotEvolveNextTurn===true||!Number.isInteger(p.lastPlayedOrEvolvedTurn)||p.lastPlayedOrEvolvedTurn>=turn||!isNaturalStageStep(p.printed?.stage,meta.stage,stages))continue;
   return {kind:'evolve-pokemon',handIndex,printing,slot:target.slot,index:target.index,from:p.printing};
  }
 }
 return null;
}
module.exports={VERSION,isNaturalStageStep,chooseNaturalEvolutionIntent};
