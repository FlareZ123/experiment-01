'use strict';

const assert=require('node:assert/strict');
const {publicEventReceipt}=require('./agent8-public-event-receipt.cjs');

const VERSION='agent7-mimikyu-single-burrow-copycat-root-v1';

/**
 * Add the latest completed opponent-turn snapshot to an already detached
 * actor observation. The tracker is the authority for freshness; its snapshot
 * preserves unavailable (null) versus known-empty ([]).
 *
 * @param {object} view Detached actor observation.
 * @param {object} state Authenticated current Store state.
 * @param {0|1} seat Physical acting seat.
 * @param {{getPreviousTurnSnapshot:(playerId:number)=>{turn:number,attacks:object[]}|null}|null} tracker
 * @returns {Readonly<object>}
 */
function attachPreviousOpponentTurnReceipt(view,state,seat,tracker){
  assert.ok((seat===0||seat===1)&&state?.players?.length===2);
  assert.equal(view.actorSeat,seat);
  assert.equal(view.globalTurn,state.turn);
  assert.equal(view.publicEventReceipt,undefined);
  const opponentId=state.players[1-seat].id;
  const snapshot=tracker?.getPreviousTurnSnapshot(opponentId)??null;
  if(snapshot!==null){
    assert.ok(Number.isSafeInteger(snapshot.turn)&&snapshot.turn>=0);
    assert.ok(Array.isArray(snapshot.attacks));
  }
  const receipt=publicEventReceipt(state,seat,
    snapshot===null?null:snapshot.attacks,
    snapshot===null?null:snapshot.turn);
  return Object.freeze({...view,publicEventReceipt:receipt});
}

/**
 * Narrow, default-off Copycat root for the exact single-attack witness.
 * Multiple-attack turns remain ambiguous until a verified Ω Barrage pair
 * contract is exposed by the history tracker.
 *
 * @param {object} view Detached actor observation with public event receipt.
 * @returns {object|null} Native-neutral Copycat attack intent.
 */
function chooseMimikyuBurrowCopycat(view){
  const active=view?.ownPublic?.active;
  if(active?.printing!=='Mimikyu GRI')return null;
  const receipt=view.publicEventReceipt;
  if(receipt?.actorSeat!==view.actorSeat||receipt.turn!==view.globalTurn)return null;
  const rows=receipt.opponentLastTurnAttacks;
  if(!Array.isArray(rows)||rows.length!==1)return null;
  const snapshotTurn=receipt.opponentLastTurnTurn;
  if(!Number.isSafeInteger(snapshotTurn)||snapshotTurn>=view.globalTurn)return null;
  const row=rows[0];
  if(row.turn!==snapshotTurn||row.gxAttack!==false||row.copycatAttack!==false)
    return null;
  if(!row.sourcePrinting.startsWith('Bunnelby PRC')||row.attackName!=='Burrow')
    return null;
  if(!active.attacks?.some(attack=>attack.name==='Copycat'))return null;
  return Object.freeze({
    kind:'attack',attackName:'Copycat',source:VERSION,
    previousTurn:snapshotTurn,previousSource:row.sourcePrinting,
    previousAttack:row.attackName
  });
}

module.exports={VERSION,attachPreviousOpponentTurnReceipt,chooseMimikyuBurrowCopycat};
