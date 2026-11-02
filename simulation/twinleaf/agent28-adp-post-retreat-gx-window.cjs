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
  const templeOfSinnoh=[...(own.stadium??[]),
    ...(view.opponentPublic?.stadium??[])].some(name=>
    name.startsWith('Temple of Sinnoh '));
  // One functioning Double Dragon provides Metal plus the additional Water
  // for boosted Altered Creation-GX on this Dragon TAG TEAM. Other Energy
  // suppression, attack permission, Prize effects and replies remain unproved.
  const nominalBoostedResourceWindow=Boolean(printedAttack)&&ddeCount>=1&&
    !usedGX&&!gxLocked&&!attackLocked&&!templeOfSinnoh;
  return {printing:ADP,globalTurn:view.globalTurn,
    ddeAttachedCards:ddeCount,printedGxFound:Boolean(printedAttack),
    printedCost:printedAttack?[...printedAttack.cost]:null,
    engineGxAttackAnnotation:printedAttack?.gxAttack===true,
    gxAlreadyUsed:usedGX,gxLocked,attackLocked,templeOfSinnoh,
    nominalBoostedResourceWindow,nativePlayableCertified:false,
    opponentResponseCertified:false};
}

module.exports={VERSION,ADP,DDE,GX,observeAdpBoostedGxResourceWindow};
