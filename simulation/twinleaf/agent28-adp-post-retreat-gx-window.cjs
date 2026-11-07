'use strict';

const assert=require('node:assert/strict');
const VERSION='agent28-adp-post-retreat-boosted-gx-public-preflight-v1';
const ADP='Arceus & Dialga & Palkia GX CEC';
const DDE='Double Dragon Energy ROS';
const GX='Altered Creation-GX';

/**
 * Observe the printed boosted-GX resource opportunity from the current
 * player's detached public board. The pinned native ADP printing reports
 * gxAttack=false even for Altered Creation-GX; use its exact printed name
 * and keep native GX legality separate. This is not a permission verdict.
 * @param {object} view Owner-only detached actor observation.
 * @returns {object|null}
 */
function observeAdpBoostedGxResourceWindow(view){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic;
  const active=own?.active;
  if(active?.printing!==ADP)return null;
  const printedAttack=active.attacks.find(a=>a.name===GX);
  const ddeCount=active.energies.filter(name=>name===DDE).length;
  const usedGX=own.publicTurnRestrictions?.gxUsed===true;
  const gxLocked=own.publicTurnRestrictions?.cannotUseGXAttacks===true;
  const attackLocked=(own.publicTurnRestrictions?.attackLockTurnsRemaining??0)>0||
    active.publicRestrictions?.cannotAttackNextTurn===true||
    active.publicRestrictions?.cannotUseAttacksNextTurn?.includes(GX)===true||
    active.publicRestrictions?.blockedAttackNameNextTurn===GX||
    active.publicRestrictions?.blockedAttackNameUntilLeavesActive===GX;
  const publicStadiums=[...(own.stadium??[]),
    ...(view.opponentPublic?.stadium??[])];
  const templeOfSinnoh=publicStadiums.some(name=>
    name.startsWith('Temple of Sinnoh '));
  const wondrousLabyrinth=publicStadiums.some(name=>
    name.startsWith('Wondrous Labyrinth Prism Star '));
  // Basic Energy identities are public once attached. Unknown Special Energy
  // never adds a claimed guaranteed unit in this read-only lower-bound check.
  const basicEnergyCount=active.energies.filter(printing=>
    /^(Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy /.test(printing)).length;
  const knownAvailableEnergyUnits=2*ddeCount+basicEnergyCount;
  const energyUnitsForEnhancedGX=2+Number(wondrousLabyrinth);
  // One Double Dragon is Metal + extra Water only when no extra Stadium tax
  // applies. Under Wondrous, Metal + Colorless + extra Water needs three units.
  // This protects boosted-GX claims; native base-GX eligibility stays separate.
  const nominalBoostedResourceWindow=Boolean(printedAttack)&&ddeCount>=1&&
    !usedGX&&!gxLocked&&!attackLocked&&!templeOfSinnoh&&
    knownAvailableEnergyUnits>=energyUnitsForEnhancedGX;
  return {printing:ADP,globalTurn:view.globalTurn,
    ddeAttachedCards:ddeCount,printedGxFound:Boolean(printedAttack),
    printedCost:printedAttack?[...printedAttack.cost]:null,
    engineGxAttackAnnotation:printedAttack?.gxAttack===true,
    gxAlreadyUsed:usedGX,gxLocked,attackLocked,templeOfSinnoh,
    wondrousLabyrinth,knownAvailableEnergyUnits,energyUnitsForEnhancedGX,
    nominalBoostedResourceWindow,nativePlayableCertified:false,
    opponentResponseCertified:false};
}

/**
 * Select printed GX only among attacks already accepted as payable by the
 * independent actor-owned resource-cost model. Native Store remains final.
 * @param {object} view Detached owner-only observation.
 * @param {object[]} payable Actor cost-screened attacks.
 * @returns {{kind:'attack',attackName:string}|null}
 */
function chooseAdpGxFromPayable(view,payable){
  assert.ok(Array.isArray(payable));
  const window=observeAdpBoostedGxResourceWindow(view);
  if(!window?.nominalBoostedResourceWindow)return null;
  return payable.some(attack=>attack.name===GX)?
    {kind:'attack',attackName:GX}:null;
}

module.exports={VERSION,ADP,DDE,GX,observeAdpBoostedGxResourceWindow,
  chooseAdpGxFromPayable};
