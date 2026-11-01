'use strict';
const assert=require('node:assert/strict');
const {exactLockedOpening}=require('./agent25-dhelmise-lock-conditioned-opening.cjs');
const VERSION='agent25-dhelmise-any-psychic-attack-opening-v1';

/**
 * Exact physical-location event for ordinary one-Psychic Vengeful Anchor.
 * Telepathic Psychic Energy and ordinary Basic Psychic Energy both pay
 * Dhelmise M5's printed one-Psychic attack cost; Clefairy is optional when
 * no Dragon-weakness amplifier is required. No Item action, attack, turn
 * ordering or opponent play is simulated.
 *
 * Our narrow prior first-eight benchmark insists specifically on Telepathic
 * and accessible Lillie's Clefairy, which is a distinct Dragon-weakness line.
 * @returns {object} Comparable, explicitly limited physical opportunities.
 */
function study(){
  const scenarios=[2,3,4].map(pairCopies=>{
    const totalDonors=4+pairCopies*2;
    const effectivePartial=4+pairCopies;
    const basicCount=12+pairCopies;
    const common={totalDonors,basicCount};
    const narrow={
      allAbilities:exactLockedOpening({...common,
        eligibleDonors:totalDonors,
        energyCount:4,clefairyCount:2,requireClefairy:true}),
      wobbuffet:exactLockedOpening({...common,eligibleDonors:effectivePartial,
        energyCount:4,clefairyCount:2,requireClefairy:true})
    };
    const ordinary={
      allAbilities:exactLockedOpening({...common,
        eligibleDonors:totalDonors,energyCount:10,
        clefairyCount:0,requireClefairy:false}),
      wobbuffet:exactLockedOpening({...common,
        eligibleDonors:effectivePartial,energyCount:10,
        clefairyCount:0,requireClefairy:false}),
      silentLab:exactLockedOpening({...common,
        eligibleDonors:effectivePartial,energyCount:10,
        clefairyCount:0,requireClefairy:false}),
      garbotoxin:exactLockedOpening({...common,
        eligibleDonors:0,energyCount:10,
        clefairyCount:0,requireClefairy:false})
    };
    assert.equal(ordinary.wobbuffet.unconditional,
      ordinary.silentLab.unconditional);
    assert.equal(ordinary.garbotoxin.favorableWorlds,'0');
    return {pairCopies,totalDonors,partialLockEffectiveDonors:effectivePartial,
      hypotheticalNonDonorCardsCut:totalDonors-8,basicCount,
      strictTelepathicAndAccessibleClefairy:narrow,
      anyPsychicEnergyNoClefairyRequirement:ordinary,
      sameFixedSixtyAsSourceV2:pairCopies===2,
      allVersionsRequireDhelmiseInInitialSeven:true};
  });
  return {version:VERSION,baseFixedSixty:
      'results/als/agent25-dhelmise-mixed-lock-answers-v2.json',
    methods:{
      physicalLocations:'exact combinatorial enumeration over 60 identity classes, opening seven + exactly one natural draw + 6 random Prize cards',
      requirement:'Dhelmise in starting seven; at least one eligible Energy in initial eight; held Blender or held Arven with Blender in deck or two held Compressors; at least four eligible HNS donors still in deck after six Prizes',
      narrow:'four Telepathic Psychic Energy plus at least one Clefairy still in hand/deck',
      anyEnergy:'four Telepathic plus six ordinary Basic Psychic Energy; Clefairy not required, its two printed cards remain in the other physical category',
      noSearchOrGameplay:'No native action legality, Supporter turn rules, locks established at any particular time, opponent policy, raw draws beyond first, Battle Compressor actual selection, or attack path',
      actualGameClaim:false
    },
    scenarios,competitiveQualifiedGames:0,
    otherScenariosAreNotActualSixties:true};
}
module.exports={VERSION,study};
if(require.main===module)process.stdout.write(JSON.stringify(study(),null,2)+'\n');
