'use strict';
const assert=require('node:assert/strict');
const {publicSpecialAttackPayable}=require('./agent17-public-context-special-energy.cjs');
const {projectedPrintedDamage}=require('./agent6-actor-paid-retreat-frontier.cjs');
const VERSION='agent42-owner-visible-two-basic-psychic-retreat-terminal-v2.4-opponent-active-tool-jammer-guard';
const SOURCE='Shadow Rider Calyrex VMAX CRE';
const PSY='Psychic Energy ';

function twoPsychicPayment(active,catalog){
  if(!Array.isArray(active?.energies)||active.energies.length<2||
     !(catalog.basicEnergies instanceof Set))return null;
  if(!active.energies.every(p=>catalog.basicEnergies.has(p)&&p.startsWith(PSY)))
    return null;
  // A two-unit retreat may discard any two attached basic Psychic Energy.
  // Surplus Energy remains attached; Max Geist's post-retreat projection
  // subtracts exactly these two indices from the board's Psychic total.
  const indices=[0,1];
  return {indices,printings:indices.map(index=>active.energies[index])};
}

function attackBlocked(pokemon,attack,playerRestrictions){
  const r=pokemon?.publicRestrictions;
  if(!r||typeof r.cannotAttackNextTurn!=='boolean'||
     !Array.isArray(r.cannotUseAttacksNextTurn)||
     !(r.blockedAttackNameNextTurn===null||
       typeof r.blockedAttackNameNextTurn==='string')||
     !(r.blockedAttackNameUntilLeavesActive===null||
       typeof r.blockedAttackNameUntilLeavesActive==='string')||
     !(r.onlyAllowedAttackNameNextTurn===null||
       typeof r.onlyAllowedAttackNameNextTurn==='string')||
     !Number.isSafeInteger(r.attackCostIncreaseNextTurn)||
     !Number.isSafeInteger(r.attackCostIncreaseWhileActive)||
     !playerRestrictions||
     !Number.isSafeInteger(playerRestrictions.attackMaxEnergyTurnsRemaining)||
     playerRestrictions.attackMaxEnergyTurnsRemaining<0||
     !(playerRestrictions.attackMaxEnergy===null||
       Number.isSafeInteger(playerRestrictions.attackMaxEnergy)))return null;
  // Printed-cost projection does not model live cost increases or the
  // player-wide attack-energy ceiling. Abstain rather than certify an
  // attack that may become illegal when the Benched Pokémon is promoted.
  if(r.attackCostIncreaseNextTurn!==0||
     r.attackCostIncreaseWhileActive!==0||
     playerRestrictions.attackMaxEnergyTurnsRemaining>0)return null;
  return r.cannotAttackNextTurn===true||
    r.blockedAttackNameNextTurn===attack.name||
    r.blockedAttackNameUntilLeavesActive===attack.name||
    r.cannotUseAttacksNextTurn.includes(attack.name)||
    Boolean(r.onlyAllowedAttackNameNextTurn&&
      r.onlyAllowedAttackNameNextTurn!==attack.name);
}

