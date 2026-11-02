'use strict';

const assert=require('node:assert/strict');

const VERSION='agent37-owner-public-dce-mew-paid-retreat-v1';
const DCE='Double Colorless Energy SUM';
const MEW='Mew VMAX FST';
const GENESECT='Genesect V FST';

/**
 * One tightly bounded owner-public response to an engine-pinned original Mew
 * source being stranded behind its unpowered-to-attack Active Genesect V.
 * Both this policy and the native Store must separately agree on eligibility.
 *
 * DCE supplies two Colorless Energy but remains one card when discarded to
 * pay Genesect V's two-Colorless Retreat Cost. Mew VMAX on the Bench must
 * retain its own DCE and a Benched Genesect donor for Cross Fusion Strike.
 *
 * This is a mechanically grounded intent, not a complete legality oracle or
 * evidence that an actual live Store accepted a retrospective alternative.
 * All observation inputs are from this player's hand/public board.
 *
 * @param {object} view Detached actorObservation on owner's real turn.
 * @param {object} catalog Public printed Energy and status constants.
 * @returns {object|null} Existing paid-retreat native-neutral intent.
 */
function chooseDceMewPaidRetreat(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,active=own?.active,resources=view.ownTurnResources;
  if(!active||!Array.isArray(own.bench)||!resources||view.globalTurn===1)
    return null;
  if(!Number.isSafeInteger(resources.retreatedTurn)||
      resources.retreatedTurn===view.globalTurn)return null;
  if(active.printing!==GENESECT||active.energies?.length!==1||
      active.energies[0]!==DCE)return null;
  const colors=catalog.colorlessEnergyType;
  if(!Array.isArray(active.printed?.retreatCost)||
      active.printed.retreatCost.length!==2||
      active.printed.retreatCost.some(x=>x!==colors))return null;
  if(active.publicRestrictions?.cannotRetreatNextTurn===true||
      active.publicRestrictions?.cannotRetreatWhileActive===true||
      active.specialConditions?.some(x=>x===catalog.specialConditions.ASLEEP||
        x===catalog.specialConditions.PARALYZED))return null;
  if(own.publicTurnRestrictions?.attackLockTurnsRemaining>0)return null;
  const stadiums=[...(own.stadium??[]),...(view.opponentPublic?.stadium??[])];
  if(stadiums.some(x=>x.startsWith('Temple of Sinnoh ')))return null;
  if(!own.bench.some(p=>p?.printing===GENESECT))return null;
  for(let benchIndex=0;benchIndex<own.bench.length;benchIndex++){
    const p=own.bench[benchIndex];
    if(p?.printing!==MEW||p.energies?.length!==1||
        p.energies[0]!==DCE||p.publicRestrictions?.cannotAttackNextTurn===true)
      continue;
    if(p.specialConditions?.some(x=>
      x===catalog.specialConditions.ASLEEP||
      x===catalog.specialConditions.PARALYZED))continue;
    const attack=p.attacks?.find(a=>a.name==='Cross Fusion Strike'&&
      Array.isArray(a.cost)&&a.cost.length===2&&
      a.cost.every(x=>x===colors));
    if(!attack||p.publicRestrictions?.blockedAttackNameNextTurn===attack.name||
        p.publicRestrictions?.blockedAttackNameUntilLeavesActive===attack.name||
        p.publicRestrictions?.cannotUseAttacksNextTurn?.includes(attack.name)||
        (p.publicRestrictions?.onlyAllowedAttackNameNextTurn&&
          p.publicRestrictions.onlyAllowedAttackNameNextTurn!==attack.name))
      continue;
    return {kind:'paid-retreat',benchIndex,printing:MEW,
      attackName:'Cross Fusion Strike',retreatCostUnits:1,
      paymentPrinting:DCE,policy:VERSION};
  }
  return null;
}

module.exports={VERSION,DCE,MEW,GENESECT,chooseDceMewPaidRetreat};
