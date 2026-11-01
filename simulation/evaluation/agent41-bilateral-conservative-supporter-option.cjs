'use strict';

const assert=require('node:assert/strict');

const VERSION='agent41-bilateral-conservative-shuffle-supporter-v1';

/**
 * One-factor, symmetric two-seat policy-development intervention. It admits
 * only the existing owner-visible low-hand Lillie/Marnie/Iono selector.
 * The underlying selector, native Store, and prompt handlers retain their
 * own independent legality and settlement responsibilities.
 *
 * @param {{enabled:boolean,actorOnlyComposition:boolean}} input
 * @returns {{conservativeShuffleBeforeAttack?:true}}
 */
function commonConservativeSupporterRootOptions({enabled,actorOnlyComposition}){
  assert.equal(typeof enabled,'boolean');
  assert.equal(typeof actorOnlyComposition,'boolean');
  assert.ok(!enabled||actorOnlyComposition,
    'Conservative Supporter root must use the same actor-only policy for both seats');
  return enabled?Object.freeze({conservativeShuffleBeforeAttack:true}):
    Object.freeze({});
}

module.exports={VERSION,commonConservativeSupporterRootOptions};
