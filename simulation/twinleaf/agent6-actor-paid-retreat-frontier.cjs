'use strict';

const assert=require('node:assert/strict');
const {paysWithBasics}=
  require('./agent7-actor-free-retreat-frontier.cjs');

const VERSION='agent6-owner-visible-paid-one-energy-retreat-v1';

/**
 * Pick a single legal-looking paid retreat from a zero-damage Active attack
 * to a Benched attacker whose printed positive-damage attack is payable.
 *
 * This is a conservative owner-observation planner, not a complete paper
 * Retreat legality oracle. The genuine Store must accept the RetreatAction
 * and a later AttackAction before effects can be credited. We intentionally
 * exclude variable Special Energy payments, modified Retreat Costs, known
 * status locks, and opponent hidden information.
 *
 * @param {object} view Deeply frozen detached actorObservation.
 * @param {object} catalog Public card printing and Energy type catalog.
 * @returns {{kind:'paid-retreat',benchIndex:number,printing:string,
 *   attackName:string,baseDamage:number,retreatCostUnits:1}|null}
 */
function choosePaidRetreatToDamagingBench(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,active=own?.active;
  if(!active||view.globalTurn===1)return null;
  const resources=view.ownTurnResources;
  if(!Number.isSafeInteger(resources?.retreatedTurn)||
      resources.retreatedTurn===view.globalTurn)return null;
  if(own.publicTurnRestrictions?.attackLockTurnsRemaining>0)return null;
  if(!Array.isArray(active.printed?.retreatCost)||
      active.printed.retreatCost.length!==1)return null;
  if(active.publicRestrictions?.cannotRetreatNextTurn===true||
     active.publicRestrictions?.cannotRetreatWhileActive===true||
     active.specialConditions?.some(x=>x===catalog.specialConditions.ASLEEP||
       x===catalog.specialConditions.PARALYZED))return null;
  if(active.energies?.length!==1||
      !catalog.basicEnergies.has(active.energies[0]))return null;

  // The relevant failure is repeated zero-damage setup attacks while another
  // already powered Pokémon sits on the Bench. Do not displace a potentially
  // damaging Active attacker without a complete board-value model.
  const activeHasPositiveAttack=active.attacks?.some(attack=>
    attack.gxAttack!==true&&Number.isSafeInteger(attack.damage)&&
    attack.damage>0&&paysWithBasics(active,attack,catalog));
  if(activeHasPositiveAttack)return null;

  const options=[];
  for(let index=0;index<own.bench.length;index++){
    const pokemon=own.bench[index];
    if(!pokemon||pokemon.publicRestrictions?.cannotAttackNextTurn===true||
       pokemon.specialConditions?.some(x=>
         x===catalog.specialConditions.ASLEEP||
         x===catalog.specialConditions.PARALYZED))continue;
    for(const attack of pokemon.attacks??[]){
      if(attack.gxAttack===true||
         !Number.isSafeInteger(attack.damage)||attack.damage<=0||
         !paysWithBasics(pokemon,attack,catalog))continue;
      if(pokemon.publicRestrictions?.blockedAttackNameNextTurn===attack.name||
         pokemon.publicRestrictions?.blockedAttackNameUntilLeavesActive===attack.name||
         pokemon.publicRestrictions?.cannotUseAttacksNextTurn?.includes(attack.name)||
         (pokemon.publicRestrictions?.onlyAllowedAttackNameNextTurn&&
          pokemon.publicRestrictions.onlyAllowedAttackNameNextTurn!==attack.name))continue;
      options.push({kind:'paid-retreat',benchIndex:index,
        printing:pokemon.printing,attackName:attack.name,
        baseDamage:attack.damage,retreatCostUnits:1});
    }
  }
  options.sort((a,b)=>b.baseDamage-a.baseDamage||
    a.benchIndex-b.benchIndex||a.attackName.localeCompare(b.attackName));
  return options[0]??null;
}

module.exports={VERSION,choosePaidRetreatToDamagingBench};
