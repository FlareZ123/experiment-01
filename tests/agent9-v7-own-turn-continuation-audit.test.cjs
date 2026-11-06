'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {auditV7SourceOwnerContinuation} =
  require('../scripts/agent9-v7-own-turn-continuation-audit.cjs');

/** @param {number} ordinal @param {number} turn @param {number} playerSlot
 * @param {string} action @param {string|null} [card] */
function root(ordinal, turn, playerSlot, action, card = null) {
  return {actionOrdinal: ordinal, turnBefore: turn, turnAfter: turn,
    playerSlot, action, ...(card === null ? {} :
      action === 'AttackAction' ? {attack: card} : {card})};
}

function fixture() {
  const attacks = [{
    actionOrdinal: 3, turnBefore: 3, triggerAction: 'AttackAction',
    attackName: 'Volt Cyclone', completionRootOrdinal: 6,
    settledPromptChain: true, settlementCrossesClockReset: false,
    nextSourceRoot: {ordinal: 7, action: 'PlayCardAction', card: 'Psychic Energy'}
  }];
  return {attempts: [{
    id: 'rank6-original', status: 'returned-unqualified',
    originalSourceSeat: 0, sourceDealFingerprint: 'physical-A',
    fullPhysicalDealFingerprint: 'two-player-A',
    publicRootActionsTruncated: false,
    publicRootLedgerDigestConsistent: true,
    publicRootActions: [
      root(3, 3, 0, 'AttackAction', 'Volt Cyclone'),
      root(4, 3, 0, 'ResolvePromptAction'),
      root(5, 3, 0, 'ResolvePromptAction'),
      root(6, 3, 0, 'ResolvePromptAction'),
      root(7, 4, 1, 'PlayCardAction', 'Psychic Energy'),
      root(8, 4, 1, 'PassTurnAction'),
      root(9, 5, 0, 'PassTurnAction')
    ],
    actualSourceAttackSettlement: {
      auditedActorRole: 'source', attacks
    }
  }]};
}

test('observes actual owner turn instead of the opponent nextSourceRoot', () => {
  const result = auditV7SourceOwnerContinuation(fixture());
  assert.equal(result.knownSettledSourceAttacks, 1);
  assert.equal(result.attacksWithObservedOwnerReturn, 1);
  assert.equal(result.passOnlyImmediateReturns, 1);
  assert.equal(result.immediateReturnsWithoutAnotherAttack, 1);
  assert.equal(result.attackRecords[0].nextOwnerTurn, 5);
  assert.deepEqual(result.attackRecords[0].ownerActions.map(x => x.ordinal), [9]);
});

test('captures source Energy attachment then Pass with correct owner slot', () => {
  const data = fixture();
  data.attempts[0].publicRootActions.splice(6, 0,
    root(9, 5, 0, 'PlayCardAction', 'Capture Energy'));
  data.attempts[0].publicRootActions[7].actionOrdinal = 10;
  const result = auditV7SourceOwnerContinuation(data);
  assert.equal(result.captureEnergyThenPassImmediateReturns, 1);
  assert.equal(result.passOnlyImmediateReturns, 0);
});

test('preserves unknown source outcomes on genuine aborted rows', () => {
  const data = fixture();
  data.attempts.push({id: 'original-error', status: 'engine-error',
    originalSourceSeat: null, sourceDealFingerprint: 'physical-B',
    fullPhysicalDealFingerprint: 'two-player-B',
    publicRootActionsTruncated: false,
    publicRootLedgerDigestConsistent: true,
    publicRootActions: [], actualSourceAttackSettlement: null});
  const result = auditV7SourceOwnerContinuation(data);
  assert.equal(result.allRegisteredAttempts, 2);
  assert.equal(result.knownSettledSourceAttacks, 1);
  assert.equal(result.unknownAttackSettlementRows.length, 1);
  assert.equal(result.trialRows[1].knownSettledAttackCount, null);
});

test('never promotes an unsettled attack into a completed source decision', () => {
  const data = fixture();
  data.attempts[0].actualSourceAttackSettlement.attacks.push({
    actionOrdinal: 11, turnBefore: 6, triggerAction: 'AttackAction',
    attackName: 'Volt Cyclone', completionRootOrdinal: null,
    settledPromptChain: false, settlementCrossesClockReset: false
  });
  data.attempts[0].publicRootActions.push(root(11, 6, 0, 'AttackAction', 'Volt Cyclone'));
  const result = auditV7SourceOwnerContinuation(data);
  assert.equal(result.knownSettledSourceAttacks, 1);
  assert.equal(result.trialRows[0].incompleteAttackCount, 1);
});

test('refuses wrong source seat, fake attack name, wrong origin and digest', () => {
  const tamper = apply => {
    const data = fixture();
    apply(data);
    assert.throws(() => auditV7SourceOwnerContinuation(data));
  };
  tamper(x => {x.attempts[0].originalSourceSeat = 1;});
  tamper(x => {x.attempts[0].actualSourceAttackSettlement.attacks[0].attackName = 'Wrong';});
  tamper(x => {x.attempts[0].actualSourceAttackSettlement.attacks[0].triggerAction = 'UseAbilityAction';});
  tamper(x => {x.attempts[0].publicRootLedgerDigestConsistent = false;});
  tamper(x => {x.attempts[0].publicRootActionsTruncated = true;});
});

test('deduplicates genuine source openings across different contender rows', () => {
  const data = fixture();
  const cloned = structuredClone(data.attempts[0]);
  cloned.id = 'rank6-second-contender';
  cloned.fullPhysicalDealFingerprint = 'two-player-B';
  data.attempts.push(cloned);
  const result = auditV7SourceOwnerContinuation(data);
  assert.equal(result.knownSettledSourceAttacks, 2);
  assert.equal(result.sourceRowCountWithSettledAttacks, 2);
  assert.equal(result.physicallyDistinctSourceOpeningsWithSettledAttacks, 1);
});
