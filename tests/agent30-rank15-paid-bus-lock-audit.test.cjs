'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {auditRank15PaidBusLock} =
  require('../scripts/agent30-rank15-paid-bus-lock-audit.cjs');

const after = (turn, active = 'Vileplume BUS') => ({
  turnBefore: turn,
  after: {active, bench: ['Vileplume AOR', 'Budew ASC']}
});

function fixture() {
  const first = {
    aor: {turn: 16}, bus: {turn: 16},
    dual: {turn: 18, opponentActive: 'Vileplume BUS',
      opponentBoard: ['Vileplume BUS', 'Vileplume AOR']},
    busActive: {turn: 18}
  };
  const original = {rootLedgerSHA256: 'a',
    first: {aor: {turn: 16}, bus: {turn: 16}},
    nativeCandidateAttacks: [{turnBefore: 19, attackName: 'Night Watch'}]};
  return {
    schema: 'rank15-retrospective-owner-bus-promotion-native-fork-v1',
    sourceRank: 15, sourceSeat: 1, candidateSeat: 0,
    physicalFirstSeat: 0, printedDecksUnchanged: true,
    enginePin: 'pin', seed: 3050400820,
    nativeSecondAttackOnly: original,
    proposedNativePromotion: {...original},
    ownerPaysRetreat: {
      rootLedgerSHA256: 'b', first, finished: false,
      sourceProposal: [
        {kind: 'owner-hand-Grass-to-Active-Bunnelby', turn: 18,
          simulatorAccepts: true},
        {kind: 'paid-native-retreat-to-Vileplume-BUS', turn: 18,
          simulatorAccepts: true,
          energy: ['Grass Energy MEE', 'Grass Energy MEE']}
      ],
      nativeRootRetreats: [{
        actionOrdinal: 172, playerSlot: 1,
        action: 'RetreatAction', turnBefore: 18
      }],
      ownerSourceWindow: [after(18,'Bunnelby PRC'), after(18),
        after(19), after(20), after(26)],
      postRetreatRootResponse: [
        {playerSlot: 0, turnBefore: 19, action: 'PassTurnAction'},
        {playerSlot: 1, turnBefore: 20, action: 'PassTurnAction'}
      ],
      nativeCandidateAttacks: []
    }
  };
}

test('authentic accepted paid line establishes persistent board and reply', () => {
  const result = auditRank15PaidBusLock(fixture());
  assert.equal(result.consecutivePostDispatchDualObservations, 4);
  assert.equal(result.observedDualThroughOwnTurn, 26);
  assert.equal(result.competitiveGames, 0);
});

test('fails closed if post-promotion board breaks before turn26', () => {
  const packet = fixture();
  packet.ownerPaysRetreat.ownerSourceWindow[3] = after(20, 'Bunnelby PRC');
  assert.throws(() => auditRank15PaidBusLock(packet),
    /persist/);
});

test('rejects claimed native retreat without accepted physical payment', () => {
  const packet = fixture();
  packet.ownerPaysRetreat.sourceProposal[1].simulatorAccepts = false;
  assert.throws(() => auditRank15PaidBusLock(packet));
});

test('rejects source-return assertion with no true subsequent source action', () => {
  const packet = fixture();
  packet.ownerPaysRetreat.postRetreatRootResponse.pop();
  assert.throws(() => auditRank15PaidBusLock(packet), /source return/);
});
