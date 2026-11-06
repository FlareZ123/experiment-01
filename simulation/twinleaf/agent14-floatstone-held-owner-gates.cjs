'use strict';

const {publicSpecialAttackPayable}=
  require('./agent17-public-context-special-energy.cjs');
const {projectedFundedAttackDamage}=
  require('./agent14-generic-funded-floatstone-frontier.cjs');
const {MIN_PROJECTED_DAMAGE}=
  require('./agent6-actor-paid-retreat-frontier.cjs');
const {counterKnockoutPrerequisite}=
  require('./agent14-public-counter-knockout-potential.cjs');

const VERSION='agent14-held-floatstone-independent-readonly-gates-v1';
const FIELDS=Object.freeze([
  'postFirstTurn','benchOccupied','activeHasEnergy',
  'activePositivePrintedRetreat','activeToolSlotEmpty',
  'unusedRetreat','toolPlayUnlocked','publicToolUnsuppressed',
  'benchHasEnergy','benchHasPayableAttack',
  'benchHasPayable80DamageAttack','benchHasKnownCounterAttack',
  'benchHasSatisfiedCounterCondition','allCoarseStructuralGates'
]);

/**
 * Independent owner-visible gate census for a HELD Float Stone. Individual
 * flags can overlap. Bench payoff checks remain nominal approximations,
 * so none of these flags certifies paper-legal or strategically best play.
 * The actual helper's return is the only measured final eligibility test.
 *
 * @param {object} view Detached, current acting owner's root observation.
 * @param {object} catalog Public printed card metadata.
 * @returns {object} Fixed-shape boolean gate record, no native actions.
 */
function heldFloatGateFlags(view,catalog){
  const own=view.ownPublic??{}, active=own.active??null;
  const bench=Array.isArray(own.bench)?own.bench.filter(Boolean):[];
  const resources=view.ownTurnResources??{};
  const held=Array.isArray(view.ownHand)&&
    view.ownHand.includes('Float Stone BKT');
  const stadiums=[...(own.stadium??[]),
    ...(view.opponentPublic?.stadium??[])];
  const postFirstTurn=Number.isSafeInteger(view.globalTurn)&&
    view.globalTurn>1;
  const benchOccupied=bench.length>0;
  const activeHasEnergy=Array.isArray(active?.energies)&&
    active.energies.length>0;
  const activePositivePrintedRetreat=
    Array.isArray(active?.printed?.retreatCost)&&
    active.printed.retreatCost.length>0;
  const activeToolSlotEmpty=
    Array.isArray(active?.tools)&&active.tools.length===0;
  const unusedRetreat=Number.isSafeInteger(resources.retreatedTurn)&&
    resources.retreatedTurn!==view.globalTurn;
  const toolPlayUnlocked=resources.toolPlayLocked!==true&&
    own.publicTurnRestrictions?.toolPlayLocked!==true;
  const publicToolUnsuppressed=
    !stadiums.some(x=>x.startsWith('Jamming Tower '))&&
    !view.opponentPublic?.active?.tools?.some(
      x=>x.startsWith('Tool Jammer '));
  const benchHasEnergy=bench.some(p=>
    Array.isArray(p.energies)&&p.energies.length>0);
  let benchHasPayableAttack=false;
  let benchHasPayable80DamageAttack=false;
  let benchHasKnownCounterAttack=false;
  let benchHasSatisfiedCounterCondition=false;
  const benchPayableTargets=[];
  if(held){
    for(const pokemon of bench){
      for(const attack of pokemon.attacks??[]){
        if(attack.gxAttack===true||
            !publicSpecialAttackPayable(view,catalog,pokemon,attack))
          continue;
        benchHasPayableAttack=true;
        const projected=projectedFundedAttackDamage(
          view,pokemon,attack,catalog);
        const condition=counterKnockoutPrerequisite(view,attack);
        if(condition.recognized)benchHasKnownCounterAttack=true;
        if(condition.satisfied)benchHasSatisfiedCounterCondition=true;
        benchPayableTargets.push({printing:pokemon.printing,
          attack:attack.name,nominalDamage:Number.isSafeInteger(projected)?
            projected:null,condition});
        if(Number.isSafeInteger(projected)&&
            projected>=MIN_PROJECTED_DAMAGE)
          benchHasPayable80DamageAttack=true;
      }
    }
  }
  const allCoarseStructuralGates=postFirstTurn&&benchOccupied&&
    activeHasEnergy&&activePositivePrintedRetreat&&
    activeToolSlotEmpty&&unusedRetreat&&toolPlayUnlocked&&
    publicToolUnsuppressed&&benchHasPayable80DamageAttack;
  return {held,postFirstTurn,benchOccupied,activeHasEnergy,
    activePositivePrintedRetreat,activeToolSlotEmpty,unusedRetreat,
    toolPlayUnlocked,publicToolUnsuppressed,benchHasEnergy,
    benchHasPayableAttack,benchHasPayable80DamageAttack,
    benchHasKnownCounterAttack,benchHasSatisfiedCounterCondition,
    allCoarseStructuralGates,benchPayableTargets};
}

module.exports={VERSION,FIELDS,heldFloatGateFlags};
