'use strict';
/*
 * Research-only HOST-side adapter. Validates a genuine V3 event receipt
 * BEFORE augmenting it with an internal (not V3-wire-safe) owner-turn KO
 * certificate. The original 2026 Aichi opponent-policy runtime must never
 * echo this private enriched receipt over the V3 protocol.
 *
 * Use only after installing the agent8 Store KO observer from turn zero and
 * after validating the original inbound actor request against V3. The Store
 * tracker records PUBLIC, opponent-origin Knock Outs and completed turn
 * ownership, not opponent hidden cards, hands, decks or prizes.
 */
const assert=require('node:assert/strict');
const protocol=require('../evaluation/2026-11/agent49-policy-protocol.cjs');
const CERT_VERSION='agent8-host-only-last-opponent-turn-ko-v1';
const TRACKER_VERSION='agent8-store-ko-turn-tracker-v2-owner-turn-aware';
function bindHostVerifiedLastOpponentKO(request,{tracker,ownerPlayerId,
  opponentPlayerId}={}){
  assert.ok(request?.role==='opponent'&&Number.isSafeInteger(request.seat));
  const view=request.observation,r=request.publicEventReceipt;
  assert.ok(view&&r&&r.actorSeat===request.seat&&
    view.actorSeat===request.seat&&
    Number.isSafeInteger(view.globalTurn));
  // This exact V3 check prevents self-asserted KO certificates in incoming
  // objects. The extra field is added only to this PRIVATE policy call.
  protocol.validatePublicEventReceipt(r,view);
  if(!tracker||tracker.version!==TRACKER_VERSION||
     typeof tracker.snapshotLastOpponentTurn!=='function')
    return request;
  assert.ok(ownerPlayerId!==undefined&&opponentPlayerId!==undefined&&
    ownerPlayerId!==opponentPlayerId);
  const snapshot=tracker.snapshotLastOpponentTurn(
    ownerPlayerId,opponentPlayerId,view.globalTurn);
  if(!snapshot||!Number.isSafeInteger(snapshot.turn)||
     snapshot.turn>=view.globalTurn||!Array.isArray(snapshot.events))
    return request;
  for(const event of snapshot.events) {
    assert.equal(event.turn,snapshot.turn);
    assert.equal(event.victimPlayerId,ownerPlayerId);
    assert.equal(event.attackerPlayerId,opponentPlayerId);
    assert.ok(event.byAttack===true||event.byAttack===false||
      event.byAttack===null);
  }
  const cert=Object.freeze({
    version:CERT_VERSION,
    actorSeat:request.seat,
    observationTurn:view.globalTurn,
    lastOpponentTurn:snapshot.turn,
    lastOpponentTurnVerified:true,
    any:snapshot.events.length>0,
    byAttack:snapshot.events.some(x=>x.byAttack===true)
  });
  return Object.freeze({
    ...request,
    publicEventReceipt:Object.freeze({
      ...r,
      hostAuthenticatedPriorOpponentTurnKO:cert
    })
  });
}
module.exports={bindHostVerifiedLastOpponentKO,CERT_VERSION,TRACKER_VERSION};
