'use strict';
/**
 * New Moon v3: research-only actor-visible Cursed Blast -> optional Ace Trainer
 * -> Night Watch / Miraculous Duo-GX finishing opportunity detector.
 *
 * NO engine import, native action or policy integration. A 'candidate' finding
 * requires revalidating after every subsequent native state transition.
 * The caller certifies public legality and effects; hidden zones are never read.
 */
const DUSKNOIR_ID = 'sv6pt5-20';
const ATTACKS = Object.freeze([
  {name: 'Night Watch', isGX: false},
  {name: 'Miraculous Duo-GX', isGX: true}
]);
function integer(n) { return Number.isSafeInteger(n) && n >= 0; }
function nBool(n) { return n === true || n === false; }
function invalid(reason) { return {status: 'unsupported', reason}; }
function blocked(reason, facts={}) { return {status: 'blocked', reason, ...facts}; }
function offeredAttack(row) {
  return row && typeof row === 'object' &&
    ATTACKS.some(x => x.name === row.name) &&
    nBool(row.legal) && integer(row.projectedDamage) &&
    nBool(row.hasCorrectSource) && nBool(row.gxAllowed);
}
function analyzeDusknoirFinisher(view) {
  if (!view || typeof view !== 'object' || !view.own || !view.opponent || !view.combat) {
    return invalid('MISSING_ACTOR_VIEW');
  }
  const {own, opponent, combat} = view;
  if (![own.prizesRemaining, opponent.prizesRemaining, opponent.active?.hp,
        opponent.active?.damage, opponent.active?.prizeValue].every(integer) ||
      !Array.isArray(own.bench) || !Array.isArray(combat.attackOffers) ||
      !nBool(own.supporterUsed) || !nBool(own.supporterLocked) ||
      !nBool(own.aceTrainerInHand) || !nBool(own.gxAttackUsed) ||
      !nBool(combat.abilityCanActivate) || !nBool(combat.abilityWillPlaceCounters) ||
      !nBool(combat.reactiveEffectsAccountedFor) ||
      !combat.attackOffers.every(offeredAttack)) {
    return invalid('UNVERIFIED_ACTOR_VISIBLE_FIELDS');
  }
  if (opponent.active.hp <= 0 || opponent.active.damage >= opponent.active.hp ||
      opponent.active.prizeValue < 1 || opponent.active.prizeValue > 3 ||
      own.prizesRemaining < 1 || own.prizesRemaining > 6 ||
      opponent.prizesRemaining < 1 || opponent.prizesRemaining > 6) {
    return invalid('INVALID_LIVE_PRIZE_OR_HP_STATE');
  }
  if (!combat.reactiveEffectsAccountedFor) return blocked('UNMODELED_REACTIVE_EFFECT');
  if (opponent.prizesRemaining <= 1) return blocked('SELF_KO_CONCEDES_FINAL_PRIZE');
  const dusk = own.bench.find(x => x && x.printId === DUSKNOIR_ID && x.abilityReady === true);
  if (!dusk) return blocked('NO_READY_BENCHED_DUSKNOIR');
  if (!combat.abilityCanActivate) return blocked('ABILITY_UNAVAILABLE_OR_LOCKED');
  if (!combat.abilityWillPlaceCounters) return blocked('ABILITY_COUNTERS_PREVENTED');
  const rem = opponent.active.hp - opponent.active.damage;
  if (rem <= 130) return blocked('ABILITY_ALONE_CAN_KO_TARGET');
  const legalOffers = combat.attackOffers.filter(x => x.legal && x.hasCorrectSource && x.gxAllowed &&
    (x.name !== 'Miraculous Duo-GX' || !own.gxAttackUsed));
  if (!legalOffers.length) return blocked('NO_CERTIFIED_PAID_ATTACK');
  if (legalOffers.some(x => x.projectedDamage >= rem)) return blocked('ATTACK_ALONE_ALREADY_KOS');
  const finishers = legalOffers.filter(x => x.projectedDamage + 130 >= rem);
  if (!finishers.length) return blocked('BLAST_PLUS_ATTACK_NOT_LETHAL');
  finishers.sort((a,b) => (a.name === 'Night Watch' ? -1 : 1) -
    (b.name === 'Night Watch' ? -1 : 1));
  const attack = finishers[0];
  const opponentPrizesAfterSelfKO = opponent.prizesRemaining - 1;
  const aceTrainerCanFollow = own.aceTrainerInHand && !own.supporterUsed &&
    !own.supporterLocked && own.prizesRemaining > opponentPrizesAfterSelfKO;
  return {
    status: 'candidate',
    reason: 'ONE_TURN_130_PLUS_ATTACK_KO',
    firstAction: {kind:'use-ability', printing:DUSKNOIR_ID, ability:'Cursed Blast',
      target:'opponent-active'},
    continuationRevalidateAfterEveryAction: true,
    conditionalContinuation: [
      ...(aceTrainerCanFollow ? [{kind:'play-supporter',name:'Ace Trainer'}] : []),
      {kind:'attack', name:attack.name, source:attack.source ?? null}
    ],
    projected: {
      targetRemainingHp: rem, blastCounters:13, blastAmount:130,
      attackDamage:attack.projectedDamage,
      targetPrizeValue:opponent.active.prizeValue,
      opponentPrizesAfterSelfKO,
      ownPrizesAfterAttack:Math.max(0,own.prizesRemaining-opponent.active.prizeValue),
      aceTrainerCanFollow,
      conditionalHandAfterAceAndNightWatchIfThreeDrawn:
        aceTrainerCanFollow && attack.name === 'Night Watch' ? 1 : null
    },
    limitations: [
      'Only a first-action hypothesis; recheck native legality after every transition.',
      'No hidden Prize/deck/hand composition, resource acquisition, opponent reply or win rate is modeled.'
    ]
  };
}
module.exports = {analyzeDusknoirFinisher,DUSKNOIR_ID};
