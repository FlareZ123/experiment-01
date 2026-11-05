'use strict';
const assert=require('node:assert/strict');
const {paysWithBasics}=require('./agent7-actor-free-retreat-frontier.cjs');

const VERSION='agent2-bilateral-owner-skyliner-funded-positive-bench-v2-block-guard';

/**
 * Public opponent Active restrictions can prohibit Retreat even with a
 * zero Energy fee. The printed Snorlax Block witness is authoritative for
 * this original source; other matching face-up Ability text is conservative.
 * @param {object} view Owner-only board observation.
 * @returns {boolean}
 */
function opponentActiveBlocksRetreat(view){
  const active=view?.opponentPublic?.active;
  if(!active)return false;
  if(active.printing==='Snorlax PGO'&&
    active.abilities?.includes('Block'))return true;
  return (active.abilityDetails??[]).some(ability=>{
    if(typeof ability?.text!=='string')return false;
    const text=ability.text.replace(/[\u2018\u2019]/g,"'").toLowerCase();
    return text.includes("your opponent's active pokémon can't retreat")||
      text.includes("your opponent's active pokemon can't retreat");
  });
}

/**
 * Propose a public-information Skyliner free Retreat to a paid printed
 * positive attack; actual native cost and legality are separate checks.
 * @param {object} view Detached owner-only authentic root observation.
 * @param {object} catalog Public native printing and rule metadata.
 * @returns {object|null} Native-neutral possible free-retreat proposal.
 */
function chooseOwnerSkylinerFundedBenchRetreat(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,active=own?.active;
  const resources=view.ownTurnResources;
  if(!active||!view.opponentPublic?.active||
     opponentActiveBlocksRetreat(view)||view.globalTurn<=1||
     !resources||!Number.isSafeInteger(resources.retreatedTurn)||
     resources.retreatedTurn===view.globalTurn||
     own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
     active.printed?.stage!==catalog.stages?.BASIC||
     !Array.isArray(own.bench)||
     !own.bench.some(x=>x?.abilities?.includes('Skyliner'))||
     active.publicRestrictions?.cannotRetreatNextTurn===true||
     active.publicRestrictions?.cannotRetreatWhileActive===true||
     active.specialConditions?.some(s=>s===catalog.specialConditions?.ASLEEP||
       s===catalog.specialConditions?.PARALYZED))
    return null;
  // A funded positive Active printed attack is a competing line requiring
  // strategic evaluation rather than a safe forced positional intervention.
  if((active.attacks??[]).some(attack=>
    attack.gxAttack!==true&&Number.isSafeInteger(attack.damage)&&
    attack.damage>0&&Array.isArray(active.energies)&&
    paysWithBasics(active,attack,catalog)))return null;
  const choices=[];
  for(const [benchIndex,pokemon] of own.bench.entries()){
    if(!pokemon||!Array.isArray(pokemon.energies)||
       pokemon.publicRestrictions?.cannotAttackNextTurn===true||
       pokemon.specialConditions?.some(s=>
         s===catalog.specialConditions?.ASLEEP||
         s===catalog.specialConditions?.PARALYZED))continue;
    for(const attack of pokemon.attacks??[]){
      if(attack.gxAttack===true||
         !Number.isSafeInteger(attack.damage)||attack.damage<=0||
         attack.damageCalculation!==null&&
           attack.damageCalculation!==undefined||
         pokemon.publicRestrictions?.blockedAttackNameNextTurn===attack.name||
         pokemon.publicRestrictions?.blockedAttackNameUntilLeavesActive===
           attack.name||
         pokemon.publicRestrictions?.cannotUseAttacksNextTurn?.includes(
           attack.name)||
         pokemon.publicRestrictions?.onlyAllowedAttackNameNextTurn&&
           pokemon.publicRestrictions.onlyAllowedAttackNameNextTurn!==
             attack.name||
         !paysWithBasics(pokemon,attack,catalog))continue;
      choices.push({
        kind:'skyliner-free-retreat',
        benchIndex,pokemon: pokemon.printing,
        attackName:attack.name,baseDamage:attack.damage,
        calculatedNativeRetreatCost:null,
        status:'owner-only-proposal-not-Store-accepted'
      });
    }
  }
  choices.sort((a,b)=>
    b.baseDamage-a.baseDamage||
    a.benchIndex-b.benchIndex||
    a.attackName.localeCompare(b.attackName));
  return choices[0]??null;
}
module.exports={VERSION,opponentActiveBlocksRetreat,
  chooseOwnerSkylinerFundedBenchRetreat};
