'use strict';
const assert=require('node:assert/strict');
const {combination}=require('./agent11-field-simultaneous-mulligan-compensation.cjs');
const C=(n,k)=>Number(combination(n,k));
const VERSION='agent11-newmoon-vip-simultaneous-stadium-shield-v1';

/**
 * Pure physical first-seven+Prize event for frozen New Moon 60:
 * at least one VIP, no held Solrock or Lunatone, at least one other Basic
 * to make a Basic-valid opening; both singleton shield partners not Prized.
 * Does NOT imply opponent has Risky Ruins in play, Item use is legal,
 * Ability is active, Bench slots free or actual game-state action succeeds.
 * @returns {object}
 */
function eligibleUninterruptedPairSearch(){
  let favourable=0;
  for(let vip=1;vip<=4;vip++)
    for(let otherBasic=1;otherBasic<=15;otherBasic++)
      favourable+=C(4,vip)*C(15,otherBasic)*
        C(39,7-vip-otherBasic);
  const validSeven=C(60,7)-C(43,7);
  const bothOutOfPrize=C(51,6)/C(53,6);
  return {
    version:VERSION,
    candidateBasics:17,otherBasics:15,vipCopies:4,
    singletonShieldPartners:['Solrock CES62','Lunatone OBF92'],
    eligibleInitialSevenConditionalOnValid:favourable/validSeven,
    bothShieldPartnersOutOfPrize:bothOutOfPrize,
    combinedPhysicalEligibility:favourable/validSeven*bothOutOfPrize,
    noAbilityOrItemLockOrBenchPressureModeled:true,
    noGameWinInference:true
  };
}
module.exports={VERSION,eligibleUninterruptedPairSearch};
