'use strict';
const assert=require('node:assert/strict');
const VERSION='agent37-owner-physical-energy-starvation-v1';
/**
 * Owner/public zero-energy custody census. It is a hint for alternative
 * action arbitration, not an attack-permission or paid-search verdict.
 * @param {object} view Detached actor observation.
 * @param {{basicEnergies:Set<string>,specialEnergies:Set<string>}} catalog
 * Exact printed Energy definitions.
 * @returns {object} Bounded visible physical-energy and rescue observations.
 */
function ownerZeroEnergyFrontier(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic;
  const ownSlots=[own.active,...own.bench].filter(Boolean);
  const energyInHand=view.ownHand.filter(printing=>
    catalog.basicEnergies.has(printing)||
    catalog.specialEnergies.has(printing));
  const attached=ownSlots.flatMap(slot=>slot.energies??[]);
  const ownPrizes=own.prizeCount;
  const opponentPrizes=view.opponentPublic.prizeCount;
  const holds=printing=>view.ownHand.includes(printing);
  const shuffleOffers=[
    ...(holds("Lillie's Determination M1L")?
      [{printing:"Lillie's Determination M1L",type:'shuffle-and-draw',
        printedDrawCount:ownPrizes===6?8:6}]:[]),
    ...(holds('Ace Trainer AOR')&&ownPrizes>opponentPrizes?
      [{printing:'Ace Trainer AOR',type:'disruptive-shuffle-and-draw',
        printedDrawCount:6,opponentPrintedDrawCount:3}]:[])
  ];
  return {
    schema:VERSION,
    handCount:view.ownHand.length,
    ownerPhysicalEnergyHand:energyInHand.length,
    ownerPhysicalEnergyAttached:attached.length,
    zeroPhysicalEnergy:energyInHand.length===0&&attached.length===0,
    ownPrizesRemaining:ownPrizes,
    opponentPrizesRemaining:opponentPrizes,
    heldCounterCatcher:holds('Counter Catcher PAR'),
    heldForestSealStone:holds('Forest Seal Stone SIT'),
    printedShuffleOffers:shuffleOffers,
    knownEnergyRemainingInDeck:null,
    attackAvailabilityCertified:false,
    supporterNativeCanPlayCertified:false,
    tacticalBenefitCertified:false
  };
}
module.exports={VERSION,ownerZeroEnergyFrontier};
