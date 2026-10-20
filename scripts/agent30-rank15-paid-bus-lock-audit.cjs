'use strict';

const assert = require('node:assert/strict');

const SCHEMA = 'rank15-retrospective-owner-bus-promotion-native-fork-v1';

/** @param {{active:string,bench:Array<string|null>}} board */
function dualLockBoard(board) {
  return board.active === 'Vileplume BUS' &&
    board.bench.includes('Vileplume AOR');
}

/**
 * Independently audit native source-owned BUS promotion and its observable
 * continuation from the complete archived rank-15 retrospective JSON.
 * This measures a physical-board witness and action declarations; it cannot
 * certify actual lock reducer operation or competent competitive decisions.
 *
 * @param {object} packet Original rank15-bus-native-retreat-fork JSON.
 * @returns {object} Reproducible bounded paired-action audit.
 */
function auditRank15PaidBusLock(packet) {
  assert.equal(packet.schema, SCHEMA);
  assert.equal(packet.sourceRank, 15);
  assert.equal(packet.sourceSeat, 1);
  assert.equal(packet.candidateSeat, 0);
  assert.equal(packet.physicalFirstSeat, 0);
  assert.equal(packet.printedDecksUnchanged, true);
  const control = packet.nativeSecondAttackOnly;
  const unpaid = packet.proposedNativePromotion;
  const paid = packet.ownerPaysRetreat;
  assert.equal(control.rootLedgerSHA256, unpaid.rootLedgerSHA256,
    'Original and unpayable retreat controls diverged');
  assert.notEqual(control.rootLedgerSHA256, paid.rootLedgerSHA256,
    'Paid owner action did not change the recorded Store history');
  assert.equal(control.first.aor?.turn, 16);
  assert.equal(control.first.bus?.turn, 16);
  assert.equal(paid.first.aor?.turn, 16);
  assert.equal(paid.first.bus?.turn, 16);
  assert.equal(paid.first.dual?.turn, 18);
  assert.equal(paid.first.busActive?.turn, 18);
  assert.equal(paid.first.dual.opponentActive, 'Vileplume BUS');
  assert.ok(paid.first.dual.opponentBoard.includes('Vileplume AOR'));

  const steps = paid.sourceProposal;
  assert.deepEqual(steps.map(x => x.kind), [
    'owner-hand-Grass-to-Active-Bunnelby',
    'paid-native-retreat-to-Vileplume-BUS'
  ]);
  assert.ok(steps.every(x => x.simulatorAccepts === true));
  assert.equal(steps[0].turn, 18);
  assert.equal(steps[1].turn, 18);
  assert.deepEqual(steps[1].energy,
    ['Grass Energy MEE', 'Grass Energy MEE']);
  assert.ok(paid.nativeRootRetreats.some(x =>
    x.playerSlot === 1 && x.action === 'RetreatAction' &&
    x.turnBefore === 18));

  const events = paid.ownerSourceWindow.filter(x =>
    x.turnBefore >= 18 && x.turnBefore <= 26);
  const firstDualEvent = events.findIndex(x => dualLockBoard(x.after));
  assert.ok(firstDualEvent >= 0, 'No real after-dispatch joint lock');
  const afterPromotion = events.slice(firstDualEvent);
  assert.ok(afterPromotion.length > 0);
  assert.ok(afterPromotion.every(x => dualLockBoard(x.after)),
    'Joint Vileplume board did not persist through recorded window');
  assert.equal(afterPromotion.at(-1).turnBefore, 26);

  const reply = paid.postRetreatRootResponse;
  assert.ok(reply.some(x => x.playerSlot === 0 &&
    x.turnBefore === 19 && x.action === 'PassTurnAction'),
    'No actual candidate first-turn response');
  assert.ok(reply.some(x => x.playerSlot === 1 &&
    x.turnBefore === 20 && x.action === 'PassTurnAction'),
    'No actual source return');

  return {
    schema: 'agent30-rank15-paid-bus-lock-temporal-audit-v1',
    enginePin: packet.enginePin,
    sourceRank: packet.sourceRank,
    seed: packet.seed,
    actualStarterSeat: packet.physicalFirstSeat,
    originalRootLedgerSHA256: control.rootLedgerSHA256,
    unpaidRootLedgerSHA256: unpaid.rootLedgerSHA256,
    paidRootLedgerSHA256: paid.rootLedgerSHA256,
    paidNativeRetreatOrdinal: paid.nativeRootRetreats
      .find(x => x.playerSlot === 1 && x.turnBefore === 18).actionOrdinal,
    observedDualFromTurn: paid.first.dual.turn,
    observedDualThroughOwnTurn: afterPromotion.at(-1).turnBefore,
    consecutivePostDispatchDualObservations: afterPromotion.length,
    candidateResponseTurn: 19,
    sourceReturnTurn: 20,
    controlCandidateAttackDeclarations: control.nativeCandidateAttacks.map(
      x => ({turn: x.turnBefore, attack: x.attackName})),
    paidCandidateAttackDeclarations: paid.nativeCandidateAttacks.map(
      x => ({turn: x.turnBefore, attack: x.attackName})),
    paidComplete: paid.finished,
    actualEffectSuppressionProved: false,
    paperClockQualified: false,
    competitiveGames: 0
  };
}

module.exports = {SCHEMA, dualLockBoard, auditRank15PaidBusLock};
