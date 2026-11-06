'use strict';
const assert=require('node:assert/strict');
const {publicSpecialAttackPayable}=require('./agent17-public-context-special-energy.cjs');
const {projectedPrintedDamage}=require('./agent6-actor-paid-retreat-frontier.cjs');
const VERSION='agent42-owner-visible-two-basic-psychic-retreat-terminal-v2';
const SOURCE='Shadow Rider Calyrex VMAX CRE';
const PSY='Psychic Energy ';

function twoPsychicPayment(active,catalog){
  if(!Array.isArray(active?.energies)||active.energies.length!==2||
     !(catalog.basicEnergies instanceof Set))return null;
  if(!active.energies.every(p=>catalog.basicEnergies.has(p)&&p.startsWith(PSY)))
    return null;
  return {indices:[0,1],printings:[...active.energies]};
}

function attackBlocked(pokemon,attack){
  const r=pokemon?.publicRestrictions;
  if(!r||!Array.isArray(r.cannotUseAttacksNextTurn))return true;
  return r.cannotAttackNextTurn===true||
    r.blockedAttackNameNextTurn===attack.name||
    r.blockedAttackNameUntilLeavesActive===attack.name||
    r.cannotUseAttacksNextTurn.includes(attack.name)||
    Boolean(r.onlyAllowedAttackNameNextTurn&&
      r.onlyAllowedAttackNameNextTurn!==attack.name);
}

function activeHasCompetingAttack(view,catalog,active){
  if(!Array.isArray(active.attacks))return null;
  const usage=view.ownPublic?.publicTurnRestrictions;
  for(const attack of active.attacks){
    if(!attack||typeof attack.name!=='string'||!Array.isArray(attack.cost))
      return null;
    if(attackBlocked(active,attack))continue;
    if(attack.gxAttack===true){
      if(typeof usage?.gxUsed!=='boolean'||
         typeof usage?.cannotUseGXAttacks!=='boolean')return null;
      if(usage.gxUsed||usage.cannotUseGXAttacks)continue;
    }
    if(publicSpecialAttackPayable(view,catalog,active,attack))return true;
  }
  return false;
}

function postRetreatPrintedDamage(view,pokemon,attack,payment,catalog){
  if(pokemon.printing===SOURCE&&attack.name==='Max Geist'){
    const active=view.ownPublic?.active;
    const board=[active,...(view.ownPublic?.bench??[])].filter(Boolean);
    if(!active||!board.every(p=>Array.isArray(p.energies)))return null;
    if(!board.every(p=>p.energies.every(e=>catalog.basicEnergies?.has(e))))
      return null;
    let psychic=0;
    for(const member of board)
      for(const energy of member.energies)
        if(energy.startsWith(PSY))psychic++;
    for(const index of payment.indices){
      if(!Number.isSafeInteger(index)||index<0||
         index>=active.energies.length)return null;
      if(active.energies[index].startsWith(PSY))psychic--;
    }
    return psychic>=0?10+30*psychic:null;
  }
  if(attack.damageCalculation!==null&&
     attack.damageCalculation!==undefined)return null;
  return projectedPrintedDamage(view,pokemon,attack);
}

function opponentHasUnmodeledDamageOrPrizeText(view){
  const opponent=view.opponentPublic;
  if(!opponent?.active||!Array.isArray(opponent.bench))return true;
  for(const pokemon of [opponent.active,...opponent.bench].filter(Boolean)){
    if(!Array.isArray(pokemon.abilityDetails))return true;
    for(const ability of pokemon.abilityDetails){
      if(ability?.text!==null&&ability?.text!==undefined&&
         typeof ability.text!=='string')return true;
      const text=ability?.text??'';
      if(text.toLowerCase().includes('damage')||
         text.toLowerCase().includes('prize'))return true;
    }
  }
  return false;
}

