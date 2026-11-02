'use strict';

const assert=require('node:assert/strict');
const {projectedPrintedDamage,MIN_PROJECTED_DAMAGE}=
  require('./agent6-actor-paid-retreat-frontier.cjs');
const {publicSpecialAttackPayable}=
  require('./agent17-public-context-special-energy.cjs');

const VERSION='agent6-public-mixed-energy-paid-retreat-proposal-v1';

/**
 * Public-only, deliberately narrow proposal. Preserves one owner-visible
 * Basic Energy as a deterministic preferred retreat discard, while allowing
 * arbitrary *recognized* Special Energy on the prospective Bench attacker.
 * Does not submit any Store action or certify actual retreat/attack legality.
 *
 * @param {object} view Detached actorObservation
 * @param {object} catalog Exact public Energy printing/type catalog
 * @returns {object|null} Research-only retreat/payment proposal
 */
function proposeMixedEnergyPaidRetreat(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,active=own?.active;
  if(!active||!view.opponentPublic?.active||view.globalTurn===1)return null;
  const resources=view.ownTurnResources;
  if(!Number.isSafeInteger(resources?.retreatedTurn)||
      resources.retreatedTurn===view.globalTurn)return null;
  if(own.publicTurnRestrictions?.attackLockTurnsRemaining>0)return null;
  // Do not silently infer effective retreat cost from printed cost when
  // a Stadium or Tool may modify it. This is a strict initial scope.
  if((own.stadium?.length??0)!==0||
     (view.opponentPublic.stadium?.length??0)!==0||
     (active.tools?.length??0)!==0)return null;
  if(!Array.isArray(active.printed?.retreatCost)||
      active.printed.retreatCost.length!==1||
      active.printed.retreatCost[0]!==catalog.colorlessEnergyType)return null;
  if(active.publicRestrictions?.cannotRetreatNextTurn===true||
     active.publicRestrictions?.cannotRetreatWhileActive===true||
     active.specialConditions?.some(x=>x===catalog.specialConditions.ASLEEP||
       x===catalog.specialConditions.PARALYZED))return null;
  const basic=active.energies?.find(printing=>
    catalog.basicEnergies?.has(printing));
  if(!basic)return null;

  // Retain an Active attacker whenever the same conservative public model
  // can already prove that it has a damaging, payable attack.
  if(active.attacks?.some(attack=>
    attack.gxAttack!==true&&
    Number.isSafeInteger(attack.damage)&&attack.damage>0&&
    publicSpecialAttackPayable(view,catalog,active,attack)))return null;

  const options=[];
  for(let benchIndex=0;benchIndex<(own.bench?.length??0);benchIndex++){
    const pokemon=own.bench[benchIndex];
    if(!pokemon||pokemon.publicRestrictions?.cannotAttackNextTurn===true)
      continue;
    for(const attack of pokemon.attacks??[]){
      const damage=projectedPrintedDamage(view,pokemon,attack);
      if(attack.gxAttack===true||damage===null||
          damage<MIN_PROJECTED_DAMAGE||
          !publicSpecialAttackPayable(view,catalog,pokemon,attack))continue;
      if(pokemon.publicRestrictions?.blockedAttackNameNextTurn===attack.name||
         pokemon.publicRestrictions?.blockedAttackNameUntilLeavesActive===attack.name||
         pokemon.publicRestrictions?.cannotUseAttacksNextTurn?.includes(attack.name)||
         (pokemon.publicRestrictions?.onlyAllowedAttackNameNextTurn&&
          pokemon.publicRestrictions.onlyAllowedAttackNameNextTurn!==attack.name))
        continue;
      options.push({
        kind:'mixed-energy-paid-retreat-proposal',benchIndex,
        printing:pokemon.printing,attackName:attack.name,
        projectedPrintedDamage:damage,retreatCostUnits:1,
        preferredDiscardPrinting:basic,
        validation:'UNVERIFIED_NATIVE_PROMPT_AND_ATTACK'
      });
    }
  }
  options.sort((a,b)=>b.projectedPrintedDamage-a.projectedPrintedDamage||
    a.benchIndex-b.benchIndex||a.attackName.localeCompare(b.attackName));
  return options[0]??null;
}

module.exports={VERSION,proposeMixedEnergyPaidRetreat};
