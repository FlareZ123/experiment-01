'use strict';

const assert=require('node:assert/strict');

const VERSION='agent37-owner-public-genesect-fusion-draw-v1';
const FUSION_STRIKE=new Set(['Genesect V FST','Mew V FST','Mew VMAX FST']);

/**
 * Select one owner-visible Genesect V Fusion Strike System opportunity.
 *
 * The exact three recognized printings undercount rather than invent
 * additional Fusion Strike marks; this planner is scoped to original
 * Aichi rank5 Mew/Genesect and any mirrored physical eligible board.
 * Only once per owner turn is permitted by the surrounding adapter,
 * although multiple separate Genesect V could legally use their own Ability.
 *
 * The native Store remains the authority for Ability locks, dynamic effects,
 * use-once constraints and actual draw/prompts.
 *
 * @param {object} view Detached owner-root observation.
 * @param {{usedThisTurn?:boolean}} [options] Root-adapter usage state.
 * @returns {object|null} Native-neutral owner-only Ability intent.
 */
function chooseGenesectFusionDraw(view,options={}){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic;
  if(options.usedThisTurn===true||!own||
     !Array.isArray(own.bench)||!Array.isArray(view.ownHand)||
     own.deckCount<1||view.globalTurn<1)return null;
  const all=[own.active,...own.bench];
  const knownFusionCount=all.filter(p=>
    p&&FUSION_STRIKE.has(p.printing)).length;
  if(knownFusionCount===0||view.ownHand.length>=knownFusionCount)return null;
  // An attack prohibition does not itself prevent using a draw Ability.
  // Printed Ability locks and used markers remain subject to native Store.
  const abilities=p=>p?.printing==='Genesect V FST'&&
    p.abilities?.includes('Fusion Strike System')===true;
  for(let benchIndex=0;benchIndex<own.bench.length;benchIndex++){
    if(abilities(own.bench[benchIndex]))
      return {kind:'use-genesect-fusion-draw',
        position:'bench',benchIndex,abilityName:'Fusion Strike System',
        knownFusionCount,handCount:view.ownHand.length,policy:VERSION};
  }
  if(abilities(own.active))
    return {kind:'use-genesect-fusion-draw',position:'active',
      benchIndex:null,abilityName:'Fusion Strike System',
      knownFusionCount,handCount:view.ownHand.length,policy:VERSION};
  return null;
}

module.exports={VERSION,FUSION_STRIKE,chooseGenesectFusionDraw};
