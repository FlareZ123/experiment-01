'use strict';

const assert=require('node:assert/strict');
const {publicSpecialAttackPayable}=
  require('./agent17-public-context-special-energy.cjs');
const {projectedPrintedDamage,MIN_PROJECTED_DAMAGE}=
  require('./agent6-actor-paid-retreat-frontier.cjs');
const {printedAllPokemonEnergyScaling}=
  require('./agent17-printed-scaling-basic-ko.cjs');

const VERSION='agent14-generic-funded-floatstone-owner-v2-all-own-basic-scaling';
const TOOL='Float Stone BKT';

/**
 * Public *nominal* damage for fixed, Rondo, or safely recognized all-own-
 * Basic-Energy additive attacks. Unknown attached Special Energy causes an
 * explicit nonprojection. This cannot prove final Weakness/lock/KO outcomes.
 *
 * @param {object} view Detached public battlefield.
 * @param {object} pokemon Public attacker.
 * @param {object} attack Public printed attack.
 * @param {object} catalog Public card printing and type metadata.
 * @returns {number|null} Nominal printed attack damage if supported.
 */
function projectedFundedAttackDamage(view,pokemon,attack,catalog){
  const scaling=printedAllPokemonEnergyScaling(attack);
  if(!scaling)return projectedPrintedDamage(view,pokemon,attack);
  if(!(catalog.basicEnergies instanceof Set))return null;
  let count=0;
  const board=[view.ownPublic?.active,...(view.ownPublic?.bench??[])];
  for(const slot of board.filter(Boolean)){
    if(!Array.isArray(slot.energies))return null;
    for(const energy of slot.energies){
      if(!catalog.basicEnergies.has(energy))return null;
      if(energy.startsWith(scaling.energyType+' Energy '))count++;
    }
  }
  const nominal=scaling.baseDamage+scaling.damagePerUnit*count;
  return Number.isSafeInteger(nominal)?nominal:null;
}

/**
 * A typed, source-independent opportunity for a partially charged Active
 * Pokemon that cannot pay a damaging attack but has a fully charged Bench
 * attacker. A held Float Stone can save the Active's valuable attached Energy
 * when ordinary retreat requires discarding it.
 *
 * This is a conservative owner-visible proposal, not a proof of paper
 * legality, tactical optimality or native Store acceptance. Dynamic damage
 * formulas unknown to projectedPrintedDamage remain out of scope.
 *
 * @param {object} view Detached owner-root hand and public battlefield.
 * @param {object} catalog Public printing metadata and Energy type enums.
 * @returns {object|null} Existing native-neutral Tool/Retreat intent.
 */
function chooseGenericFundedFloatStone(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,active=own?.active,r=view.ownTurnResources;
  if(view.globalTurn<=1||!active||!r||
      !Array.isArray(own.bench)||
      !Number.isSafeInteger(r.retreatedTurn)||
      r.retreatedTurn===view.globalTurn||
      own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
      !Array.isArray(active.printed?.retreatCost)||
      active.printed.retreatCost.length===0||
      !Array.isArray(active.energies)||active.energies.length===0)
    return null;
  const restricted=active.publicRestrictions??{};
  if(restricted.cannotRetreatNextTurn===true||
      restricted.cannotRetreatWhileActive===true||
      active.specialConditions?.some(x=>
        x===catalog.specialConditions?.ASLEEP||
        x===catalog.specialConditions?.PARALYZED))return null;

  // Respect a currently payable damaging Active attack, even if the
  // public printed projection does not know its damage multiplier.
  const canAttack=(active.attacks??[]).some(attack=>
    attack.gxAttack!==true&&
    projectedFundedAttackDamage(view,active,attack,catalog)!==0&&
    publicSpecialAttackPayable(view,catalog,active,attack)&&
    restricted.cannotAttackNextTurn!==true&&
    restricted.blockedAttackNameNextTurn!==attack.name&&
    restricted.blockedAttackNameUntilLeavesActive!==attack.name&&
    !restricted.cannotUseAttacksNextTurn?.includes(attack.name)&&
    (!restricted.onlyAllowedAttackNameNextTurn||
      restricted.onlyAllowedAttackNameNextTurn===attack.name));
  if(canAttack)return null;

  const stadiums=[...(own.stadium??[]),
    ...(view.opponentPublic?.stadium??[])];
  if(stadiums.some(x=>x.startsWith('Jamming Tower '))||
      view.opponentPublic?.active?.tools?.some(
        x=>x.startsWith('Tool Jammer ')))return null;

  const options=[];
  for(const [benchIndex,pokemon] of own.bench.entries()){
    if(!pokemon||pokemon.publicRestrictions?.cannotAttackNextTurn===true||
       pokemon.specialConditions?.some(x=>
         x===catalog.specialConditions?.ASLEEP||
         x===catalog.specialConditions?.PARALYZED))continue;
    for(const attack of pokemon.attacks??[]){
      const damage=projectedFundedAttackDamage(view,pokemon,attack,catalog);
      const rules=pokemon.publicRestrictions??{};
      if(attack.gxAttack===true||
         !Number.isSafeInteger(damage)||damage<MIN_PROJECTED_DAMAGE||
         rules.blockedAttackNameNextTurn===attack.name||
         rules.blockedAttackNameUntilLeavesActive===attack.name||
         rules.cannotUseAttacksNextTurn?.includes(attack.name)||
         (rules.onlyAllowedAttackNameNextTurn&&
           rules.onlyAllowedAttackNameNextTurn!==attack.name)||
         !publicSpecialAttackPayable(view,catalog,pokemon,attack))
        continue;
      options.push({benchIndex,printing:pokemon.printing,
        targetAttackName:attack.name,projectedPrintedDamage:damage});
    }
  }
  options.sort((a,b)=>
    b.projectedPrintedDamage-a.projectedPrintedDamage||
    a.benchIndex-b.benchIndex||
    a.targetAttackName.localeCompare(b.targetAttackName));
  const target=options[0];
  if(!target)return null;

  if(active.tools?.includes(TOOL))
    return {...target,kind:'retreat-emergency-floatstone',
      source:VERSION,paperQualified:false};
  if(!Array.isArray(active.tools)||active.tools.length!==0||
      r.toolPlayLocked===true||
      own.publicTurnRestrictions?.toolPlayLocked===true)return null;
  const handIndex=view.ownHand.indexOf(TOOL);
  if(handIndex<0)return null;
  return {...target,kind:'attach-emergency-floatstone',handIndex,
    source:VERSION,paperQualified:false};
}

module.exports={VERSION,TOOL,projectedFundedAttackDamage,
  chooseGenericFundedFloatStone};
