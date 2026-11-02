'use strict';
const assert=require('node:assert/strict');
const VERSION='agent9-owner-public-crobat-dce-mew-retreat-v1';
const DCE='Double Colorless Energy SUM';
const CROBAT='Crobat V DAA';
const MEW='Mew VMAX FST';
const GENESECT='Genesect V FST';

/**
 * Offer an actor-owned native paid retreat only when a real, observed
 * Active Crobat V has a DCE payable for exactly one printed Colorless
 * retreat unit, and a Benched Mew VMAX already has the DCE needed for
 * Cross Fusion Strike with a separate Genesect V donor.
 *
 * No private deck, prizes, opponent hand or native Store instance is read.
 * Native Store must independently accept the proposed RetreatAction.
 * This remains developmental and cannot certify a paper match.
 *
 * @param {object} view Detached live owner-root observation.
 * @param {object} catalog Public printing and type metadata.
 * @returns {object|null} Existing native-neutral paid-retreat intent.
 */
function chooseCrobatDceMewRetreat(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,active=own?.active,resources=view.ownTurnResources;
  if(view.globalTurn===1||!active||!Array.isArray(own?.bench)||
      !resources||!Number.isSafeInteger(resources.retreatedTurn)||
      resources.retreatedTurn===view.globalTurn)return null;
  if(active.printing!==CROBAT||active.energies?.length!==1||
      active.energies[0]!==DCE)return null;
  const colorless=catalog.colorlessEnergyType;
  if(!Array.isArray(active.printed?.retreatCost)||
      active.printed.retreatCost.length!==1||
      active.printed.retreatCost[0]!==colorless)return null;
  const conditions=catalog.specialConditions;
  if(active.specialConditions?.some(x=>
      x===conditions.ASLEEP||x===conditions.PARALYZED))return null;
  if(active.publicRestrictions?.cannotRetreatNextTurn===true||
      active.publicRestrictions?.cannotRetreatWhileActive===true||
      active.publicRestrictions?.cannotRetreat===true||
      own.publicTurnRestrictions?.attackLockTurnsRemaining>0)return null;
  const stadiums=[...(own.stadium??[]),...(view.opponentPublic?.stadium??[])];
  if(stadiums.some(s=>s.startsWith('Temple of Sinnoh ')))return null;
  if(!own.bench.some(p=>p?.printing===GENESECT))return null;
  for(let benchIndex=0;benchIndex<own.bench.length;benchIndex++){
    const candidate=own.bench[benchIndex];
    if(candidate?.printing!==MEW||candidate.energies?.length!==1||
        candidate.energies[0]!==DCE||
        candidate.publicRestrictions?.cannotAttackNextTurn===true)continue;
    if(candidate.specialConditions?.some(x=>
        x===conditions.ASLEEP||x===conditions.PARALYZED))continue;
    const attack=candidate.attacks?.find(a=>
      a.name==='Cross Fusion Strike'&&Array.isArray(a.cost)&&
      a.cost.length===2&&a.cost.every(x=>x===colorless));
    if(!attack||
        candidate.publicRestrictions?.blockedAttackNameNextTurn===attack.name||
        candidate.publicRestrictions?.blockedAttackNameUntilLeavesActive===attack.name||
        candidate.publicRestrictions?.cannotUseAttacksNextTurn?.includes(attack.name)||
        (candidate.publicRestrictions?.onlyAllowedAttackNameNextTurn&&
          candidate.publicRestrictions.onlyAllowedAttackNameNextTurn!==attack.name))
      continue;
    return {kind:'paid-retreat',benchIndex,printing:MEW,
      attackName:'Cross Fusion Strike',retreatCostUnits:1,
      paymentPrinting:DCE,policy:VERSION};
  }
  return null;
}

module.exports={VERSION,DCE,CROBAT,MEW,GENESECT,chooseCrobatDceMewRetreat};
