'use strict';
const assert=require('node:assert/strict');
const {energyUnits}=require('./actor-energy-payability.cjs');
const {publicEnergyContext,effectivePublicAttackCost,futureOneUnitDeficit}=
  require('./agent17-public-context-special-energy.cjs');
const VERSION='agent10-active-mega-claw-priority-over-second-benched-mega-v1';
const CLAW='Your opponent reveals their hand, and you discard a card you find there.';

/**
 * Narrow same-printing competition repair. A previously selected legal-looking
 * Benched Mega investment may be outweighed by adding the *same held card* to
 * an already closer Active Mega Claw. Preserve the old proposed Bench action
 * if the Active recipient is not strictly closer to a payable Claw.
 *
 * @param {object} view Detached currently acting player view
 * @param {object} catalog Public immutable card print definitions
 * @param {object|null} benchIntent Existing Agent2 Bench funding decision
 * @returns {object|null} A stronger Active allocation or null to keep Bench
 */
function chooseActiveMegaClawOverBenchedMega(view,catalog,benchIntent){
  assert.equal(view?.decisionKind,'owner-root');
  if(!benchIntent||benchIntent.slot!=='bench'||
      !Number.isSafeInteger(benchIntent.handIndex)||
      !Number.isSafeInteger(benchIntent.remainingFutureAttachments)||
      view.ownHand?.[benchIntent.handIndex]!==benchIntent.printing)
    return null;
  const own=view.ownPublic;
  const active=own?.active;
  if(active?.printing!=='Mega Absol ex M1L'||
      active.printed?.stage!==catalog.stages?.BASIC||
      active.publicRestrictions?.cannotAttackNextTurn===true||
      active.publicRestrictions?.cannotUseAttacksNextTurn?.includes('Claw of Darkness')||
      active.publicRestrictions?.blockedAttackNameNextTurn==='Claw of Darkness')
    return null;
  const attack=active.attacks?.find(a=>a.name==='Claw of Darkness'&&
    a.damage===200&&a.text===CLAW&&
    (a.damageCalculation===null||a.damageCalculation===undefined));
  if(!attack)return null;
  const cost=effectivePublicAttackCost(view,catalog,active,attack);
  if(cost===null||cost.length===0)return null;
  const stadiums=[...(own.stadium??[]),...(view.opponentPublic?.stadium??[])];
  const temple=stadiums.some(s=>s.startsWith('Temple of Sinnoh '));
  const ctx=publicEnergyContext(view,active,catalog);
  const units=[];
  for(const printing of active.energies??[]){
    const u=temple&&catalog.specialEnergies.has(printing)?
      [['C']]:energyUnits(printing,ctx);
    if(u===null)return null;
    units.push(...u);
  }
  const before=futureOneUnitDeficit(cost,units);
  if(before===0)return null;
  const added=temple&&catalog.specialEnergies.has(benchIntent.printing)?
    [['C']]:energyUnits(benchIntent.printing,ctx);
  if(added===null)return null;
  const after=futureOneUnitDeficit(cost,[...units,...added]);
  if(after>=before||after>=benchIntent.remainingFutureAttachments)
    return null;
  return {
    kind:benchIntent.kind,
    printing:benchIntent.printing,
    handIndex:benchIntent.handIndex,
    slot:'active',index:0,
    publicAttackName:'Claw of Darkness',
    remainingFutureAttachments:after,
    alternativeBenchedMegaDeficit:benchIntent.remainingFutureAttachments,
    selectionVersion:VERSION,
    nativeStoreAcceptanceRequired:true,
    wholeGameValueUnverified:true
  };
}
module.exports={VERSION,chooseActiveMegaClawOverBenchedMega};
