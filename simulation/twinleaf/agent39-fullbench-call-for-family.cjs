'use strict';

/**
 * Exact-print, public-state policy filter for a strategically empty
 * bench-filling attack. Under paper C-11 the attack can be announced with a
 * full Bench and simply ends without searching. The native engine currently
 * rejects this state, so declining the attack also avoids an engine abort.
 *
 * @param {object} actorView Detached actor observation.
 * @param {object} attack Publicly printed candidate attack.
 * @returns {boolean} Whether to exclude this no-op from strategic selection.
 */
function skipEmptyTrubbishCallForFamily(actorView,attack){
  const own=actorView.ownPublic;
  return actorView.decisionKind==='owner-root'&&
    own?.active?.printing==='Trubbish FST'&&
    Array.isArray(own.bench)&&own.bench.length===5&&
    own.bench.every(Boolean)&&
    attack?.name==='Call for Family'&&attack.damage===0;
}

module.exports={skipEmptyTrubbishCallForFamily};
