'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent30-public-prize-trainer-necessary-v1';
const PRINT_RULES = Object.freeze({
  'Counter Catcher PAR': Object.freeze({
    id: 'sv4-160', type: 'Item', rule: 'own-prizes-greater'
  }),
  'Roxanne ASR': Object.freeze({
    id: 'swsh10-150', type: 'Supporter', rule: 'opponent-prizes-at-most-3'
  }),
  'Special Red Card CRI': Object.freeze({
    id: 'me4-82', type: 'Item', rule: 'opponent-prizes-at-most-3'
  })
});

/**
 * Independent, owner-visible negative paper eligibility certificate.
 * A satisfied necessary condition NEVER certifies that a Trainer is playable:
 * other printed costs, targets, lock and effect restrictions remain unresolved.
 *
 * @param {object} view Detached owner-root actorObservation, public counts only.
 * @param {{handIndex:number,printing:string,type:string}} row Physical Trainer.
 * @returns {object} An exact-print prerequisite result.
 */
function publicPrizeTrainerPrerequisite(view, row) {
  assert.equal(view?.decisionKind, 'owner-root');
  assert.ok(Array.isArray(view.ownHand));
  assert.ok(Number.isSafeInteger(row?.handIndex) &&
    row.handIndex >= 0 && row.handIndex < view.ownHand.length);
  assert.equal(view.ownHand[row.handIndex], row.printing);
  const own = view.ownPublic?.prizeCount;
  const opponent = view.opponentPublic?.prizeCount;
  assert.ok(Number.isSafeInteger(own) && own >= 0);
  assert.ok(Number.isSafeInteger(opponent) && opponent >= 0);
  const spec = PRINT_RULES[row.printing];
  if (!spec) return {
    version: VERSION, printing: row.printing,
    knownPrintedPrerequisite: false, blocked: false,
    reason: null, paperPlayable: null
  };
  assert.equal(row.type, spec.type, 'Mismatched native Trainer type');
  const eligible = spec.rule === 'own-prizes-greater' ? own > opponent :
    opponent <= 3;
  return {
    version: VERSION, printing: row.printing,
    exactSourceCardId: spec.id, knownPrintedPrerequisite: true,
    observedOwnPrizeCount: own, observedOpponentPrizeCount: opponent,
    printedPrerequisite: spec.rule,
    blocked: !eligible,
    reason: eligible ? null : 'public-prize-prerequisite-failed',
    paperPlayable: eligible ? null : false,
    remainingTargetPaymentAndBenefitUnknown: true
  };
}

/**
 * Retain each genuine physical hand copy at its actual owner's root.
 * Its output may narrow an unqualified native offer count, never increase
 * a paper-certified play count.
 * @param {object} view
 * @param {object[]} rows Existing held Trainer rows.
 */
function screenOwnerTrainerPrizePrerequisites(view, rows) {
  assert.ok(Array.isArray(rows));
  const seen = new Set();
  const examined = rows.map(row => {
    assert.ok(!seen.has(row.handIndex), 'Repeated physical owner hand index');
    seen.add(row.handIndex);
    return { handIndex: row.handIndex, ...publicPrizeTrainerPrerequisite(view, row) };
  });
  return {
    version: VERSION,
    actorSeat: view.actorSeat,
    globalTurn: view.globalTurn,
    heldTrainerCopies: examined.length,
    exactPrintedPrizeRulesSeen: examined.filter(r => r.knownPrintedPrerequisite).length,
    provenPrizeBlockedCopies: examined.filter(r => r.blocked).length,
    remainingNotDisprovenCopies: examined.filter(r => !r.blocked).length,
    anyPaperPlayableTrainerCertified: false,
    opponentConcealedInformationUsed: false,
    competitiveGameQualified: false,
    rows: examined
  };
}

module.exports = {
  VERSION, PRINT_RULES, publicPrizeTrainerPrerequisite,
  screenOwnerTrainerPrizePrerequisites
};
