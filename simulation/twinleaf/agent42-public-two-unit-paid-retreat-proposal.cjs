'use strict';

const assert=require('node:assert/strict');
const {canPaySymbols,energyUnits}=
  require('./actor-energy-payability.cjs');
const {publicEnergyContext,publicSpecialAttackPayable}=
  require('./agent17-public-context-special-energy.cjs');
const {projectedPrintedDamage,MIN_PROJECTED_DAMAGE}=
  require('./agent6-actor-paid-retreat-frontier.cjs');

const VERSION='agent42-owner-visible-two-unit-retreat-proposal-v1';

/**
 * Select the smallest physical-card subset that can pay a known printed,
 * unmodified two-Colorless retreat cost. This is a proposal for the native
 * Store's actual payment prompt, not an accepted payment certificate.
 *
 * @param {string[]} printings Public attached Energy identities.
 * @param {object} context Public recipient stage and Prize information.
 * @returns {{indices:number[],printings:string[]}|null}
 */
function twoUnitPayment(printings,context){
  assert.ok(Array.isArray(printings));
  if(printings.length===0||printings.length>12)return null;
  const perCard=printings.map(printing=>energyUnits(printing,context));
  if(perCard.some(units=>units===null))return null;
  for(let size=1;size<=printings.length;size++){
    /** @param {number[]} indices @param {number} next */
    function find(indices,next){
      if(indices.length===size){
        const units=indices.flatMap(index=>perCard[index]);
        return canPaySymbols(['C','C'],units)?indices:null;
      }
      for(let index=next;index<=printings.length-(size-indices.length);
          index++){
        const result=find([...indices,index],index+1);
        if(result)return result;
      }
      return null;
    }
    const indices=find([],0);
    if(indices)return {indices,printings:indices.map(i=>printings[i])};
  }
  return null;
}

/**
 * Printed base damage only for Shadow Rider VMAX CRE Max Geist with a
 * fully known owner board of Basic Energy. Special Energy is deliberately
 * unsupported until native context-dependent typing is independently checked.
 *
 * @param {object} view Detached public acting-player observation.
 * @param {object} pokemon Public attacker.
 * @param {object} attack Public printed attack.
 * @param {number[]} removedActiveEnergyIndices Physical retreat payment.
 * @param {object} catalog Public Energy printings.
 * @returns {number|null}
 */
function postRetreatPrintedDamage(view,pokemon,attack,
                                 removedActiveEnergyIndices,catalog){
  if(pokemon.printing!=='Shadow Rider Calyrex VMAX CRE'||
     attack.name!=='Max Geist')return projectedPrintedDamage(view,pokemon,attack);
  const active=view.ownPublic?.active;
  const board=[active,...(view.ownPublic?.bench??[])].filter(Boolean);
  if(!board.every(p=>Array.isArray(p.energies)))return null;
  let psychic=0;
  for(const member of board){
    for(const printing of member.energies){
      if(!catalog.basicEnergies?.has(printing))return null;
      if(printing.startsWith('Psychic Energy '))psychic++;
    }
  }
  for(const index of removedActiveEnergyIndices){
    if(!Number.isSafeInteger(index)||index<0||
       index>=(active?.energies?.length??0))return null;
    if(active.energies[index].startsWith('Psychic Energy '))psychic--;
  }
  return psychic>=0?10+30*psychic:null;
}

/**
 * Narrow, optional research proposal for a two-unit printed Retreat to an
 * already funded Benched attacker. Locks, stadiums and tools that might modify
 * costs are excluded. Native payment and subsequent attack must be witnessed
 * before this is a tactical outcome.
 *
 * @param {object} view Frozen owner-only actor observation.
 * @param {object} catalog Public native Energy, Stage and status catalog.
 * @returns {object|null}
 */
function proposeTwoUnitPaidRetreat(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,active=own?.active;
  const resources=view.ownTurnResources;
  if(!active||!view.opponentPublic?.active||view.globalTurn<=1||
     !Number.isSafeInteger(resources?.retreatedTurn)||
     resources.retreatedTurn===view.globalTurn||
     own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
     (own.stadium?.length??0)!==0||
     (view.opponentPublic.stadium?.length??0)!==0||
     (active.tools?.length??0)!==0||
     !Array.isArray(active.printed?.retreatCost)||
     active.printed.retreatCost.length!==2||
     active.printed.retreatCost.some(x=>x!==catalog.colorlessEnergyType)||
     active.publicRestrictions?.cannotRetreatNextTurn===true||
     active.publicRestrictions?.cannotRetreatWhileActive===true||
     active.specialConditions?.some(x=>
       x===catalog.specialConditions?.ASLEEP||
       x===catalog.specialConditions?.PARALYZED))return null;
  if(!Array.isArray(active.energies))return null;
  const context=publicEnergyContext(view,active,catalog);
  const payment=twoUnitPayment(active.energies,context);
  if(!payment)return null;

  // An already usable active attack is a competing plan that this
  // conservative evaluator does not pretend to have compared.
  if((active.attacks??[]).some(attack=>
    attack.gxAttack!==true&&
    publicSpecialAttackPayable(view,catalog,active,attack)))return null;

  const options=[];
  for(let benchIndex=0;benchIndex<(own.bench?.length??0);benchIndex++){
    const pokemon=own.bench[benchIndex];
    if(!pokemon||pokemon.publicRestrictions?.cannotAttackNextTurn===true||
       pokemon.specialConditions?.some(x=>
         x===catalog.specialConditions?.ASLEEP||
         x===catalog.specialConditions?.PARALYZED))continue;
    for(const attack of pokemon.attacks??[]){
      if(attack.gxAttack===true||
         attack.name?.endsWith('-GX')||
         !publicSpecialAttackPayable(view,catalog,pokemon,attack)||
         pokemon.publicRestrictions?.blockedAttackNameNextTurn===attack.name||
         pokemon.publicRestrictions?.blockedAttackNameUntilLeavesActive===attack.name||
         pokemon.publicRestrictions?.cannotUseAttacksNextTurn?.includes(attack.name)||
         (pokemon.publicRestrictions?.onlyAllowedAttackNameNextTurn&&
          pokemon.publicRestrictions.onlyAllowedAttackNameNextTurn!==attack.name))
        continue;
      const projected=postRetreatPrintedDamage(
        view,pokemon,attack,payment.indices,catalog);
      if(projected===null||projected<MIN_PROJECTED_DAMAGE)continue;
      options.push({
        kind:'two-unit-paid-retreat-proposal',
        benchIndex,printing:pokemon.printing,attackName:attack.name,
        retreatCostUnits:2,discardEnergyIndices:payment.indices,
        discardEnergyPrintings:payment.printings,
        projectedPrintedDamage:projected,
        planningVersion:VERSION,ownerVisibleOnly:true,
        nativeStorePaymentVerified:false,
        subsequentAttackVerified:false,
        competitiveGameQualified:false
      });
    }
  }
  options.sort((a,b)=>
    b.projectedPrintedDamage-a.projectedPrintedDamage||
    a.benchIndex-b.benchIndex||
    a.attackName.localeCompare(b.attackName));
  return options[0]??null;
}

module.exports={VERSION,twoUnitPayment,postRetreatPrintedDamage,
  proposeTwoUnitPaidRetreat};