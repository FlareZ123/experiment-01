/**
 * Independently audit the two original-rank-3 capped contexts in the archived
 * v8 + Telepath + Confirm-false developmental native receipt.
 *
 * Usage: node agent35-v8-rank3-active-trap.cjs <extracted-treatment-json>
 * This analysis is read-only. Printed-card rules are checked separately against
 * PGO 55 (Snorlax), CRZ 105 (Radiant Eternatus), OBF 92 (Lunatone).
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');

const RANK3_IDS = [
  '3:213:A:champion-reference',
  '3:213:A:new-moon-lockbreaker-v1'
];

/**
 * Check a printed attack's Energy symbols against a Pokémon attached only
 * Basic Psychic Energy. In the pinned Twinleaf enum, Psychic=5 and Colorless=9.
 * This is deliberately limited to this homogeneous Basic Energy state.
 * @param {number[]} cost Pinned native printed attack energy symbols.
 * @param {string[]} attached Card names from actual final public board.
 * @returns {boolean}
 */
function payableUsingOnlyBasicPsychic(cost, attached) {
  assert.ok(attached.every(name => name === 'Psychic Energy'));
  return cost.length <= attached.length &&
    cost.every(symbol => symbol === 5 || symbol === 9);
}

/** @param {object} row Actual native attempt, including public root ledger. */
function inspectRank3Attempt(row) {
  assert.ok(RANK3_IDS.includes(row.id));
  assert.equal(row.originalSourceSeat, 1);
  assert.equal(row.candidateSeat, 0);
  assert.equal(row.nativeOutcome, 'action-cap');
  assert.equal(row.nativeRootActionCount, 128);
  assert.equal(row.publicRootActions.length, 128);
  assert.deepEqual(row.finalPrizes, [6, 6]);
  assert.equal(row.actualSourceAttackSettlement.declarations, 0);
  assert.equal(row.candidateAttackSettlement.declarations, 0);
  assert.equal(row.publicRootActions.filter(root => root.action === 'AttackAction').length, 0);
  const source = row.finalBoard[1].active;
  const candidate = row.finalBoard[0].active;
  assert.equal(source.printing, 'Snorlax PGO');
  assert.ok(Array.isArray(candidate.printedAttacks));
  assert.ok(candidate.energyCards.every(name => name === 'Psychic Energy'));
  const attacks = candidate.printedAttacks.map(attack => ({
    name: attack.name,
    cost: attack.cost,
    payableFromAttachedBasicPsychic:
      payableUsingOnlyBasicPsychic(attack.cost, candidate.energyCards)
  }));
  const psychicEnergyPlays = row.publicRootActions.filter(root =>
    root.playerSlot === 0 && root.action === 'PlayCardAction' &&
    root.card === 'Psychic Energy').length;
  const candidatePasses = row.publicRootActions.filter(root =>
    root.playerSlot === 0 && root.action === 'PassTurnAction').length;
  const sourcePasses = row.publicRootActions.filter(root =>
    root.playerSlot === 1 && root.action === 'PassTurnAction').length;
  const highestTurn = Math.max(...row.publicRootActions.map(root => root.turnBefore));
  return {
    id: row.id,
    nativeOutcome: row.nativeOutcome,
    sourceActive: source.printing,
    sourceActiveAbilityFromPrintedCard: 'Block',
    candidateActive: candidate.printing,
    candidateActiveEnergy: candidate.energyCards,
    candidateActiveAttacks: attacks,
    candidateActiveHasPayablePrintedAttack: attacks.some(a => a.payableFromAttachedBasicPsychic),
    publicPsychicEnergyPlaysByCandidate: psychicEnergyPlays,
    publicPassesByCandidate: candidatePasses,
    publicPassesBySource: sourcePasses,
    publicAttackDeclarationsBothPlayers: 0,
    finalPrizes: row.finalPrizes,
    highestObservedGlobalTurn: highestTurn,
    nativeRootCap: 128,
    paperLegalityCertified: false,
    competitiveGameQualified: false
  };
}

/** @param {object} archived Archived treatment receipt with eight attempts. */
function analyze(archived) {
  assert.equal(archived.attempts.length, 8);
  const rows = RANK3_IDS.map(id => {
    const matches = archived.attempts.filter(row => row.id === id);
    assert.equal(matches.length, 1);
    return inspectRank3Attempt(matches[0]);
  });
  assert.equal(rows[0].candidateActive, 'Radiant Eternatus CRZ');
  assert.equal(rows[0].candidateActiveEnergy.length, 5);
  assert.deepEqual(rows[0].candidateActiveAttacks.map(a => a.name), ['Power Beam']);
  assert.deepEqual(rows[0].candidateActiveAttacks[0].cost, [2, 7, 9]);
  assert.equal(rows[1].candidateActive, 'Lunatone OBF');
  assert.equal(rows[1].candidateActiveEnergy.length, 2);
  assert.deepEqual(rows[1].candidateActiveAttacks.map(a => a.name), ['Moon Press']);
  assert.deepEqual(rows[1].candidateActiveAttacks[0].cost, [5, 9, 9]);
  return {schema: 'agent35-rank3-active-trap-v1',contextCount: 2,rows};
}

if (require.main === module) {
  const report = analyze(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')));
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
}

module.exports = {RANK3_IDS, payableUsingOnlyBasicPsychic, inspectRank3Attempt, analyze};
