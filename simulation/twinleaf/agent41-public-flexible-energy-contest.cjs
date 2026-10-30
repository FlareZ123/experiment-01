'use strict';

const assert=require('node:assert/strict');
const {energyUnits,canPaySymbols}=
  require('./actor-energy-payability.cjs');
const {effectivePublicAttackCost,publicEnergyContext}=
  require('./agent17-public-context-special-energy.cjs');

const VERSION='agent41-public-flexible-special-vs-basic-immediate-attack-v1';

/**
 * Represent one exact, already attached Energy printing in owner-visible
 * Stadium and recipient context. Fail closed for an unknown printed effect.
 * @param {string} printing
 * @param {object} context
 * @param {boolean} temple
 * @param {object} catalog
 * @returns {string[][]|null}
 */
function attachedPublicUnits(printing,context,temple,catalog){
  if(temple&&catalog.specialEnergies?.has(printing))return [['C']];
  return energyUnits(printing,context);
}

/**
 * Offer a more powerful currently held Special Energy before a Basic
 * attachment only when that Special enables an actual printed positive-damage
 * attack NOW, and neither the current attached Energy nor ANY held Basic can
 * pay for any eligible attack. The native Store remains the legality
 * authority, particularly for conditional attachments and card effects.
 *
 * The predicate is owner-visible and archetype-independent. Attacks with no
 * printed positive damage (including copied-attack or lock effects) stay
 * deliberately unmodeled rather than fabricated into damage scores.
 *
 * @param {object} view Detached actorObservation, never a live Store.
 * @param {object} catalog Exact public printing metadata.
 * @returns {object|null} Exact-hand Special to the real own Active.
 */
function choosePublicFlexibleImmediateAttackEnergy(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,resource=view.ownTurnResources;
  const active=own?.active;
  if(!active||!resource||view.globalTurn<=1||
    resource.energyPlayLocked!==false||
    resource.specialEnergyPlayLocked===true||
    resource.energyPlayedTurn===view.globalTurn||
    own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
    active.publicRestrictions?.cannotAttackNextTurn===true||
    active.specialConditions?.some(condition=>
      condition===catalog.specialConditions?.ASLEEP||
      condition===catalog.specialConditions?.PARALYZED))return null;

  const basic=[],special=[];
  const context=publicEnergyContext(view,active,catalog);
  const stadium=[...(own.stadium??[]),...(view.opponentPublic?.stadium??[])];
  const temple=stadium.some(p=>p.startsWith('Temple of Sinnoh '));
  for(let i=0;i<view.ownHand.length;i++){
    const printing=view.ownHand[i];
    const isBasic=catalog.basicEnergies?.has(printing)===true;
    const isSpecial=catalog.specialEnergies?.has(printing)===true;
    if(!isBasic&&!isSpecial)continue;
    const units=attachedPublicUnits(printing,context,temple,catalog);
    if(units===null)continue;
    (isBasic?basic:special).push({handIndex:i,printing,units});
  }
  // Otherwise the existing public-context selector already considers Specials
  // after a (possibly absent) Basic, and there is no contested hand resource.
  if(!basic.length||!special.length)return null;

  const attached=[];
  for(const printing of active.energies??[]){
    const units=attachedPublicUnits(printing,context,temple,catalog);
    if(units===null)return null;
    attached.push(...units);
  }
  const restrictions=active.publicRestrictions??{};
  const attacks=(active.attacks??[]).filter(a=>
    Number.isFinite(a.damage)&&a.damage>0&&
    Array.isArray(a.cost)&&a.gxAttack!==true&&
    !a.name?.endsWith('-GX')&&
    restrictions.blockedAttackNameNextTurn!==a.name&&
    restrictions.blockedAttackNameUntilLeavesActive!==a.name&&
    !restrictions.cannotUseAttacksNextTurn?.includes(a.name)&&
    (!restrictions.onlyAllowedAttackNameNextTurn||
      restrictions.onlyAllowedAttackNameNextTurn===a.name))
    .map(attack=>({attack,cost:effectivePublicAttackCost(
      view,catalog,active,attack)}))
    .filter(row=>row.cost!==null);
  if(!attacks.length)return null;

  if(attacks.some(row=>canPaySymbols(row.cost,attached)))return null;
  if(basic.some(card=>attacks.some(row=>
    canPaySymbols(row.cost,[...attached,...card.units]))))return null;
  for(const card of special){
    if(attacks.some(row=>canPaySymbols(
      row.cost,[...attached,...card.units]))){
      return {kind:'attach-special-energy',handIndex:card.handIndex,
        printing:card.printing,slot:'active',index:0};
    }
  }
  return null;
}

module.exports={VERSION,attachedPublicUnits,
  choosePublicFlexibleImmediateAttackEnergy};
