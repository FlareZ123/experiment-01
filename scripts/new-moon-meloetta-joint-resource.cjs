'use strict';

const path=require('node:path');
const {mulliganProbability}=require('./aichi_opening_audit.cjs');
const {loneBasicProbability,noExtraBasic}=require('./aichi_solo_start.cjs');
const {fixedWindow}=require('./aichi-meloetta-stone-pad-bridge.cjs');
const {assess}=require('./new-moon-meloetta-solo-stress.cjs');

/**
 * Exact joint probability of a sole Klefki opponent after setup and Meloetta
 * possessing a playable-resource *opportunity* to retrieve Canceling Cologne.
 *
 * Independently drawn legal seven-card openings remain statistically
 * independent given which side first succeeded in the simultaneous
 * mulligan protocol. But received bonus counts are mutually exclusive.
 * Integrate both absorbing-tail branches explicitly.
 *
 * @param {string} root Repository root for source-printing audit.
 * @returns {object} Source-conditional resource co-occurrence only.
 */
function jointOpening(root) {
  const source=assess(root);
  const defenderBasics=source.challengerBasics;
  const attackerBasics=source.opponentBasics;
  if(defenderBasics!==17||attackerBasics!==12) {
    throw new Error('Source Basic inventories changed');
  }
  const pD=mulliganProbability(defenderBasics);
  const pA=mulliganProbability(attackerBasics);
  const bothValid=(1-pD)*(1-pA)/(1-pD*pA);
  const initialSoleK=loneBasicProbability(defenderBasics)/defenderBasics;
  const sums={soleKlefki:0,direct:0,padAdditional:0,
    stoneAdditional:0,combined:0};
  const branches={bothValid:0,defenderReceivesBonuses:0,
    attackerReceivesBonuses:0};
  let mass=0;

  /** @param {number} weight @param {number} defenderBonus @param {number} attackerBonus @param {keyof typeof branches} branch */
  function account(weight,defenderBonus,attackerBonus,branch) {
    const sole=initialSoleK*
      noExtraBasic(defenderBasics,Math.min(defenderBonus,47));
    const access=fixedWindow(attackerBasics,Math.min(attackerBonus,46));
    const joint=weight*sole*access.combined;
    sums.soleKlefki+=weight*sole;
    for(const key of ['direct','padAdditional','stoneAdditional','combined']) {
      sums[key]+=weight*sole*access[key];
    }
    branches[branch]+=joint;
    mass+=weight;
  }

  account(bothValid,0,0,'bothValid');
  // Each positive bonus count happens exclusively on one side.
  // The two geometric tails are aggregated at their physical draw caps.
  for(let k=1;k<47;k++) {
    account(bothValid*pA**k,k,0,'defenderReceivesBonuses');
    account(bothValid*pD**k,0,k,'attackerReceivesBonuses');
  }
  account(bothValid*pA**47/(1-pA),47,0,'defenderReceivesBonuses');
  account(bothValid*pD**47/(1-pD),0,46,'attackerReceivesBonuses');
  if(Math.abs(mass-1)>1e-11 ||
     Math.abs(sums.soleKlefki-
       source.afterAllUsableOpponentMulliganBonuses.challengerSoloKlefki)>1e-11) {
    throw new Error('Joint opening probability partition disagrees with source census');
  }
  return {
    schema:'source-locked-rank26-meloetta-v-newmoon-sole-klefki-resource-joint-v1',
    challengerHash:source.challengerHash,
    defenderBasics,attackerBasics,
    attackerSourceRank:26,
    defenderSource:'New Moon Lockbreaker English mechanical proxy v1',
    simultaneousMulliganMass:mass,
    ...sums,
    givenSoleKlefkiCologneOpportunity:sums.combined/sums.soleKlefki,
    givenSoleKlefkiNoModeledCologneRoute:1-sums.combined/sums.soleKlefki,
    branchContributions:branches,
    inference:'Source-dealt opening resource overlap only; opponent starting first, Pokemon Ability permission, actual Items, evolving, self-KOs, Energy, Tool and game winners not modeled.'
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(jointOpening(path.resolve(__dirname,'..')),null,2)+'\n');

module.exports={jointOpening};
