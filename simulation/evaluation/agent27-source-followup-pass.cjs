'use strict';
const assert=require('node:assert/strict');

/**
 * Recognize a genuine pinned Twinleaf PassTurnAction submitted by the
 * opponent immediately after an already Store-accepted source Energy prompt.
 * Pinned PassTurnAction identifies its actor with clientId, not playerId.
 * @param {object} state Native Store state before the selected Pass.
 * @param {object} action Native user action.
 * @param {0|1} sourceSeat Original source's physical seat.
 * @param {object[]} receipts Already accepted physical Energy receipts.
 * @returns {object|null} Matched accepted source prompt.
 */
function followingOpponentSourcePass(state,action,sourceSeat,receipts){
  assert.ok(sourceSeat===0||sourceSeat===1);
  assert.ok(Array.isArray(receipts));
  if(action?.constructor?.name!=='PassTurnAction')return null;
  const opponent=state?.players?.[1-sourceSeat];
  if(!opponent||opponent.id!==action.clientId)return null;
  return receipts.findLast(row=>
    row.nativeStoreActionAccepted===true&&
    row.actorSeat===sourceSeat&&
    row.globalTurn+1===state.turn)??null;
}

module.exports={followingOpponentSourcePass};
