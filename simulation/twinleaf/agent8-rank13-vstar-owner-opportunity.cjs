'use strict';
const assert=require('node:assert/strict');
const {chooseNaturalEvolutionIntent}=
  require('./agent1-actor-evolution-frontier.cjs');

const VERSION='agent8-original-rank13-owner-vstar-observation-v1';
const REGIDRAGO_V='Regidrago V SIT';
const REGIDRAGO_VSTAR='Regidrago VSTAR SIT';

/**
 * Read-only, owner-root Regidrago VSTAR access diagnostic.
 * The owner hand may be inspected on its own turn. Own public board,
 * evolution chronology and locks determine whether the generic, ordinary
 * V -> VSTAR selector has a presently legal owner-visible root. Hidden
 * source deck, face-down Prize contents, and opponent hand are not read.
 *
 * @param {object} view Detached actor-owned root projection.
 * @param {object} stages Native printed stage constants.
 * @returns {object} Bounded plain values; no full private hand disclosure.
 */
function observeRank13VstarOpportunity(view,stages){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(stages&&stages.VSTAR!==undefined&&stages.BASIC!==undefined);
  const heldVstar=view.ownHand.filter(p=>p===REGIDRAGO_VSTAR).length;
  const slots=[
    {position:'active',index:0,pokemon:view.ownPublic.active},
    ...view.ownPublic.bench.map((pokemon,index)=>({
      position:'bench',index,pokemon
    }))
  ];
  const inPlay=slots.filter(slot=>slot.pokemon?.printing===REGIDRAGO_V);
  const catalog={
    stages,
    evolutions:new Map([[REGIDRAGO_VSTAR,{
      stage:stages.VSTAR,evolvesFrom:'Regidrago V',hasAbility:true
    }]])
  };
  const legal=chooseNaturalEvolutionIntent(view,catalog);
  return {
    turn:view.globalTurn,
    heldVstarCount:heldVstar,
    inPlayRegidragoVCount:inPlay.length,
    ordinaryVstarRootLegal:legal!==null,
    eligibleSlot:legal?{
      position:legal.slot,index:legal.index,printing:legal.printing
    }:null
  };
}
module.exports={VERSION,REGIDRAGO_V,REGIDRAGO_VSTAR,
  observeRank13VstarOpportunity};
