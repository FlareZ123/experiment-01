'use strict';

const assert=require('node:assert/strict');

// Pinned Twinleaf a9905a76: SpecialCondition.PARALYZED=0, ASLEEP=2.
// Keep these explicit to avoid granting a plain observation-only policy
// access to native Store State or exposed concealed deck/Prize card objects.
const PARALYZED=0;
const ASLEEP=2;

/**
 * Report only reasons that definitely prevent announcing the named attack
 * under the supplied public actor observation. An empty array is UNKNOWN
 * legality, never an affirmative permission or prediction of success.
 * Copied attacks need not appear among printed attacks.
 *
 * @param {object} observation Deeply detached actorObservation output.
 * @param {string} attackName Name actually announced to the native Store.
 * @returns {string[]} Observable hard blockers.
 */
function certainAttackBlockers(observation,attackName){
  assert.equal(typeof attackName,'string');
  const publicOwner=observation.ownPublic;
  const active=publicOwner.active;
  if(!active)return ['no-active-pokemon'];
  const reasons=[];
  if(active.specialConditions.includes(ASLEEP))reasons.push('asleep');
  if(active.specialConditions.includes(PARALYZED))reasons.push('paralyzed');
  if(publicOwner.publicTurnRestrictions.attackLockTurnsRemaining>0)
    reasons.push('player-attack-lock');
  const restrictions=active.publicRestrictions;
  if(restrictions.cannotAttackNextTurn)reasons.push('pokemon-attack-lock');
  if(restrictions.cannotUseAttacksNextTurn.includes(attackName))
    reasons.push('named-attack-lock');
  if(restrictions.blockedAttackNameNextTurn===attackName)
    reasons.push('blocked-next-turn-attack');
  if(restrictions.blockedAttackNameUntilLeavesActive===attackName)
    reasons.push('blocked-until-leaves-active');
  if(restrictions.onlyAllowedAttackNameNextTurn!==null &&
      restrictions.onlyAllowedAttackNameNextTurn!==attackName)
    reasons.push('only-other-attack-allowed');
  return reasons;
}

/**
 * Report definitive retreat prohibitions visible in the actor-only view.
 * Energy sufficiency, once-per-turn retreat usage and card modifiers still
 * require real Store legality tests. A zero-length result is UNKNOWN.
 * @param {object} observation Detached actor observation.
 * @returns {string[]} Observable hard blockers.
 */
function certainRetreatBlockers(observation){
  const owner=observation.ownPublic,active=owner.active;
  if(!active)return ['no-active-pokemon'];
  const reasons=[];
  if(active.specialConditions.includes(ASLEEP))reasons.push('asleep');
  if(active.specialConditions.includes(PARALYZED))reasons.push('paralyzed');
  if(active.publicRestrictions.cannotRetreatNextTurn)
    reasons.push('next-turn-retreat-lock');
  if(active.publicRestrictions.cannotRetreatWhileActive)
    reasons.push('while-active-retreat-lock');
  if(!owner.bench.some(Boolean))reasons.push('no-benched-pokemon');
  return reasons;
}

module.exports={certainAttackBlockers,certainRetreatBlockers};