function projectedPrizeOutcome(view,catalog,damage){
  const own=view.ownPublic,defender=view.opponentPublic?.active;
  if(!defender||!Number.isSafeInteger(defender.hp)||
     !Number.isSafeInteger(defender.damage)||
     !Array.isArray(defender.printed?.resistance)||
     defender.printed.resistance.length!==0||
     !(catalog.ruleboxPokemonPrintings instanceof Set)||
     catalog.ruleboxPokemonPrintings.has(defender.printing)||
     !Number.isSafeInteger(own?.prizeCount)||own.prizeCount<1||
     opponentHasUnmodeledDamageOrPrizeText(view))return null;
  const remainingHp=defender.hp-defender.damage;
  if(!Number.isSafeInteger(remainingHp)||remainingHp<=0||
     damage<remainingHp)return null;
  return {opponentActiveRemainingHp:remainingHp,
    projectedPrizeCount:1,projectedTerminalWin:own.prizeCount===1};
}

function proposeTwoUnitPaidRetreatV2(view,catalog){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,active=own?.active;
  const resources=view.ownTurnResources,opponent=view.opponentPublic;
  if(!active||!opponent?.active||!Array.isArray(own?.bench)||
     !Array.isArray(own.stadium)||!Array.isArray(opponent.stadium)||
     view.globalTurn<=1||
     !Number.isSafeInteger(resources?.retreatedTurn)||
     resources.retreatedTurn===view.globalTurn||
     own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
     own.stadium.length!==0||opponent.stadium.length!==0||
     !Array.isArray(active.tools)||active.tools.length!==0||
     !Array.isArray(active.printed?.retreatCost)||
     active.printed.retreatCost.length!==2||
     active.printed.retreatCost.some(x=>x!==catalog.colorlessEnergyType)||
     active.publicRestrictions?.cannotRetreatNextTurn===true||
     active.publicRestrictions?.cannotRetreatWhileActive===true||
     !Array.isArray(active.specialConditions)||
     active.specialConditions.some(x=>
       x===catalog.specialConditions?.ASLEEP||
       x===catalog.specialConditions?.PARALYZED))return null;
  const payment=twoPsychicPayment(active,catalog);
  if(!payment||activeHasCompetingAttack(view,catalog,active)!==false)
    return null;
  const options=[];
  for(let benchIndex=0;benchIndex<own.bench.length;benchIndex++){
    const pokemon=own.bench[benchIndex];
    if(!pokemon)continue;
    if(!Array.isArray(pokemon.attacks))return null;
    if(pokemon.publicRestrictions?.cannotAttackNextTurn===true||
       !Array.isArray(pokemon.specialConditions)||
       pokemon.specialConditions.some(x=>
         x===catalog.specialConditions?.ASLEEP||
         x===catalog.specialConditions?.PARALYZED))continue;
    for(const attack of pokemon.attacks){
      if(!attack||typeof attack.name!=='string'||!Array.isArray(attack.cost))
        return null;
      if(attack.gxAttack===true||attackBlocked(pokemon,attack)||
         !publicSpecialAttackPayable(view,catalog,pokemon,attack))continue;
      const damage=postRetreatPrintedDamage(view,pokemon,attack,payment,catalog);
      if(!Number.isSafeInteger(damage)||damage<=0)continue;
      const prize=projectedPrizeOutcome(view,catalog,damage);
      if(!prize)continue;
      options.push({kind:'two-unit-paid-retreat-proposal-v2',
        benchIndex,printing:pokemon.printing,attackName:attack.name,
        retreatCostUnits:2,discardEnergyIndices:payment.indices,
        discardEnergyPrintings:payment.printings,
        projectedPrintedDamage:damage,...prize,
        paymentClass:'two-distinct-basic-psychic',planningVersion:VERSION,
        ownerVisibleOnly:true,nativeStorePaymentVerified:false,
        subsequentAttackVerified:false,nativeTerminalVerified:false,
        competitiveGameQualified:false});
    }
  }
  options.sort((a,b)=>
    Number(b.projectedTerminalWin)-Number(a.projectedTerminalWin)||
    b.projectedPrintedDamage-a.projectedPrintedDamage||
    a.benchIndex-b.benchIndex||a.attackName.localeCompare(b.attackName));
  return options[0]??null;
}

module.exports={VERSION,twoPsychicPayment,attackBlocked,
  activeHasCompetingAttack,postRetreatPrintedDamage,
  opponentHasUnmodeledDamageOrPrizeText,projectedPrizeOutcome,
  proposeTwoUnitPaidRetreatV2};
