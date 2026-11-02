'use strict';

const assert=require('node:assert/strict');
const registration=require('../../results/aichi-2026/registrations/agent22-rank7-stateful-steven-20261102.json');

const MODEL=registration.model;
const VERSION=MODEL.id;
const supporterNames=new Set(MODEL.supporterPrintings);

/**
 * Calculate an exact-printing search value from an authenticated actor's
 * detached owner/private and opponent/public observation. The named
 * conditions are intentionally narrow and source-rank-7 specific.
 * Frozen weights are preregistered before outcome data are inspected.
 *
 * @param {string} printing Full native printing name.
 * @param {object} actor Frozen actorObservation, never a raw Store.
 * @returns {number} Hypothetical marginal base value.
 */
function source7PrintingWeight(printing,actor){
  const rule=MODEL.weights[printing];
  if(!rule)return MODEL.defaultWeight;
  const own=actor.ownPublic;
  const opp=actor.opponentPublic;
  const limits=own.publicTurnRestrictions;
  const benchOpen=own.bench.filter(Boolean).length<5;
  const itemsAllowed=!limits.itemPlayLocked;
  const stadiumAllowed=!limits.stadiumPlayLocked;
  const specialEnergyAllowed=!limits.energyPlayLocked&&
    !limits.specialEnergyPlayLocked;
  const stadium=[...own.stadium,...opp.stadium];
  switch(printing){
    case 'Capture Energy RCL':
    case 'Jet Energy PAL':
      return benchOpen&&specialEnergyAllowed?rule.ready:rule.blocked;
    case 'Artazon PAL':
      return benchOpen&&stadiumAllowed&&!stadium.includes(printing)?
        rule.ready:rule.blocked;
    case 'Counter Catcher PAR':
      return own.prizeCount>opp.prizeCount&&
        opp.bench.some(Boolean)&&itemsAllowed?rule.ready:rule.blocked;
    case 'VS Seeker PHF':
      return itemsAllowed&&own.discard.some(name=>
        supporterNames.has(name))?rule.ready:rule.blocked;
    case 'Chaotic Swell CEC':
      return !stadiumAllowed?rule.blocked:
        opp.stadium.length>0?rule.ready:rule.alternate;
    case 'Nest Ball SVI':
    case 'Robo Substitute PHF':
    case "Lillie's Poké Doll CEC":
      return benchOpen&&itemsAllowed?rule.ready:rule.blocked;
    case 'Palace Book SMP':
      return itemsAllowed?rule.ready:rule.blocked;
    default:
      return MODEL.defaultWeight;
  }
}

/**
 * A complete, deterministic bundle score with physical-printing multiplicity
 * diminishing against cards already in the owner's hand and earlier cards
 * in the same proposed bundle. Not a trained win-value model.
 *
 * @param {readonly string[]} printings Exact names provided by native prompt.
 * @param {object} actor Frozen actor-only observation.
 * @returns {number} Hypothetical source7 score.
 */
function statefulStevenBundleScore(printings,actor){
  assert.ok(Array.isArray(printings));
  assert.ok(Array.isArray(actor?.ownHand));
  assert.ok(actor?.ownPublic?.bench&&actor?.opponentPublic?.bench);
  const counts=new Map();
  for(const name of actor.ownHand){
    counts.set(name,(counts.get(name)??0)+1);
  }
  let score=0;
  for(const name of printings){
    const already=counts.get(name)??0;
    score+=source7PrintingWeight(name,actor)/(1+already)-
      MODEL.perCardCost;
    counts.set(name,already+1);
  }
  return score;
}

module.exports={VERSION,MODEL,source7PrintingWeight,
  statefulStevenBundleScore};
