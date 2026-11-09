'use strict';

const assert=require('node:assert/strict');
const VERSION='agent38-owner-physically-mail-selected-marnie-afterpass-v1';
const MARNIE='Marnie SSH';

/**
 * Make one otherwise omitted legal Supporter use possible after an owner
 * physically searched Marnie with Trainers' Mail. The caller supplies only
 * hand indices proven by real owner-deck-to-hand card identity settlement.
 * This function observes its own public resources and hand, no hidden zones.
 *
 * @param {object} view Detached genuine owner-root observation.
 * @param {number[]} settledMailHandIndices Hand indices of provenance-matched cards.
 * @returns {{kind:string,handIndex:number,printing:string}|null}
 */
function chooseMailSelectedMarnie(view,settledMailHandIndices){
  assert.equal(view?.decisionKind,'owner-root');
  if(!Number.isSafeInteger(view.globalTurn)||view.globalTurn<=1||
     !Array.isArray(view.ownHand)||!Array.isArray(settledMailHandIndices))
    return null;
  const r=view.ownTurnResources;
  if(!r||r.supporterPlayLocked!==false||
     r.supporterPlayedTurn!==0||
     view.ownPublic?.publicTurnRestrictions?.supporterPlayLocked===true)
    return null;
  const index=settledMailHandIndices.find(i=>
    Number.isSafeInteger(i)&&i>=0&&i<view.ownHand.length&&
    view.ownHand[i]===MARNIE);
  return index===undefined?null:{
    kind:'play-physically-mail-selected-marnie',
    handIndex:index,printing:MARNIE
  };
}

module.exports={VERSION,MARNIE,chooseMailSelectedMarnie};
