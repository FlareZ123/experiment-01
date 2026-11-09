'use strict';
const assert=require('node:assert/strict');
const {publicSpecialAttackPayable}=
  require('./agent17-public-context-special-energy.cjs');
const {projectedFundedAttackDamage}=
  require('./agent14-generic-funded-floatstone-frontier.cjs');
const {MIN_PROJECTED_DAMAGE}=
  require('./agent6-actor-paid-retreat-frontier.cjs');

const VERSION='agent19-zero-energy-nonko-funded-floatstone-v1';
const TOOL='Float Stone BKT';

/**
 * The existing generic funded Float Stone selector requires an Energy already
 * attached to the Active. The earlier zero-Energy variant requires nominal
 * immediate KO. This owner-only planner fills the disjoint case: zero-Energy
 * stranded Active, held or attached Float Stone, funded substantive attack on
 * the Bench, even when that attack is not a projected KO. No effect on a
 * foreign player's hand, Prize information, or speculative Store.
 *
 * @param {object} view Detached actor observation, at real owner root.
 * @param {object} catalog Printing-specific public Energy metadata.
 * @returns {object|null} Native-neutral Tool/Retreat intent.
 */
function chooseZeroEnergyNonKoFloatStone(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,active=own?.active,r=view.ownTurnResources;
  if(!Number.isSafeInteger(view.globalTurn)||view.globalTurn<=1||
     !active||!r||!Array.isArray(own?.bench)||
     !Array.isArray(active.energies)||active.energies.length!==0||
     !Array.isArray(active.printed?.retreatCost)||
     active.printed.retreatCost.length===0||
     !Number.isSafeInteger(r.retreatedTurn)||r.retreatedTurn===view.globalTurn||
     own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
     active.publicRestrictions?.cannotRetreatWhileActive===true||
     active.publicRestrictions?.cannotRetreatNextTurn===true||
     active.specialConditions?.some(x=>x===catalog.specialConditions?.ASLEEP||
       x===catalog.specialConditions?.PARALYZED))return null;
  const stadiums=[...(own.stadium??[]),...(view.opponentPublic?.stadium??[])];
  if(stadiums.some(x=>x.startsWith('Jamming Tower '))||
     view.opponentPublic?.active?.tools?.some(x=>x.startsWith('Tool Jammer ')))
    return null;

  // Zero-Energy attacks and other free attacks are real competing actions.
  if((active.attacks??[]).some(attack=>
    publicSpecialAttackPayable(view,catalog,active,attack)&&
    projectedFundedAttackDamage(view,active,attack,catalog)>0))
    return null;

  const possibilities=[];
  for(const [benchIndex,pokemon] of own.bench.entries()){
    if(!pokemon||
      require('./agent47-active-position-retreat-veto.cjs')
        .wouldLoseActivePositionAbility(view,benchIndex)||
      pokemon.publicRestrictions?.cannotAttackNextTurn===true||
      pokemon.specialConditions?.some(x=>x===catalog.specialConditions?.ASLEEP||
        x===catalog.specialConditions?.PARALYZED))continue;
    const restrictions=pokemon.publicRestrictions??{};
    for(const attack of pokemon.attacks??[]){
      if(attack.gxAttack===true||
         restrictions.blockedAttackNameNextTurn===attack.name||
         restrictions.blockedAttackNameUntilLeavesActive===attack.name||
         restrictions.cannotUseAttacksNextTurn?.includes(attack.name)||
         (restrictions.onlyAllowedAttackNameNextTurn&&
          restrictions.onlyAllowedAttackNameNextTurn!==attack.name)||
         !publicSpecialAttackPayable(view,catalog,pokemon,attack))continue;
      const damage=projectedFundedAttackDamage(view,pokemon,attack,catalog);
      if(!Number.isSafeInteger(damage)||damage<MIN_PROJECTED_DAMAGE)
        continue;
      possibilities.push({benchIndex,printing:pokemon.printing,
        targetAttackName:attack.name,projectedPrintedDamage:damage});
    }
  }
  possibilities.sort((a,b)=>b.projectedPrintedDamage-a.projectedPrintedDamage||
    a.benchIndex-b.benchIndex||a.targetAttackName.localeCompare(b.targetAttackName));
  const target=possibilities[0];
  if(!target)return null;
  if(active.tools?.includes(TOOL))
    return {...target,kind:'retreat-emergency-floatstone',
      source:VERSION,paperQualified:false};
  if(!Array.isArray(active.tools)||active.tools.length!==0||
     r.toolPlayLocked===true||
     own.publicTurnRestrictions?.toolPlayLocked===true)return null;
  const handIndex=view.ownHand?.indexOf(TOOL)??-1;
  if(handIndex<0)return null;
  return {...target,kind:'attach-emergency-floatstone',handIndex,
    source:VERSION,paperQualified:false};
}

/**
 * Wrapper injects the new option into the existing funded Float Stone native
 * action decoder, without modifying upstream or changing the default policy.
 * @template T
 * @param {()=>T} execute Entire synchronous Store-native game batch.
 * @returns {{result:T,audit:object}}
 */
function withZeroEnergyNonKoFloatStone(execute){
  assert.equal(typeof execute,'function');
  const selector=require('./agent14-generic-funded-floatstone-frontier.cjs');
  const original=selector.chooseGenericFundedFloatStone;
  let encountered=0;
  let chosen=0;
  function composed(view,catalog){
    const plan=original(view,catalog);
    if(plan)return plan;
    if(view?.ownPublic?.active?.energies?.length===0)encountered++;
    const extra=chooseZeroEnergyNonKoFloatStone(view,catalog);
    if(extra)chosen++;
    return extra;
  }
  selector.chooseGenericFundedFloatStone=composed;
  try{return {result:execute(),audit:{version:VERSION,
    zeroEnergyOpportunityChecks:encountered,proposalsSelected:chosen,
    nativeAcceptedRootsNotProvenByProposal:true,paperQualified:false}};}
  finally{
    assert.equal(selector.chooseGenericFundedFloatStone,composed);
    selector.chooseGenericFundedFloatStone=original;
  }
}
module.exports={VERSION,chooseZeroEnergyNonKoFloatStone,
  withZeroEnergyNonKoFloatStone};
