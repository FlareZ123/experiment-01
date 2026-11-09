'use strict';

const assert=require('node:assert/strict');
const {chooseFogPrinting}=require('./agent9-fog-actor-prompt.cjs');

const VERSION='agent21-owner-fog-basic-psychic-energy-deficit-v1';
const ENERGY_PREFIXES=[
  'Psychic Energy ','Telepath [P] Energy ',
  'Double Colorless Energy ','Prism Energy ',
  'Rainbow Energy ','Horror Psychic Energy '
];

/**
 * Pure owner-only Fog Crystal prompt target selection. Does not read future
 * draws, hidden opponent zones, or owner's deck before a legal search prompt.
 * A playable attack plus an exposed, unpowered Active can justify finding
 * Basic Psychic Energy when an attachment is still available and a backup
 * Bench Pokémon (or playable turn-one VIP) guards immediate Bench-out risk.
 *
 * @param {object} view Detached actorObservation at genuine owner-deck prompt.
 * @param {{printing:string,permitted:boolean,basicPsychic:boolean,psychicEnergy:boolean}[]} offered
 *   Exact printed searchable options from the owner's current prompt.
 * @returns {string|null} Selected owner-deck printing or null.
 */
function chooseEnergyDeficitFogPrinting(view,offered){
  assert.equal(view?.decisionKind,'owner-prompt');
  assert.equal(view.pendingOwnerDeckSearch,true);
  assert.ok(Array.isArray(offered));
  const owner=view.ownPublic??{};
  const active=owner.active;
  const resources=view.ownTurnResources??{};
  const hasBackup=(owner.bench??[]).some(Boolean)||
    (view.globalTurn<=2&&view.ownHand?.includes('Battle VIP Pass FST'));
  const hasEnergyInHand=(view.ownHand??[]).some(name=>
    ENERGY_PREFIXES.some(prefix=>name.startsWith(prefix)));
  const availableAttachment=resources.energyPlayedTurn!==view.globalTurn&&
    resources.energyPlayLocked!==true&&
    resources.specialEnergyPlayLocked!==true;
  const needsBasicEnergy=active?.energies?.length===0&&
    active?.attacks?.some(attack=>attack.cost?.length>0)===true;
  if(hasBackup&&!hasEnergyInHand&&availableAttachment&&needsBasicEnergy){
    const basic=offered.find(row=>row.permitted&&row.psychicEnergy);
    if(basic)return basic.printing;
  }
  return chooseFogPrinting(view,offered);
}

module.exports={VERSION,chooseEnergyDeficitFogPrinting};
