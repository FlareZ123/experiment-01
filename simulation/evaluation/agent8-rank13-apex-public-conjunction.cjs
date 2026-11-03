'use strict';
const assert=require('node:assert/strict');
const {SOURCE_DRAGONS}=
  require('../twinleaf/agent8-rank13-payload-owner-opportunity.cjs');

const ACTIVE='Regidrago VSTAR SIT';
const DDE='Double Dragon Energy ROS';
/**
 * Evaluate NECESSARY visible copy and colored-energy constraints only.
 * Opposing effects, Special Conditions and attack resolution remain native.
 * A Double Dragon supplies two independently chosen colored Energy units
 * only when no public Temple of Sinnoh suppresses it.
 *
 * @param {object} root Detached source-owner public root snapshot.
 * @returns {object}
 */
function ownerApexPublicGates(root){
  assert.ok(root&&Array.isArray(root.eligiblePublicDragonDiscard));
  const energies=root.activeAttachedEnergyPrintings??[];
  const grass=energies.filter(p=>p.startsWith('Grass Energy ')).length;
  const fire=energies.filter(p=>p.startsWith('Fire Energy ')).length;
  const dde=energies.filter(p=>p===DDE).length;
  const missingColoredUnits=Math.max(0,2-grass)+Math.max(0,1-fire);
  const multicoloredUnits=root.templeOfSinnohPublicInPlay===true?0:2*dde;
  const active=root.activePrinting===ACTIVE;
  const payload=root.eligiblePublicDragonDiscard.some(p=>
    SOURCE_DRAGONS.has(p));
  return {
    turn:root.turn,activeRegidragoVstar:active,
    publicDragonDiscardPayload:payload,
    grassBasicCount:grass,fireBasicCount:fire,
    doubleDragonCards:dde,publicTempleOfSinnoh:
      root.templeOfSinnohPublicInPlay===true,
    missingColoredUnits,availableMulticoloredUnits:multicoloredUnits,
    printedColoredApexCostPossiblySatisfied:
      missingColoredUnits<=multicoloredUnits,
    allThreeNecessaryPublicGates:
      active&&payload&&missingColoredUnits<=multicoloredUnits,
    completePaperAttackLegalityVerified:false
  };
}
module.exports={ownerApexPublicGates};
