'use strict';

const assert=require('node:assert/strict');
const {publicPlayer}=require('./actor-observation-contract.cjs');
const {publicSkylinerSuppressionReason}=require(
  './agent6-skyliner-ability-suppression-guard.cjs');

const VERSION='agent6-public-tool-jammer-latias-floatstone-native-repair-v1';

/**
 * Narrow, opt-in, research-owned adapter over an EXISTING pinned Store.
 * Corrects one reproduced native difference: opposite Active Tool Jammer
 * does not inhibit an attached Float Stone's zero-cost result when printed
 * Skyliner is publicly suppressed. This consciously covers only uncharged
 * Latias ex SSP's printed C,C Retreat Cost in otherwise staged states.
 *
 * A full gameplay semantics repair would need to track additional reduction,
 * Tool-immunity and replacement effects. This stage-only hook is unsuitable
 * for deriving competitive win rates without broader validation.
 *
 * @template T
 * @param {object} store A genuine pinned native Store.
 * @param {object} source Native owner Player object.
 * @param {object} opponent Native opposing Player object.
 * @param {()=>T} execute Synchronous staged native action sequence.
 * @returns {{result:T,patches:object[]}} Native result and exact corrections.
 */
function withToolJammerFloatStoneRetreatRepair(store,source,opponent,execute){
  assert.equal(typeof execute,'function');
  const previous=store.reduceEffect;
  assert.equal(typeof previous,'function');
  const patches=[];
  function patched(state,effect){
    const result=previous.call(this,state,effect);
    if(effect?.constructor?.name!=='CheckRetreatCostEffect')return result;
    if(state.players[state.activePlayer]!==source||
       effect.player!==source)return result;
    const active=source.active.getPokemonCard();
    if(active?.fullName!=='Latias ex SSP'||
       !source.active.tools.some(tool=>tool.fullName==='Float Stone BKT')||
       !opponent.active.tools.some(tool=>tool.fullName==='Tool Jammer BST')||
       effect.cost.length!==0)return result;
    const view={ownPublic:publicPlayer(source),
      opponentPublic:publicPlayer(opponent)};
    const reason=publicSkylinerSuppressionReason(view);
    if(reason===null)return result;
    const originalCost=effect.cost.length;
    effect.cost=[...active.retreat];
    patches.push({sourcePlayerId:source.id,reason,originalCost,
      repairedCost:effect.cost.length,sourceActive:active.fullName,
      opponentActive:opponent.active.getPokemonCard()?.fullName??null});
    return result;
  }
  store.reduceEffect=patched;
  try{return {result:execute(),patches};}
  finally{
    assert.equal(store.reduceEffect,patched);
    store.reduceEffect=previous;
  }
}

module.exports={VERSION,withToolJammerFloatStoneRetreatRepair};
