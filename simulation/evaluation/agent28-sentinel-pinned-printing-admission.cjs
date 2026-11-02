'use strict';
const assert=require('node:assert/strict');
const candidate=require('../../results/aichi-2026/candidate-sentinel-lopunny-vileplume-v1.json');
const {planAichi,summarisePlan}=require('./aichi-pilot.cjs');

/**
 * Source-printing resolution, without running a single game. The external
 * tournament JSON is authoritative for source display printing identities,
 * while the bundled native mapping can require approved basic-energy aliases.
 * @returns {object}
 */
function probeSentinelAdmission(){
  const plan=planAichi(candidate,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const status=summarisePlan(plan);
  const exactCount=candidate.cards.reduce((n,card)=>n+card.count,0);
  assert.equal(exactCount,60);
  assert.deepEqual(status.unavailableSourceRanks,[23,25,28]);
  return {
    version:'agent28-sentinel-native-printing-resolution-v1',
    manifest:'results/aichi-2026/candidate-sentinel-lopunny-vileplume-v1.json',
    candidateDigest:plan.candidateDigest,
    fieldManifestDigest:plan.manifestDigest,
    fixed60Count:exactCount,
    pinnedNativeCandidateResolved:status.candidateResolved,
    nativeResolvedPhysicalCards:plan.candidate.cards.length,
    sourceUnavailableRanks:status.unavailableSourceRanks,
    status,
    actualGameCount:0,
    competitiveQualified:false,
    evidenceScope:'card-resolution only; no shuffled games or attack-policy claims'
  };
}

if(require.main===module)
  console.log(JSON.stringify(probeSentinelAdmission(),null,2));
module.exports={probeSentinelAdmission};
