'use strict';
const assert=require('node:assert/strict');
const {actorObservation}=
  require('../twinleaf/actor-observation-contract.cjs');
const {opponentPublicFailedHandNames}=
  require('./agent26-public-mulligan-printing-name-bridge.cjs');

const VERSION='agent26-owner-public-mulligan-actor-view-v1';

/**
 * Optional, **not installed in the canonical chooser**, detached actor-root
 * view with the opponent's genuinely public failed-seven *names* added.
 * Original ownership/prompt, face-down setup, K0 and K1 privacy checks remain
 * delegated to the canonical actorObservation function.
 *
 * Caller must supply a native public observer receipt already captured from
 * a valid match. Public name index must be built from card definitions, not
 * from an opponent's registered deck or hidden card zones.
 *
 * @param {object} state Authenticated genuine Store state.
 * @param {0|1} seat Acting physical owner.
 * @param {object} publicMulliganReceipt Valid native opponent-facing receipt.
 * @param {Map<string,string>} publicNameIndex Printed public metadata.
 * @param {{ownerK1Snapshot?:object}} [options]
 * @returns {object} Frozen detached owner/root observation.
 */
function actorObservationWithPublicMulligans(
  state,seat,publicMulliganReceipt,publicNameIndex,options={}
){
  const original=actorObservation(state,seat,options);
  const named=opponentPublicFailedHandNames(
    publicMulliganReceipt,seat,publicNameIndex);
  assert.ok(Object.isFrozen(named));
  return Object.freeze({
    ...original,
    publicFailedOpponentSevens:named,
    publicFailedOpponentSevensVersion:VERSION
  });
}
module.exports={VERSION,actorObservationWithPublicMulligans};
