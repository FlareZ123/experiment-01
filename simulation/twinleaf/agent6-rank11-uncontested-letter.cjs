'use strict';
const {chooseRank11Letter}=require('./agent6-rank11-owner-letter-frontier.cjs');

/**
 * Cost-contention guard for first-turn Letter: the original rank11 Carmine
 * may convert searched Darkness into discard targets for Dark Patch.
 * A direct Letter root is withheld until a joint policy prices the two lines.
 * @param {object} ownerView Detached real owner observation.
 * @param {object} registeredSixty Original source printing counts.
 */
function chooseUncontestedRank11Letter(ownerView,registeredSixty){
  if(ownerView.ownHand.includes('Carmine TWM'))return null;
  return chooseRank11Letter(ownerView,registeredSixty);
}
module.exports={chooseUncontestedRank11Letter};
