'use strict';

const assert=require('node:assert/strict');
const {preflightVisibleOwnerRemainingUpperBound}=
  require('./owner-original-60-plan-gate.cjs');

const VERSION='agent49-owner-direct-fog-one-energy-public-ko-proposal-v1';
const FOG='Fog Crystal CRE';
const BASIC='Psychic Energy';

/**
 * A conservative actor-only proposal for paying one basic Psychic via a
 * physically held Fog Crystal and then using the public Active's already
 * printed one-Energy attack. Exact attack damage still needs genuine native
 * Store plus target effects before a Knock Out can be certified.
 *
 * No opponent hand, deck, Prize or concealed source identity is accessed.
 * All original60 inputs must be from the acting owner, never opponent.
 *
 * @param {object} view Detached owner-root actor observation.
 * @param {string[]} original60 Actual owner's registered native fullNames.
 * @param {{psychic:number,colorless:number}} [costs] Pinned native enums.
 * @returns {object|null} Proposed plan, never a success certificate.
 */
function proposeOwnerDirectFogOneEnergyKo(
  view,original60,costs={psychic:5,colorless:9}
){
  if(view?.decisionKind!=='owner-root'||view.globalTurn<=1)
    return null;
  assert.ok(Array.isArray(original60)&&original60.length===60);
  const hand=view.ownHand??[];
  if(!hand.includes(FOG))return null;
  const own=view.ownPublic,opp=view.opponentPublic;
  const r=view.ownTurnResources;
  if(!own?.active||!opp?.active||!Array.isArray(own.active.attacks))
    return null;
  if(hand.some(x=>x===BASIC||x.startsWith(BASIC+' ')))return null;
  if(r?.energyPlayedTurn===view.globalTurn||
     r?.energyPlayLocked===true||r?.itemPlayLocked===true||
     own.publicTurnRestrictions?.itemPlayLocked===true||
     own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
     own.active.energies?.length!==0||
     own.active.publicRestrictions?.cannotAttackNextTurn===true||
     own.active.specialConditions?.length>0)return null;
  const remaining=opp.active.hp-opp.active.damage;
  if(!Number.isFinite(remaining)||remaining<=0)return null;
  const attack=own.active.attacks.find(a=>
    a.gxAttack!==true&&Array.isArray(a.cost)&&a.cost.length===1&&
    (a.cost[0]===costs.psychic||a.cost[0]===costs.colorless)&&
    Number.isFinite(a.damage)&&a.damage>=remaining&&
    own.active.publicRestrictions?.blockedAttackNameNextTurn!==a.name&&
    own.active.publicRestrictions?.blockedAttackNameUntilLeavesActive!==a.name);
  if(!attack)return null;
  const energyPrints=[...new Set(original60.filter(x=>
    typeof x==='string'&&x.startsWith(BASIC+' ')))];
  if(energyPrints.length===0)return null;
  const preflight=preflightVisibleOwnerRemainingUpperBound(
    original60,view,[{
      role:'fog-owner-deck-basic-energy-target',
      acceptablePrintings:energyPrints,copies:1
    }]);
  if(preflight.status!=='not-disproven')return null;
  return {
    version:VERSION,source:'actor-owner-public-plus-registered60',
    heldSearchPrinting:FOG,attackName:attack.name,
    sourcePrinting:own.active.printing,
    basicEnergyPrintings:energyPrints,
    printedDamage:attack.damage,
    opponentRemainingHp:remaining,
    needsRealNativeItemPaymentAndPrompt:true,
    prizeTakeCertified:false,gameWinCertified:false,
    opponentHiddenInspected:false,ownHiddenDeckInspected:false,
    ownHiddenPrizesInspected:false,
    qualifiedCompetitiveGame:false
  };
}

module.exports={VERSION,FOG,BASIC,proposeOwnerDirectFogOneEnergyKo};
