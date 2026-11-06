'use strict';

const assert = require('node:assert/strict');

const VOLUNTARY_ROOTS = new Set([
  'PlayCardAction', 'AttackAction', 'RetreatAction',
  'UseAbilityAction', 'PassTurnAction'
]);

/**
 * Audit actual original-owner follow-up turns after real Store-settled attacks.
 * The archive's attack.nextSourceRoot is the *opponent* return when the
 * settlement builder is reused with auditedActorRole='source'. Never use it
 * as evidence of the attacking owner's next decision.
 *
 * @param {object} archive A real archived v7 public-execution receipt.
 * @returns {object} Failure-inclusive root/owner-seat provenance audit.
 */
function auditV7SourceOwnerContinuation(archive) {
  assert.ok(Array.isArray(archive?.attempts));
  const seen = new Set();
  const attackRecords = [];
  const unknownRows = [];
  const trialRows = [];
  for (const trial of archive.attempts) {
    assert.equal(typeof trial.id, 'string');
    assert.ok(!seen.has(trial.id), 'Duplicate trial identifier');
    seen.add(trial.id);
    assert.ok(Array.isArray(trial.publicRootActions));
    assert.equal(trial.publicRootActionsTruncated, false,
      'Cannot infer owner return from truncated root evidence');
    assert.equal(trial.publicRootLedgerDigestConsistent, true,
      'Archive must attest a consistent accepted-root ledger');
    const sourceSeat = trial.originalSourceSeat;
    const settlement = trial.actualSourceAttackSettlement;
    const row = {
      id: trial.id,
      status: trial.status,
      originalSourceSeat: sourceSeat,
      sourceDealFingerprint: trial.sourceDealFingerprint,
      fullPhysicalDealFingerprint: trial.fullPhysicalDealFingerprint,
      knownSettledAttackCount: null,
      incompleteAttackCount: null,
      ownerReturns: []
    };
    trialRows.push(row);
    if (sourceSeat !== 0 && sourceSeat !== 1) {
      unknownRows.push({id: trial.id, reason: 'source seat unavailable after abort'});
      continue;
    }
    if (!settlement || !Array.isArray(settlement.attacks)) {
      unknownRows.push({id: trial.id, reason: 'attack settlement unavailable'});
      continue;
    }
    assert.equal(settlement.auditedActorRole, 'source');
    row.knownSettledAttackCount = 0;
    row.incompleteAttackCount = 0;
    const roots = trial.publicRootActions;
    for (const attack of settlement.attacks) {
      const attackRoot = roots.find(root =>
        root.actionOrdinal === attack.actionOrdinal);
      assert.ok(attackRoot, 'Attack must have an accepted real Store root');
      assert.equal(attackRoot.playerSlot, sourceSeat,
        'Attacker must be the physically registered source seat');
      assert.equal(attackRoot.turnBefore, attack.turnBefore);
      assert.equal(attackRoot.action, attack.triggerAction,
        'Attack declaration origin must match accepted root type');
      if (attackRoot.action === 'AttackAction') {
        assert.equal(attackRoot.attack, attack.attackName);
      }
      if (attack.settledPromptChain !== true ||
          attack.settlementCrossesClockReset === true) {
        row.incompleteAttackCount++;
        continue;
      }
      row.knownSettledAttackCount++;
      assert.ok(Number.isSafeInteger(attack.completionRootOrdinal));
      assert.ok(attack.completionRootOrdinal >= attack.actionOrdinal);
      const future = roots.filter(root =>
        root.actionOrdinal > attack.completionRootOrdinal &&
        root.playerSlot === sourceSeat &&
        root.turnBefore > attack.turnBefore &&
        VOLUNTARY_ROOTS.has(root.action));
      const ownerReturnTurn = future[0]?.turnBefore ?? null;
      const ownerActions = future.filter(root =>
        root.turnBefore === ownerReturnTurn).map(root => ({
        ordinal: root.actionOrdinal,
        turn: root.turnBefore,
        action: root.action,
        card: root.card ?? null,
        attack: root.attack ?? null
      }));
      const ownerReturnEnded = ownerActions.some(root =>
        root.action === 'PassTurnAction' || root.action === 'AttackAction');
      const record = {
        id: trial.id,
        sourceDealFingerprint: trial.sourceDealFingerprint,
        sourceSeat,
        attackName: attack.attackName,
        attackOrdinal: attack.actionOrdinal,
        attackTurn: attack.turnBefore,
        settledThroughOrdinal: attack.completionRootOrdinal,
        nextOwnerTurn: ownerReturnTurn,
        nextOwnerTurnEnded: ownerReturnEnded,
        ownerActions,
        evidence: 'accepted Store root + publicly settled attack + next real owner roots',
        paperQualified: false
      };
      row.ownerReturns.push(record);
      attackRecords.push(record);
    }
  }
  const observed = attackRecords.filter(x => x.nextOwnerTurn !== null);
  const ended = observed.filter(x => x.nextOwnerTurnEnded);
  const passOnly = ended.filter(x =>
    x.ownerActions.length === 1 &&
    x.ownerActions[0].action === 'PassTurnAction');
  const captureThenPass = ended.filter(x =>
    x.ownerActions.length === 2 &&
    x.ownerActions[0].action === 'PlayCardAction' &&
    x.ownerActions[0].card === 'Capture Energy' &&
    x.ownerActions[1].action === 'PassTurnAction');
  const noImmediateSourceAttack = ended.filter(x =>
    x.ownerActions.every(a => a.action !== 'AttackAction'));
  return {
    schema: 'agent9-v7-real-owner-return-audit-v1',
    allRegisteredAttempts: trialRows.length,
    unknownAttackSettlementRows: unknownRows,
    knownSettledSourceAttacks: attackRecords.length,
    attacksWithObservedOwnerReturn: observed.length,
    ownerReturnsWithEndedTurn: ended.length,
    passOnlyImmediateReturns: passOnly.length,
    captureEnergyThenPassImmediateReturns: captureThenPass.length,
    immediateReturnsWithoutAnotherAttack: noImmediateSourceAttack.length,
    physicallyDistinctSourceOpeningsWithSettledAttacks:
      new Set(attackRecords.map(x => x.sourceDealFingerprint)).size,
    sourceRowCountWithSettledAttacks:
      new Set(attackRecords.map(x => x.id)).size,
    trialRows,
    attackRecords,
    competitiveGamesQualified: 0,
    limitations: [
      'A root sequence says nothing about the strategic affordability of unplayed cards',
      'Aborted rows retain unknown attack-settlement and owner-return outcomes',
      'Repeated attacks from one trajectory are correlated observations',
      'Owner-next-turn outcomes are distinct from the settlement builder nextSourceRoot (opponent)'
    ]
  };
}

module.exports = {VOLUNTARY_ROOTS, auditV7SourceOwnerContinuation};
