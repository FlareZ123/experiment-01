'use strict';
const assert=require('node:assert/strict');
const {SOURCE_DRAGONS}=require('./agent8-rank13-payload-owner-opportunity.cjs');
const {ownerApexPublicGates}=
  require('../evaluation/agent8-rank13-apex-public-conjunction.cjs');
const VERSION='agent8-owner-root-publicly-payable-regidrago-apex-v1';

/**
 * Narrow, default-off owner-public Apex intent after source physically
 * obtains all three necessary printed prerequisites. Actual live Store
 * acceptance and attack-copy prompt selection remain authoritative.
 * No hidden deck or Prize identity and no opponent secret is accessed.
 * @param {object} view Detached actorObservation on its own root
 * @param {object} catalog Native printed public Special Conditions
 * @returns {object|null}
 */
function choosePublicApexRoot(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,active=own?.active;
  if(!active||view.globalTurn===1||
     !active.attacks?.some(attack=>attack.name==='Apex Dragon'))return null;
  const restrictions=active.publicRestrictions??{};
  const globalRules=own.publicTurnRestrictions??{};
  if(globalRules.attackLockTurnsRemaining>0||
     restrictions.cannotAttackNextTurn===true||
     restrictions.cannotUseAttacksNextTurn?.includes('Apex Dragon')||
     restrictions.blockedAttackNameNextTurn==='Apex Dragon'||
     restrictions.blockedAttackNameUntilLeavesActive==='Apex Dragon'||
     (restrictions.onlyAllowedAttackNameNextTurn&&
       restrictions.onlyAllowedAttackNameNextTurn!=='Apex Dragon')||
     active.specialConditions?.some(condition=>
       condition===catalog.specialConditions.ASLEEP||
       condition===catalog.specialConditions.PARALYZED))return null;
  const allPublic=[
    ...(own.stadium??[]),...(view.opponentPublic?.stadium??[])
  ];
  const gates=ownerApexPublicGates({
    turn:view.globalTurn,activePrinting:active.printing,
    activeAttachedEnergyPrintings:active.energies??[],
    eligiblePublicDragonDiscard:(own.discard??[])
      .filter(p=>SOURCE_DRAGONS.has(p)),
    templeOfSinnohPublicInPlay:allPublic.some(p=>
      p.startsWith('Temple of Sinnoh '))
  });
  if(!gates.allThreeNecessaryPublicGates)return null;
  return {kind:'attack',attackName:'Apex Dragon',
    source:VERSION,publicGates:gates,
    nativeStoreAndAttackEffectUnverified:true};
}
module.exports={VERSION,choosePublicApexRoot};
