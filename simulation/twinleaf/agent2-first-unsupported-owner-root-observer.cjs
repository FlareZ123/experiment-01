'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');

const VERSION='agent2-first-unsupported-owner-root-owner-public-v1';

/**
 * Return exactly the previously detached actor-known information at the
 * first unsupported root, never identities from unsearched deck/Prize or
 * opponent hidden hand. The returned object is for offline diagnosis only.
 *
 * @param {object} view Frozen actorObservation for the actual root.
 * @returns {{version:string,ownerVisibleSha256:string,ownerView:object,
 *   hiddenSourceIdentitiesIncluded:false}}
 */
function snapshotFirstUnsupportedOwnerRoot(view){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(view.actorSeat===0||view.actorSeat===1);
  assert.ok(Number.isSafeInteger(view.globalTurn));
  assert.ok(Array.isArray(view.ownHand));
  assert.ok(view.ownPublic&&view.opponentPublic&&view.ownTurnResources);
  const known={
    actorSeat:view.actorSeat,
    globalTurn:view.globalTurn,
    phase:view.phase??null,
    decisionKind:'owner-root',
    ownHand:[...view.ownHand],
    ownPublic:view.ownPublic,
    opponentPublic:view.opponentPublic,
    ownTurnResources:view.ownTurnResources
  };
  // JSON serialization is deterministic across these fixed property keys.
  // It strips prototype/method identity and detached undefined fields.
  const ownerView=JSON.parse(JSON.stringify(known));
  const ownerVisibleSha256=createHash('sha256')
    .update(JSON.stringify(ownerView)).digest('hex');
  return {
    version:VERSION,ownerVisibleSha256,ownerView,
    hiddenSourceIdentitiesIncluded:false
  };
}

module.exports={VERSION,snapshotFirstUnsupportedOwnerRoot};