function activeHasCompetingAttack(view,catalog,active){
  if(!Array.isArray(active.attacks)||!Array.isArray(active.specialConditions)||
     catalog.specialConditions?.CONFUSED===undefined)return null;
  const confused=active.specialConditions.includes(
    catalog.specialConditions.CONFUSED);
  const usage=view.ownPublic?.publicTurnRestrictions;
  for(const attack of active.attacks){
    if(!attack||typeof attack.name!=='string'||!Array.isArray(attack.cost))
      return null;
    const blocked=attackBlocked(active,attack,view.ownPublic?.publicTurnRestrictions);
    if(blocked===null)return null;
    if(blocked)continue;
    if(attack.gxAttack===true){
      if(typeof usage?.gxUsed!=='boolean'||
         typeof usage?.cannotUseGXAttacks!=='boolean')return null;
      if(usage.gxUsed||usage.cannotUseGXAttacks)continue;
    }
    if(publicSpecialAttackPayable(view,catalog,active,attack))
      return confused?null:true;
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

function opponentActiveToolJammerDisablesHood(view){
  const tools=view?.opponentPublic?.active?.tools;
  if(!Array.isArray(tools)||!tools.every(tool=>typeof tool==='string'))return null;
  return tools.some(tool=>tool.startsWith('Tool Jammer '));
}

function opponentHasUnmodeledDamageOrPrizeText(view){
  const opponent=view.opponentPublic;
  if(!opponent?.active||!Array.isArray(opponent.bench))return true;
  for(const pokemon of [opponent.active,...opponent.bench].filter(Boolean)){
    if(!Array.isArray(pokemon.abilityDetails)||!Array.isArray(pokemon.tools)||
       pokemon.tools.some(p=>!p.startsWith('Tool Jammer ')))return true;
    for(const ability of pokemon.abilityDetails){
      if(!ability||typeof ability.text!=='string')return true;
      const text=ability.text.toLowerCase();
      if(text.includes('damage')||
         text.toLowerCase().includes('prize'))return true;
    }
  }
  return false;
}

function ownerHasUnmodeledFreeMobility(view){
  if(!Array.isArray(view.ownHand))return true;
  const patterns=/^(?:Switch|Switch Cart|Escape Rope|Guzma|Bird Keeper|Tate & Liza|AZ|Acerola|Super Scoop Up|Scoop Up Net|Air Balloon|Escape Board|U-Turn Board) /;
  return view.ownHand.some(card=>typeof card!=='string'||patterns.test(card));
}

function retreatAbilityGuard(view,catalog,active){
  const own=view.ownPublic,opponent=view.opponentPublic;
  if(!own||!Array.isArray(own.bench)||!opponent||
     !opponent.active||!Array.isArray(opponent.bench))return 'unknown';
  const ownBoard=[own.active,...own.bench].filter(Boolean);
  const opposingBoard=[opponent.active,...opponent.bench].filter(Boolean);
  for(const pokemon of ownBoard){
    if(!Array.isArray(pokemon.abilityDetails))return 'unknown';
    for(const ability of pokemon.abilityDetails){
      const name=ability?.name??'',text=ability?.text??'';
      if(name==='Skyliner'){
        if(active.printed?.stage===catalog.stages?.BASIC)return 'free';
        if(active.printed?.stage===undefined||catalog.stages?.BASIC===undefined)
          return 'unknown';
        continue;
      }
      const lower=text.toLowerCase();
      if(name==='Block'&&lower.includes("opponent's active")&&
         lower.includes("can't retreat"))continue;
      if(lower.includes('retreat'))return 'unknown';
    }
  }
  for(const pokemon of opposingBoard){
    if(!Array.isArray(pokemon.abilityDetails))return 'unknown';
    for(const ability of pokemon.abilityDetails){
      const name=ability?.name??'',text=ability?.text??'';
      if(name==='Skyliner')continue;
      const lower=text.toLowerCase();
      if(name==='Block'&&lower.includes("opponent's active")&&
         lower.includes("can't retreat")){
        if(pokemon===opponent.active)return 'blocked';
        continue;
      }
      if(lower.includes('retreat'))return 'unknown';
    }
  }
  return 'printed';
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
  if(catalog.specialConditions?.CONFUSED===undefined)return null;
  if(ownerHasUnmodeledFreeMobility(view))return null;
  // Tool Jammer on the opponent's Active disables Stealthy Hood on ours.
  if(opponentActiveToolJammerDisablesHood(view)!==false)return null;
  if(active&&retreatAbilityGuard(view,catalog,active)!=='printed')return null;
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
         x===catalog.specialConditions?.PARALYZED||
         x===catalog.specialConditions.CONFUSED))continue;
    for(const attack of pokemon.attacks){
      if(!attack||typeof attack.name!=='string'||!Array.isArray(attack.cost))
        return null;
      const blocked=attackBlocked(pokemon,attack,own.publicTurnRestrictions);
      if(blocked===null)return null;
      if(attack.gxAttack===true||blocked||
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
  activeHasCompetingAttack,ownerHasUnmodeledFreeMobility,postRetreatPrintedDamage,
  opponentHasUnmodeledDamageOrPrizeText,opponentActiveToolJammerDisablesHood,projectedPrizeOutcome,
  proposeTwoUnitPaidRetreatV2};
